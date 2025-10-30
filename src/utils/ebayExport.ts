import { Card } from '../types';

// eBay File Exchange format headers
export const EBAY_FE_HEADERS = [
  '*Action(SiteID=US|Country=US|Currency=USD|Version=1193)',
  '*Category',
  '*Title',
  '*Description',
  '*ConditionID',
  '*PicURL',
  'Product:UPC',
  '*Quantity',
  '*Format',
  '*StartPrice',
  'BuyItNowPrice',
  '*Duration',
  '*Location',
  'ShippingType',
  'ShippingService-1:Option',
  'ShippingService-1:Cost',
  'PaymentMethods',
  '*DispatchTimeMax',
  '*ReturnsAcceptedOption',
  'ReturnsWithinOption',
  'RefundOption',
  'ShippingCostPaidByOption',
  'PayPalEmailAddress',
  'UseTaxTable',
];

export interface EbayExportOptions {
  priceMultiplier: number;
  shippingCost: number;
  duration: string;
  location: string;
  paypalEmail: string;
  dispatchTime: number;
}

export const generateEbayFileExchange = (cards: Card[], options: EbayExportOptions): string => {
  const rows: string[][] = [];

  // Add headers
  rows.push(EBAY_FE_HEADERS);

  // Process each card
  cards.forEach((card) => {
    const row = [
      'Add', // Action
      getCategoryId(card.category), // Category
      generateTitle(card), // Title
      generateDescription(card), // Description
      getConditionId(card.condition), // ConditionID
      '', // PicURL (would need to be uploaded separately)
      '', // UPC
      '1', // Quantity
      'FixedPrice', // Format
      (card.currentValue * options.priceMultiplier).toFixed(2), // StartPrice
      (card.currentValue * 0.95).toFixed(2), // BuyItNowPrice
      options.duration, // Duration
      options.location, // Location
      'Flat', // ShippingType
      'USPS First Class', // ShippingService
      options.shippingCost.toFixed(2), // ShippingCost
      'PayPal', // PaymentMethods
      options.dispatchTime.toString(), // DispatchTimeMax
      'ReturnsAccepted', // ReturnsAcceptedOption
      'Days_30', // ReturnsWithinOption
      'MoneyBack', // RefundOption
      'Buyer', // ShippingCostPaidByOption
      options.paypalEmail, // PayPalEmailAddress
      '1', // UseTaxTable
    ];

    rows.push(row);
  });

  // Convert to CSV format
  return rows
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if needed
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(',')
    )
    .join('\n');
};

const generateTitle = (card: Card): string => {
  const parts = [];

  parts.push(`${card.year} ${card.brand}`);
  parts.push(card.player);
  parts.push(`#${card.cardNumber}`);

  if (card.parallel) {
    parts.push(card.parallel);
  }

  if (card.notes?.toLowerCase().includes('rookie')) {
    parts.push('RC');
  }

  if (card.gradingCompany) {
    parts.push(`${card.gradingCompany} ${card.condition}`);
  }

  parts.push(card.category);

  // eBay title limit is 80 characters
  let title = parts.join(' ');
  if (title.length > 80) {
    title = `${title.substring(0, 77)}...`;
  }

  return title;
};

