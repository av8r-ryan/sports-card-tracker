import { Card } from '../types';

export const exportCardsAsJSON = (cards: Card[]): string => {
  return JSON.stringify(cards, null, 2);
};

export const exportCardsAsCSV = (cards: Card[]): string => {
  if (cards.length === 0) return '';

  // Define headers
  const headers = [
    'ID',
    'Player',
    'Team',
    'Year',
    'Brand',
    'Category',
    'Card Number',
    'Parallel',
    'Condition',
    'Grading Company',
    'Purchase Price',
    'Purchase Date',
    'Current Value',
    'Sell Price',
    'Sell Date',
    'Notes',
    'Created At',
    'Updated At',
  ];

  // Convert cards to CSV rows
  const rows = cards.map((card) => [
    card.id,
    card.player,
    card.team,
    card.year,
    card.brand,
    card.category,
    card.cardNumber,
    card.parallel || '',
    card.condition,
    card.gradingCompany || '',
    card.purchasePrice,
    card.purchaseDate instanceof Date ? card.purchaseDate.toISOString().split('T')[0] : card.purchaseDate,
    card.currentValue,
    card.sellPrice || '',
    card.sellDate ? (card.sellDate instanceof Date ? card.sellDate.toISOString().split('T')[0] : card.sellDate) : '',
    card.notes.replace(/"/g, '""'), // Escape quotes in notes
    card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt,
    card.updatedAt instanceof Date ? card.updatedAt.toISOString() : card.updatedAt,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Wrap in quotes if contains comma or newline
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
            return `"${cellStr}"`;
          }
          return cellStr;
        })
        .join(',')
    ),
  ].join('\n');

  return csvContent;
};
