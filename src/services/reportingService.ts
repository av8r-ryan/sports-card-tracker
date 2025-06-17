import { Card } from '../types';
import {
  ReportFilter,
  ReportMetrics,
  PortfolioPerformance,
  CollectionAnalytics,
  MarketAnalysis,
  TaxReport,
  InsuranceReport,
  CategoryDistribution,
  ConditionDistribution,
  YearDistribution,
  BrandDistribution,
  TeamDistribution,
  AcquisitionPattern,
  ValueDistribution,
  MonthlyReturn,
  CategoryPerformance,
  TaxGain,
  CategoryInsurance
} from '../types/reports';
import { startOfMonth, format, differenceInMonths, differenceInDays } from 'date-fns';
import { groupBy, orderBy, sumBy, meanBy } from 'lodash';

export class ReportingService {
  private cards: Card[];

  constructor(cards: Card[]) {
    this.cards = cards;
  }

  // Core filtering method
  filterCards(filter?: ReportFilter): Card[] {
    if (!filter) return this.cards;

    return this.cards.filter(card => {
      // Date range filter
      if (filter.dateRange) {
        const purchaseDate = new Date(card.purchaseDate);
        if (purchaseDate < filter.dateRange.start || purchaseDate > filter.dateRange.end) {
          return false;
        }
      }

      // Category filter
      if (filter.categories && filter.categories.length > 0) {
        if (!filter.categories.includes(card.category)) return false;
      }

      // Team filter
      if (filter.teams && filter.teams.length > 0) {
        if (!filter.teams.includes(card.team)) return false;
      }

      // Player filter
      if (filter.players && filter.players.length > 0) {
        if (!filter.players.some(player => 
          card.player.toLowerCase().includes(player.toLowerCase())
        )) return false;
      }

      // Condition filter
      if (filter.conditions && filter.conditions.length > 0) {
        if (!filter.conditions.includes(card.condition)) return false;
      }

      // Value range filter
      if (filter.valueRange) {
        const value = card.currentValue || 0;
        if (value < filter.valueRange.min || value > filter.valueRange.max) {
          return false;
        }
      }

      // Year filter
      if (filter.years && filter.years.length > 0) {
        if (!filter.years.includes(card.year)) return false;
      }

      // Brand filter
      if (filter.brands && filter.brands.length > 0) {
        if (!filter.brands.includes(card.brand)) return false;
      }

      return true;
    });
  }

  // Basic metrics calculation
  calculateMetrics(cards: Card[] = this.cards): ReportMetrics {
    const totalCards = cards.length;
    const totalValue = sumBy(cards, 'currentValue') || 0;
    const totalCost = sumBy(cards, 'purchasePrice') || 0;
    const totalProfit = totalValue - totalCost;
    const profitMargin = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const averageValue = totalCards > 0 ? totalValue / totalCards : 0;
    const averageCost = totalCards > 0 ? totalCost / totalCards : 0;
    const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    
    const soldCards = cards.filter(card => card.sellPrice && card.sellDate);
    const cardsSold = soldCards.length;
    const salesRevenue = sumBy(soldCards, 'sellPrice') || 0;

    return {
      totalCards,
      totalValue,
      totalCost,
      totalProfit,
      profitMargin,
      averageValue,
      averageCost,
      roi,
      cardsSold,
      salesRevenue
    };
  }

  // Portfolio Performance Analysis
  generatePortfolioPerformance(filter?: ReportFilter): PortfolioPerformance {
    const filteredCards = this.filterCards(filter);
    const metrics = this.calculateMetrics(filteredCards);

    // Calculate returns
    const totalReturn = metrics.totalProfit;
    const annualizedReturn = this.calculateAnnualizedReturn(filteredCards);

    // Best and worst performers
    const cardsWithGains = filteredCards.map(card => ({
      card,
      gain: (card.currentValue || 0) - (card.purchasePrice || 0),
      percentage: card.purchasePrice > 0 
        ? (((card.currentValue || 0) - card.purchasePrice) / card.purchasePrice) * 100 
        : 0
    }));

    const bestPerformers = orderBy(cardsWithGains, 'gain', 'desc')
      .slice(0, 10)
      .map(item => item.card);

    const worstPerformers = orderBy(cardsWithGains, 'gain', 'asc')
      .slice(0, 10)
      .map(item => item.card);

    // Monthly returns
    const monthlyReturns = this.calculateMonthlyReturns(filteredCards);

    // Category performance
    const categoryPerformance = this.calculateCategoryPerformance(filteredCards);

    // Realized vs unrealized gains
    const soldCards = filteredCards.filter(card => card.sellPrice && card.sellDate);
    const realizedGains = sumBy(soldCards, card => 
      (card.sellPrice || 0) - (card.purchasePrice || 0)
    );
    const unrealizedGains = totalReturn - realizedGains;

    return {
      totalReturn,
      annualizedReturn,
      totalValue: metrics.totalValue,
      totalCost: metrics.totalCost,
      unrealizedGains,
      realizedGains,
      bestPerformers,
      worstPerformers,
      monthlyReturns,
      categoryPerformance
    };
  }

