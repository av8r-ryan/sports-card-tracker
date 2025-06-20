import React, { useState, useMemo, memo, useCallback } from 'react';
import { useCards } from '../../context/CardContext';
import { Card, FilterOptions, SortOption } from '../../types';
import './CardList.css';

interface CardListProps {
  onCardSelect?: (card: Card) => void;
  onEditCard?: (card: Card) => void;
}

const CardList: React.FC<CardListProps> = ({ onCardSelect, onEditCard }) => {
  const { state, deleteCard } = useCards();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortOption, setSortOption] = useState<SortOption>({ field: 'createdAt', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');


  const filteredAndSortedCards = useMemo(() => {
    let filtered = state.cards.filter(card => {
      const matchesSearch = searchTerm === '' || 
        card.player.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlayer = !filters.player || 
        card.player.toLowerCase().includes(filters.player.toLowerCase());
      
      const matchesTeam = !filters.team || 
        card.team.toLowerCase().includes(filters.team.toLowerCase());
      
      const matchesYear = !filters.year || card.year === filters.year;
      
      const matchesBrand = !filters.brand || 
        card.brand.toLowerCase().includes(filters.brand.toLowerCase());
      
      const matchesCategory = !filters.category || card.category === filters.category;
      
      const matchesCondition = !filters.condition || card.condition === filters.condition;
      
      const matchesMinValue = !filters.minValue || card.currentValue >= filters.minValue;
      
      const matchesMaxValue = !filters.maxValue || card.currentValue <= filters.maxValue;

      return matchesSearch && matchesPlayer && matchesTeam && matchesYear && 
             matchesBrand && matchesCategory && matchesCondition && matchesMinValue && matchesMaxValue;
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
  }, [state.cards, filters, sortOption, searchTerm]);

  const handleDeleteCard = useCallback(async (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await deleteCard(cardId);
      } catch (error) {
        alert(`Failed to delete card: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [deleteCard]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  const uniqueValues = useMemo(() => ({
    teams: [...new Set(state.cards.map(card => card.team))].sort(),
    brands: [...new Set(state.cards.map(card => card.brand))].sort(),
    categories: [...new Set(state.cards.map(card => card.category))].sort(),
    conditions: [...new Set(state.cards.map(card => card.condition))].sort(),
    years: [...new Set(state.cards.map(card => card.year))].sort((a, b) => b - a)
  }), [state.cards]);

  return (
    <div className="card-list-container">
      <div className="card-list-header">
        <h1>Card Inventory</h1>
        <div className="card-count">
          {filteredAndSortedCards.length} of {state.cards.length} cards
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
            onChange={(e) => setFilters({...filters, team: e.target.value || undefined})}
            className="filter-select"
          >
            <option value="">All Teams</option>
            {uniqueValues.teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>

          <select
            value={filters.brand || ''}
            onChange={(e) => setFilters({...filters, brand: e.target.value || undefined})}
            className="filter-select"
          >
            <option value="">All Brands</option>
            {uniqueValues.brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({...filters, category: e.target.value || undefined})}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {uniqueValues.categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filters.year || ''}
            onChange={(e) => setFilters({...filters, year: e.target.value ? parseInt(e.target.value) : undefined})}
            className="filter-select"
          >
            <option value="">All Years</option>
            {uniqueValues.years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filters.condition || ''}
            onChange={(e) => setFilters({...filters, condition: e.target.value || undefined})}
            className="filter-select"
          >
            <option value="">All Conditions</option>
            {uniqueValues.conditions.map(condition => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
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

      <div className="cards-grid">
        {filteredAndSortedCards.map(card => (
          <div key={card.id} className={`card-item ${card.sellDate ? 'sold' : ''}`}>
            <div className="card-actions">
              {onEditCard && (
                <button onClick={() => onEditCard(card)} className="edit-btn">
                  Edit
                </button>
              )}
              <button onClick={() => handleDeleteCard(card.id)} className="delete-btn">
                Delete
              </button>
            </div>
            
            <div className="card-content" onClick={() => onCardSelect && onCardSelect(card)}>
              {card.sellDate && (
                <div className="sold-banner">
                  <span>SOLD</span>
                </div>
              )}
              <div className="card-image-section">
                <div className="card-image-container">
                  <img 
                    src={card.images && card.images.length > 0 ? card.images[0] : '/generic.png'} 
                    alt={`${card.player} card`} 
                    className="card-main-image" 
                  />
                  {card.images && card.images.length > 1 && (
                    <div className="image-count-badge">
                      +{card.images.length - 1}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-player-name">
                <h4>{card.player}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedCards.length === 0 && (
        <div className="empty-state">
          <p>No cards found matching your criteria.</p>
          {(Object.keys(filters).length > 0 || searchTerm) && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(CardList);