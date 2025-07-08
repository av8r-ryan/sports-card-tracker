import { createWorker } from 'tesseract.js';
import { ExtractedCardData, CardFeatures } from '../types/detection';
import { playerDatabase } from './playerDatabase';
import { manufacturerDatabase } from './manufacturerDatabase';

export class RealOCRService {
  /**
   * Extract text from image using Tesseract.js
   */
  async extractTextFromImage(imageData: string): Promise<string> {
    const worker = await createWorker('eng', 1, {
      logger: (m: any) => console.log('OCR Progress:', m)
    });
    
    try {
      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();
      return text;
    } catch (error) {
      console.error('OCR Error:', error);
      await worker.terminate();
      throw error;
    }
  }

  /**
   * Parse extracted text to find card information
   */
  parseCardData(text: string): Partial<ExtractedCardData> {
    const data: Partial<ExtractedCardData> = {};
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Common patterns
    const yearPattern = /\b(19[5-9]\d|20[0-2]\d)\b/;
    const cardNumberPattern = /(?:#|No\.?|Card)\s*(\d+[A-Za-z]?)/i;
    const serialPattern = /(\d+)\s*\/\s*(\d+)/;
    
    // Look for year
    const yearMatch = text.match(yearPattern);
    if (yearMatch) {
      data.year = yearMatch[1];
    }
    
    // Look for card number
    const cardNumberMatch = text.match(cardNumberPattern);
    if (cardNumberMatch) {
      data.cardNumber = cardNumberMatch[1];
    }
    
    // Look for serial numbering
    const serialMatch = text.match(serialPattern);
    if (serialMatch) {
      data.serialNumber = serialMatch[0];
    }
    
    // Try to identify brand/manufacturer
    const brands = ['Topps', 'Panini', 'Upper Deck', 'Bowman', 'Donruss', 'Fleer', 'Score'];
    for (const brand of brands) {
      if (text.toLowerCase().includes(brand.toLowerCase())) {
        data.brand = brand;
        break;
      }
    }
    
    // Try to identify sport
    const sportKeywords = {
      'Baseball': ['MLB', 'baseball', 'pitcher', 'batting', 'home run'],
      'Basketball': ['NBA', 'basketball', 'rebounds', 'assists', 'points'],
      'Football': ['NFL', 'football', 'touchdown', 'quarterback', 'yards'],
      'Hockey': ['NHL', 'hockey', 'goals', 'goalie', 'stanley cup']
    };
    
    for (const [sport, keywords] of Object.entries(sportKeywords)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
        data.category = sport;
        break;
      }
    }
    
    // Try to find player name using various heuristics
    data.player = this.extractPlayerName(lines, text);
    
    // Try to find team
    data.team = this.extractTeam(text);
    
    // Check for special features
    const features: CardFeatures = {
      isRookie: /rookie|rc|first year|debut/i.test(text),
      isAutograph: /auto|autograph|signed|signature/i.test(text),
      isRelic: /relic|patch|jersey|memorabilia|game.?used/i.test(text),
      isNumbered: serialMatch !== null,
      isGraded: /psa|bgs|sgc|cgc/i.test(text),
      isParallel: /refractor|prizm|chrome|gold|silver/i.test(text)
    };
    
    // Extract grade if present
    const gradeMatch = text.match(/(?:PSA|BGS|SGC|CGC)\s*(\d+(?:\.\d+)?)/i);
    if (gradeMatch) {
      data.gradingCompany = gradeMatch[0].split(/\s+/)[0].toUpperCase();
      data.grade = gradeMatch[1];
    }
    
    // Detect parallel/variation
    const parallelKeywords = ['Refractor', 'Prizm', 'Chrome', 'Gold', 'Silver', 'Black', 'Rainbow'];
    for (const parallel of parallelKeywords) {
      if (text.includes(parallel)) {
        data.parallel = parallel;
        break;
      }
    }
    
    return { ...data, features };
  }