  // Collection Analytics
  generateCollectionAnalytics(filter?: ReportFilter): CollectionAnalytics {
    const filteredCards = this.filterCards(filter);
    const totalCards = filteredCards.length;

    return {
      categoryDistribution: this.calculateCategoryDistribution(filteredCards, totalCards),
      conditionDistribution: this.calculateConditionDistribution(filteredCards, totalCards),
      yearDistribution: this.calculateYearDistribution(filteredCards, totalCards),
      brandDistribution: this.calculateBrandDistribution(filteredCards, totalCards),
      teamDistribution: this.calculateTeamDistribution(filteredCards, totalCards),
      acquisitionPattern: this.calculateAcquisitionPattern(filteredCards),
      valueDistribution: this.calculateValueDistribution(filteredCards, totalCards)
    };
  }

  // Market Analysis
  generateMarketAnalysis(filter?: ReportFilter): MarketAnalysis {
    const filteredCards = this.filterCards(filter);

    const performers = filteredCards.map(card => ({
      card,
      gainLoss: (card.currentValue || 0) - (card.purchasePrice || 0),
      percentage: card.purchasePrice > 0 
        ? (((card.currentValue || 0) - card.purchasePrice) / card.purchasePrice) * 100 
        : 0,
      currentValue: card.currentValue || 0,
      purchaseValue: card.purchasePrice || 0
    }));

    const topGainers = orderBy(performers, 'percentage', 'desc').slice(0, 10);
    const topLosers = orderBy(performers, 'percentage', 'asc').slice(0, 10);

    return {
      topGainers,
      topLosers,
      categoryTrends: [], // TODO: Implement trend analysis
      playerPerformance: this.calculatePlayerPerformance(filteredCards),
      marketComparison: {
        portfolioReturn: this.calculateMetrics(filteredCards).roi,
        marketIndex: 8.5, // Placeholder - could integrate with actual market data
        outperformance: this.calculateMetrics(filteredCards).roi - 8.5
      }
    };
  }

  // Tax Reporting
  generateTaxReport(year: number, filter?: ReportFilter): TaxReport {
    const filteredCards = this.filterCards(filter);
    const soldCards = filteredCards.filter(card => 
      card.sellPrice && 
      card.sellDate && 
      new Date(card.sellDate).getFullYear() === year
    );

    const taxGains: TaxGain[] = soldCards.map(card => {
      const purchaseDate = new Date(card.purchaseDate);
      const sellDate = new Date(card.sellDate!);
      const holdingPeriod = differenceInDays(sellDate, purchaseDate);
      
      return {
        card,
        purchaseDate,
        sellDate,
        costBasis: card.purchasePrice || 0,
        salePrice: card.sellPrice || 0,
        gainLoss: (card.sellPrice || 0) - (card.purchasePrice || 0),
        holdingPeriod
      };
    });

    const shortTermGains = taxGains.filter(gain => gain.holdingPeriod <= 365);
    const longTermGains = taxGains.filter(gain => gain.holdingPeriod > 365);

    return {
      year,
      shortTermGains,
      longTermGains,
      totalShortTerm: sumBy(shortTermGains, 'gainLoss'),
      totalLongTerm: sumBy(longTermGains, 'gainLoss'),
      netGainLoss: sumBy(taxGains, 'gainLoss')
    };
  }

  // Insurance Reporting
  generateInsuranceReport(filter?: ReportFilter): InsuranceReport {
    const filteredCards = this.filterCards(filter);
    const totalReplacementValue = sumBy(filteredCards, 'currentValue') || 0;
    
    // High value cards (top 10% by value)
    const sortedByValue = orderBy(filteredCards, 'currentValue', 'desc');
    const highValueThreshold = Math.ceil(filteredCards.length * 0.1);
    const highValueCards = sortedByValue.slice(0, highValueThreshold);

    const categoryBreakdown: CategoryInsurance[] = Object.entries(
      groupBy(filteredCards, 'category')
    ).map(([category, cards]) => ({
      category,
      totalValue: sumBy(cards, 'currentValue') || 0,
      cardCount: cards.length,
      highestValue: Math.max(...cards.map(c => c.currentValue || 0)),
      averageValue: meanBy(cards, 'currentValue') || 0
    }));

    return {
      totalReplacementValue,
      highValueCards,
      categoryBreakdown,
      recommendedCoverage: totalReplacementValue * 1.2, // 20% buffer
      lastUpdated: new Date()
    };
  }

  // Helper methods for calculations
  private calculateAnnualizedReturn(cards: Card[]): number {
    if (cards.length === 0) return 0;

    const oldestCard = cards.reduce((oldest, card) => 
      new Date(card.purchaseDate) < new Date(oldest.purchaseDate) ? card : oldest
    );

    const monthsHeld = differenceInMonths(new Date(), new Date(oldestCard.purchaseDate));
    if (monthsHeld === 0) return 0;

    const totalReturn = this.calculateMetrics(cards).roi;
    return (totalReturn / monthsHeld) * 12;
  }

