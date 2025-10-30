// Card Detection Service - Simulates AI/OCR card detection from images
// In production, this would integrate with services like Google Vision API, AWS Textract, or custom ML models

import { ExtractedCardData, DetectionConfidence, CardFeatures } from '../types/detection';

import { manufacturerDatabase } from './manufacturerDatabase';
import { playerDatabase } from './playerDatabase';
import { realOCRService } from './realOCRService';
import { textExtractionService } from './textExtractionService';

// Common card patterns and keywords
const CARD_PATTERNS = {
  rookieIndicators: [
    'ROOKIE',
    'RC',
    'FIRST YEAR',
    'DRAFT PICK',
    'PROSPECT',
    'DEBUT',
    'RATED ROOKIE',
    'FUTURE STARS',
    'STAR ROOKIE',
    '1ST BOWMAN',
  ],
  autographIndicators: [
    'AUTO',
    'AUTOGRAPH',
    'SIGNED',
    'SIGNATURE',
    'ON-CARD AUTO',
    'AUTHENTIC',
    'CERTIFIED AUTOGRAPH',
    'DUAL AUTO',
  ],
  relicIndicators: [
    'RELIC',
    'PATCH',
    'JERSEY',
    'MEMORABILIA',
    'GAME-USED',
    'GAME-WORN',
    'BAT',
    'MATERIAL',
    'SWATCH',
    'PRIME',
  ],
  parallelIndicators: [
    'REFRACTOR',
    'PRIZM',
    'CHROME',
    'GOLD',
    'SILVER',
    'BLACK',
    'RAINBOW',
    'SAPPHIRE',
    'ORANGE',
    'RED',
    'BLUE',
    'GREEN',
    'ATOMIC',
    'SHIMMER',
    'MOSAIC',
    'OPTIC',
    'SELECT',
  ],
  numberedIndicators: [
    /\d+\/\d+/, // Matches patterns like 25/99
    /LIMITED TO \d+/,
    /NUMBERED TO \d+/,
    /#\d+ OF \d+/,
  ],
  gradeIndicators: {
    PSA: /PSA\s*(\d+(?:\.\d+)?)/,
    BGS: /BGS\s*(\d+(?:\.\d+)?)/,
    SGC: /SGC\s*(\d+(?:\.\d+)?)/,
    CGC: /CGC\s*(\d+(?:\.\d+)?)/,
  },
};

// Brand detection patterns
const BRAND_PATTERNS = {
  Topps: ['TOPPS', 'TOPPS CHROME', 'TOPPS UPDATE', 'TOPPS SERIES', 'BOWMAN', 'BOWMAN CHROME'],
  Panini: ['PANINI', 'PRIZM', 'MOSAIC', 'SELECT', 'OPTIC', 'DONRUSS', 'NATIONAL TREASURES', 'IMMACULATE'],
  'Upper Deck': ['UPPER DECK', 'UD', 'SP AUTHENTIC', 'THE CUP', 'ULTIMATE COLLECTION'],
  Leaf: ['LEAF', 'LEAF METAL', 'LEAF TRINITY'],
  Fleer: ['FLEER', 'FLEER ULTRA', 'SKYBOX'],
  Score: ['SCORE', 'SCORE SELECT'],
  Bowman: ['BOWMAN', 'BOWMAN CHROME', 'BOWMAN DRAFT', "BOWMAN'S BEST"],
};

// Sport detection keywords
const SPORT_PATTERNS = {
  Baseball: ['MLB', 'BASEBALL', 'PITCHER', 'BATTING', 'HOME RUN', 'STOLEN BASE', 'ERA'],
  Basketball: ['NBA', 'BASKETBALL', 'REBOUNDS', 'ASSISTS', 'POINTS', 'DUNK', 'THREE-POINTER'],
  Football: ['NFL', 'FOOTBALL', 'TOUCHDOWN', 'PASSING', 'RUSHING', 'QUARTERBACK', 'YARDS'],
  Hockey: ['NHL', 'HOCKEY', 'GOALS', 'ASSISTS', 'GOALIE', 'STANLEY CUP', 'HAT TRICK'],
  Soccer: ['SOCCER', 'FOOTBALL', 'GOALS', 'FIFA', 'WORLD CUP', 'PREMIER LEAGUE', 'LA LIGA'],
  Pokemon: ['POKEMON', 'POKÉMON', 'HP', 'ENERGY', 'TRAINER', 'EVOLUTION', 'ATTACK'],
};