  /**
   * Extract player name using various strategies
   */
  private extractPlayerName(lines: string[], fullText: string): string {
    // Strategy 1: Look for known players in database
    const allPlayers: string[] = [];
    const players = playerDatabase.getAllPlayers();
    players.forEach(player => allPlayers.push(player.name));
    
    // Check exact matches first
    for (const player of allPlayers) {
      if (fullText.includes(player)) {
        return player;
      }
    }
    
    // Strategy 2: Look for title case names (common on cards)
    const namePattern = /\b([A-Z][a-z]+ [A-Z][a-z]+(?:\s+(?:Jr\.|Sr\.|III|II|IV))?)\b/g;
    const matches = fullText.match(namePattern);
    
    if (matches) {
      // Filter out common non-player words
      const nonPlayerWords = ['Topps', 'Panini', 'Upper Deck', 'Baseball', 'Football', 'Basketball', 'Hockey', 'Rookie', 'Card'];
      const potentialNames = matches.filter(match => 
        !nonPlayerWords.some(word => match.includes(word))
      );
      
      if (potentialNames.length > 0) {
        // Return the first potential name (often the most prominent)
        return potentialNames[0];
      }
    }
    
    // Strategy 3: Look for the largest/boldest text (usually the player name)
    // This would require more advanced image processing
    
    return '';
  }

  /**
   * Extract team name from text
   */
  private extractTeam(text: string): string {
    // Common team names and abbreviations
    const teams = [
      // MLB
      'Yankees', 'NYY', 'Red Sox', 'BOS', 'Dodgers', 'LAD', 'Giants', 'SF',
      'Cardinals', 'STL', 'Cubs', 'CHC', 'Braves', 'ATL', 'Astros', 'HOU',
      // NBA
      'Lakers', 'LAL', 'Celtics', 'BOS', 'Warriors', 'GSW', 'Bulls', 'CHI',
      'Heat', 'MIA', 'Spurs', 'SAS', 'Knicks', 'NYK', 'Nets', 'BKN',
      // NFL
      'Patriots', 'NE', 'Cowboys', 'DAL', 'Packers', 'GB', 'Chiefs', 'KC',
      'Eagles', 'PHI', 'Steelers', 'PIT', '49ers', 'SF', 'Bills', 'BUF',
      // NHL
      'Rangers', 'NYR', 'Canadiens', 'MTL', 'Maple Leafs', 'TOR', 'Bruins', 'BOS',
      'Blackhawks', 'CHI', 'Red Wings', 'DET', 'Penguins', 'PIT', 'Capitals', 'WSH'
    ];
    
    for (const team of teams) {
      if (text.includes(team)) {
        return team;
      }
    }
    
    return '';
  }

  /**
   * Process card images with real OCR
   */
  async processCardImages(frontImage: string, backImage?: string): Promise<ExtractedCardData> {
    try {
      // Extract text from front image
      const frontText = await this.extractTextFromImage(frontImage);
      console.log('Front OCR Text:', frontText);
      
      // Extract text from back image if provided
      let backText = '';
      if (backImage) {
        backText = await this.extractTextFromImage(backImage);
        console.log('Back OCR Text:', backText);
      }
      
      // Combine texts
      const combinedText = frontText + '\n\n' + backText;
      
      // Parse the combined text
      const extractedData = this.parseCardData(combinedText);
      
      // Calculate confidence based on how much data we extracted
      const fields = Object.keys(extractedData).filter(key => key !== 'features');
      const confidence = Math.round((fields.length / 10) * 100); // Assume 10 key fields
      
      return {
        ...extractedData,
        confidence: {
          score: confidence,
          level: confidence > 80 ? 'high' : confidence > 50 ? 'medium' : 'low',
          detectedFields: fields.length
        },
        rawText: combinedText,
        extractionErrors: []
      } as ExtractedCardData;
    } catch (error) {
      console.error('OCR Processing Error:', error);
      throw error;
    }
  }
}

export const realOCRService = new RealOCRService();