export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string; // For UI display
  icon?: string; // Emoji or icon identifier
  isDefault?: boolean; // Each user has one default collection
  cardCount?: number; // Computed field
  totalValue?: number; // Computed field
  visibility: 'private' | 'public' | 'shared'; // For future sharing features
  tags?: string[]; // For categorization
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionStats {
  cardCount: number;
  totalValue: number;
  totalCost: number;
  topValueCard?: {
    id: string;
    player: string;
    value: number;
  };
  categoryBreakdown: { [category: string]: number };
}

export interface CollectionFormData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  visibility: 'private' | 'public' | 'shared';
  tags?: string[];
}
