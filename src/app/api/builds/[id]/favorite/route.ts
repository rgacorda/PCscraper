import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Add build to favorites
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if build exists and is public
    const build = await prisma.build.findUnique({
      where: { id },
      select: { id: true, isPublic: true },
    });

    if (!build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    if (!build.isPublic) {
      return NextResponse.json(
        { error: 'Only public builds can be favorited' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.buildFavorite.findUnique({
      where: {
        buildId_userId: {
          buildId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Build already in favorites' },
        { status: 400 }
      );
    }

    // Add to favorites
    const favorite = await prisma.buildFavorite.create({
      data: {
        buildId: id,
        userId: session.user.id,
      },
      include: {
        build: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Build added to favorites',
        favorite,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE - Remove build from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Delete favorite
    await prisma.buildFavorite.delete({
      where: {
        buildId_userId: {
          buildId: id,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({
      message: 'Build removed from favorites',
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}

// GET - Check if build is favorited by current user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ isFavorited: false });
    }

    const { id } = await params;

    const favorite = await prisma.buildFavorite.findUnique({
      where: {
        buildId_userId: {
          buildId: id,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({
      isFavorited: !!favorite,
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}