const generateDescription = (card: Card): string => {
  const sections = [];

  // Header
  sections.push(`<h2>${card.year} ${card.brand} ${card.player} #${card.cardNumber}</h2>`);

  // Details table
  sections.push('<table style="width:100%; border-collapse: collapse;">');
  sections.push(
    `<tr><td style="padding:5px; border:1px solid #ddd;"><strong>Year:</strong></td><td style="padding:5px; border:1px solid #ddd;">${card.year}</td></tr>`
  );
  sections.push(
    `<tr><td style="padding:5px; border:1px solid #ddd;"><strong>Brand:</strong></td><td style="padding:5px; border:1px solid #ddd;">${card.brand}</td></tr>`
  );
  sections.push(
    `<tr><td style="padding:5px; border:1px solid #ddd;"><strong>Player:</strong></td><td style="padding:5px; border:1px solid #ddd;">${card.player}</td></tr>`
  );
  sections.push(
    `<tr><td style="padding:5px; border:1px solid #ddd;"><strong>Team:</strong></td><td style="padding:5px; border:1px solid #ddd;">${card.team}</td></tr>`
  );
  sections.push(
    `<tr><td style="padding:5px; border:1px solid #ddd;"><strong>Card Number:</strong></td><td style="padding:5px; border:1px solid #ddd;">#${card.cardNumber}</td></tr>`
  );

  if (card.parallel) {
    sections.push(
      `<tr><td style="padding:5px; border:1px solid #ddd;"><strong>Parallel/Variation:</strong></td><td style="padding:5px; border:1px solid #ddd;">${card.parallel}</td></tr>`
    );
  }

  sections.push(
    `<tr><td style="padding:5px; border:1px solid #ddd;"><strong>Condition:</strong></td><td style="padding:5px; border:1px solid #ddd;">${card.condition}</td></tr>`
  );

  if (card.gradingCompany) {
    sections.push(
      `<tr><td style="padding:5px; border:1px solid #ddd;"><strong>Grading Company:</strong></td><td style="padding:5px; border:1px solid #ddd;">${card.gradingCompany}</td></tr>`
    );
  }

  sections.push('</table>');

  // Additional info
  if (card.notes) {
    sections.push('<h3>Additional Information:</h3>');
    sections.push(`<p>${card.notes}</p>`);
  }

  // Shipping info
  sections.push('<h3>Shipping & Handling:</h3>');
  sections.push('<ul>');
  sections.push('<li>Card shipped in protective sleeve and toploader</li>');
  sections.push('<li>Bubble mailer with tracking</li>');
  sections.push('<li>Ships within 1 business day</li>');
  sections.push('</ul>');

  // Condition disclaimer
  sections.push('<h3>Please Note:</h3>');
  sections.push('<p>See photos for exact condition. All cards are authentic and from a smoke-free environment.</p>');

  return sections.join('\n');
};

const getCategoryId = (category: string): string => {
  const categoryMap: Record<string, string> = {
    Baseball: '261328',
    Basketball: '261329',
    Football: '261330',
    Hockey: '261331',
    Soccer: '261333',
    Pokemon: '183454',
    Other: '261324',
  };

  return categoryMap[category] || '261324';
};

const getConditionId = (condition: string): string => {
  // eBay condition IDs for trading cards
  if (condition.includes('10') || condition.includes('GEM')) {
    return '275000'; // Gem Mint 10
  } else if (condition.includes('9.5')) {
    return '275001'; // Mint 9.5
  } else if (condition.includes('9')) {
    return '275002'; // Mint 9
  } else if (condition.includes('8')) {
    return '275003'; // Near Mint-Mint 8
  } else if (condition.includes('7')) {
    return '275004'; // Near Mint 7
  } else if (condition === 'RAW') {
    return '3000'; // Used
  }

  return '3000'; // Default to Used
};

// Generate simple listing format for copy/paste
export const generateSimpleListings = (cards: Card[]): string => {
  return cards
    .map((card) => {
      const title = generateTitle(card);
      const price = (card.currentValue * 0.9).toFixed(2);

      return `
=====================================
${title}

Starting Price: $${price}
Buy It Now: $${(card.currentValue * 0.95).toFixed(2)}

${card.year} ${card.brand} ${card.player} #${card.cardNumber}
${card.parallel ? `Parallel: ${card.parallel}` : ''}
Condition: ${card.condition}
${card.gradingCompany ? `Graded by: ${card.gradingCompany}` : ''}
Team: ${card.team}
Category: ${card.category}

${card.notes ? `Notes: ${card.notes}` : ''}
=====================================
`;
    })
    .join('\n');
};
