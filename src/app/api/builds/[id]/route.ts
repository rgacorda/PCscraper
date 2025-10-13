import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get build by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const build = await prisma.pCBuild.findUnique({
      where: { id: params.id },
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

    if (!build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    return NextResponse.json({ build });
  } catch (error) {
    console.error('Error fetching build:', error);
    return NextResponse.json({ error: 'Failed to fetch build' }, { status: 500 });
  }
}

// DELETE - Delete build
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.pCBuild.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Build deleted successfully' });
  } catch (error) {
    console.error('Error deleting build:', error);
    return NextResponse.json({ error: 'Failed to delete build' }, { status: 500 });
  }
}
