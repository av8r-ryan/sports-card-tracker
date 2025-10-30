import { Card } from './index';

// Core Report Types
export interface ReportFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  teams?: string[];
  players?: string[];
  conditions?: string[];
  valueRange?: {
    min: number;
    max: number;
  };
  years?: number[];
  brands?: string[];
}

export interface ReportMetrics {
  totalCards: number;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  averageValue: number;
  averageCost: number;
  roi: number;
  cardsSold: number;
  salesRevenue: number;
}

// Financial Performance Reports
export interface PortfolioPerformance {
  totalReturn: number;
  annualizedReturn: number;
  totalValue: number;
  totalCost: number;
  unrealizedGains: number;
  realizedGains: number;
  bestPerformers: Card[];
  worstPerformers: Card[];
  monthlyReturns: MonthlyReturn[];
  categoryPerformance: CategoryPerformance[];
}

export interface MonthlyReturn {
  month: string;
  value: number;
  cost: number;
  return: number;
  percentage: number;
}

export interface CategoryPerformance {
  category: string;
  totalValue: number;
  totalCost: number;
  return: number;
  percentage: number;
  cardCount: number;
}

// Collection Analytics
export interface CollectionAnalytics {
  categoryDistribution: CategoryDistribution[];
  conditionDistribution: ConditionDistribution[];
  yearDistribution: YearDistribution[];
  brandDistribution: BrandDistribution[];
  teamDistribution: TeamDistribution[];
  acquisitionPattern: AcquisitionPattern[];
  valueDistribution: ValueDistribution[];
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
  totalValue: number;
  averageValue: number;
}

export interface ConditionDistribution {
  condition: string;
  count: number;
  percentage: number;
  averageValue: number;
}

export interface YearDistribution {
  year: number;
  count: number;
  percentage: number;
  averageValue: number;
}

export interface BrandDistribution {
  brand: string;
  count: number;
  percentage: number;
  totalValue: number;
}

export interface TeamDistribution {
  team: string;
  count: number;
  percentage: number;
  totalValue: number;
}

export interface AcquisitionPattern {
  month: string;
  count: number;
  totalSpent: number;
  averagePrice: number;
}

export interface ValueDistribution {
  range: string;
  count: number;
  percentage: number;
  totalValue: number;
}

// Market Analysis
export interface MarketAnalysis {
  topGainers: MarketPerformer[];
  topLosers: MarketPerformer[];
  categoryTrends: CategoryTrend[];
  playerPerformance: PlayerPerformance[];
  marketComparison: MarketComparison;
}

export interface MarketPerformer {
  card: Card;
  gainLoss: number;
  percentage: number;
  currentValue: number;
  purchaseValue: number;
}

export interface CategoryTrend {
  category: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  monthlyData: { month: string; value: number }[];
}

export interface PlayerPerformance {
  player: string;
  totalCards: number;
  totalValue: number;
  averageGain: number;
  bestCard: Card;
}

export interface MarketComparison {
  portfolioReturn: number;
  marketIndex: number;
  outperformance: number;
}

// Tax Reports
export interface TaxReport {
  year: number;
  shortTermGains: TaxGain[];
  longTermGains: TaxGain[];
  totalShortTerm: number;
  totalLongTerm: number;
  netGainLoss: number;
}

export interface TaxGain {
  card: Card;
  purchaseDate: Date;
  sellDate: Date;
  costBasis: number;
  salePrice: number;
  gainLoss: number;
  holdingPeriod: number;
}

// Insurance Reports
export interface InsuranceReport {
  totalReplacementValue: number;
  highValueCards: Card[];
  categoryBreakdown: CategoryInsurance[];
  recommendedCoverage: number;
  lastUpdated: Date;
}

export interface CategoryInsurance {
  category: string;
  totalValue: number;
  cardCount: number;
  highestValue: number;
  averageValue: number;
}

// Export Options
export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeSummary: boolean;
  includeDetails: boolean;
  template: 'standard' | 'detailed' | 'executive' | 'insurance' | 'tax';
}

// Report Generation Options
export interface ReportGenerationOptions {
  filter?: ReportFilter;
  exportOptions?: ReportExportOptions;
  includeComparisons?: boolean;
  includePredictions?: boolean;
  customFields?: string[];
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  cost?: number;
  count?: number;
}

export interface ComparisonData {
  category: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

// Report Templates
export type ReportTemplate =
  | 'portfolio-summary'
  | 'financial-performance'
  | 'collection-analytics'
  | 'market-analysis'
  | 'tax-summary'
  | 'insurance-appraisal'
  | 'investment-insights'
  | 'detailed-inventory'
  | 'comparison-analysis'
  | 'executive-dashboard';

// Report Status
export interface ReportStatus {
  id: string;
  template: ReportTemplate;
  status: 'generating' | 'completed' | 'error';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
}
