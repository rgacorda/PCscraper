import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, items, totalPrice } = body;

    if (!name || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Name and items are required' },
        { status: 400 }
      );
    }

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Helper function to check if we need a new page
    const checkPageBreak = (neededSpace: number) => {
      if (yPos + neededSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with link
    const addLink = (text: string, url: string, x: number, y: number, fontSize: number) => {
      doc.setTextColor(37, 99, 235); // Blue color
      doc.textWithLink(text, x, y, { url });
      doc.setTextColor(0, 0, 0); // Reset to black
    };

    // Header
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text(name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    if (description) {
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128); // Gray
      doc.text(description, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
    }

    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175); // Light gray
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Divider line
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Components section
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39); // Dark gray
    doc.text('Components', margin, yPos);
    yPos += 10;

    // Group items by category
    const categoryMap = new Map<string, typeof items>();
    items.forEach((item: any) => {
      const category = item.category || 'OTHER';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(item);
    });

    // Display items by category
    for (const [category, categoryItems] of categoryMap.entries()) {
      checkPageBreak(15);

      // Category header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(55, 65, 81);
      doc.text(category.replace(/_/g, ' '), margin, yPos);
      yPos += 8;

      // Items in this category
      for (const item of categoryItems) {
        checkPageBreak(35);

        // Product name with brand
        const productName = item.brand
          ? `${item.brand} ${item.name}`
          : item.name;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);

        // Split long product names
        const splitName = doc.splitTextToSize(productName, pageWidth - margin * 2 - 50);
        doc.text(splitName, margin + 5, yPos);

        // Price (aligned right)
        const priceText = `₱${Number(item.price).toLocaleString('en-PH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
        doc.text(priceText, pageWidth - margin, yPos, { align: 'right' });

        yPos += splitName.length * 5 + 2;

        // Retailer
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text(`Retailer: ${item.retailer}`, margin + 5, yPos);
        yPos += 5;

        // Get product URL from database
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            listings: {
              where: {
                retailer: item.retailer,
                isActive: true,
              },
              take: 1,
            },
          },
        });

        if (product && product.listings[0]) {
          const url = product.listings[0].retailerUrl;
          doc.setFontSize(9);
          addLink('View Product →', url, margin + 5, yPos, 9);
        }

        yPos += 6;

        // Separator line
        doc.setDrawColor(243, 244, 246);
        doc.line(margin + 5, yPos, pageWidth - margin, yPos);
        yPos += 5;
      }

      yPos += 3;
    }

    // Total section
    checkPageBreak(30);
    yPos += 5;

    // Bold divider line
    doc.setDrawColor(17, 24, 39);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Total price
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('Total:', margin, yPos);

    const formattedTotal = `₱${Number(totalPrice).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text(formattedTotal, pageWidth - margin, yPos, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    const footerText = 'This build was created using PC Builder. Prices are subject to change. Please verify current prices and availability with the retailers.';
    const splitFooter = doc.splitTextToSize(footerText, pageWidth - margin * 2);
    doc.text(splitFooter, pageWidth / 2, pageHeight - 20, { align: 'center' });

    // Generate PDF as blob
    const pdfBlob = doc.output('arraybuffer');

    // Return PDF as response
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${name.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
