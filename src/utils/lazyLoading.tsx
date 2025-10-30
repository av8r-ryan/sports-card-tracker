import React, { Suspense, lazy, ComponentType, useState, useCallback } from 'react';
import { usePerformanceOptimization } from './performanceUtils';

// Loading fallback components
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <>{fallback || <div className="error-fallback">Something went wrong</div>}</>;
  }

  return <>{children}</>;
};

// Lazy loading wrapper with error boundary
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Route-based code splitting
export const LazyDashboard = withLazyLoading(
  lazy(() => import('../components/Dashboard/Dashboard'))
);

export const LazyCardList = withLazyLoading(
  lazy(() => import('../components/CardList/CardList'))
);

export const LazyCardForm = withLazyLoading(
  lazy(() => import('../components/CardForm/CardForm'))
);

export const LazyEnhancedCardForm = withLazyLoading(
  lazy(() => import('../components/EnhancedCardForm/EnhancedCardForm'))
);

export const LazyPhotoCardForm = withLazyLoading(
  lazy(() => import('../components/PhotoCardForm/PhotoCardForm'))
);

export const LazyCardDetail = withLazyLoading(
  lazy(() => import('../components/CardDetail/CardDetail'))
);

export const LazyAdminDashboard = withLazyLoading(
  lazy(() => import('../components/AdminDashboard/AdminDashboard'))
);

export const LazyUserProfile = withLazyLoading(
  lazy(() => import('../components/UserProfile/UserProfile'))
);

export const LazyUserManagement = withLazyLoading(
  lazy(() => import('../components/UserManagement/UserManagement'))
);

export const LazyCollections = withLazyLoading(
  lazy(() => import('../components/Collections/Collections'))
);

export const LazyReports = withLazyLoading(
  lazy(() => import('../components/Reports/Reports'))
);

// Individual Reports components for better code splitting
export const LazyReportsDashboard = withLazyLoading(
  lazy(() => import('../components/Reports/ReportsDashboard'))
);

export const LazyPortfolioPerformanceReport = withLazyLoading(
  lazy(() => import('../components/Reports/PortfolioPerformanceReport'))
);

export const LazyCollectionAnalyticsReport = withLazyLoading(
  lazy(() => import('../components/Reports/CollectionAnalyticsReport'))
);

export const LazyMarketAnalysisReport = withLazyLoading(
  lazy(() => import('../components/Reports/MarketAnalysisReport'))
);

export const LazyTaxReport = withLazyLoading(
  lazy(() => import('../components/Reports/TaxReport'))
);

export const LazyInsuranceReport = withLazyLoading(
  lazy(() => import('../components/Reports/InsuranceReport'))
);

export const LazyInventoryReport = withLazyLoading(
  lazy(() => import('../components/Reports/InventoryReport'))
);

export const LazyComparisonReport = withLazyLoading(
  lazy(() => import('../components/Reports/ComparisonReport'))
);

export const LazyExecutiveDashboard = withLazyLoading(
  lazy(() => import('../components/Reports/ExecutiveDashboard'))
);

export const LazyInvestmentInsightsReport = withLazyLoading(
  lazy(() => import('../components/Reports/InvestmentInsightsReport'))
);

export const LazyReportFilters = withLazyLoading(
  lazy(() => import('../components/Reports/ReportFilters'))
);

export const LazyReportExport = withLazyLoading(
  lazy(() => import('../components/Reports/ReportExport'))
);

export const LazyEbayListings = withLazyLoading(
  lazy(() => import('../components/EbayListings/EbayListings'))
);

// BackupRestore doesn't have a default export, so we skip lazy loading for it
// export const LazyBackupRestore = withLazyLoading(
//   lazy(() => import('../components/BackupRestore/BackupRestore'))
// );

export const LazyAbout = withLazyLoading(
  lazy(() => import('../components/About/About'))
);

export const LazyContact = withLazyLoading(
  lazy(() => import('../components/Contact/Contact'))
);

export const LazyNotFound = withLazyLoading(
  lazy(() => import('../components/NotFound/NotFound'))
);

// Feature-based code splitting
export const LazyAuthForm = withLazyLoading(
  lazy(() => import('../components/Auth/AuthForm'))
);

export const LazyLayout = withLazyLoading(
  lazy(() => import('../components/Layout/Layout'))
);

// Utility components
export const LazyCarousel = withLazyLoading(
  lazy(() => import('../components/Carousel/Carousel'))
);

export const LazyModal = withLazyLoading(
  lazy(() => import('../components/Modal/Modal'))
);

export const LazyCollapsibleMenu = withLazyLoading(
  lazy(() => import('../components/UI/CollapsibleMenu'))
);

export const LazyAnimatedWrapper = withLazyLoading(
  lazy(() => import('../components/Animation/AnimatedWrapper'))
);

export const LazyParticleBackground = withLazyLoading(
  lazy(() => import('../components/Animation/ParticleBackground'))
);

export const LazyMobileOptimized = withLazyLoading(
  lazy(() => import('../components/Mobile/MobileOptimized'))
);

