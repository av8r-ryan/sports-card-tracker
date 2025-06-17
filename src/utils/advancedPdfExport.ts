import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportingService } from '../services/reportingService';
import { ReportFilter, ReportTemplate } from '../types/reports';
import { format } from 'date-fns';

type ExtendedJsPDF = jsPDF & {
  lastAutoTable: {
    finalY: number;
  };
  internal: jsPDF['internal'] & {
    getNumberOfPages(): number;
  };
};

export const exportAdvancedReportToPDF = async (
  reportingService: ReportingService,
  reportTemplate: ReportTemplate,
  filters?: ReportFilter
): Promise<void> => {
  const doc = new jsPDF() as ExtendedJsPDF;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Generate report data based on template
  const portfolioData = reportingService.generatePortfolioPerformance(filters);
  const analyticsData = reportingService.generateCollectionAnalytics(filters);
  const marketData = reportingService.generateMarketAnalysis(filters);
  const metrics = reportingService.calculateMetrics(reportingService.filterCards(filters));

  // Add header with logo and title
  addReportHeader(doc, reportTemplate, pageWidth, margin);

  let yPosition = 60;

  // Executive Summary (for all reports)
  yPosition = addExecutiveSummary(doc, metrics, portfolioData, yPosition, margin);

  // Report-specific content
  switch (reportTemplate) {
    case 'portfolio-summary':
    case 'financial-performance':
      yPosition = addPortfolioSection(doc, portfolioData, metrics, yPosition, margin);
      break;
    
    case 'collection-analytics':
      yPosition = addAnalyticsSection(doc, analyticsData, yPosition, margin);
      break;
    
    case 'market-analysis':
    case 'investment-insights':
      yPosition = addMarketSection(doc, marketData, yPosition, margin);
      break;
    
    case 'tax-summary':
      const taxData = reportingService.generateTaxReport(new Date().getFullYear(), filters);
      yPosition = addTaxSection(doc, taxData, yPosition, margin);
      break;
    
    case 'insurance-appraisal':
      const insuranceData = reportingService.generateInsuranceReport(filters);
      yPosition = addInsuranceSection(doc, insuranceData, yPosition, margin);
      break;
  }

  // Add detailed card listings if space allows
  if (reportTemplate !== 'executive-dashboard') {
    yPosition = addCardListings(doc, reportingService.filterCards(filters), yPosition, margin);
  }

  // Add footer with page numbers
  addPageNumbers(doc, pageWidth, margin);

  // Save the PDF
  const filename = `${reportTemplate}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
};

const addReportHeader = (doc: ExtendedJsPDF, template: ReportTemplate, pageWidth: number, margin: number) => {
  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  
  const titles: Record<ReportTemplate, string> = {
    'portfolio-summary': 'Portfolio Summary Report',
    'financial-performance': 'Financial Performance Analysis',
    'collection-analytics': 'Collection Analytics Report',
    'market-analysis': 'Market Analysis Report',
    'tax-summary': 'Tax Summary Report',
    'insurance-appraisal': 'Insurance Appraisal Report',
    'investment-insights': 'Investment Insights Report',
    'detailed-inventory': 'Detailed Inventory Report',
    'comparison-analysis': 'Comparison Analysis Report',
    'executive-dashboard': 'Executive Dashboard Report'
  };

  doc.text(titles[template], margin, 30);

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy')}`, margin, 40);
  
  // Header line
  doc.setLineWidth(1);
  doc.line(margin, 45, pageWidth - margin, 45);
};

const addExecutiveSummary = (
  doc: ExtendedJsPDF,
  metrics: any,
  portfolioData: any,
  yPosition: number,
  margin: number
): number => {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, yPosition);
  yPosition += 15;

  const summaryData = [
    ['Total Cards', metrics.totalCards.toLocaleString()],
    ['Portfolio Value', formatCurrency(metrics.totalValue)],
    ['Total Investment', formatCurrency(metrics.totalCost)],
    ['Total Return', formatCurrency(metrics.totalProfit)],
    ['ROI', `${metrics.roi.toFixed(1)}%`],
    ['Cards Sold', metrics.cardsSold.toString()],
    ['Sales Revenue', formatCurrency(metrics.salesRevenue)]
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 80, halign: 'right' }
    }
  });

  return doc.lastAutoTable.finalY + 20;
};

