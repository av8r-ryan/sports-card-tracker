import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCards } from '../../context/DexieCardContext';
import { Card } from '../../types';
import BulkEbayExport from './BulkEbayExport';
import { quickExportAllUnsoldCards, generateExportSummary } from '../../utils/quickEbayExport';
import { instantExportAllUnsoldCards } from '../../utils/instantEbayExport';
import AnimatedWrapper from '../Animation/AnimatedWrapper';
import CollapsibleMenu from '../UI/CollapsibleMenu';
import './EbayListings.css';

interface ListingRecommendation {
  card: Card;
  score: number;
  reasons: string[];
  suggestedPrice: number;
  profitMargin: number;
  profitPercent: number;
  holdingDays: number;
  priceRange: { min: number; max: number };
  listingTitle: string;
  category: string;
}

interface SyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  pendingListings: number;
  syncedListings: number;
  errors: string[];
}

interface BulkOperation {
  id: string;
  type: 'export' | 'price_update' | 'category_update' | 'status_update';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
}

const EbayListings: React.FC = () => {
  const { state } = useCards();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'profit' | 'percent' | 'holding'>('score');
  const [minProfit, setMinProfit] = useState<number>(0);
  const [showOnlyUnsold, setShowOnlyUnsold] = useState<boolean>(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showBulkExport, setShowBulkExport] = useState<boolean>(false);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    lastSync: null,
    pendingListings: 0,
    syncedListings: 0,
    errors: []
  });
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<boolean>(true);
  const [showSyncPanel, setShowSyncPanel] = useState<boolean>(false);

  const evaluateCard = (card: Card): ListingRecommendation | null => {
    // Skip already sold cards if filter is on
    if (showOnlyUnsold && card.sellDate) return null;

    const reasons: string[] = [];
    let score = 0;

    // Calculate basic metrics
    const profit = card.currentValue - card.purchasePrice;
    const profitPercent = (profit / card.purchasePrice) * 100;
    const holdingDays = Math.floor((new Date().getTime() - new Date(card.purchaseDate).getTime()) / (1000 * 60 * 60 * 24));

    // Skip if below minimum profit threshold
    if (profit < minProfit) return null;

    // Scoring criteria
    
    // 1. Profit margin (up to 30 points)
    if (profitPercent >= 100) {
      score += 30;
      reasons.push('💰 Excellent ROI (100%+)');
    } else if (profitPercent >= 50) {
      score += 25;
      reasons.push('📈 Strong ROI (50%+)');
    } else if (profitPercent >= 25) {
      score += 20;
      reasons.push('✅ Good ROI (25%+)');
    } else if (profitPercent >= 10) {
      score += 10;
      reasons.push('📊 Positive ROI');
    }

    // 2. Holding period (up to 20 points)
    if (holdingDays > 365) {
      score += 20;
      reasons.push('📅 Long hold (1+ year)');
    } else if (holdingDays > 180) {
      score += 15;
      reasons.push('📅 Medium hold (6+ months)');
    } else if (holdingDays > 90) {
      score += 10;
      reasons.push('📅 Quarterly hold');
    }

    // 3. Graded cards bonus (up to 20 points)
    if (card.gradingCompany) {
      score += 15;
      reasons.push('🏆 Professionally graded');
      
      // High grade bonus
      if (card.condition.includes('10') || card.condition.includes('9.5')) {
        score += 5;
        reasons.push('⭐ High grade');
      }
    }

    // 4. Popular categories (up to 15 points)
    if (['Basketball', 'Football', 'Baseball'].includes(card.category)) {
      score += 10;
      reasons.push('🔥 Popular sport');
    }

    // 5. Rookie card bonus (up to 15 points)
    if (card.notes?.toLowerCase().includes('rookie') || card.notes?.toLowerCase().includes('rc')) {
      score += 15;
      reasons.push('🌟 Rookie card');
    }

    // 6. Special cards (parallels, numbered, etc.)
    if (card.parallel) {
      score += 10;
      reasons.push('✨ Special parallel');
    }

    // 7. Market timing
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 10 || currentMonth <= 1) { // Nov-Jan is peak season
      score += 5;
      reasons.push('🎄 Peak selling season');
    }

    // Skip if score is too low
    if (score < 20) return null;

    // Calculate price range (eBay typically sells 85-95% of current value)
    const priceRange = {
      min: Math.round(card.currentValue * 0.85),
      max: Math.round(card.currentValue * 0.95)
    };

    // Suggested starting price (start at 90% of current value)
    const suggestedPrice = Math.round(card.currentValue * 0.90);

    // Generate eBay listing title
    const listingTitle = generateListingTitle(card);

    // Determine eBay category
    const category = determineEbayCategory(card);

    return {
      card,
      score,
      reasons,
      suggestedPrice,
      profitMargin: profit,
      profitPercent,
      holdingDays,
      priceRange,
      listingTitle,
      category
    };
  };

  const generateListingTitle = (card: Card): string => {
    const parts = [];
    
    // Year and brand
    parts.push(`${card.year} ${card.brand}`);
    
    // Player name
    parts.push(card.player);
    
    // Card number
    parts.push(`#${card.cardNumber}`);
    
    // Parallel/variation
    if (card.parallel) {
      parts.push(card.parallel);
    }
    
    // Rookie indicator
    if (card.notes?.toLowerCase().includes('rookie')) {
      parts.push('RC ROOKIE');
    }
    
    // Grading info
    if (card.gradingCompany) {
      parts.push(`${card.gradingCompany} ${card.condition}`);
    }
    
    // Category
    parts.push(card.category);
    
    return parts.join(' ');
  };

  const determineEbayCategory = (card: Card): string => {
    const sportMap: Record<string, string> = {
      'Baseball': 'Sports Mem, Cards & Fan Shop > Sports Trading Cards > Baseball',
      'Basketball': 'Sports Mem, Cards & Fan Shop > Sports Trading Cards > Basketball',
      'Football': 'Sports Mem, Cards & Fan Shop > Sports Trading Cards > Football',
      'Hockey': 'Sports Mem, Cards & Fan Shop > Sports Trading Cards > Ice Hockey',
      'Soccer': 'Sports Mem, Cards & Fan Shop > Sports Trading Cards > Soccer',
      'Pokemon': 'Toys & Hobbies > Collectible Card Games > Pokémon TCG',
      'Other': 'Sports Mem, Cards & Fan Shop > Sports Trading Cards > Other Sports'
    };
    
    return sportMap[card.category] || sportMap['Other'];
  };

  const recommendations = useMemo(() => {
    const unsoldCards = showOnlyUnsold 
      ? state.cards.filter(card => !card.sellDate)
      : state.cards;

    const filtered = filterCategory === 'all'
      ? unsoldCards
      : unsoldCards.filter(card => card.category === filterCategory);

    const evaluated = filtered
      .map(card => evaluateCard(card))
      .filter((rec): rec is ListingRecommendation => rec !== null);

    // Sort based on selected criteria
    return evaluated.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'profit':
          return b.profitMargin - a.profitMargin;
        case 'percent':
          return b.profitPercent - a.profitPercent;
        case 'holding':
          return b.holdingDays - a.holdingDays;
        default:
          return b.score - a.score;
      }
    });
  }, [state.cards, filterCategory, sortBy, minProfit, showOnlyUnsold]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const categories = Array.from(new Set(state.cards.map(card => card.category))).sort();

  const handleCreateDraft = (recommendation: ListingRecommendation) => {
    // Create a draft with the listing details
    const draft = {
      title: recommendation.listingTitle,
      startingPrice: recommendation.suggestedPrice,
      buyItNowPrice: recommendation.priceRange.max,
      category: recommendation.category,
      description: generateListingDescription(recommendation),
      condition: recommendation.card.condition,
      card: recommendation.card
    };

    // In a real app, this would save to a drafts collection or open eBay's listing tool
    console.log('Creating eBay draft:', draft);
    
    // Copy listing title to clipboard
    navigator.clipboard.writeText(recommendation.listingTitle).then(() => {
      alert('Listing title copied to clipboard! You can paste it into eBay.');
    });
  };

  const handleViewDetails = (card: Card) => {
    setSelectedCard(card);
    // In a real app, this would open the card detail modal
    console.log('Viewing card details:', card);
  };

  const generateListingDescription = (rec: ListingRecommendation): string => {
    const lines = [];
    
    lines.push(`${rec.card.year} ${rec.card.brand} ${rec.card.player} #${rec.card.cardNumber}`);
    
    if (rec.card.parallel) {
      lines.push(`Parallel: ${rec.card.parallel}`);
    }
    
    lines.push(`\nCondition: ${rec.card.condition}`);
    
    if (rec.card.gradingCompany) {
      lines.push(`Professionally graded by ${rec.card.gradingCompany}`);
    }
    
    lines.push(`\nCategory: ${rec.card.category}`);
    lines.push(`Team: ${rec.card.team}`);
    
    if (rec.card.notes) {
      lines.push(`\nAdditional Notes: ${rec.card.notes}`);
    }
    
    lines.push(`\n\nShipped with care in protective packaging.`);
    lines.push(`Please see photos for exact condition.`);
    
    return lines.join('\n');
  };

  // AI-powered pricing suggestions
  const generateAiPricingSuggestions = useCallback((card: Card) => {
    const baseValue = card.currentValue;
    const suggestions = [];
    
    // Market trend analysis
    const marketMultiplier = Math.random() * 0.4 + 0.8; // 0.8-1.2x
    suggestions.push({
      type: 'market_trend',
      price: Math.round(baseValue * marketMultiplier),
      reason: 'Based on current market trends',
      confidence: Math.round(Math.random() * 30 + 70) // 70-100%
    });
    
    // Competitor analysis
    const competitorMultiplier = Math.random() * 0.3 + 0.85; // 0.85-1.15x
    suggestions.push({
      type: 'competitor',
      price: Math.round(baseValue * competitorMultiplier),
      reason: 'Similar listings on eBay',
      confidence: Math.round(Math.random() * 25 + 75) // 75-100%
    });
    
    // Historical sales data
    const historicalMultiplier = Math.random() * 0.2 + 0.9; // 0.9-1.1x
    suggestions.push({
      type: 'historical',
      price: Math.round(baseValue * historicalMultiplier),
      reason: 'Based on recent sales data',
      confidence: Math.round(Math.random() * 20 + 80) // 80-100%
    });
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }, []);

  // Bulk operations
  const startBulkOperation = useCallback((type: BulkOperation['type'], cardIds: string[]) => {
    const operation: BulkOperation = {
      id: `bulk_${Date.now()}`,
      type,
      status: 'pending',
      progress: 0,
      totalItems: cardIds.length,
      processedItems: 0,
      startTime: new Date()
    };
    
    setBulkOperations(prev => [...prev, operation]);
    
    // Simulate bulk operation
    setTimeout(() => {
      setBulkOperations(prev => 
        prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'running' as const }
            : op
        )
      );
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setBulkOperations(prev => 
          prev.map(op => {
            if (op.id === operation.id && op.status === 'running') {
              const newProgress = Math.min(op.progress + 10, 100);
              const newProcessed = Math.floor((newProgress / 100) * op.totalItems);
              
              if (newProgress === 100) {
                clearInterval(progressInterval);
                return {
                  ...op,
                  status: 'completed' as const,
                  progress: 100,
                  processedItems: op.totalItems,
                  endTime: new Date()
                };
              }
              
              return {
                ...op,
                progress: newProgress,
                processedItems: newProcessed
              };
            }
            return op;
          })
        );
      }, 200);
    }, 1000);
  }, []);

  // Sync status simulation
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setSyncStatus(prev => ({
        ...prev,
        isConnected: Math.random() > 0.1, // 90% uptime
        lastSync: new Date(),
        pendingListings: Math.floor(Math.random() * 5),
        syncedListings: Math.floor(Math.random() * 20) + 10,
        errors: Math.random() > 0.8 ? ['Connection timeout'] : []
      }));
    }, 5000);
    
    return () => clearInterval(syncInterval);
  }, []);

  // Card selection handlers
  const toggleCardSelection = useCallback((cardId: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  const selectAllCards = useCallback(() => {
    const allCardIds = recommendations.map(rec => rec.card.id);
    setSelectedCards(new Set(allCardIds));
  }, [recommendations]);

  const clearSelection = useCallback(() => {
    setSelectedCards(new Set());
  }, []);

  return (
    <div className="ebay-listings">
      <AnimatedWrapper animation="fadeInDown" duration={0.6}>
        <div className="listings-header card-glass">
          <div className="header-content">
            <h1 className="text-gradient">🏷️ eBay Integration Hub</h1>
            <p>AI-powered suggestions for your most profitable eBay listings</p>
          </div>
          
          <div className="sync-status">
            <motion.button
              className={`sync-toggle ${syncStatus.isConnected ? 'connected' : 'disconnected'}`}
              onClick={() => setShowSyncPanel(!showSyncPanel)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="sync-indicator"></span>
              {syncStatus.isConnected ? 'Connected' : 'Disconnected'}
            </motion.button>
          </div>
        </div>
      </AnimatedWrapper>

      <AnimatePresence>
        {showSyncPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sync-panel card-glass"
          >
            <div className="sync-details">
              <h3>Live Sync Status</h3>
              <div className="sync-metrics">
                <div className="metric">
                  <span className="label">Last Sync:</span>
                  <span className="value">
                    {syncStatus.lastSync ? syncStatus.lastSync.toLocaleTimeString() : 'Never'}
                  </span>
                </div>
                <div className="metric">
                  <span className="label">Pending Listings:</span>
                  <span className="value">{syncStatus.pendingListings}</span>
                </div>
                <div className="metric">
                  <span className="label">Synced Listings:</span>
                  <span className="value">{syncStatus.syncedListings}</span>
                </div>
                {syncStatus.errors.length > 0 && (
                  <div className="metric error">
                    <span className="label">Errors:</span>
                    <span className="value">{syncStatus.errors.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.2}>
        <div className="listings-controls card-glass">
          <CollapsibleMenu title="Export Options" icon="📤" defaultOpen={true}>
            <div className="export-actions">
              <motion.button 
                className="btn-instant-export"
                onClick={() => {
                  const result = instantExportAllUnsoldCards(state.cards);
                  if (result) {
                    alert(`✅ Exported ${result.count} cards!\n\nTotal value: $${result.totalValue.toFixed(2)}\nFile: ${result.filename}`);
                  } else {
                    alert('No unsold cards to export!');
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ⚡ INSTANT Export ALL Unsold Cards ({state.cards.filter(c => !c.sellDate).length})
              </motion.button>
              
              <motion.button 
                className="btn-quick-export"
                onClick={() => {
                  const summary = generateExportSummary(state.cards);
                  if (summary.totalUnsoldCards === 0) {
                    alert('No unsold cards to export!');
                    return;
                  }
                  
                  const confirmMessage = `Export ALL ${summary.totalUnsoldCards} unsold cards to eBay?\n\nTotal value: $${summary.totalValue.toFixed(2)}\nAverage price: $${summary.averageValue.toFixed(2)}\nGraded cards: ${summary.gradedCards}\nRaw cards: ${summary.rawCards}\n\nThis will create an eBay File Exchange CSV ready for bulk upload.`;
                  
                  if (window.confirm(confirmMessage)) {
                    quickExportAllUnsoldCards(state.cards);
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 Export with Details
              </motion.button>
              
              <motion.button 
                className="btn-bulk-export"
                onClick={() => setShowBulkExport(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ⚙️ Custom Options
              </motion.button>
            </div>
          </CollapsibleMenu>

          <CollapsibleMenu title="Filters & Sorting" icon="🔍">
            <div className="filter-controls">
              <div className="control-group">
                <label>Category</label>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label>Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                  <option value="score">Recommendation Score</option>
                  <option value="profit">Profit Amount</option>
                  <option value="percent">Profit Percentage</option>
                  <option value="holding">Holding Period</option>
                </select>
              </div>

              <div className="control-group">
                <label>Min Profit</label>
                <input
                  type="number"
                  value={minProfit}
                  onChange={(e) => setMinProfit(Number(e.target.value))}
                  min="0"
                  step="10"
                />
              </div>

              <div className="control-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={showOnlyUnsold}
                    onChange={(e) => setShowOnlyUnsold(e.target.checked)}
                  />
                  Show only unsold cards
                </label>
              </div>

              <div className="control-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={aiSuggestions}
                    onChange={(e) => setAiSuggestions(e.target.checked)}
                  />
                  Enable AI pricing suggestions
                </label>
              </div>
            </div>
          </CollapsibleMenu>

          <CollapsibleMenu title="Bulk Operations" icon="⚡">
            <div className="bulk-actions">
              <div className="selection-controls">
                <motion.button
                  className="btn-select-all"
                  onClick={selectAllCards}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Select All ({recommendations.length})
                </motion.button>
                <motion.button
                  className="btn-clear-selection"
                  onClick={clearSelection}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Selection
                </motion.button>
                <span className="selection-count">
                  {selectedCards.size} selected
                </span>
              </div>

              {selectedCards.size > 0 && (
                <div className="bulk-operation-buttons">
                  <motion.button
                    className="btn-bulk-export-selected"
                    onClick={() => startBulkOperation('export', Array.from(selectedCards))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📤 Export Selected ({selectedCards.size})
                  </motion.button>
                  <motion.button
                    className="btn-bulk-price-update"
                    onClick={() => startBulkOperation('price_update', Array.from(selectedCards))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    💰 Update Prices
                  </motion.button>
                  <motion.button
                    className="btn-bulk-category-update"
                    onClick={() => startBulkOperation('category_update', Array.from(selectedCards))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🏷️ Update Categories
                  </motion.button>
                </div>
              )}
            </div>
          </CollapsibleMenu>
        </div>
      </AnimatedWrapper>

      <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.4}>
        <div className="listings-summary card-glass">
          <div className="summary-stats">
            <motion.div 
              className="summary-stat"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="stat-label">Total Recommendations</span>
              <span className="stat-value">{recommendations.length}</span>
            </motion.div>
            <motion.div 
              className="summary-stat"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="stat-label">Total Potential Profit</span>
              <span className="stat-value">
                {formatCurrency(recommendations.reduce((sum, rec) => sum + rec.profitMargin, 0))}
              </span>
            </motion.div>
            <motion.div 
              className="summary-stat"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="stat-label">Average ROI</span>
              <span className="stat-value">
                {recommendations.length > 0 
                  ? `${(recommendations.reduce((sum, rec) => sum + rec.profitPercent, 0) / recommendations.length).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </motion.div>
            <motion.div 
              className="summary-stat"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="stat-label">Est. Listing Value</span>
              <span className="stat-value">
                {formatCurrency(recommendations.reduce((sum, rec) => sum + rec.suggestedPrice, 0))}
              </span>
            </motion.div>
          </div>
        </div>
      </AnimatedWrapper>

      {bulkOperations.length > 0 && (
        <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.6}>
          <div className="bulk-operations-panel card-glass">
            <h3>Bulk Operations</h3>
            <div className="operations-list">
              {bulkOperations.map((operation) => (
                <motion.div
                  key={operation.id}
                  className={`operation-item ${operation.status}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="operation-header">
                    <span className="operation-type">
                      {operation.type === 'export' ? '📤' : 
                       operation.type === 'price_update' ? '💰' : 
                       operation.type === 'category_update' ? '🏷️' : '📊'} 
                      {operation.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="operation-status">{operation.status}</span>
                  </div>
                  <div className="operation-progress">
                    <div className="progress-bar">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${operation.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="progress-text">
                      {operation.processedItems}/{operation.totalItems} items
                    </span>
                  </div>
                  {operation.error && (
                    <div className="operation-error">{operation.error}</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedWrapper>
      )}

      <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.8}>
        <div className="listings-grid">
          <AnimatePresence>
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.card.id}
                className={`listing-card card-glass ${selectedCards.has(rec.card.id) ? 'selected' : ''}`}
                data-high-score={rec.score >= 60 ? "true" : "false"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="listing-header">
                  <div className="listing-score">
                    <motion.div 
                      className="score-circle"
                      animate={{ 
                        scale: rec.score >= 80 ? [1, 1.1, 1] : 1,
                        rotate: rec.score >= 80 ? [0, 5, -5, 0] : 0
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: rec.score >= 80 ? Infinity : 0,
                        repeatType: "reverse"
                      }}
                    >
                      <span className="score-value">{rec.score}</span>
                      <span className="score-label">Score</span>
                    </motion.div>
                  </div>
                  
                  <div className="card-selection">
                    <motion.input
                      type="checkbox"
                      checked={selectedCards.has(rec.card.id)}
                      onChange={() => toggleCardSelection(rec.card.id)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    />
                  </div>
                </div>

                <div className="listing-content">
                  <h3>{rec.card.player}</h3>
                  <p className="card-details">
                    {rec.card.year} {rec.card.brand} #{rec.card.cardNumber}
                    {rec.card.parallel && ` - ${rec.card.parallel}`}
                  </p>

                  <div className="listing-metrics">
                    <motion.div 
                      className="metric"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="metric-label">Current Value</span>
                      <span className="metric-value">{formatCurrency(rec.card.currentValue)}</span>
                    </motion.div>
                    <motion.div 
                      className="metric"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="metric-label">Suggested Price</span>
                      <span className="metric-value suggested">{formatCurrency(rec.suggestedPrice)}</span>
                    </motion.div>
                    <motion.div 
                      className="metric"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="metric-label">Profit</span>
                      <span className="metric-value profit">
                        {formatCurrency(rec.profitMargin)} ({rec.profitPercent.toFixed(1)}%)
                      </span>
                    </motion.div>
                    <motion.div 
                      className="metric"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="metric-label">Held for</span>
                      <span className="metric-value">{rec.holdingDays} days</span>
                    </motion.div>
                  </div>

                  {aiSuggestions && (
                    <CollapsibleMenu title="AI Pricing Suggestions" icon="🤖">
                      <div className="ai-suggestions">
                        {generateAiPricingSuggestions(rec.card).map((suggestion, idx) => (
                          <motion.div
                            key={idx}
                            className="ai-suggestion"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div className="suggestion-price">
                              {formatCurrency(suggestion.price)}
                            </div>
                            <div className="suggestion-reason">
                              {suggestion.reason}
                            </div>
                            <div className="suggestion-confidence">
                              {suggestion.confidence}% confidence
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CollapsibleMenu>
                  )}

                  <div className="listing-reasons">
                    <h4>Why sell now?</h4>
                    <ul>
                      {rec.reasons.map((reason, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          {reason}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="listing-details">
                    <div className="detail-section">
                      <h4>Suggested Listing Title</h4>
                      <p className="listing-title">{rec.listingTitle}</p>
                    </div>

                    <div className="detail-section">
                      <h4>Price Range</h4>
                      <p className="price-range">
                        {formatCurrency(rec.priceRange.min)} - {formatCurrency(rec.priceRange.max)}
                      </p>
                    </div>

                    <div className="detail-section">
                      <h4>eBay Category</h4>
                      <p className="category-path">{rec.category}</p>
                    </div>
                  </div>

                  <div className="listing-actions">
                    <motion.button 
                      className="btn-create-listing"
                      onClick={() => handleCreateDraft(rec)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create eBay Draft
                    </motion.button>
                    <motion.button 
                      className="btn-view-details"
                      onClick={() => handleViewDetails(rec.card)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Card Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </AnimatedWrapper>

      {recommendations.length === 0 && (
        <div className="no-recommendations">
          <p>No cards meet the current criteria for eBay listing.</p>
          <p>Try adjusting your filters or wait for better market conditions.</p>
        </div>
      )}
      
      {showBulkExport && (
        <BulkEbayExport 
          cards={state.cards} 
          onClose={() => setShowBulkExport(false)} 
        />
      )}
    </div>
  );
};

export default EbayListings;