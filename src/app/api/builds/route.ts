import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - List all builds
export async function GET(request: NextRequest) {
  try {
    const builds = await prisma.pCBuild.findMany({
      include: {
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
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ builds });
  } catch (error) {
    console.error('Error fetching builds:', error);
    return NextResponse.json({ error: 'Failed to fetch builds' }, { status: 500 });
  }
}

// POST - Create new build
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, items } = body;

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
        totalPrice += Number(product.listings[0].price);
      }
    }

    // Create build with items
    const build = await prisma.pCBuild.create({
      data: {
        name,
        description: description || null,
        totalPrice,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
          })),
        },
      },
      include: {
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
