// Advanced Text Extraction Service
// Simulates sophisticated OCR text extraction with real-world patterns

import { manufacturerDatabase } from './manufacturerDatabase';
import { PLAYER_DATABASE } from './playerDatabase';

interface TextRegion {
  text: string;
  confidence: number;
  position: 'top' | 'middle' | 'bottom' | 'left' | 'right';
  fontSize?: 'large' | 'medium' | 'small';
  isBold?: boolean;
}

interface ExtractedText {
  regions: TextRegion[];
  fullText: string;
  language: string;
  orientation: number;
}

// Common OCR errors and corrections
const OCR_CORRECTIONS: Record<string, string> = (() => {
  const corrections: Record<string, string[]> = {
    '0': ['O', 'Q', 'D'],
    '1': ['I', 'l', '|'],
    '5': ['S'],
    '8': ['B'],
    rn: ['m'],
    ll: ['II'],
    vv: ['w'],
  };

  const result: Record<string, string> = {};
  Object.entries(corrections).forEach(([correct, errors]) => {
    errors.forEach((error) => {
      result[error] = correct;
    });
  });

  return result;
})();

// Common text patterns found on cards
const TEXT_PATTERNS = {
  stats: /(\d+\.?\d*)\s*(AVG|HR|RBI|PPG|RPG|APG|TD|YDS|G|A|PTS)/gi,
  fractions: /(\d+)\s*\/\s*(\d+)/g,
  currency: /\$\d+\.?\d*/g,
  percentages: /\d+\.?\d*%/g,
  years: /(19\d{2}|20\d{2})(-\d{2})?/g,
  alphanumeric: /[A-Z]{1,3}-?\d{1,4}/g,
  setInfo: /(BASE SET|INSERT|PARALLEL|VARIATION|SP|SSP)/gi,
};

export class TextExtractionService {
  /**
   * Simulates OCR text extraction with realistic patterns and errors
   */
  extractText(imageData: string, imageType: 'front' | 'back'): ExtractedText {
    // In production, this would process the actual image
    // For now, we'll generate realistic text based on card type

    const template = this.selectTemplate();
    const regions = this.generateTextRegions(template, imageType);
    const fullText = this.assembleFullText(regions);

    return {
      regions,
      fullText,
      language: 'en',
      orientation: 0,
    };
  }

  /**
   * Selects a realistic card template
   */
  private selectTemplate(): any {
    // Weight different card types for realistic distribution
    const weights = [
      { template: () => this.modernSportsCard(), weight: 30 },
      { template: () => this.vintageCard(), weight: 15 },
      { template: () => this.gradedCard(), weight: 20 },
      { template: () => this.autographCard(), weight: 10 },
      { template: () => this.pokemonCard(), weight: 5 },
      { template: () => this.rookieCard(), weight: 10 },
      { template: () => this.parallelCard(), weight: 5 },
      { template: () => this.relicCard(), weight: 5 },
    ];

    const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of weights) {
      random -= item.weight;
      if (random <= 0) {
        return item.template();
      }
    }

