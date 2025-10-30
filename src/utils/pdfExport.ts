import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Card } from '../types';

// Helper type for jsPDF with autoTable plugin
type ExtendedJsPDF = jsPDF & {
  lastAutoTable: {
    finalY: number;
  };
  internal: jsPDF['internal'] & {
    getNumberOfPages(): number;
  };
};

interface ExportOptions {
  includeImages?: boolean;
  groupBy?: 'none' | 'category' | 'team' | 'year';
  sortBy?: 'player' | 'team' | 'year' | 'value' | 'purchaseDate';
  includeStats?: boolean;
}

export const exportCardsToPDF = (cards: Card[], options: ExportOptions = {}): void => {
  const {
    // includeImages = false, // TODO: Implement image inclusion in future
    groupBy = 'none',
    sortBy = 'player',
    includeStats = true,
  } = options;

  const doc = new jsPDF() as ExtendedJsPDF;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Sports Card Collection Report', margin, 25);

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString();
  doc.text(`Generated on: ${currentDate}`, margin, 35);

  let yPosition = 50;

  // Statistics section
  if (includeStats && cards.length > 0) {
    const totalCards = cards.length;
    const totalCostBasis = cards.reduce((sum, card) => sum + (card.purchasePrice || 0), 0);
    const totalCurrentValue = cards.reduce((sum, card) => sum + (card.currentValue || 0), 0);
    const totalProfit = totalCurrentValue - totalCostBasis;
    const soldCards = cards.filter((card) => card.sellPrice && card.sellDate);
    const totalSoldValue = soldCards.reduce((sum, card) => sum + (card.sellPrice || 0), 0);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Portfolio Summary', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const stats = [
      ['Total Cards:', totalCards.toString()],
      ['Total Cost Basis:', `$${totalCostBasis.toFixed(2)}`],
      ['Current Value:', `$${totalCurrentValue.toFixed(2)}`],
      ['Total Profit/Loss:', `$${totalProfit.toFixed(2)}`],
      ['Cards Sold:', soldCards.length.toString()],
      ['Sales Revenue:', `$${totalSoldValue.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: stats,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60, halign: 'right' },
      },
    });

    yPosition = doc.lastAutoTable.finalY + 20;
  }

  // Sort cards
  const sortedCards = [...cards].sort((a, b) => {
    switch (sortBy) {
      case 'player':
        return a.player.localeCompare(b.player);
      case 'team':
        return a.team.localeCompare(b.team);
      case 'year':
        return b.year - a.year;
      case 'value':
        return (b.currentValue || 0) - (a.currentValue || 0);
      case 'purchaseDate':
        return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
      default:
        return 0;
    }
  });

  // Group cards if needed
  const groupedCards = groupBy === 'none' ? { 'All Cards': sortedCards } : groupCards(sortedCards, groupBy);

  // Generate table for each group
  Object.entries(groupedCards).forEach(([groupName, groupCards], index) => {
    if (index > 0 || yPosition > 200) {
      doc.addPage();
      yPosition = 25;
    }

    if (groupBy !== 'none') {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(groupName, margin, yPosition);
      yPosition += 15;
    }

    // Prepare table data
    const tableHeaders = [
      'Player',
      'Team',
      'Year',
      'Brand',
      'Category',
      'Card #',
      'Condition',
      'Purchase Price',
      'Current Value',
      'Profit/Loss',
    ];

    const tableData = groupCards.map((card) => {
      const profit = (card.currentValue || 0) - (card.purchasePrice || 0);
      return [
        card.player || '',
        card.team || '',
        card.year?.toString() || '',
        card.brand || '',
        card.category || '',
        card.cardNumber || '',
        card.condition || '',
        `$${(card.purchasePrice || 0).toFixed(2)}`,
        `$${(card.currentValue || 0).toFixed(2)}`,
        `$${profit.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [tableHeaders],
      body: tableData,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [52, 152, 219],
        fontSize: 9,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 25 }, // Player
        1: { cellWidth: 20 }, // Team
        2: { cellWidth: 12 }, // Year
        3: { cellWidth: 20 }, // Brand
        4: { cellWidth: 18 }, // Category
        5: { cellWidth: 15 }, // Card #
        6: { cellWidth: 20 }, // Condition
        7: { cellWidth: 18, halign: 'right' }, // Purchase Price
        8: { cellWidth: 18, halign: 'right' }, // Current Value
        9: { cellWidth: 18, halign: 'right' }, // Profit/Loss
      },
      didDrawPage: (data) => {
        // Add page number - we'll add this after the table is complete
      },
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  });

  // Add page numbers to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, doc.internal.pageSize.height - 10);
  }

  // Save the PDF
  const filename = `sports-cards-collection-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

const groupCards = (cards: Card[], groupBy: string): Record<string, Card[]> => {
  return cards.reduce(
    (groups, card) => {
      let key: string;

      switch (groupBy) {
        case 'category':
          key = card.category || 'Uncategorized';
          break;
        case 'team':
          key = card.team || 'Unknown Team';
          break;
        case 'year':
          key = card.year?.toString() || 'Unknown Year';
          break;
        default:
          key = 'All Cards';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(card);

      return groups;
    },
    {} as Record<string, Card[]>
  );
};

export const exportDetailedCardReport = (card: Card): void => {
  const doc = new jsPDF() as ExtendedJsPDF;
  const margin = 20;
  let yPosition = 25;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Card Detail Report', margin, yPosition);
  yPosition += 20;

  // Card basic info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${card.player} - ${card.team}`, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${card.year} ${card.brand} #${card.cardNumber}`, margin, yPosition);
  yPosition += 15;

  // Card details table
  const cardDetails = [
    ['Category', card.category || 'N/A'],
    ['Condition', card.condition || 'N/A'],
    ['Parallel/Insert', card.parallel || 'N/A'],
    ['Grading Company', card.gradingCompany || 'N/A'],
    ['Purchase Price', `$${(card.purchasePrice || 0).toFixed(2)}`],
    ['Purchase Date', new Date(card.purchaseDate).toLocaleDateString()],
    ['Current Value', `$${(card.currentValue || 0).toFixed(2)}`],
    ['Profit/Loss', `$${((card.currentValue || 0) - (card.purchasePrice || 0)).toFixed(2)}`],
  ];

  if (card.sellPrice && card.sellDate) {
    cardDetails.push(
      ['Sell Price', `$${card.sellPrice.toFixed(2)}`],
      ['Sell Date', new Date(card.sellDate).toLocaleDateString()]
    );
  }

  autoTable(doc, {
    startY: yPosition,
    head: [['Property', 'Value']],
    body: cardDetails,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 80 },
    },
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // Notes section
  if (card.notes && card.notes.trim()) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(card.notes, doc.internal.pageSize.width - 2 * margin);
    doc.text(splitNotes, margin, yPosition);
  }

  // Save the PDF
  const filename = `card-detail-${card.player.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
  doc.save(filename);
};