const addPortfolioSection = (
  doc: ExtendedJsPDF,
  portfolioData: any,
  metrics: any,
  yPosition: number,
  margin: number
): number => {
  // Check if we need a new page
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 25;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Portfolio Performance Details', margin, yPosition);
  yPosition += 15;

  // Performance metrics table
  const performanceData = [
    ['Annualized Return', `${portfolioData.annualizedReturn.toFixed(1)}%`],
    ['Unrealized Gains', formatCurrency(portfolioData.unrealizedGains)],
    ['Realized Gains', formatCurrency(portfolioData.realizedGains)],
    ['Average Card Value', formatCurrency(metrics.averageValue)],
    ['Average Cost Basis', formatCurrency(metrics.averageCost)]
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Performance Metric', 'Value']],
    body: performanceData,
    theme: 'striped',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [52, 152, 219] },
    margin: { left: margin, right: margin }
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // Top performers
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 25;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 10 Performers', margin, yPosition);
  yPosition += 10;

  const topPerformersData = portfolioData.bestPerformers.slice(0, 10).map((card: any) => {
    const gain = (card.currentValue || 0) - (card.purchasePrice || 0);
    const percentage = card.purchasePrice > 0 ? ((gain / card.purchasePrice) * 100) : 0;
    
    return [
      card.player,
      `${card.year} ${card.brand}`,
      formatCurrency(card.purchasePrice || 0),
      formatCurrency(card.currentValue || 0),
      formatCurrency(gain),
      `${percentage.toFixed(1)}%`
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Player', 'Card', 'Cost', 'Value', 'Gain', 'ROI%']],
    body: topPerformersData,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [40, 167, 69] },
    margin: { left: margin, right: margin },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    }
  });

  return doc.lastAutoTable.finalY + 20;
};

const addAnalyticsSection = (
  doc: ExtendedJsPDF,
  analyticsData: any,
  yPosition: number,
  margin: number
): number => {
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 25;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Collection Analytics', margin, yPosition);
  yPosition += 15;

  // Category distribution
  const categoryData = analyticsData.categoryDistribution.map((cat: any) => [
    cat.category,
    cat.count.toString(),
    `${cat.percentage.toFixed(1)}%`,
    formatCurrency(cat.totalValue),
    formatCurrency(cat.averageValue)
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Category', 'Count', '%', 'Total Value', 'Avg Value']],
    body: categoryData,
    theme: 'striped',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [255, 193, 7] },
    margin: { left: margin, right: margin }
  });

  return doc.lastAutoTable.finalY + 20;
};

const addMarketSection = (
  doc: ExtendedJsPDF,
  marketData: any,
  yPosition: number,
  margin: number
): number => {
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 25;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Market Analysis', margin, yPosition);
  yPosition += 15;

  // Market comparison
  const comparisonData = [
    ['Portfolio Return', `${marketData.marketComparison.portfolioReturn.toFixed(1)}%`],
    ['Market Benchmark', `${marketData.marketComparison.marketIndex.toFixed(1)}%`],
    ['Outperformance', `${marketData.marketComparison.outperformance.toFixed(1)}%`]
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: comparisonData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [220, 53, 69] },
    margin: { left: margin, right: margin }
  });

  return doc.lastAutoTable.finalY + 20;
};

const addTaxSection = (
  doc: ExtendedJsPDF,
  taxData: any,
  yPosition: number,
  margin: number
): number => {
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 25;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Tax Report - ${taxData.year}`, margin, yPosition);
  yPosition += 15;

  const taxSummaryData = [
    ['Short-Term Capital Gains', formatCurrency(taxData.totalShortTerm)],
    ['Long-Term Capital Gains', formatCurrency(taxData.totalLongTerm)],
    ['Net Capital Gain/Loss', formatCurrency(taxData.netGainLoss)]
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Tax Category', 'Amount']],
    body: taxSummaryData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [108, 117, 125] },
    margin: { left: margin, right: margin }
  });

  return doc.lastAutoTable.finalY + 20;
};

const addInsuranceSection = (
  doc: ExtendedJsPDF,
  insuranceData: any,
  yPosition: number,
  margin: number
): number => {
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 25;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Insurance Appraisal', margin, yPosition);
  yPosition += 15;

  const insuranceSummaryData = [
    ['Total Replacement Value', formatCurrency(insuranceData.totalReplacementValue)],
    ['Recommended Coverage', formatCurrency(insuranceData.recommendedCoverage)],
    ['High-Value Items', insuranceData.highValueCards.length.toString()],
    ['Last Updated', format(insuranceData.lastUpdated, 'MM/dd/yyyy')]
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Insurance Metric', 'Value']],
    body: insuranceSummaryData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [111, 66, 193] },
    margin: { left: margin, right: margin }
  });

  return doc.lastAutoTable.finalY + 20;
};

const addCardListings = (
  doc: ExtendedJsPDF,
  cards: any[],
  yPosition: number,
  margin: number
): number => {
  if (cards.length === 0) return yPosition;

  if (yPosition > 200) {
    doc.addPage();
    yPosition = 25;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Card Listings', margin, yPosition);
  yPosition += 10;

  const cardData = cards.slice(0, 50).map(card => [
    card.player,
    card.team,
    card.year.toString(),
    card.brand,
    card.condition,
    formatCurrency(card.purchasePrice || 0),
    formatCurrency(card.currentValue || 0)
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Player', 'Team', 'Year', 'Brand', 'Condition', 'Cost', 'Value']],
    body: cardData,
    theme: 'striped',
    styles: { fontSize: 7 },
    headStyles: { fillColor: [23, 162, 184] },
    margin: { left: margin, right: margin },
    columnStyles: {
      5: { halign: 'right' },
      6: { halign: 'right' }
    }
  });

  return doc.lastAutoTable.finalY + 20;
};

const addPageNumbers = (doc: ExtendedJsPDF, pageWidth: number, margin: number) => {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 30,
      doc.internal.pageSize.height - 10
    );
  }
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};