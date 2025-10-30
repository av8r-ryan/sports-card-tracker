import { Card } from '../types';

// Direct export function - call this to export all unsold cards immediately
export const exportAllUnsoldCardsNow = (cards: Card[]) => {
  const unsoldCards = cards.filter((card) => !card.sellDate);

  if (unsoldCards.length === 0) {
    return { success: false, message: 'No unsold cards to export' };
  }

  // Create CSV content
  const csvRows: string[] = [];

  // Add header
  csvRows.push('Title,Price,Quantity,Category,Condition,Brand,Player,Year,Card Number,Team,Notes');

  // Add each card
  unsoldCards.forEach((card) => {
    // Build title
    const titleParts = [card.year, card.brand, card.player, `#${card.cardNumber}`];

    if (card.parallel) {
      titleParts.push(card.parallel);
    }

    if (card.gradingCompany) {
      titleParts.push(`${card.gradingCompany} ${card.condition}`);
    }

    const title = titleParts.join(' ').substring(0, 80);
    const price = (card.currentValue * 0.9).toFixed(2);

    // Build row
    const row = [
      `"${title}"`,
      price,
      '1',
      card.category,
      card.condition,
      card.brand,
      card.player,
      card.year,
      card.cardNumber,
      card.team,
      `"${card.notes || ''}"`,
    ];

    csvRows.push(row.join(','));
  });

  // Create and download file
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `all-unsold-cards-ebay-${Date.now()}.csv`;
  link.click();

  URL.revokeObjectURL(url);

  return {
    success: true,
    count: unsoldCards.length,
    filename: link.download,
  };
};