// Common player name patterns for better extraction
const PLAYER_NAME_PATTERNS = [
  // First Last
  /^([A-Z][a-z]+)\s+([A-Z][a-z]+(?:\s+(?:Jr\.|Sr\.|III|II|IV))?)$/,
  // First Middle Last
  /^([A-Z][a-z]+)\s+([A-Z]\.?)\s+([A-Z][a-z]+)$/,
  // Nickname patterns
  /^([A-Z][a-z]+)\s+"([^"]+)"\s+([A-Z][a-z]+)$/,
];

export class CardDetectionService {
  /**
   * Main detection function that processes card images
   * In production, this would send images to an AI/OCR service
   */
  async detectCard(frontImage: string, backImage?: string | null): Promise<ExtractedCardData> {
    // Check if we should use real OCR (environment variable or feature flag)
    const useRealOCR = process.env.REACT_APP_USE_REAL_OCR === 'true' || localStorage.getItem('useRealOCR') === 'true';

    if (useRealOCR) {
      try {
        console.log('Using real OCR for card detection...');
        return await realOCRService.processCardImages(frontImage, backImage || undefined);
      } catch (error) {
        console.error('Real OCR failed, falling back to simulation:', error);
        // Fall through to simulation
      }
    }

    // Original simulation code
    // Simulate processing time
    await this.simulateProcessing();

    // Extract text from front image
    const frontExtraction = textExtractionService.extractText(frontImage, 'front');

    // Extract text from back image if provided
    const backExtraction = backImage ? textExtractionService.extractText(backImage, 'back') : null;

    // Combine text regions with confidence weighting
    const combinedText = this.combineExtractedText(frontExtraction, backExtraction);

    // Clean the text for better parsing
    const cleanedText = textExtractionService.cleanText(combinedText);

    // Extract patterns from text
    const patterns = textExtractionService.extractPatterns(cleanedText);

    // Extract structured data with region awareness
    const extractedData = this.extractDataFromRegions(
      frontExtraction.regions,
      backExtraction?.regions,
      cleanedText,
      patterns
    );

    // Detect special features
    const features = this.detectSpecialFeatures(cleanedText);

    // Calculate confidence based on extraction quality
    const confidence = this.calculateExtractionConfidence(extractedData, features, frontExtraction.regions);

    return {
      ...extractedData,
      features,
      confidence,
      rawText: combinedText,
      extractionErrors: this.validateExtraction(extractedData),
    };
  }

