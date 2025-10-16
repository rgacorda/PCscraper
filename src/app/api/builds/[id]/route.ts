import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get build by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const build = await prisma.build.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                listings: {
                  where: { isActive: true },
                  orderBy: { price: 'asc' },
                },
              },
            },
          },
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    // Check if build is private and user is not the owner
    if (!build.isPublic && (!session || session.user.id !== build.userId)) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    // Calculate average rating
    const avgRating =
      build.ratings.length > 0
        ? build.ratings.reduce((sum, r) => sum + r.rating, 0) / build.ratings.length
        : null;

    return NextResponse.json({
      build: {
        ...build,
        averageRating: avgRating,
        totalRatings: build.ratings.length,
      },
    });
  } catch (error) {
    console.error('Error fetching build:', error);
    return NextResponse.json({ error: 'Failed to fetch build' }, { status: 500 });
  }
}

// DELETE - Delete build (requires authentication and ownership)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if build exists and user is the owner
    const build = await prisma.build.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    if (build.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this build' },
        { status: 403 }
      );
    }

    // Delete build (cascade will handle buildItems, ratings, comments)
    await prisma.build.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Build deleted successfully' });
  } catch (error) {
    console.error('Error deleting build:', error);
    return NextResponse.json({ error: 'Failed to delete build' }, { status: 500 });
  }
}

// PATCH - Update build (requires authentication and ownership)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if build exists and user is the owner
    const existingBuild = await prisma.build.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingBuild) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    if (existingBuild.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this build' },
        { status: 403 }
      );
    }

    // Update build
    const body = await request.json();
    const { name, description, isPublic, items } = body;

    // If items are provided, delete existing items and create new ones
    if (items && Array.isArray(items)) {
      // Delete existing build items
      await prisma.buildItem.deleteMany({
        where: { buildId: id },
      });

      // Calculate total price
      const totalPrice = await items.reduce(async (sumPromise: Promise<number>, item: any) => {
        const sum = await sumPromise;
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            listings: {
              where: { isActive: true },
              orderBy: { price: 'asc' },
              take: 1,
            },
          },
        });
        const price = product?.listings[0]?.price || 0;
        return sum + Number(price) * (item.quantity || 1);
      }, Promise.resolve(0));

      // Update build with new items
      const updatedBuild = await prisma.build.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(isPublic !== undefined && { isPublic }),
          totalPrice,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity || 1,
            })),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  listings: {
                    where: { isActive: true },
                    orderBy: { price: 'asc' },
                  },
                },
              },
            },
          },
        },
      });

      return NextResponse.json({ build: updatedBuild });
    } else {
      // Update only metadata
      const updatedBuild = await prisma.build.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(isPublic !== undefined && { isPublic }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  listings: {
                    where: { isActive: true },
                    orderBy: { price: 'asc' },
                  },
                },
              },
            },
          },
        },
      });

      return NextResponse.json({ build: updatedBuild });
    }
  } catch (error) {
    console.error('Error updating build:', error);
    return NextResponse.json({ error: 'Failed to update build' }, { status: 500 });
  }
}