// Dynamic imports with performance optimization
export const createOptimizedLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: {
    fallback?: React.ReactNode;
    preload?: boolean;
    priority?: 'high' | 'normal' | 'low';
  } = {}
) => {
  const { fallback, preload = false, priority = 'normal' } = options;
  const { isLowEndDevice } = usePerformanceOptimization();

  // Preload on high priority components
  if (preload && priority === 'high' && !isLowEndDevice) {
    importFunc();
  }

  const LazyComponent = lazy(importFunc);

  return withLazyLoading(LazyComponent, fallback);
};

// Preload utilities
export const preloadComponent = (importFunc: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback for non-critical preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFunc());
    } else {
      setTimeout(() => importFunc(), 0);
    }
  }
};

// Route preloading
export const preloadRoute = (route: string) => {
  const routeMap: Record<string, () => Promise<any>> = {
    '/dashboard': () => import('../components/Dashboard/Dashboard'),
    '/inventory': () => import('../components/CardList/CardList'),
    '/add-card': () => import('../components/CardForm/CardForm'),
    '/admin': () => import('../components/AdminDashboard/AdminDashboard'),
    '/profile': () => import('../components/UserProfile/UserProfile'),
    '/reports': () => import('../components/Reports/Reports'),
    '/ebay': () => import('../components/EbayListings/EbayListings'),
    '/collections': () => import('../components/Collections/Collections'),
    '/about': () => import('../components/About/About'),
    '/contact': () => import('../components/Contact/Contact')
  };

  const preloadFunc = routeMap[route];
  if (preloadFunc) {
    preloadComponent(preloadFunc);
  }
};

// Smart preloading based on user behavior
export const useSmartPreloading = () => {
  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(new Set());

  const preloadRoute = useCallback((route: string) => {
    if (!preloadedRoutes.has(route)) {
      preloadRoute(route);
      setPreloadedRoutes(prev => new Set([...prev, route]));
    }
  }, [preloadedRoutes]);

  // Preload routes on hover
  const handleRouteHover = useCallback((route: string) => {
    preloadRoute(route);
  }, [preloadRoute]);

  // Preload likely next routes
  const preloadLikelyRoutes = useCallback((currentRoute: string) => {
    const likelyRoutes: Record<string, string[]> = {
      '/dashboard': ['/inventory', '/reports'],
      '/inventory': ['/add-card', '/collections'],
      '/add-card': ['/inventory', '/dashboard'],
      '/admin': ['/users', '/reports'],
      '/profile': ['/dashboard', '/inventory']
    };

    const routes = likelyRoutes[currentRoute] || [];
    routes.forEach(route => preloadRoute(route));
  }, []);

  return {
    preloadRoute,
    handleRouteHover,
    preloadLikelyRoutes
  };
};

// Bundle splitting configuration
export const bundleConfig = {
  // Core bundle (always loaded)
  core: [
    'react',
    'react-dom',
    'framer-motion'
  ],
  
  // Route bundles (loaded on demand)
  routes: {
    dashboard: ['../components/Dashboard/Dashboard'],
    inventory: ['../components/CardList/CardList'],
    forms: [
      '../components/CardForm/CardForm',
      '../components/EnhancedCardForm/EnhancedCardForm',
      '../components/PhotoCardForm/PhotoCardForm'
    ],
    admin: [
      '../components/AdminDashboard/AdminDashboard',
      '../components/UserManagement/UserManagement'
    ],
    features: [
      '../components/Reports/Reports',
      '../components/EbayListings/EbayListings',
      '../components/Collections/Collections'
    ],
    pages: [
      '../components/About/About',
      '../components/Contact/Contact',
      '../components/NotFound/NotFound'
    ]
  },
  
  // Utility bundles
  utils: {
    animations: [
      '../components/Animation/AnimatedWrapper',
      '../components/Animation/ParticleBackground'
    ],
    ui: [
      '../components/Carousel/Carousel',
      '../components/Modal/Modal',
      '../components/UI/CollapsibleMenu'
    ],
    mobile: [
      '../components/Mobile/MobileOptimized'
    ]
  }
};

// Performance monitoring for lazy loading
export const useLazyLoadingPerformance = () => {
  const [loadingTimes, setLoadingTimes] = useState<Record<string, number>>({});
  const [loadingErrors, setLoadingErrors] = useState<Record<string, Error>>({});

  const measureLoadingTime = useCallback((componentName: string, startTime: number) => {
    const endTime = performance.now();
    const loadingTime = endTime - startTime;
    
    setLoadingTimes(prev => ({
      ...prev,
      [componentName]: loadingTime
    }));
  }, []);

  const recordLoadingError = useCallback((componentName: string, error: Error) => {
    setLoadingErrors(prev => ({
      ...prev,
      [componentName]: error
    }));
  }, []);

  return {
    loadingTimes,
    loadingErrors,
    measureLoadingTime,
    recordLoadingError
  };
};

// Resource hints for better loading performance
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });

  // Preload critical resources
  const criticalResources = [
    { href: '/static/css/main.css', as: 'style' },
    { href: '/static/js/main.js', as: 'script' }
  ];

  criticalResources.forEach(({ href, as }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  });
};

// Initialize resource hints
if (typeof window !== 'undefined') {
  addResourceHints();
}
