// Manufacturer Database Service
// Contains accurate manufacturer-sport-year relationships and licensing information

export interface ManufacturerInfo {
  name: string;
  sports: SportLicense[];
  founded: number;
  defunct?: number;
}

export interface SportLicense {
  sport: string;
  startYear: number;
  endYear?: number;
  exclusive?: boolean;
  majorSets: string[];
}

// Manufacturer licensing database
export const MANUFACTURER_DATABASE: Record<string, ManufacturerInfo> = {
  Topps: {
    name: 'Topps',
    founded: 1938,
    sports: [
      {
        sport: 'Baseball',
        startYear: 1951,
        exclusive: true, // MLB exclusive since 2009
        majorSets: [
          'Topps',
          'Topps Chrome',
          'Topps Update',
          'Topps Heritage',
          'Stadium Club',
          'Finest',
          'Archives',
          'Allen & Ginter',
        ],
      },
      {
        sport: 'Football',
        startYear: 1956,
        endYear: 2015,
        majorSets: ['Topps', 'Topps Chrome', 'Finest'],
      },
    ],
  },

  Bowman: {
    name: 'Bowman',
    founded: 1948,
    sports: [
      {
        sport: 'Baseball',
        startYear: 1948,
        exclusive: false, // Owned by Topps
        majorSets: ['Bowman', 'Bowman Chrome', 'Bowman Draft', "Bowman's Best", 'Bowman Sterling'],
      },
    ],
  },

  Panini: {
    name: 'Panini',
    founded: 1961,
    sports: [
      {
        sport: 'Basketball',
        startYear: 2009,
        exclusive: true, // NBA exclusive
        majorSets: [
          'Prizm',
          'Select',
          'Mosaic',
          'Optic',
          'Chronicles',
          'National Treasures',
          'Immaculate',
          'Flawless',
          'Donruss',
        ],
      },
      {
        sport: 'Football',
        startYear: 2016,
        exclusive: true, // NFL exclusive
        majorSets: [
          'Prizm',
          'Select',
          'Mosaic',
          'Optic',
          'Chronicles',
          'National Treasures',
          'Immaculate',
          'Contenders',
          'Donruss',
        ],
      },
      {
        sport: 'Soccer',
        startYear: 1970,
        majorSets: ['Prizm', 'Select', 'Chronicles', 'Donruss'],
      },
    ],
  },

  'Upper Deck': {
    name: 'Upper Deck',
    founded: 1988,
    sports: [
      {
        sport: 'Hockey',
        startYear: 1990,
        exclusive: true, // NHL exclusive
        majorSets: [
          'Upper Deck',
          'SP Authentic',
          'The Cup',
          'Ultimate Collection',
          'Ice',
          'Series 1',
          'Series 2',
          'Young Guns',
        ],
      },
      {
        sport: 'Basketball',
        startYear: 1991,
        endYear: 2009,
        majorSets: ['Upper Deck', 'SP Authentic', 'Exquisite Collection'],
      },
      {
        sport: 'Baseball',
        startYear: 1989,
        endYear: 2010,
        majorSets: ['Upper Deck', 'SP Authentic', 'Sweet Spot', 'Ultimate Collection'],
      },
    ],
  },

  Fleer: {
    name: 'Fleer',
    founded: 1885,
    defunct: 2007,
    sports: [
      {
        sport: 'Baseball',
        startYear: 1981,
        endYear: 2007,
        majorSets: ['Fleer', 'Fleer Ultra', 'Fleer Tradition'],
      },
      {
        sport: 'Basketball',
        startYear: 1986,
        endYear: 2007,
        majorSets: ['Fleer', 'Fleer Ultra', 'Fleer Tradition'],
      },
    ],
  },

  Donruss: {
    name: 'Donruss',
    founded: 1954,
    sports: [
      {
        sport: 'Baseball',
        startYear: 1981,
        endYear: 2005, // Lost MLB license, now part of Panini
        majorSets: ['Donruss', 'Donruss Elite', 'Studio', 'Leaf'],
      },
    ],
  },

  Score: {
    name: 'Score',
    founded: 1988,
    defunct: 1998,
    sports: [
      {
        sport: 'Baseball',
        startYear: 1988,
        endYear: 1998,
        majorSets: ['Score', 'Score Select', 'Pinnacle'],
      },
      {
        sport: 'Football',
        startYear: 1989,
        endYear: 1998,
        majorSets: ['Score', 'Score Select'],
      },
    ],
  },

  Leaf: {
    name: 'Leaf',
    founded: 1948,
    sports: [
      {
        sport: 'Multi-Sport',
        startYear: 2010,
        majorSets: ['Leaf Metal', 'Leaf Trinity', 'Leaf Ultimate', 'Leaf Valiant'],
      },
    ],
  },
};

