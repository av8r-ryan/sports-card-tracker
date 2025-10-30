// Sample data generator for testing and demonstration
import { Card } from '../types';

export const generateSampleCards = (): Partial<Card>[] => {
  const currentDate = new Date();
  const oneYearAgo = new Date(currentDate);
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

  return [
    // Baseball Cards
    {
      player: 'Mike Trout',
      team: 'Los Angeles Angels',
      year: 2011,
      brand: 'Topps Update',
      category: 'Baseball',
      cardNumber: 'US175',
      condition: '9: MINT',
      gradingCompany: 'PSA',
      purchasePrice: 1200,
      purchaseDate: oneYearAgo,
      currentValue: 3500,
      notes: 'Rookie card - key investment piece',
      images: [],
    },
    {
      player: 'Shohei Ohtani',
      team: 'Los Angeles Angels',
      year: 2018,
      brand: 'Topps Chrome',
      category: 'Baseball',
      cardNumber: '150',
      parallel: 'Refractor',
      condition: '10: GEM MINT',
      gradingCompany: 'PSA',
      purchasePrice: 2500,
      purchaseDate: new Date('2023-06-15'),
      currentValue: 4000,
      notes: 'Two-way phenom RC - long term hold',
      images: [],
    },

    // Basketball Cards
    {
      player: 'Luka Dončić',
      team: 'Dallas Mavericks',
      year: 2018,
      brand: 'Panini Prizm',
      category: 'Basketball',
      cardNumber: '280',
      parallel: 'Silver',
      condition: '10: GEM MINT',
      gradingCompany: 'PSA',
      purchasePrice: 800,
      purchaseDate: new Date('2023-03-20'),
      currentValue: 1500,
      notes: 'Base Prizm RC - market is hot',
      images: [],
    },
    {
      player: 'Giannis Antetokounmpo',
      team: 'Milwaukee Bucks',
      year: 2013,
      brand: 'Panini Prizm',
      category: 'Basketball',
      cardNumber: '290',
      condition: '9: MINT',
      gradingCompany: 'BGS',
      purchasePrice: 1800,
      purchaseDate: new Date('2022-12-01'),
      currentValue: 2200,
      notes: 'Greek Freak RC - championship bump',
      images: [],
    },

    // Football Cards
    {
      player: 'Patrick Mahomes',
      team: 'Kansas City Chiefs',
      year: 2017,
      brand: 'Panini Prizm',
      category: 'Football',
      cardNumber: '269',
      condition: '9.5: MINT+',
      gradingCompany: 'BGS',
      purchasePrice: 3000,
      purchaseDate: new Date('2023-01-15'),
      currentValue: 4500,
      sellPrice: 4500,
      sellDate: new Date('2024-01-15'),
      notes: 'SOLD - Great ROI on Super Bowl winner',
      images: [],
    },
    {
      player: 'Justin Herbert',
      team: 'Los Angeles Chargers',
      year: 2020,
      brand: 'Panini Select',
      category: 'Football',
      cardNumber: '44',
      parallel: 'Premier Level',
      condition: '10: GEM MINT',
      gradingCompany: 'PSA',
      purchasePrice: 600,
      purchaseDate: new Date('2023-08-10'),
      currentValue: 750,
      notes: 'Young QB with upside',
      images: [],
    },

    // Hockey Cards
    {
      player: 'Connor McDavid',
      team: 'Edmonton Oilers',
      year: 2015,
      brand: 'Upper Deck',
      category: 'Hockey',
      cardNumber: '201',
      condition: '9: MINT',
      gradingCompany: 'PSA',
      purchasePrice: 1500,
      purchaseDate: new Date('2023-04-01'),
      currentValue: 2000,
      notes: 'Young Guns RC - generational talent',
      images: [],
    },

    // Pokemon Cards
    {
      player: 'Charizard',
      team: 'Base Set',
      year: 1999,
      brand: 'Pokemon',
      category: 'Pokemon',
      cardNumber: '4/102',
      condition: '8: NEAR MINT-MINT',
      gradingCompany: 'PSA',
      purchasePrice: 3500,
      purchaseDate: new Date('2022-11-20'),
      currentValue: 4200,
      notes: 'Base Set classic - always in demand',
      images: [],
    },
    {
      player: 'Pikachu',
      team: 'Evolutions',
      year: 2016,
      brand: 'Pokemon',
      category: 'Pokemon',
      cardNumber: '35/108',
      parallel: 'Reverse Holo',
      condition: '10: GEM MINT',
      gradingCompany: 'PSA',
      purchasePrice: 150,
      purchaseDate: new Date('2023-07-01'),
      currentValue: 200,
      sellPrice: 200,
      sellDate: new Date('2023-12-01'),
      notes: 'SOLD - Quick flip for profit',
      images: [],
    },

    // Soccer Card
    {
      player: 'Lionel Messi',
      team: 'Barcelona',
      year: 2004,
      brand: 'Panini Mega Cracks',
      category: 'Soccer',
      cardNumber: '71',
      condition: '8.5: NEAR MINT-MINT+',
      gradingCompany: 'BGS',
      purchasePrice: 2800,
      purchaseDate: new Date('2023-02-14'),
      currentValue: 3500,
      notes: 'Early Messi - World Cup boost',
      images: [],
    },
  ];
};

// Function to add sample data to the app
export const addSampleDataToCollection = async (addCard: (card: any) => Promise<void>) => {
  const sampleCards = generateSampleCards();

  for (const card of sampleCards) {
    try {
      await addCard(card);
    } catch (error) {
      console.error('Error adding sample card:', error);
    }
  }

  return sampleCards.length;
};
