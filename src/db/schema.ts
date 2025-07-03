// Type definition for RxJsonSchema
type RxJsonSchema<T = any> = any;

export const cardSchema: RxJsonSchema<any> = {
  version: 0,
  title: 'Card schema',
  description: 'Schema for sports cards',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    player: {
      type: 'string',
      maxLength: 200
    },
    team: {
      type: 'string',
      maxLength: 100
    },
    year: {
      type: 'number',
      minimum: 1900,
      maximum: 2100
    },
    brand: {
      type: 'string',
      maxLength: 100
    },
    category: {
      type: 'string',
      maxLength: 50
    },
    cardNumber: {
      type: 'string',
      maxLength: 50
    },
    parallel: {
      type: ['string', 'null'],
      maxLength: 100
    },
    condition: {
      type: 'string',
      maxLength: 50
    },
    gradingCompany: {
      type: ['string', 'null'],
      maxLength: 50
    },
    purchasePrice: {
      type: 'number',
      minimum: 0
    },
    purchaseDate: {
      type: 'string',
      format: 'date-time'
    },
    sellPrice: {
      type: ['number', 'null'],
      minimum: 0
    },
    sellDate: {
      type: ['string', 'null'],
      format: 'date-time'
    },
    currentValue: {
      type: 'number',
      minimum: 0
    },
    images: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: []
    },
    notes: {
      type: 'string',
      default: ''
    },
    createdAt: {
      type: 'string',
      format: 'date-time'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time'
    }
  },
  required: [
    'id',
    'player',
    'team', 
    'year',
    'brand',
    'category',
    'cardNumber',
    'condition',
    'purchasePrice',
    'purchaseDate',
    'currentValue',
    'createdAt',
    'updatedAt'
  ],
  indexes: [
    'player',
    'year',
    'category',
    'createdAt',
    ['year', 'player'], // Compound index for common queries
    'currentValue'
  ]
};

export type CardDocType = {
  id: string;
  player: string;
  team: string;
  year: number;
  brand: string;
  category: string;
  cardNumber: string;
  parallel?: string | null;
  condition: string;
  gradingCompany?: string | null;
  purchasePrice: number;
  purchaseDate: string;
  sellPrice?: number | null;
  sellDate?: string | null;
  currentValue: number;
  images: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export const collections = {
  cards: {
    schema: cardSchema
  }
};