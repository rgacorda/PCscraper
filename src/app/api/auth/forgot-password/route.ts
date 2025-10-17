import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

// POST - Request password reset: create token and send email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    // Always respond with a success message to avoid account enumeration,
    // but only create token/send email if user exists.
    const genericResponse = NextResponse.json(
      {
        message:
          'If an account with that email exists, a password reset email has been sent.',
      },
      { status: 200 }
    );

    if (!user) {
      return genericResponse;
    }

    // Optionally remove previous tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires,
        used: false,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email as string, user.name ?? 'User', resetUrl);
    } catch (mailErr) {
      console.error('Failed to send password reset email:', mailErr);
      // Do not leak mail errors to the client; still return generic success.
    }

    return genericResponse;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json(
      { error: 'Failed to request password reset' },
      { status: 500 }
    );
  }
}
