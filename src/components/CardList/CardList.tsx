import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useMemo, memo, useCallback, useRef, useEffect } from 'react';

import { useCards } from '../../context/DexieCardContext';
import { collectionsDatabase } from '../../db/collectionsDatabase';
import useVirtualScroll from '../../hooks/useVirtualScroll';
import { Card, FilterOptions, SortOption } from '../../types';
import { BulkEbayExport } from '../EbayListing/BulkEbayExport';
import LazyImage from '../LazyImage/LazyImage';
import LoadingSkeleton from '../LoadingSkeleton/LoadingSkeleton';
import MoveCardsModal from '../MoveCardsModal/MoveCardsModal';
import './CardList.css';

interface CardListProps {
  onCardSelect?: (card: Card) => void;
  onEditCard?: (card: Card) => void;
  selectedCollectionId?: string | null;
}

const CardList: React.FC<CardListProps> = ({ onCardSelect, onEditCard, selectedCollectionId }) => {
  const { state, deleteCard, setCards } = useCards();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortOption, setSortOption] = useState<SortOption>({ field: 'createdAt', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkEbay, setShowBulkEbay] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Virtual scrolling setup
  const itemHeight = viewMode === 'list' ? 100 : 300; // Adjust based on view mode
  const containerHeight = 600; // Adjust based on your container height

  const itemsPerPage = 12;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Load collection info when selectedCollectionId changes
  React.useEffect(() => {
    if (selectedCollectionId) {
      import('../../db/collectionsDatabase').then(({ collectionsDatabase }) => {
        collectionsDatabase.getCollectionById(selectedCollectionId).then((collection) => {
          setSelectedCollection(collection);
        });
      });
    } else {
      setSelectedCollection(null);
    }
  }, [selectedCollectionId]);

  // Infinite scroll setup
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && filteredCards.length > currentPage * itemsPerPage) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setCurrentPage((prev) => prev + 1);
            setIsLoadingMore(false);
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [isLoadingMore, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm, sortOption]);

  const filteredCards = useMemo(() => {
    const filtered = state.cards.filter((card) => {
      // First apply collection filter if provided
      if (selectedCollectionId && card.collectionId !== selectedCollectionId) {
        return false;
      }

      const matchesSearch =
        searchTerm === '' ||
        card.player.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlayer = !filters.player || card.player.toLowerCase().includes(filters.player.toLowerCase());

      const matchesTeam = !filters.team || card.team.toLowerCase().includes(filters.team.toLowerCase());

      const matchesYear = !filters.year || card.year === filters.year;

      const matchesBrand = !filters.brand || card.brand.toLowerCase().includes(filters.brand.toLowerCase());

      const matchesCategory = !filters.category || card.category === filters.category;

      const matchesCondition = !filters.condition || card.condition === filters.condition;

      const matchesMinValue = !filters.minValue || card.currentValue >= filters.minValue;

      const matchesMaxValue = !filters.maxValue || card.currentValue <= filters.maxValue;

      return (
        matchesSearch &&
        matchesPlayer &&
        matchesTeam &&
        matchesYear &&
        matchesBrand &&
        matchesCategory &&
        matchesCondition &&
        matchesMinValue &&
        matchesMaxValue
      );
    });

    filtered.sort((a, b) => {
      const aValue = a[sortOption.field] as any;
      const bValue = b[sortOption.field] as any;

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (aValue < bValue) return sortOption.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOption.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [state.cards, filters, sortOption, searchTerm, selectedCollectionId]);

  // Get paginated cards
  const paginatedCards = useMemo(() => {
    return filteredCards.slice(0, currentPage * itemsPerPage);
  }, [filteredCards, currentPage, itemsPerPage]);

  // Virtual scrolling setup
  const virtualScroll = useVirtualScroll(paginatedCards, {
    itemHeight,
    containerHeight,
    overscan: 5,
  });

  // Card flip functionality
  const toggleCardFlip = useCallback((cardId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      if (window.confirm('Are you sure you want to delete this card?')) {
        try {
          await deleteCard(cardId);
        } catch (error) {
          alert(`Failed to delete card: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    },
    [deleteCard]
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  const toggleCardSelection = useCallback((cardId: string) => {
    setSelectedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedCards(new Set(paginatedCards.map((card: any) => card.id)));
  }, [paginatedCards]);

  const clearSelection = useCallback(() => {
    setSelectedCards(new Set());
  }, []);

  const handleMoveCards = useCallback(
    async (cardIds: string[], targetCollectionId: string) => {
      try {
        // Move cards to the target collection - this updates the database
        await collectionsDatabase.moveCardsToCollection(cardIds, targetCollectionId);

        // Reload from database to ensure we have the latest state
        const { cardDatabase } = await import('../../db/simpleDatabase');
        const freshCards = await cardDatabase.getAllCards();
        console.log(
          '[handleMoveCards] Fresh cards from database after move:',
          freshCards.filter((c) => cardIds.includes(c.id)).map((c) => ({ id: c.id, collectionId: c.collectionId }))
        );

        setCards(freshCards);

        clearSelection();
        setShowMoveModal(false);
      } catch (error) {
        console.error('Error moving cards:', error);
        // If there's an error, reload from database to ensure consistency
        const { cardDatabase } = await import('../../db/simpleDatabase');
        const freshCards = await cardDatabase.getAllCards();
        setCards(freshCards);
        throw error;
      }
    },
    [state.cards, clearSelection, setCards]
  );

  const uniqueValues = useMemo(
    () => ({
      teams: [...new Set(state.cards.map((card) => card.team))].sort(),
      brands: [...new Set(state.cards.map((card) => card.brand))].sort(),
      categories: [...new Set(state.cards.map((card) => card.category))].sort(),
      conditions: [...new Set(state.cards.map((card) => card.condition))].sort(),
      years: [...new Set(state.cards.map((card) => card.year))].sort((a, b) => b - a),
    }),
    [state.cards]
  );

  if (state.loading) {
    return (
      <div className="card-list-container">
        <div className="card-list-header">
          <h1>Card Inventory</h1>
          <div className="card-count">Loading...</div>
        </div>
        <LoadingSkeleton count={6} type="card" />
      </div>
    );
  }

  return (
    <div className="card-list-container">
      <div className="card-list-header">
        <h1>
          {selectedCollection ? (
            <>
              <span style={{ color: selectedCollection.color }}>{selectedCollection.icon}</span>{' '}
              {selectedCollection.name}
            </>
          ) : (
            'Card Inventory'
          )}
        </h1>
        <div className="card-count">
          {filteredCards.length} of {state.cards.length} cards
          {selectedCollection && (
            <button
              onClick={() => (window.location.hash = '')}
              className="clear-collection-btn"
              style={{ marginLeft: '10px' }}
            >
              ✕ Clear Collection Filter
            </button>
          )}
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            ⊞
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            ☰
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-grid">
          <select
            value={filters.team || ''}
            onChange={(e) => setFilters({ ...filters, team: e.target.value || undefined })}
            className="filter-select"
          >
            <option value="">All Teams</option>
            {uniqueValues.teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>

          <select
            value={filters.brand || ''}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value || undefined })}
            className="filter-select"
          >
            <option value="">All Brands</option>
            {uniqueValues.brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {uniqueValues.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filters.year || ''}
            onChange={(e) => setFilters({ ...filters, year: e.target.value ? parseInt(e.target.value) : undefined })}
            className="filter-select"
          >
            <option value="">All Years</option>
            {uniqueValues.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={filters.condition || ''}
            onChange={(e) => setFilters({ ...filters, condition: e.target.value || undefined })}
            className="filter-select"
          >
            <option value="">All Conditions</option>
            {uniqueValues.conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
          <button onClick={() => setShowBulkEbay(true)} className="bulk-ebay-btn">
            🛒 Bulk eBay Export
          </button>
        </div>

        <div className="sort-section">
          <label>Sort by:</label>
          <select
            value={`${sortOption.field}-${sortOption.direction}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortOption({ field: field as keyof Card, direction: direction as 'asc' | 'desc' });
            }}
            className="sort-select"
          >
            <option value="createdAt-desc">Date Added (Newest)</option>
            <option value="createdAt-asc">Date Added (Oldest)</option>
            <option value="player-asc">Player (A-Z)</option>
            <option value="player-desc">Player (Z-A)</option>
            <option value="year-desc">Year (Newest)</option>
            <option value="year-asc">Year (Oldest)</option>
            <option value="currentValue-desc">Value (Highest)</option>
            <option value="currentValue-asc">Value (Lowest)</option>
          </select>
        </div>
      </div>

      {/* Bulk Selection Controls */}
      {filteredCards.length > 0 && (
        <div className="bulk-selection-controls">
          <div className="selection-info">
            {selectedCards.size > 0 ? (
              <>
                <span>
                  {selectedCards.size} card{selectedCards.size !== 1 ? 's' : ''} selected
                </span>
                <button onClick={clearSelection} className="clear-selection-btn">
                  Clear Selection
                </button>
                <button onClick={() => setShowMoveModal(true)} className="move-cards-btn">
                  Move to Collection
                </button>
              </>
            ) : (
              <button onClick={selectAll} className="select-all-btn">
                Select All ({filteredCards.length})
              </button>
            )}
          </div>
        </div>
      )}

      <div
        className={`cards-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}
        style={{
          height: containerHeight,
          overflow: 'auto',
          position: 'relative',
        }}
        onScroll={virtualScroll.handleScroll}
      >
        <div style={{ height: virtualScroll.totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${virtualScroll.startIndex * itemHeight}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            <AnimatePresence mode="popLayout">
              {virtualScroll.visibleItems.map((card, index) => (
                <motion.div
                  key={card.id}
                  className={`card-item card-glass hover-lift ${card.sellDate ? 'sold' : ''} ${selectedCards.has(card.id) ? 'selected' : ''}`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: 'easeOut',
                  }}
                  whileHover={{
                    scale: 1.02,
                    rotateY: 5,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="card-selection">
                    <input
                      type="checkbox"
                      checked={selectedCards.has(card.id)}
                      onChange={() => toggleCardSelection(card.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="card-actions">
                    {onEditCard && (
                      <motion.button
                        onClick={() => onEditCard(card)}
                        className="edit-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        Edit
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => handleDeleteCard(card.id)}
                      className="delete-btn"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      Delete
                    </motion.button>
                  </div>

                  <motion.div
                    className="card-flip-container"
                    onClick={() => toggleCardFlip(card.id)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      className={`card-flip-inner ${flippedCards.has(card.id) ? 'flipped' : ''}`}
                      animate={{ rotateY: flippedCards.has(card.id) ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    >
                      {/* Front of card */}
                      <div className="card-front">
                        {card.sellDate && (
                          <div className="sold-banner">
                            <span>SOLD</span>
                          </div>
                        )}
                        <div className="card-image-section">
                          <div className="card-image-container">
                            <LazyImage
                              src={card.images && card.images.length > 0 ? card.images[0] : '/generic.png'}
                              alt={`${card.player} card`}
                              className="card-main-image"
                            />
                            {card.images && card.images.length > 1 && (
                              <div className="image-count-badge">+{card.images.length - 1}</div>
                            )}
                          </div>
                        </div>

                        <div className="card-player-name">
                          <h4>{card.player}</h4>
                        </div>
                      </div>

                      {/* Back of card */}
                      <div className="card-back">
                        <div className="card-details">
                          <h4>{card.player}</h4>
                          <p>
                            <strong>Team:</strong> {card.team}
                          </p>
                          <p>
                            <strong>Year:</strong> {card.year}
                          </p>
                          <p>
                            <strong>Brand:</strong> {card.brand}
                          </p>
                          <p>
                            <strong>Value:</strong> ${card.currentValue?.toLocaleString()}
                          </p>
                          {card.notes && (
                            <p>
                              <strong>Notes:</strong> {card.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Infinite scroll loading indicator */}
      {isLoadingMore && (
        <motion.div className="loading-more" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="loading-spinner" />
          <p>Loading more cards...</p>
        </motion.div>
      )}

      {/* Load more trigger */}
      {filteredCards.length > currentPage * itemsPerPage && <div ref={loadMoreRef} className="load-more-trigger" />}

      {filteredCards.length === 0 && (
        <div className="empty-state">
          <p>No cards found matching your criteria.</p>
          {(Object.keys(filters).length > 0 || searchTerm) && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          )}
        </div>
      )}

      {showBulkEbay && <BulkEbayExport cards={filteredCards} onClose={() => setShowBulkEbay(false)} />}

      {showMoveModal && selectedCards.size > 0 && (
        <MoveCardsModal
          cards={state.cards.filter((card) => selectedCards.has(card.id))}
          onClose={() => setShowMoveModal(false)}
          onMove={handleMoveCards}
        />
      )}
    </div>
  );
};

export default memo(CardList);