  /**
   * Simulates processing delay
   */
  private async simulateProcessing(): Promise<void> {
    const delay = Math.random() * 1500 + 1500; // 1.5-3 seconds
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Combines text from front and back extractions
   */
  private combineExtractedText(frontExtraction: any, backExtraction: any | null): string {
    let combined = frontExtraction.fullText;

    if (backExtraction) {
      combined += `\n\n--- BACK OF CARD ---\n\n${backExtraction.fullText}`;
    }

    return combined;
  }

  /**
   * Extracts data using region-aware parsing
   */
  private extractDataFromRegions(
    frontRegions: any[],
    backRegions: any[] | undefined,
    fullText: string,
    patterns: Record<string, string[]>
  ): Partial<ExtractedCardData> {
    const data: Partial<ExtractedCardData> = {};

    // Process front regions by position and confidence
    const topRegions = frontRegions.filter((r) => r.position === 'top');
    const middleRegions = frontRegions.filter((r) => r.position === 'middle');
    const bottomRegions = frontRegions.filter((r) => r.position === 'bottom');

    // Extract brand/set from top regions
    for (const region of topRegions) {
      if (region.confidence > 0.9) {
        const brandMatch = this.matchBrand(region.text);
        if (brandMatch) {
          data.brand = brandMatch.brand;
          data.setName = brandMatch.setName || region.text;
          break;
        }
      }
    }

    // Extract player from middle regions (usually largest text)
    const playerRegion = middleRegions
      .filter((r) => r.fontSize === 'large' && r.isBold)
      .sort((a, b) => b.confidence - a.confidence)[0];

    if (playerRegion) {
      // Try to find player in database
      const playerInfo = playerDatabase.findPlayer(playerRegion.text);
      if (playerInfo) {
        data.player = playerInfo.name;
        data.category = playerInfo.sport;
        // If we found the player, validate the team
        if (data.team && !playerInfo.teams.includes(data.team)) {
          // Try to find a matching team
          data.team = playerInfo.teams[0];
        }
      } else {
        data.player = this.normalizePlayerName(playerRegion.text);
      }
    }

    // Extract team from middle regions
    const teamRegion = middleRegions.find((r) => r.fontSize === 'medium' && !r.isBold && r.text !== data.player);

    if (teamRegion) {
      // Try to find team in database
      const teamInfo = playerDatabase.findTeam(teamRegion.text);
      if (teamInfo) {
        data.team = teamInfo.name;
        // If we have a team but no sport yet, set it
        if (!data.category) {
          data.category = teamInfo.sport;
        }
      } else {
        data.team = this.extractTeam(teamRegion.text);
      }
    }

    // Extract card number from bottom regions or patterns
    const cardNumberRegion = bottomRegions.find((r) => r.text.match(/#?\w+-?\d+/) || r.text.match(/^\d+[A-Z]?$/));

    if (cardNumberRegion) {
      data.cardNumber = this.extractCardNumber(cardNumberRegion.text);
    } else if (patterns.alphanumeric && patterns.alphanumeric.length > 0) {
      data.cardNumber = patterns.alphanumeric[0];
    }

    // Extract year from patterns or text
    if (patterns.years && patterns.years.length > 0) {
      data.year = patterns.years[0].substring(0, 4);
    } else {
      const yearMatch = fullText.match(/(19\d{2}|20\d{2})/);
      if (yearMatch) {
        data.year = yearMatch[1];
      }
    }

    // Extract serial number from patterns
    if (patterns.fractions && patterns.fractions.length > 0) {
      const serialMatch = patterns.fractions[0].match(/(\d+)\s*\/\s*(\d+)/);
      if (serialMatch) {
        data.serialNumber = serialMatch[0];
        data.printRun = parseInt(serialMatch[2]);
      }
    }

    // Extract parallel/variation from high-confidence regions
    const parallelRegion = frontRegions.find((r) =>
      CARD_PATTERNS.parallelIndicators.some((p) => r.text.toUpperCase().includes(p))
    );

    if (parallelRegion) {
      data.parallel = parallelRegion.text;
    }

    // Extract category based on content
    if (!data.category) {
      // Try to get sport from brand
      if (data.brand) {
        const sportFromBrand = playerDatabase.getSportFromBrand(data.brand, fullText);
        if (sportFromBrand) {
          data.category = sportFromBrand;
        }
      }

      // If still no category, use pattern detection
      if (!data.category) {
        data.category = this.detectCategory(fullText, patterns);
      }
    }

    // Validate manufacturer-sport-year combination
    if (data.brand && data.category && data.year) {
      const year = parseInt(data.year);
      const manufacturer = data.brand
        .split(' ')
        .find((part) => manufacturerDatabase.validateManufacturer(part, data.category!, year));

      // If manufacturer doesn't match sport/year, try to correct it
      if (!manufacturer) {
        const validManufacturers = manufacturerDatabase.getValidManufacturers(data.category, year);
        if (validManufacturers.length > 0 && data.player) {
          // Check if it's a rookie to prefer Bowman for baseball
          const playerInfo = playerDatabase.findPlayer(data.player);
          const isRookie = playerInfo && playerInfo.rookie === data.year;

          const { manufacturer: correctMfr, set } = manufacturerDatabase.getRealisticManufacturer(
            data.category,
            year,
            isRookie || false
          );

          // Update brand with correct manufacturer
          data.brand = `${data.year} ${set}`;
        }
      }
    }

    // Extract grading info if present
    const gradeInfo = this.extractGradingInfo(frontRegions, fullText);
    if (gradeInfo) {
      data.gradingCompany = gradeInfo.company;
      data.grade = gradeInfo.grade;
      data.certNumber = gradeInfo.certNumber;
    }

    return data;
  }

  /**
   * Matches brand patterns
   */
  private matchBrand(text: string): { brand: string; setName?: string } | null {
    const upperText = text.toUpperCase();

    for (const [brand, keywords] of Object.entries(BRAND_PATTERNS)) {
      for (const keyword of keywords) {
        if (upperText.includes(keyword)) {
          return { brand, setName: text };
        }
      }
    }

    return null;
  }

  /**
   * Normalizes player names
   */
  private normalizePlayerName(text: string): string {
    // Remove extra spaces
    text = text.trim().replace(/\s+/g, ' ');

    // Handle all caps
    if (text === text.toUpperCase()) {
      return text
        .split(' ')
        .map((word) => {
          if (word.length <= 2) return word; // Keep Jr., Sr., etc
          return word.charAt(0) + word.slice(1).toLowerCase();
        })
        .join(' ');
    }

    return text;
  }

  /**
   * Extracts team name
   */
  private extractTeam(text: string): string {
    // Clean up team text
    return text
      .trim()
      .replace(/^\W+|\W+$/g, '') // Remove leading/trailing non-word chars
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Extracts card number
   */
  private extractCardNumber(text: string): string {
    // Remove common prefixes but keep the number
    return text.replace(/^(Card\s*)?#?\s*/i, '').trim();
  }

  /**
   * Detects card category/sport
   */
  private detectCategory(text: string, patterns: Record<string, string[]>): string {
    const upperText = text.toUpperCase();

    // Check for sport-specific keywords
    for (const [sport, keywords] of Object.entries(SPORT_PATTERNS)) {
      let matchCount = 0;
      for (const keyword of keywords) {
        if (upperText.includes(keyword)) {
          matchCount++;
        }
      }
      if (matchCount >= 2) {
        return sport;
      }
    }

    // Check stats patterns
    if (patterns.stats && patterns.stats.length > 0) {
      const statText = patterns.stats.join(' ').toUpperCase();
      if (statText.includes('AVG') || statText.includes('HR') || statText.includes('RBI')) {
        return 'Baseball';
      }
      if (statText.includes('PPG') || statText.includes('RPG') || statText.includes('APG')) {
        return 'Basketball';
      }
      if (statText.includes('TD') || statText.includes('YDS')) {
        return 'Football';
      }
    }

    return 'Other';
  }

  /**
   * Extracts grading information
   */
  private extractGradingInfo(
    regions: any[],
    text: string
  ): { company: string; grade: string; certNumber?: string } | null {
    // Look for grading company in high-confidence regions
    for (const region of regions) {
      if (region.confidence > 0.95) {
        for (const [company, pattern] of Object.entries(CARD_PATTERNS.gradeIndicators)) {
          const match = region.text.match(pattern);
          if (match) {
            const result: any = {
              company,
              grade: match[1],
            };

            // Look for cert number
            const certMatch = text.match(/Cert:?\s*(\d{7,})/i);
            if (certMatch) {
              result.certNumber = certMatch[1];
            }

            return result;
          }
        }
      }
    }

    return null;
  }

  /**
   * Calculates confidence based on extraction quality
   */
  private calculateExtractionConfidence(
    data: Partial<ExtractedCardData>,
    features: CardFeatures,
    regions: any[]
  ): DetectionConfidence {
    let score = 0;
    let detectedFields = 0;
    const missingFields: string[] = [];

    // Score based on field completeness
    const fieldScores: Record<string, number> = {
      player: 20,
      year: 15,
      brand: 15,
      cardNumber: 10,
      team: 8,
      category: 5,
      setName: 5,
      parallel: 3,
      serialNumber: 4,
    };

    for (const [field, points] of Object.entries(fieldScores)) {
      if (data[field as keyof ExtractedCardData]) {
        score += points;
        detectedFields++;
      } else if (points >= 10) {
        missingFields.push(field);
      }
    }

    // Bonus for special features
    const featureCount = Object.values(features).filter(Boolean).length;
    score += featureCount * 3;

    // Bonus for high-confidence regions
    const highConfidenceRegions = regions.filter((r) => r.confidence > 0.9).length;
    score += Math.min(highConfidenceRegions * 2, 10);

    // Calculate percentage
    const percentage = Math.min(Math.round(score), 100);

    // Determine level
    let level: 'high' | 'medium' | 'low';
    if (percentage >= 80) level = 'high';
    else if (percentage >= 60) level = 'medium';
    else level = 'low';

    // Add warnings for low confidence
    const warnings: string[] = [];
    if (regions.some((r) => r.confidence < 0.7)) {
      warnings.push('Some text regions have low confidence');
    }
    if (missingFields.length > 2) {
      warnings.push('Multiple important fields missing');
    }

    return {
      score: percentage,
      level,
      detectedFields,
      missingFields: missingFields.length > 0 ? missingFields : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validates extraction results
   */
  private validateExtraction(data: Partial<ExtractedCardData>): string[] | undefined {
    const errors: string[] = [];

    // Validate year
    if (data.year) {
      const year = parseInt(data.year);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        errors.push(`Invalid year: ${data.year}`);
      }
    }

    // Validate serial number
    if (data.serialNumber && data.printRun) {
      const match = data.serialNumber.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) {
        const current = parseInt(match[1]);
        const total = parseInt(match[2]);
        if (current > total) {
          errors.push(`Invalid serial number: ${current} > ${total}`);
        }
      }
    }

    return errors.length > 0 ? errors : undefined;
  }

  /**
   * DEPRECATED: Now using textExtractionService
   * Generates realistic mock OCR text
   */
  private generateMockOCRText(): string {
    const templates = [
      // Modern Baseball
      `2023 Topps Chrome
      RONALD ACUÑA JR.
      Atlanta Braves
      #RA-15
      REFRACTOR
      Serial Numbered 150/250
      Rookie Cup
      .280 AVG | 41 HR | 106 RBI`,

      // Vintage Baseball
      `1989 Upper Deck
      Ken Griffey Jr.
      Seattle Mariners
      #1
      ROOKIE CARD
      The Natural
      .264 AVG | 16 HR | 61 RBI`,

      // Basketball
      `2019-20 Panini Prizm
      LUKA DONČIĆ
      Dallas Mavericks
      #75
      SILVER PRIZM
      21.2 PPG | 7.8 RPG | 6.0 APG
      ROY 2018-19`,

      // Football
      `2020 Panini Select
      JUSTIN HERBERT
      Los Angeles Chargers
      #44
      CONCOURSE LEVEL
      ROOKIE CARD
      Offensive Rookie of the Year
      31 TD | 10 INT | 4,336 YDS`,

      // Pokemon
      `Charizard
      120 HP    Fire
      Stage 2 - Evolves from Charmeleon
      
      Fire Spin 100
      Discard 2 Energy cards attached
      
      Weakness: Water x2
      Resistance: Fighting -30
      Retreat: 3
      
      4/102 RARE HOLO
      Base Set`,

      // Graded Card
      `PSA 10 GEM MINT
      2011 Topps Update
      MIKE TROUT
      Los Angeles Angels
      #US175
      ROOKIE CARD
      Cert: 12345678`,

      // Autographed Card
      `2022 Panini National Treasures
      SHOHEI OHTANI
      Los Angeles Angels
      ROOKIE PATCH AUTOGRAPH
      #RPA-SO
      GAME-WORN JERSEY
      ON-CARD AUTOGRAPH
      25/49`,

      // Parallel with Features
      `2021 Bowman Chrome
      WANDER FRANCO
      Tampa Bay Rays
      #BCP-100
      GOLD REFRACTOR
      1ST BOWMAN CHROME
      Serial #'d 43/50
      TOP PROSPECT`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Extracts structured data from OCR text
   */
  private extractDataFromText(text: string): Partial<ExtractedCardData> {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const data: Partial<ExtractedCardData> = {};

    // Extract year (4 digits at start of line or in format YYYY-YY)
    const yearMatch = text.match(/\b(19\d{2}|20\d{2})(?:-\d{2})?\b/);
    if (yearMatch) {
      data.year = yearMatch[1];
    }

    // Extract brand
    for (const [brand, keywords] of Object.entries(BRAND_PATTERNS)) {
      if (keywords.some((keyword) => text.toUpperCase().includes(keyword))) {
        data.brand = brand;
        // Look for specific set name
        const brandLine = lines.find((line) => keywords.some((kw) => line.toUpperCase().includes(kw)));
        if (brandLine) {
          data.setName = brandLine;
        }
        break;
      }
    }

    // Extract player name
    const playerLine = this.findPlayerName(lines);
    if (playerLine) {
      data.player = playerLine;
    }

    // Extract card number
    const cardNumberMatch = text.match(/#?([A-Z0-9]+-?[A-Z0-9]+)/);
    if (cardNumberMatch) {
      data.cardNumber = cardNumberMatch[1];
    }

    // Extract team
    const teamLine = this.findTeamName(lines);
    if (teamLine) {
      data.team = teamLine;
    }

    // Extract sport/category
    for (const [sport, keywords] of Object.entries(SPORT_PATTERNS)) {
      if (keywords.some((keyword) => text.toUpperCase().includes(keyword))) {
        data.category = sport;
        break;
      }
    }

    // Extract parallel/variation
    const parallel = this.findParallel(text);
    if (parallel) {
      data.parallel = parallel;
    }

    // Extract serial number
    const serialMatch = text.match(/(\d+)\/(\d+)/);
    if (serialMatch) {
      data.serialNumber = serialMatch[0];
      data.printRun = parseInt(serialMatch[2]);
    }

    // Extract grade if present
    for (const [company, pattern] of Object.entries(CARD_PATTERNS.gradeIndicators)) {
      const gradeMatch = text.match(pattern);
      if (gradeMatch) {
        data.gradingCompany = company;
        data.grade = gradeMatch[1];

        // Extract cert number
        const certMatch = text.match(/Cert:?\s*(\d+)/i);
        if (certMatch) {
          data.certNumber = certMatch[1];
        }
        break;
      }
    }

    return data;
  }

  /**
   * Detects special card features
   */
  private detectSpecialFeatures(text: string): CardFeatures {
    const upperText = text.toUpperCase();

    return {
      isRookie: CARD_PATTERNS.rookieIndicators.some((indicator) => upperText.includes(indicator)),
      isAutograph: CARD_PATTERNS.autographIndicators.some((indicator) => upperText.includes(indicator)),
      isRelic: CARD_PATTERNS.relicIndicators.some((indicator) => upperText.includes(indicator)),
      isNumbered: CARD_PATTERNS.numberedIndicators.some((pattern) => pattern.test(text)),
      isGraded: Object.values(CARD_PATTERNS.gradeIndicators).some((pattern) => pattern.test(text)),
      isParallel: CARD_PATTERNS.parallelIndicators.some((indicator) => upperText.includes(indicator)),
    };
  }

  /**
   * Finds player name from text lines
   */
  private findPlayerName(lines: string[]): string | undefined {
    // Look for lines that match player name patterns
    for (const line of lines) {
      // Skip lines that are obviously not names
      if (line.length < 3 || line.length > 40) continue;
      if (/^\d+$/.test(line)) continue; // Skip pure numbers
      if (line.includes('#')) continue; // Skip card numbers

      // Check if it matches common name patterns
      for (const pattern of PLAYER_NAME_PATTERNS) {
        if (pattern.test(line)) {
          return line;
        }
      }

      // Check if it's in all caps (common for player names)
      if (line === line.toUpperCase() && line.split(' ').length >= 2) {
        // Convert to proper case
        return line
          .split(' ')
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(' ');
      }
    }

    return undefined;
  }

  /**
   * Finds team name from text
   */
  private findTeamName(lines: string[]): string | undefined {
    const commonTeams = [
      'Angels',
      'Astros',
      'Athletics',
      'Blue Jays',
      'Braves',
      'Brewers',
      'Cardinals',
      'Cubs',
      'Diamondbacks',
      'Dodgers',
      'Giants',
      'Guardians',
      'Mariners',
      'Marlins',
      'Mets',
      'Nationals',
      'Orioles',
      'Padres',
      'Phillies',
      'Pirates',
      'Rangers',
      'Rays',
      'Red Sox',
      'Reds',
      'Rockies',
      'Royals',
      'Tigers',
      'Twins',
      'White Sox',
      'Yankees',
      // NBA
      'Lakers',
      'Warriors',
      'Celtics',
      'Heat',
      'Bucks',
      'Suns',
      'Mavericks',
      'Nuggets',
      'Clippers',
      'Nets',
      'Knicks',
      'Bulls',
      // NFL
      'Cowboys',
      'Patriots',
      'Packers',
      'Chiefs',
      'Bills',
      'Rams',
      'Chargers',
      'Bengals',
      'Ravens',
      'Steelers',
      'Browns',
      '49ers',
    ];

    for (const line of lines) {
      for (const team of commonTeams) {
        if (line.includes(team)) {
          return line;
        }
      }
    }

    return undefined;
  }

  /**
   * Finds parallel/variation information
   */
  private findParallel(text: string): string | undefined {
    const upperText = text.toUpperCase();

    for (const parallel of CARD_PATTERNS.parallelIndicators) {
      if (upperText.includes(parallel)) {
        // Try to find the full parallel name
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.toUpperCase().includes(parallel)) {
            return line.trim();
          }
        }
        return parallel;
      }
    }

    return undefined;
  }

  /**
   * Calculates confidence score based on extracted data completeness
   */
  private calculateConfidence(data: Partial<ExtractedCardData>, features: CardFeatures): DetectionConfidence {
    let score = 0;
    let fieldCount = 0;

    // Required fields (weighted higher)
    if (data.player) {
      score += 20;
      fieldCount++;
    }
    if (data.year) {
      score += 15;
      fieldCount++;
    }
    if (data.brand) {
      score += 15;
      fieldCount++;
    }

    // Important fields
    if (data.cardNumber) {
      score += 10;
      fieldCount++;
    }
    if (data.team) {
      score += 8;
      fieldCount++;
    }
    if (data.category) {
      score += 8;
      fieldCount++;
    }

    // Additional fields
    if (data.setName) {
      score += 5;
      fieldCount++;
    }
    if (data.parallel) {
      score += 5;
      fieldCount++;
    }
    if (data.serialNumber) {
      score += 4;
      fieldCount++;
    }

    // Special features boost confidence
    if (features.isRookie) score += 3;
    if (features.isAutograph) score += 3;
    if (features.isRelic) score += 3;
    if (features.isNumbered) score += 2;
    if (features.isGraded) score += 5;

    // Calculate final score
    const maxScore = 100;
    const percentage = Math.min(Math.round((score / maxScore) * 100), 100);

    // Determine confidence level
    let level: 'high' | 'medium' | 'low';
    if (percentage >= 80) level = 'high';
    else if (percentage >= 60) level = 'medium';
    else level = 'low';

    return {
      score: percentage,
      level,
      detectedFields: fieldCount,
    };
  }
}

// Export singleton instance
export const cardDetectionService = new CardDetectionService();
