import jsPDF from 'jspdf';

import 'jspdf-autotable';
import { Card } from '../types';

type ExtendedJsPDF = jsPDF & {
  lastAutoTable: {
    finalY: number;
  };
  internal: jsPDF['internal'] & {
    getNumberOfPages(): number;
  };
};

export const exportToPDF = (reportType: string, data: any) => {
  const doc = new jsPDF() as ExtendedJsPDF;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Add header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.title || reportType, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${data.date || new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });

  let yPosition = 50;

  if (reportType === 'inventory-report' && data.stats) {
    // Add overview stats
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Collection Overview', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const stats = [
      ['Total Cards:', data.stats.totalCards.toString()],
      ['Total Value:', formatCurrency(data.stats.totalValue)],
      ['Average Value:', formatCurrency(data.stats.averageValue)],
      ['Unique Players:', data.stats.uniquePlayers.toString()],
      ['Unique Brands:', data.stats.uniqueBrands.toString()],
      ['Graded Cards:', data.stats.gradedCards.toString()],
    ];

    stats.forEach((stat, index) => {
      doc.text(stat[0], 20, yPosition + index * 7);
      doc.text(stat[1], 80, yPosition + index * 7);
    });

    yPosition += stats.length * 7 + 10;

    // Add most valuable card if exists
    if (data.stats.mostValuableCard) {
      doc.setFont('helvetica', 'bold');
      doc.text('Most Valuable Card:', 20, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      const card = data.stats.mostValuableCard;
      doc.text(`${card.year} ${card.brand} ${card.player} - ${formatCurrency(card.currentValue)}`, 20, yPosition);
      yPosition += 15;
    }

    // Add inventory table
    if (data.cards && data.cards.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Complete Inventory', 20, yPosition);
      yPosition += 10;

      const tableData = data.cards.map((card: Card) => {
        const roi = (((card.currentValue - card.purchasePrice) / card.purchasePrice) * 100).toFixed(1);
        return [
          card.player,
          card.year,
          card.brand,
          card.cardNumber,
          card.category,
          card.condition,
          formatCurrency(card.purchasePrice),
          formatCurrency(card.currentValue),
          `${roi}%`,
        ];
      });

      (doc as any).autoTable({
        startY: yPosition,
        head: [['Player', 'Year', 'Brand', 'Card #', 'Category', 'Condition', 'Purchase', 'Current', 'ROI']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [74, 85, 104],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 15 },
          2: { cellWidth: 25 },
          3: { cellWidth: 15 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20, halign: 'right' },
          7: { cellWidth: 20, halign: 'right' },
          8: { cellWidth: 15, halign: 'right' },
        },
        didDrawPage: function (data: any) {
          // Footer
          doc.setFontSize(10);
          doc.setTextColor(100);
          const pageCount = doc.internal.getNumberOfPages();
          doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        },
      });
    }
  } else {
    // Generic export for other report types
    doc.setFontSize(12);
    doc.text('Report data export coming soon...', 20, yPosition);
  }

  // Save the PDF
  const filename = `${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
