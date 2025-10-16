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
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text(name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    if (description) {
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // Gray
      doc.text(description, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
    }

    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // Light gray
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Divider line
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Components section
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39); // Dark gray
    doc.text('Components', margin, yPos);
    yPos += 8;

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
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(55, 65, 81);
      doc.text(category.replace(/_/g, ' '), margin, yPos);
      yPos += 6;

      // Items in this category
      for (const item of categoryItems) {
        checkPageBreak(30);

        const imageSize = 12; // mm (reduced from 15)
        const imageX = margin + 2;
        const textStartX = imageX + imageSize + 3;

        // Add product image if available
        if (item.imageUrl) {
          try {
            // Fetch and convert image to base64
            const imageResponse = await fetch(item.imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const base64 = Buffer.from(imageBuffer).toString('base64');
            const imageType = item.imageUrl.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';
            const imageData = `data:image/${imageType.toLowerCase()};base64,${base64}`;

            doc.addImage(imageData, imageType, imageX, yPos - 2, imageSize, imageSize);
          } catch (error) {
            // If image fails, continue without it
            console.error('Failed to add image:', error);
          }
        }

        // Product name with brand
        const productName = item.brand
          ? `${item.brand} ${item.name}`
          : item.name;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);

        // Split long product names
        const maxTextWidth = pageWidth - textStartX - 45;
        const splitName = doc.splitTextToSize(productName, maxTextWidth);
        doc.text(splitName, textStartX, yPos);

        // Price (aligned right)
        const priceText = `PHP ${Number(item.price).toLocaleString('en-PH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(priceText, pageWidth - margin, yPos, { align: 'right' });

        yPos += Math.max(4, splitName.length * 3.5);

        // Retailer and View Product link on same line
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text(`Retailer: ${item.retailer}`, textStartX, yPos);

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
          const retailerTextWidth = doc.getTextWidth(`Retailer: ${item.retailer}`);
          doc.setFontSize(7);
          addLink(' View Product', url, textStartX + retailerTextWidth, yPos, 7);
        }

        yPos += 5;

        // Separator line
        doc.setDrawColor(243, 244, 246);
        doc.line(textStartX, yPos, pageWidth - margin, yPos);
        yPos += 4;
      }

      yPos += 3;
    }

    // Total section
    checkPageBreak(25);
    yPos += 3;

    // Bold divider line
    doc.setDrawColor(17, 24, 39);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // Total price
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('Total:', margin, yPos);

    const formattedTotal = `PHP ${Number(totalPrice).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    doc.setFontSize(14);
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
