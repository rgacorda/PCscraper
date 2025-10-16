import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get all favorited builds for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const favorites = await prisma.buildFavorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        build: {
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
            _count: {
              select: {
                favorites: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate average ratings for each build
    const favoritesWithRatings = favorites.map((favorite) => {
      const avgRating =
        favorite.build.ratings.length > 0
          ? favorite.build.ratings.reduce((sum, r) => sum + r.rating, 0) /
            favorite.build.ratings.length
          : null;

      return {
        ...favorite,
        build: {
          ...favorite.build,
          averageRating: avgRating,
          totalRatings: favorite.build.ratings.length,
          totalFavorites: favorite.build._count.favorites,
        },
      };
    });

    return NextResponse.json({ favorites: favoritesWithRatings });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}