// Sport-specific manufacturer dominance by era
export const MANUFACTURER_ERAS: Record<string, Array<{ years: string; primary: string[]; secondary: string[] }>> = {
  Baseball: [
    { years: '1951-1980', primary: ['Topps'], secondary: ['Fleer', 'Bowman'] },
    { years: '1981-1988', primary: ['Topps', 'Donruss', 'Fleer'], secondary: ['Score'] },
    { years: '1989-2000', primary: ['Topps', 'Upper Deck', 'Fleer'], secondary: ['Donruss', 'Score', 'Bowman'] },
    { years: '2001-2009', primary: ['Topps', 'Upper Deck'], secondary: ['Fleer', 'Donruss', 'Bowman'] },
    { years: '2010-2024', primary: ['Topps', 'Bowman'], secondary: [] }, // Topps exclusive
  ],

  Basketball: [
    { years: '1957-1985', primary: ['Topps'], secondary: [] },
    { years: '1986-1995', primary: ['Fleer', 'Upper Deck', 'Topps'], secondary: ['Hoops', 'SkyBox'] },
    { years: '1996-2008', primary: ['Upper Deck', 'Topps', 'Fleer'], secondary: [] },
    { years: '2009-2024', primary: ['Panini'], secondary: [] }, // Panini exclusive
  ],

  Football: [
    { years: '1948-1988', primary: ['Topps'], secondary: ['Fleer'] },
    { years: '1989-2000', primary: ['Score', 'Pro Set', 'Upper Deck', 'Topps'], secondary: ['Fleer', 'Action Packed'] },
    { years: '2001-2015', primary: ['Topps', 'Upper Deck', 'Panini'], secondary: ['Fleer', 'Donruss'] },
    { years: '2016-2024', primary: ['Panini'], secondary: [] }, // Panini exclusive
  ],

  Hockey: [
    { years: '1951-1989', primary: ['Topps', 'O-Pee-Chee'], secondary: [] },
    { years: '1990-2024', primary: ['Upper Deck'], secondary: ['O-Pee-Chee'] }, // Upper Deck exclusive
  ],
};

// Player exclusive deals (some players only appear in certain brands)
export const PLAYER_EXCLUSIVES: Record<string, string[]> = {
  // MLB Prospects often debut in Bowman
  'Bowman First': ['Jackson Holliday', 'Paul Skenes', 'Dylan Crews', 'Marcelo Mayer', 'Jackson Chourio'],

  // Panini exclusive signers (no logos)
  'Panini Baseball': ['Shohei Ohtani', 'Mike Trout', 'Ronald Acuña Jr.'], // No logos due to no MLB license

  // Special insert series
  'Topps Heritage': ['Vintage design cards'],
  'Panini National Treasures': ['High-end patches and autos'],
  'Upper Deck The Cup': ['Premier hockey cards'],
};

/**
 * Service for manufacturer-sport matching
 */
export class ManufacturerDatabaseService {
  /**
   * Gets valid manufacturers for a sport and year
   */
  getValidManufacturers(sport: string, year: number): string[] {
    const validManufacturers: string[] = [];

    Object.entries(MANUFACTURER_DATABASE).forEach(([name, info]) => {
      const sportLicense = info.sports.find(
        (s) => s.sport === sport && year >= s.startYear && (!s.endYear || year <= s.endYear)
      );

      if (sportLicense) {
        validManufacturers.push(name);
      }
    });

    return validManufacturers;
  }

  /**
   * Gets the dominant manufacturer for a sport and year
   */
  getDominantManufacturer(sport: string, year: number): string | null {
    const era = MANUFACTURER_ERAS[sport]?.find((e) => {
      const [startYear, endYear] = e.years.split('-').map((y) => parseInt(y));
      return year >= startYear && year <= endYear;
    });

    if (era && era.primary.length > 0) {
      // For exclusive eras, return the only manufacturer
      if (era.primary.length === 1) {
        return era.primary[0];
      }
      // Otherwise return a weighted random choice
      return era.primary[Math.floor(Math.random() * era.primary.length)];
    }

    return null;
  }

  /**
   * Checks if a manufacturer has exclusive rights for a sport in a given year
   */
  hasExclusiveRights(manufacturer: string, sport: string, year: number): boolean {
    const info = MANUFACTURER_DATABASE[manufacturer];
    if (!info) return false;

    const sportLicense = info.sports.find(
      (s) => s.sport === sport && year >= s.startYear && (!s.endYear || year <= s.endYear)
    );

    return sportLicense?.exclusive || false;
  }

  /**
   * Gets appropriate card sets for a manufacturer, sport, and year
   */
  getCardSets(manufacturer: string, sport: string, year: number): string[] {
    const info = MANUFACTURER_DATABASE[manufacturer];
    if (!info) return [];

    const sportLicense = info.sports.find(
      (s) => s.sport === sport && year >= s.startYear && (!s.endYear || year <= s.endYear)
    );

    return sportLicense?.majorSets || [];
  }

  /**
   * Validates if a manufacturer could produce cards for a sport in a given year
   */
  validateManufacturer(manufacturer: string, sport: string, year: number): boolean {
    const validManufacturers = this.getValidManufacturers(sport, year);
    return validManufacturers.includes(manufacturer);
  }

  /**
   * Gets a realistic manufacturer for a player based on sport and year
   */
  getRealisticManufacturer(
    sport: string,
    year: number,
    isRookie = false
  ): {
    manufacturer: string;
    set: string;
  } {
    // For baseball rookies, heavily weight Bowman
    if (sport === 'Baseball' && isRookie && year >= 2001) {
      if (Math.random() > 0.3) {
        const bowmanSets = this.getCardSets('Bowman', sport, year);
        return {
          manufacturer: 'Bowman',
          set: bowmanSets[Math.floor(Math.random() * bowmanSets.length)],
        };
      }
    }

    // Get the dominant manufacturer for the era
    const manufacturer = this.getDominantManufacturer(sport, year) || 'Topps';
    const sets = this.getCardSets(manufacturer, sport, year);

    return {
      manufacturer,
      set: sets.length > 0 ? sets[Math.floor(Math.random() * sets.length)] : manufacturer,
    };
  }
}

// Export singleton instance
export const manufacturerDatabase = new ManufacturerDatabaseService();
