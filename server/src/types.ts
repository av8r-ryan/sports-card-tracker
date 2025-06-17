export interface Card {
  id: string;
  player: string;
  team: string;
  year: number;
  brand: string;
  category: string;
  cardNumber: string;
  parallel?: string;
  condition: string;
  gradingCompany?: string;
  purchasePrice: number;
  purchaseDate: string; // ISO string in database
  sellPrice?: number;
  sellDate?: string; // ISO string in database
  currentValue: number;
  images: string[]; // Parsed from JSON string in database
  notes: string;
  createdAt: string; // ISO string in database
  updatedAt: string; // ISO string in database
}

export interface CardInput {
  player: string;
  team: string;
  year: number;
  brand: string;
  category: string;
  cardNumber: string;
  parallel?: string;
  condition: string;
  gradingCompany?: string;
  purchasePrice: number;
  purchaseDate: string;
  sellPrice?: number;
  sellDate?: string;
  currentValue: number;
  images: string[];
  notes: string;
}