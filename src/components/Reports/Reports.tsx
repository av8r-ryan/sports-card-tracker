import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useMemo, Suspense } from 'react';

import { useCards } from '../../context/DexieCardContext';
import { ReportingService } from '../../services/reportingService';
import { ReportFilter, ReportTemplate } from '../../types/reports';
import {
  LazyReportsDashboard,
  LazyPortfolioPerformanceReport,
  LazyCollectionAnalyticsReport,
  LazyMarketAnalysisReport,
  LazyTaxReport,
  LazyInsuranceReport,
  LazyInventoryReport,
  LazyComparisonReport,
  LazyExecutiveDashboard,
  LazyReportFilters,
  LazyReportExport,
} from '../../utils/lazyLoading';
import AnimatedWrapper from '../Animation/AnimatedWrapper';
import CollapsibleMenu from '../UI/CollapsibleMenu';
import './Reports.css';

const Reports: React.FC = () => {
  const { state } = useCards();
  const [activeReport, setActiveReport] = useState<ReportTemplate | 'dashboard'>('dashboard');
  const [filters, setFilters] = useState<ReportFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const reportingService = useMemo(() => new ReportingService(state.cards), [state.cards]);

  const reportTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'portfolio-summary', label: 'Portfolio Overview', icon: '📊' },
    { id: 'financial-performance', label: 'Financial Performance', icon: '💰' },
    { id: 'collection-analytics', label: 'Collection Analytics', icon: '📈' },
    { id: 'market-analysis', label: 'Market Analysis', icon: '📉' },
    { id: 'tax-summary', label: 'Tax Reports', icon: '📋' },
    { id: 'insurance-appraisal', label: 'Insurance Reports', icon: '🛡️' },
    { id: 'investment-insights', label: 'Investment Insights', icon: '🔍' },
    { id: 'detailed-inventory', label: 'Detailed Inventory', icon: '📦' },
    { id: 'comparison-analysis', label: 'Comparisons', icon: '⚖️' },
    { id: 'executive-dashboard', label: 'Executive Dashboard', icon: '🎯' },
  ] as const;

  const handleSelectReport = (reportType: ReportTemplate) => {
    setActiveReport(reportType);
    setShowFilters(false);
  };

  const renderActiveReport = () => {
    const LoadingFallback = () => (
      <div className="report-loading">
        <div className="loading-spinner" />
        <p>Loading report...</p>
      </div>
    );

    switch (activeReport) {
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyReportsDashboard onSelectReport={handleSelectReport} />
          </Suspense>
        );

      case 'portfolio-summary':
      case 'financial-performance':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyPortfolioPerformanceReport
              reportingService={reportingService}
              filters={filters}
              detailed={activeReport === 'financial-performance'}
            />
          </Suspense>
        );

      case 'collection-analytics':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyCollectionAnalyticsReport reportingService={reportingService} filters={filters} />
          </Suspense>
        );

      case 'market-analysis':
      case 'investment-insights':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyMarketAnalysisReport
              reportingService={reportingService}
              filters={filters}
              detailed={activeReport === 'investment-insights'}
            />
          </Suspense>
        );

      case 'tax-summary':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyTaxReport reportingService={reportingService} filters={filters} />
          </Suspense>
        );

      case 'insurance-appraisal':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyInsuranceReport reportingService={reportingService} filters={filters} />
          </Suspense>
        );

      case 'detailed-inventory':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyInventoryReport />
          </Suspense>
        );

      case 'comparison-analysis':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyComparisonReport />
          </Suspense>
        );

      case 'executive-dashboard':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LazyExecutiveDashboard />
          </Suspense>
        );

      default:
        return <div>Report not found</div>;
    }
  };

  if (state.loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner" />
        <p>Loading report data...</p>
      </div>
    );
  }

  if (state.cards.length === 0) {
    return (
      <AnimatedWrapper animation="fadeInUp" duration={0.6}>
        <div className="reports-empty card-glass">
          <motion.div
            className="empty-icon"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            📊
          </motion.div>
          <h2 className="text-gradient">No Data for Reports</h2>
          <p>Add some cards to your collection to generate comprehensive reports.</p>
        </div>
      </AnimatedWrapper>
    );
  }

  return (
    <div className="reports-container">
      <AnimatedWrapper animation="fadeInDown" duration={0.6}>
        <div className="reports-header">
          <div className="reports-title">
            <h1 className="text-gradient">📊 Advanced Reports & Analytics</h1>
            <p>Comprehensive insights into your sports card portfolio</p>
          </div>

          <div className="reports-actions">
            {activeReport !== 'dashboard' && (
              <>
                <motion.button
                  className={`filter-toggle ${showFilters ? 'active' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🔍 Filters
                </motion.button>

                <Suspense fallback={null}>
                  <LazyReportExport
                    reportingService={reportingService}
                    activeReport={activeReport as ReportTemplate}
                    filters={filters}
                  />
                </Suspense>
              </>
            )}
          </div>
        </div>
      </AnimatedWrapper>

      <AnimatePresence>
        {showFilters && activeReport !== 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={null}>
              <LazyReportFilters filters={filters} onFiltersChange={setFilters} cards={state.cards} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.2}>
        <div className="reports-navigation">
          <CollapsibleMenu title="Overview Reports" icon="📊" defaultOpen={true}>
            <div className="report-category">
              {reportTabs.slice(0, 3).map((tab, index) => (
                <motion.button
                  key={tab.id}
                  className={`report-option ${activeReport === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveReport(tab.id as ReportTemplate | 'dashboard')}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="option-icon">{tab.icon}</span>
                  <span className="option-label">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </CollapsibleMenu>

          <CollapsibleMenu title="Financial Reports" icon="💰" defaultOpen={true}>
            <div className="report-category">
              {reportTabs.slice(3, 6).map((tab, index) => (
                <motion.button
                  key={tab.id}
                  className={`report-option ${activeReport === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveReport(tab.id as ReportTemplate | 'dashboard')}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="option-icon">{tab.icon}</span>
                  <span className="option-label">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </CollapsibleMenu>

          <CollapsibleMenu title="Analytics Reports" icon="📈" defaultOpen={true}>
            <div className="report-category">
              {reportTabs.slice(6, 9).map((tab, index) => (
                <motion.button
                  key={tab.id}
                  className={`report-option ${activeReport === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveReport(tab.id as ReportTemplate | 'dashboard')}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="option-icon">{tab.icon}</span>
                  <span className="option-label">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </CollapsibleMenu>

          <CollapsibleMenu title="Specialized Reports" icon="🎯" defaultOpen={true}>
            <div className="report-category">
              {reportTabs.slice(9).map((tab, index) => (
                <motion.button
                  key={tab.id}
                  className={`report-option ${activeReport === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveReport(tab.id as ReportTemplate | 'dashboard')}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="option-icon">{tab.icon}</span>
                  <span className="option-label">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </CollapsibleMenu>
        </div>
      </AnimatedWrapper>

      <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.4}>
        <div className="reports-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeReport}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderActiveReport()}
            </motion.div>
          </AnimatePresence>
        </div>
      </AnimatedWrapper>
    </div>
  );
};

export default Reports;
