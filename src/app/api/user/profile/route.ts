import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendEmailChangeVerification } from '@/lib/email';
import crypto from 'crypto';

// GET - Get current user profile
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            builds: true,
            buildRatings: true,
            buildComments: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await _request.json();
    const { name, email, image } = body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: 'Email is already taken' }, { status: 400 });
      }
    }

    // Check if email is being changed
    const emailChanged = email !== session.user.email;
    let verificationToken = null;

    // If email is changed, generate verification token and set emailVerified to null
    if (emailChanged) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Delete any existing verification tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Create new verification token
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: token,
          expires: expires,
        },
      });

      verificationToken = token;

      // Send verification email to new address
      try {
        await sendEmailChangeVerification(email, name.trim(), token);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue with update but log the error
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        email,
        image: image || null,
        // Set emailVerified to null if email changed
        ...(emailChanged && { emailVerified: null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            builds: true,
            buildRatings: true,
            buildComments: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: emailChanged
          ? 'Profile updated successfully. Please verify your new email address.'
          : 'Profile updated successfully',
        user: updatedUser,
        emailChanged,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);

    // Provide more specific error information
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Failed to update user profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete user account (soft delete - keeps public builds)
export async function DELETE(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Set userId to null for public builds (keeps them but orphans them)
    await prisma.build.updateMany({
      where: {
        userId: session.user.id,
        isPublic: true,
      },
      data: {
        userId: null,
      },
    });

    // Delete private builds
    await prisma.build.deleteMany({
      where: {
        userId: session.user.id,
        isPublic: false,
      },
    });

    // Delete user account (cascades will delete sessions, accounts, ratings, comments)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({
      message: 'Account deleted successfully. Your public builds have been preserved.',
      signOut: true, // Signal to client to sign out
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json({ error: 'Failed to delete user account' }, { status: 500 });
  }
}
