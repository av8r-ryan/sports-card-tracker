import React from 'react';

import InvestmentInsightsReport from './InvestmentInsightsReport';

interface Props {
  reportingService: any;
  filters?: any;
  detailed?: boolean;
}

const MarketAnalysisReport: React.FC<Props> = ({ reportingService, filters, detailed = false }) => {
  // The MarketAnalysisReport now uses the enhanced InvestmentInsightsReport
  // which provides a much more comprehensive investment analysis
  return <InvestmentInsightsReport />;
};

export default MarketAnalysisReport;
