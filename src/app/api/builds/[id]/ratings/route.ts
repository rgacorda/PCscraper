import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get all ratings for a build
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ratings = await prisma.buildRating.findMany({
      where: { buildId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : null;

    return NextResponse.json({
      ratings,
      averageRating: avgRating,
      totalRatings: ratings.length,
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}

// POST - Add or update rating for a build (requires authentication)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { rating } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if build exists
    const build = await prisma.build.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    // Don't allow rating own builds
    if (build.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot rate your own build' },
        { status: 400 }
      );
    }

    // Upsert rating (create or update)
    const buildRating = await prisma.buildRating.upsert({
      where: {
        buildId_userId: {
          buildId: id,
          userId: session.user.id,
        },
      },
      create: {
        buildId: id,
        userId: session.user.id,
        rating,
      },
      update: {
        rating,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ rating: buildRating }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating rating:', error);
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 });
  }
}

// DELETE - Remove rating (requires authentication)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Delete rating
    await prisma.buildRating.delete({
      where: {
        buildId_userId: {
          buildId: id,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return NextResponse.json({ error: 'Failed to delete rating' }, { status: 500 });
  }
}
