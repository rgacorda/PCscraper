import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - List all builds
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Build query based on authentication and filters
    const whereClause: any = {};

    if (userId) {
      // Fetch specific user's builds
      whereClause.userId = userId;

      // Only show private builds if requesting own builds
      if (!session || session.user.id !== userId) {
        whereClause.isPublic = true;
      }
    } else {
      // Public feed: show all public builds
      whereClause.isPublic = true;
    }

    const builds = await prisma.build.findMany({
      where: whereClause,
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
                  take: 1,
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
      orderBy: { updatedAt: 'desc' },
    });

    // Calculate average ratings
    const buildsWithRatings = builds.map((build) => {
      const avgRating =
        build.ratings.length > 0
          ? build.ratings.reduce((sum, r) => sum + r.rating, 0) / build.ratings.length
          : null;

      return {
        ...build,
        averageRating: avgRating,
        totalRatings: build.ratings.length,
      };
    });

    return NextResponse.json({ builds: buildsWithRatings });
  } catch (error) {
    console.error('Error fetching builds:', error);
    return NextResponse.json({ error: 'Failed to fetch builds' }, { status: 500 });
  }
}

// POST - Create new build (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, items, isPublic = true } = body;

    if (!name || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Name and items are required' },
        { status: 400 }
      );
    }

    // Calculate total price
    let totalPrice = 0;
    for (const item of items) {
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

      if (product && product.listings[0]) {
        totalPrice += Number(product.listings[0].price) * (item.quantity || 1);
      }
    }

    // Create build with items
    const build = await prisma.build.create({
      data: {
        name,
        description: description || null,
        totalPrice,
        isPublic,
        userId: session.user.id,
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

    return NextResponse.json({ build }, { status: 201 });
  } catch (error) {
    console.error('Error creating build:', error);
    return NextResponse.json({ error: 'Failed to create build' }, { status: 500 });
  }
}