    return this.modernSportsCard();
  }

  /**
   * Modern sports card template
   */
  private modernSportsCard() {
    // Select a sport first
    const sports = ['Baseball', 'Basketball', 'Football'];
    const sport = this.randomFrom(sports);

    // Get players from that sport
    const players = PLAYER_DATABASE[sport].filter((p) => p.years.some((y) => y.includes('2023') || y.includes('2024')));

    const player = this.randomFrom(players);
    const team = this.randomFrom(player.teams);
    const year = 2023;

    // Get realistic manufacturer based on sport and year
    const { manufacturer, set } = manufacturerDatabase.getRealisticManufacturer(sport, year, player.rookie === '2023');

    const brand = `${year} ${set || manufacturer}`;

    return {
      sport,
      brand,
      player: player.name,
      team,
      position: player.position,
      cardNumber: this.generateCardNumber(),
      stats: this.generateStats(sport.toLowerCase()),
      features: ['Base Card'],
      back: {
        bio: `Position: ${player.position || 'N/A'}`,
        stats: this.generateDetailedStats(sport),
        cardInfo: `© ${year} ${manufacturer}`,
      },
    };
  }

  /**
   * Vintage card template
   */
  private vintageCard() {
    // Select vintage year
    const year = parseInt(this.randomFrom(['1987', '1988', '1989', '1990', '1991']));

    // Determine sport (Baseball was dominant in vintage era)
    const sportWeights = [
      { sport: 'Baseball', weight: 70 },
      { sport: 'Basketball', weight: 20 },
      { sport: 'Football', weight: 10 },
    ];

    const sport = this.weightedRandom(sportWeights);

    // Get vintage players from that sport
    const vintagePlayers = PLAYER_DATABASE[sport].filter((p) => {
      const startYear = parseInt(p.years[0].split('-')[0]);
      const endYear = parseInt(p.years[0].split('-')[1] || '2024');
      return startYear <= year && endYear >= year;
    });

    // If no players found for that year, fall back to legends
    const player =
      vintagePlayers.length > 0
        ? this.randomFrom(vintagePlayers)
        : this.randomFrom(PLAYER_DATABASE[sport].filter((p) => parseInt(p.years[0].split('-')[0]) < 2000));

    const team = this.randomFrom(player.teams);

    // Get valid manufacturer for sport and year
    const validManufacturers = manufacturerDatabase.getValidManufacturers(sport, year);
    const manufacturer = this.randomFrom(validManufacturers);
    const sets = manufacturerDatabase.getCardSets(manufacturer, sport, year);
    const setName = sets.length > 0 ? this.randomFrom(sets) : manufacturer;

    const brand = `${year} ${setName}`;

    return {
      sport,
      brand,
      player: player.name,
      team,
      position: player.position,
      cardNumber: `#${Math.floor(Math.random() * 700 + 1)}`,
      stats: this.generateStats(sport.toLowerCase(), true),
      features: ['Vintage'],
      isRookie: player.rookie === year.toString(),
      back: {
        bio: player.nicknames ? `"${player.nicknames[0]}"` : 'Career Highlights',
        stats: this.generateVintageStats(sport),
        cardInfo: `© ${year} ${manufacturer}`,
      },
    };
  }

  /**
   * Graded card template
   */
  private gradedCard() {
    const grade = this.randomFrom(['10', '9.5', '9', '8.5', '8']);
    const company = this.randomFrom(['PSA', 'BGS', 'SGC', 'CGC']);

    // Build graded candidates dynamically based on actual player data
    const gradedCandidates: any[] = [];

    // Add high-value rookies
    Object.entries(PLAYER_DATABASE).forEach(([sport, players]) => {
      players.forEach((player) => {
        if (player.rookie && parseInt(player.rookie) >= 2000) {
          const year = parseInt(player.rookie);
          const manufacturer = manufacturerDatabase.getRealisticManufacturer(sport, year, true);

          gradedCandidates.push({
            player: player.name,
            sport,
            year: player.rookie,
            brand: manufacturer.set,
            manufacturer: manufacturer.manufacturer,
            cardNumber: this.generateCardNumber(),
            isRookie: true,
          });
        }
      });
    });

    const card = this.randomFrom(gradedCandidates);
    const playerInfo = PLAYER_DATABASE[card.sport].find((p) => p.name === card.player)!;
    const team = this.randomFrom(playerInfo.teams);

    return {
      sport: card.sport,
      gradingLabel: `${company} ${grade}`,
      certNumber: this.generateCertNumber(),
      brand: `${card.year} ${card.brand}`,
      player: card.player,
      team,
      position: playerInfo.position,
      cardNumber: card.cardNumber,
      features: ['Graded', card.isRookie ? 'ROOKIE CARD' : 'Base'],
      subgrades: company === 'BGS' ? this.generateSubgrades() : null,
    };
  }

  /**
   * Autograph card template
   */
  private autographCard() {
    // Select sport and year
    const year = 2022;
    const sport = this.randomFrom(['Football', 'Basketball', 'Baseball']);

    // Get premium manufacturer for sport
    const validManufacturers = manufacturerDatabase.getValidManufacturers(sport, year);
    const premiumSets: Record<string, string[]> = {
      Football: ['Panini National Treasures', 'Panini Immaculate', 'Panini Flawless'],
      Basketball: ['Panini National Treasures', 'Panini Immaculate', 'Panini Flawless'],
      Baseball: ['Topps Dynasty', 'Topps Definitive', 'Topps Museum Collection'],
    };

    const setOptions = premiumSets[sport] || ['Premium Set'];
    const selectedSet = this.randomFrom(setOptions);
    const manufacturer = selectedSet.split(' ')[0];

    // Select star player from sport
    const players = PLAYER_DATABASE[sport].filter((p) => p.years.some((y) => y.includes(year.toString())));
    const player = this.randomFrom(players.slice(0, 10)); // Top players
    const team = this.randomFrom(player.teams);

    return {
      sport,
      brand: `${year} ${selectedSet}`,
      player: player.name,
      team,
      position: player.position,
      cardNumber: `RPA-${player.name
        .split(' ')
        .map((n) => n[0])
        .join('')}`,
      features: ['ON-CARD AUTOGRAPH', 'ROOKIE PATCH AUTO'],
      serialNumber: `${Math.floor(Math.random() * 99 + 1)}/99`,
      patch: 'GAME-WORN JERSEY',
    };
  }

  /**
   * Pokemon card template
   */
  private pokemonCard() {
    const pokemon = this.randomFrom(['Charizard', 'Pikachu', 'Mewtwo', 'Blastoise']);
    const hp = this.randomFrom(['120', '60', '150', '100']);

    return {
      name: pokemon,
      hp: `${hp} HP`,
      type: this.randomFrom(['Fire', 'Electric', 'Psychic', 'Water']),
      attacks: [
        { name: 'Fire Blast', damage: '120' },
        { name: 'Dragon Claw', damage: '50' },
      ],
      cardNumber: `${Math.floor(Math.random() * 150 + 1)}/150`,
      set: this.randomFrom(['Base Set', 'Jungle', 'Fossil', 'Team Rocket']),
      rarity: this.randomFrom(['Rare Holo', 'Rare', 'Uncommon']),
      year: '1999',
    };
  }

  /**
   * Rookie card template
   */
  private rookieCard() {
    const year = 2023;
    const sport = this.randomFrom(['Baseball', 'Basketball', 'Football']);

    // Get rookies from that sport
    const rookies = PLAYER_DATABASE[sport].filter((p) => p.rookie === year.toString());

    // If no rookies for 2023, get recent rookies
    const player =
      rookies.length > 0
        ? this.randomFrom(rookies)
        : this.randomFrom(PLAYER_DATABASE[sport].filter((p) => p.rookie && parseInt(p.rookie) >= 2020));

    const team = this.randomFrom(player.teams);

    // Get appropriate rookie card manufacturer
    const { manufacturer, set } = manufacturerDatabase.getRealisticManufacturer(sport, year, true);

    const features = ['ROOKIE CARD'];
    if (sport === 'Baseball' && manufacturer === 'Bowman') {
      features.push('1ST BOWMAN CHROME', 'PROSPECT');
    }

    return {
      sport,
      brand: `${year} ${set}`,
      player: player.name,
      team,
      position: player.position,
      cardNumber: this.generateRookieCardNumber(manufacturer),
      features,
      prospectRanking: sport === 'Baseball' ? `#${Math.floor(Math.random() * 10 + 1)} Prospect` : undefined,
    };
  }

  /**
   * Parallel card template
   */
  private parallelCard() {
    const year = 2023;
    const sport = this.randomFrom(['Baseball', 'Basketball', 'Football']);

    // Get star players from sport
    const stars = PLAYER_DATABASE[sport].filter((p) => p.years.some((y) => y.includes(year.toString()))).slice(0, 15); // Top players

    const player = this.randomFrom(stars);
    const team = this.randomFrom(player.teams);

    // Get manufacturer and appropriate parallel type
    const { manufacturer, set } = manufacturerDatabase.getRealisticManufacturer(sport, year);

    const parallelTypes: Record<string, string[]> = {
      'Topps Chrome': ['Gold Refractor', 'Orange Wave', 'Red Wave', 'Purple Wave', 'Pink Wave'],
      'Bowman Chrome': ['Gold Refractor', 'Orange', 'Red', 'Purple', 'Blue'],
      'Panini Prizm': ['Silver Prizm', 'Red Prizm', 'Blue Prizm', 'Green Prizm', 'Gold Prizm'],
      'Panini Select': ['Silver', 'Blue', 'Red', 'Green', 'Gold'],
      'Panini Mosaic': ['Silver', 'Blue', 'Red', 'Green', 'Gold'],
    };

    const availableParallels = parallelTypes[set] || ['Parallel'];
    const parallel = this.randomFrom(availableParallels);
    const serialNum = this.randomFrom(['25', '50', '99', '199', '250']);

    return {
      sport,
      brand: `${year} ${set}`,
      player: player.name,
      team,
      position: player.position,
      cardNumber: `#${Math.floor(Math.random() * 300 + 1)}`,
      parallel: parallel.toUpperCase(),
      serialNumber: `${Math.floor(Math.random() * parseInt(serialNum) + 1)}/${serialNum}`,
      features: [parallel, set.includes('Chrome') ? 'REFRACTOR' : 'PARALLEL', 'Serial Numbered'],
    };
  }

  /**
   * Relic card template
   */
  private relicCard() {
    const year = 2022;
    const sport = this.randomFrom(['Baseball', 'Basketball', 'Football']);

    // Get star players
    const stars = PLAYER_DATABASE[sport].filter((p) => p.years.some((y) => y.includes(year.toString()))).slice(0, 10);

    const player = this.randomFrom(stars);
    const team = this.randomFrom(player.teams);

    // Get premium manufacturer for relic cards
    const premiumSets: Record<string, string[]> = {
      Baseball: ['Topps Definitive', 'Topps Museum Collection', 'Topps Dynasty'],
      Basketball: ['Panini Immaculate', 'Panini National Treasures', 'Panini Flawless'],
      Football: ['Panini Immaculate', 'Panini National Treasures', 'Panini Flawless'],
    };

    const setList = premiumSets[sport] || ['Premium Set'];
    const set = this.randomFrom(setList);
    const manufacturer = set.split(' ')[0];

    return {
      sport,
      brand: `${year} ${set}`,
      player: player.name,
      team,
      position: player.position,
      cardNumber: this.generatePremiumCardNumber(player.name),
      features: ['GAME-WORN MATERIAL', 'PATCH', 'MEMORABILIA'],
      serialNumber: `${Math.floor(Math.random() * 25 + 1)}/25`,
      patch: this.randomFrom(['JERSEY NUMBER', 'TEAM LOGO', 'MULTI-COLOR']),
    };
  }

  /**
   * Generates text regions based on template
   */
  private generateTextRegions(template: any, imageType: 'front' | 'back'): TextRegion[] {
    const regions: TextRegion[] = [];

    if (imageType === 'front') {
      // Brand/Set name at top
      if (template.brand) {
        regions.push({
          text: this.addOCRNoise(template.brand),
          confidence: 0.95,
          position: 'top',
          fontSize: 'medium',
        });
      }

      // Player name in middle
      if (template.player) {
        regions.push({
          text: this.addOCRNoise(template.player.toUpperCase()),
          confidence: 0.92,
          position: 'middle',
          fontSize: 'large',
          isBold: true,
        });
      }

      // Add position for sports cards
      if (template.position && template.sport !== 'Pokemon') {
        regions.push({
          text: this.addOCRNoise(template.position),
          confidence: 0.9,
          position: 'middle',
          fontSize: 'small',
        });
      }

      // Team name
      if (template.team) {
        regions.push({
          text: this.addOCRNoise(template.team),
          confidence: 0.94,
          position: 'middle',
          fontSize: 'medium',
        });
      }

      // Card number
      if (template.cardNumber) {
        regions.push({
          text: this.addOCRNoise(template.cardNumber),
          confidence: 0.96,
          position: 'bottom',
          fontSize: 'small',
        });
      }

      // Features
      if (template.features) {
        template.features.forEach((feature: string) => {
          regions.push({
            text: this.addOCRNoise(feature),
            confidence: 0.9,
            position: 'middle',
            fontSize: 'small',
          });
        });
      }

      // Serial number
      if (template.serialNumber) {
        regions.push({
          text: `Serial Numbered ${this.addOCRNoise(template.serialNumber)}`,
          confidence: 0.93,
          position: 'bottom',
          fontSize: 'small',
        });
      }

      // Grading info
      if (template.gradingLabel) {
        regions.push({
          text: this.addOCRNoise(template.gradingLabel),
          confidence: 0.98,
          position: 'top',
          fontSize: 'large',
          isBold: true,
        });

        if (template.certNumber) {
          regions.push({
            text: `Cert: ${this.addOCRNoise(template.certNumber)}`,
            confidence: 0.97,
            position: 'top',
            fontSize: 'small',
          });
        }
      }

      // Pokemon specific
      if (template.hp) {
        regions.push({
          text: this.addOCRNoise(template.name || ''),
          confidence: 0.91,
          position: 'top',
          fontSize: 'large',
          isBold: true,
        });

        regions.push({
          text: this.addOCRNoise(`${template.hp}    ${template.type}`),
          confidence: 0.89,
          position: 'top',
          fontSize: 'medium',
        });
      }
    } else {
      // Back of card
      if (template.back) {
        // Biography
        if (template.back.bio) {
          regions.push({
            text: this.addOCRNoise(template.back.bio),
            confidence: 0.88,
            position: 'top',
            fontSize: 'small',
          });
        }

        // Stats
        if (template.back.stats) {
          regions.push({
            text: this.addOCRNoise(template.back.stats),
            confidence: 0.85,
            position: 'middle',
            fontSize: 'small',
          });
        }

        // Copyright
        if (template.back.cardInfo) {
          regions.push({
            text: this.addOCRNoise(template.back.cardInfo),
            confidence: 0.9,
            position: 'bottom',
            fontSize: 'small',
          });
        }
      }

      // Card number on back
      if (template.cardNumber) {
        regions.push({
          text: this.addOCRNoise(template.cardNumber),
          confidence: 0.94,
          position: 'top',
          fontSize: 'medium',
        });
      }
    }

    return regions;
  }

  /**
   * Adds realistic OCR noise and errors
   */
  private addOCRNoise(text: string): string {
    // Occasionally add OCR errors
    if (Math.random() < 0.1) {
      const errorTypes = [
        () => this.substituteCharacter(text),
        () => this.addExtraSpace(text),
        () => this.mergeCharacters(text),
        () => this.changeCase(text),
      ];

      const errorFunc = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      text = errorFunc();
    }

    return text;
  }

  /**
   * Substitutes similar looking characters (OCR confusion)
   */
  private substituteCharacter(text: string): string {
    const chars = text.split('');
    const idx = Math.floor(Math.random() * chars.length);
    const char = chars[idx];

    const substitutions: Record<string, string[]> = {
      O: ['0', 'Q'],
      '0': ['O', 'Q'],
      I: ['1', 'l'],
      '1': ['I', 'l'],
      S: ['5'],
      '5': ['S'],
      B: ['8'],
      '8': ['B'],
      Z: ['2'],
      '2': ['Z'],
    };

    if (substitutions[char]) {
      const subs = substitutions[char];
      chars[idx] = subs[Math.floor(Math.random() * subs.length)];
    }

    return chars.join('');
  }

  /**
   * Adds extra spaces (OCR spacing errors)
   */
  private addExtraSpace(text: string): string {
    const idx = Math.floor(Math.random() * (text.length - 1)) + 1;
    return `${text.slice(0, idx)} ${text.slice(idx)}`;
  }

  /**
   * Merges characters (OCR joining errors)
   */
  private mergeCharacters(text: string): string {
    return text.replace(/r n/g, 'rn').replace(/l l/g, 'll');
  }

  /**
   * Changes case randomly (OCR case errors)
   */
  private changeCase(text: string): string {
    const words = text.split(' ');
    if (words.length > 1) {
      const idx = Math.floor(Math.random() * words.length);
      words[idx] = Math.random() > 0.5 ? words[idx].toLowerCase() : words[idx].toUpperCase();
    }
    return words.join(' ');
  }

  /**
   * Assembles full text from regions
   */
  private assembleFullText(regions: TextRegion[]): string {
    // Sort by position
    const order = ['top', 'middle', 'bottom'];
    const sorted = regions.sort((a, b) => {
      return order.indexOf(a.position) - order.indexOf(b.position);
    });

    return sorted.map((r) => r.text).join('\n');
  }

  /**
   * Generates realistic card numbers
   */
  private generateCardNumber(): string {
    const formats = [
      () => `#${Math.floor(Math.random() * 500 + 1)}`,
      () => `${Math.floor(Math.random() * 300 + 1)}A`,
      () => `RC-${Math.floor(Math.random() * 50 + 1)}`,
      () => `US${Math.floor(Math.random() * 300 + 100)}`,
      () => `${this.randomFrom(['F', 'T', 'B'])}-${Math.floor(Math.random() * 100 + 1)}`,
    ];

    return formats[Math.floor(Math.random() * formats.length)]();
  }

  /**
   * Generates rookie-specific card numbers
   */
  private generateRookieCardNumber(manufacturer: string): string {
    if (manufacturer === 'Bowman') {
      return `BCP-${Math.floor(Math.random() * 200 + 1)}`;
    } else if (manufacturer === 'Topps') {
      return `US${Math.floor(Math.random() * 300 + 175)}`;
    } else if (manufacturer === 'Panini') {
      return `#${Math.floor(Math.random() * 300 + 200)}`;
    }
    return this.generateCardNumber();
  }

  /**
   * Generates premium card numbers
   */
  private generatePremiumCardNumber(playerName: string): string {
    const initials = playerName
      .split(' ')
      .map((n) => n[0])
      .join('');
    const formats = [() => `PA-${initials}`, () => `IM-${initials}`, () => `NT-${initials}`, () => `RPA-${initials}`];
    return this.randomFrom(formats)();
  }

  /**
   * Generates certificate numbers
   */
  private generateCertNumber(): string {
    return Math.floor(Math.random() * 90000000 + 10000000).toString();
  }

  /**
   * Generates sport-specific stats
   */
  private generateStats(sport: string, vintage = false): string {
    switch (sport.toLowerCase()) {
      case 'baseball':
        const avg = `.${Math.floor(Math.random() * 100 + 200)}`;
        const hr = Math.floor(Math.random() * 40 + 5);
        const rbi = Math.floor(Math.random() * 100 + 20);
        return vintage ? `Career: ${avg} AVG, ${hr} HR` : `${avg} AVG | ${hr} HR | ${rbi} RBI`;

      case 'basketball':
        const ppg = (Math.random() * 15 + 15).toFixed(1);
        const rpg = (Math.random() * 8 + 4).toFixed(1);
        const apg = (Math.random() * 6 + 2).toFixed(1);
        return `${ppg} PPG | ${rpg} RPG | ${apg} APG`;

      case 'football':
        const td = Math.floor(Math.random() * 30 + 10);
        const yds = Math.floor(Math.random() * 3000 + 2000);
        const comp = Math.floor(Math.random() * 20 + 60);
        return `${td} TD | ${yds} YDS | ${comp}% COMP`;

      case 'hockey':
        const goals = Math.floor(Math.random() * 40 + 10);
        const assists = Math.floor(Math.random() * 50 + 20);
        const pts = goals + assists;
        return `${goals} G | ${assists} A | ${pts} PTS`;

      default:
        return '';
    }
  }

  /**
   * Generates detailed stats table
   */
  private generateDetailedStats(sport?: string): string {
    const years = ['2020', '2021', '2022', '2023'];

    if (!sport || sport.toLowerCase() === 'baseball') {
      const stats = years.map((year) => {
        const avg = `.${Math.floor(Math.random() * 50 + 250)}`;
        const hr = Math.floor(Math.random() * 30 + 10);
        const rbi = Math.floor(Math.random() * 80 + 40);
        return `${year}: ${avg} AVG, ${hr} HR, ${rbi} RBI`;
      });
      return stats.join('\n');
    } else if (sport.toLowerCase() === 'basketball') {
      const stats = years.map((year) => {
        const ppg = (Math.random() * 10 + 20).toFixed(1);
        const rpg = (Math.random() * 5 + 5).toFixed(1);
        const apg = (Math.random() * 4 + 4).toFixed(1);
        return `${year}: ${ppg} PPG, ${rpg} RPG, ${apg} APG`;
      });
      return stats.join('\n');
    } else if (sport.toLowerCase() === 'football') {
      const stats = years.map((year) => {
        const td = Math.floor(Math.random() * 20 + 20);
        const yds = Math.floor(Math.random() * 1500 + 3000);
        return `${year}: ${td} TD, ${yds} YDS`;
      });
      return stats.join('\n');
    }

    return 'Career statistics';
  }

  /**
   * Generates vintage stats format
   */
  private generateVintageStats(sport?: string): string {
    if (!sport || sport === 'Baseball') {
      return (
        'Major League Totals:\n' +
        `G: ${Math.floor(Math.random() * 1000 + 500)}\n` +
        `AB: ${Math.floor(Math.random() * 4000 + 2000)}\n` +
        `H: ${Math.floor(Math.random() * 1500 + 500)}\n` +
        `HR: ${Math.floor(Math.random() * 200 + 50)}`
      );
    } else if (sport === 'Basketball') {
      return (
        'Career Totals:\n' +
        `GP: ${Math.floor(Math.random() * 800 + 400)}\n` +
        `PTS: ${Math.floor(Math.random() * 15000 + 8000)}\n` +
        `REB: ${Math.floor(Math.random() * 6000 + 3000)}\n` +
        `AST: ${Math.floor(Math.random() * 4000 + 2000)}`
      );
    } else if (sport === 'Football') {
      return (
        'Career Stats:\n' +
        `G: ${Math.floor(Math.random() * 150 + 100)}\n` +
        `TD: ${Math.floor(Math.random() * 200 + 100)}\n` +
        `YDS: ${Math.floor(Math.random() * 30000 + 20000)}`
      );
    }
    return 'Career statistics';
  }

  /**
   * Generates BGS subgrades
   */
  private generateSubgrades(): string {
    const grades = ['9.5', '9', '10', '9.5'];
    return `Centering: ${grades[0]} | Corners: ${grades[1]} | Edges: ${grades[2]} | Surface: ${grades[3]}`;
  }

  /**
   * Helper to get random element from array
   */
  private randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Weighted random selection
   */
  private weightedRandom<T extends { weight: number }>(items: T[]): any {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return (item as any).sport || item;
      }
    }

    return items[0];
  }

  /**
   * Cleans extracted text for better parsing
   */
  cleanText(text: string): string {
    // Remove extra spaces
    text = text.replace(/\s+/g, ' ').trim();

    // Fix common OCR errors
    Object.entries(OCR_CORRECTIONS).forEach(([error, correct]) => {
      text = text.replace(new RegExp(error, 'g'), correct);
    });

    // Normalize quotes and dashes
    text = text.replace(/[""]/g, '"').replace(/['']/g, "'").replace(/[—–]/g, '-');

    return text;
  }

  /**
   * Extracts specific patterns from text
   */
  extractPatterns(text: string): Record<string, string[]> {
    const patterns: Record<string, string[]> = {};

    Object.entries(TEXT_PATTERNS).forEach(([name, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        patterns[name] = matches;
      }
    });

    return patterns;
  }
}

// Export singleton instance
export const textExtractionService = new TextExtractionService();