  private calculateMonthlyReturns(cards: Card[]): MonthlyReturn[] {
    const monthlyData = groupBy(cards, card => 
      format(startOfMonth(new Date(card.purchaseDate)), 'yyyy-MM')
    );

    return Object.entries(monthlyData).map(([month, monthCards]) => {
      const value = sumBy(monthCards, 'currentValue') || 0;
      const cost = sumBy(monthCards, 'purchasePrice') || 0;
      const returnAmount = value - cost;
      const percentage = cost > 0 ? (returnAmount / cost) * 100 : 0;

      return {
        month,
        value,
        cost,
        return: returnAmount,
        percentage
      };
    }).sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateCategoryPerformance(cards: Card[]): CategoryPerformance[] {
    const categoryData = groupBy(cards, 'category');

    return Object.entries(categoryData).map(([category, categoryCards]) => {
      const totalValue = sumBy(categoryCards, 'currentValue') || 0;
      const totalCost = sumBy(categoryCards, 'purchasePrice') || 0;
      const returnAmount = totalValue - totalCost;
      const percentage = totalCost > 0 ? (returnAmount / totalCost) * 100 : 0;

      return {
        category,
        totalValue,
        totalCost,
        return: returnAmount,
        percentage,
        cardCount: categoryCards.length
      };
    });
  }

  private calculateCategoryDistribution(cards: Card[], total: number): CategoryDistribution[] {
    const categoryData = groupBy(cards, 'category');

    return Object.entries(categoryData).map(([category, categoryCards]) => ({
      category,
      count: categoryCards.length,
      percentage: (categoryCards.length / total) * 100,
      totalValue: sumBy(categoryCards, 'currentValue') || 0,
      averageValue: meanBy(categoryCards, 'currentValue') || 0
    }));
  }

  private calculateConditionDistribution(cards: Card[], total: number): ConditionDistribution[] {
    const conditionData = groupBy(cards, 'condition');

    return Object.entries(conditionData).map(([condition, conditionCards]) => ({
      condition,
      count: conditionCards.length,
      percentage: (conditionCards.length / total) * 100,
      averageValue: meanBy(conditionCards, 'currentValue') || 0
    }));
  }

  private calculateYearDistribution(cards: Card[], total: number): YearDistribution[] {
    const yearData = groupBy(cards, 'year');

    return Object.entries(yearData).map(([year, yearCards]) => ({
      year: parseInt(year),
      count: yearCards.length,
      percentage: (yearCards.length / total) * 100,
      averageValue: meanBy(yearCards, 'currentValue') || 0
    })).sort((a, b) => b.year - a.year);
  }

  private calculateBrandDistribution(cards: Card[], total: number): BrandDistribution[] {
    const brandData = groupBy(cards, 'brand');

    return Object.entries(brandData).map(([brand, brandCards]) => ({
      brand,
      count: brandCards.length,
      percentage: (brandCards.length / total) * 100,
      totalValue: sumBy(brandCards, 'currentValue') || 0
    }));
  }

  private calculateTeamDistribution(cards: Card[], total: number): TeamDistribution[] {
    const teamData = groupBy(cards, 'team');

    return Object.entries(teamData).map(([team, teamCards]) => ({
      team,
      count: teamCards.length,
      percentage: (teamCards.length / total) * 100,
      totalValue: sumBy(teamCards, 'currentValue') || 0
    }));
  }

  private calculateAcquisitionPattern(cards: Card[]): AcquisitionPattern[] {
    const monthlyData = groupBy(cards, card => 
      format(startOfMonth(new Date(card.purchaseDate)), 'yyyy-MM')
    );

    return Object.entries(monthlyData).map(([month, monthCards]) => ({
      month,
      count: monthCards.length,
      totalSpent: sumBy(monthCards, 'purchasePrice') || 0,
      averagePrice: meanBy(monthCards, 'purchasePrice') || 0
    })).sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateValueDistribution(cards: Card[], total: number): ValueDistribution[] {
    const ranges = [
      { min: 0, max: 10, label: '$0-$10' },
      { min: 10, max: 50, label: '$10-$50' },
      { min: 50, max: 100, label: '$50-$100' },
      { min: 100, max: 500, label: '$100-$500' },
      { min: 500, max: 1000, label: '$500-$1,000' },
      { min: 1000, max: Infinity, label: '$1,000+' }
    ];

    return ranges.map(range => {
      const cardsInRange = cards.filter(card => {
        const value = card.currentValue || 0;
        return value >= range.min && value < range.max;
      });

      return {
        range: range.label,
        count: cardsInRange.length,
        percentage: (cardsInRange.length / total) * 100,
        totalValue: sumBy(cardsInRange, 'currentValue') || 0
      };
    });
  }

  private calculatePlayerPerformance(cards: Card[]) {
    const playerData = groupBy(cards, 'player');

    return Object.entries(playerData).map(([player, playerCards]) => {
      const totalValue = sumBy(playerCards, 'currentValue') || 0;
      const totalCost = sumBy(playerCards, 'purchasePrice') || 0;
      const averageGain = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
      const bestCard = orderBy(playerCards, 'currentValue', 'desc')[0];

      return {
        player,
        totalCards: playerCards.length,
        totalValue,
        averageGain,
        bestCard
      };
    });
  }
}