import React, { useState } from 'react';
import { ReportFilter } from '../../types/reports';
import { Card, CATEGORIES, CONDITIONS } from '../../types';

interface Props {
  filters: ReportFilter;
  onFiltersChange: (filters: ReportFilter) => void;
  cards: Card[];
}

const ReportFilters: React.FC<Props> = ({ filters, onFiltersChange, cards }) => {
  const [localFilters, setLocalFilters] = useState<ReportFilter>(filters);

  // Get unique values from cards
  const uniqueTeams = Array.from(new Set(cards.map(card => card.team))).sort();
  const uniqueYears = Array.from(new Set(cards.map(card => card.year))).sort((a, b) => b - a);

  const handleFilterChange = (key: keyof ReportFilter, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    const dateRange = localFilters.dateRange || { start: new Date(), end: new Date() };
    const newDateRange = {
      ...dateRange,
      [type]: new Date(value)
    };
    handleFilterChange('dateRange', newDateRange);
  };

  const handleValueRangeChange = (type: 'min' | 'max', value: string) => {
    const valueRange = localFilters.valueRange || { min: 0, max: 10000 };
    const newValueRange = {
      ...valueRange,
      [type]: parseFloat(value) || 0
    };
    handleFilterChange('valueRange', newValueRange);
  };

  const handleMultiSelectChange = (key: keyof ReportFilter, value: string | number, checked: boolean) => {
    const currentValues = (localFilters[key] as (string | number)[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    handleFilterChange(key, newValues.length > 0 ? newValues : undefined);
  };

  const clearFilters = () => {
    const emptyFilters: ReportFilter = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <div className="report-filters">
      <div className="filters-header">
        <h3>🔍 Report Filters</h3>
        <button onClick={clearFilters} className="clear-filters">
          Clear All
        </button>
      </div>

      <div className="filters-grid">
        {/* Date Range */}
        <div className="filter-group">
          <label>Date Range</label>
          <div className="date-range">
            <input
              type="date"
              value={localFilters.dateRange?.start ? 
                localFilters.dateRange.start.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={localFilters.dateRange?.end ? 
                localFilters.dateRange.end.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Value Range */}
        <div className="filter-group">
          <label>Value Range</label>
          <div className="value-range">
            <input
              type="number"
              value={localFilters.valueRange?.min || ''}
              onChange={(e) => handleValueRangeChange('min', e.target.value)}
              placeholder="Min Value"
              min="0"
            />
            <input
              type="number"
              value={localFilters.valueRange?.max || ''}
              onChange={(e) => handleValueRangeChange('max', e.target.value)}
              placeholder="Max Value"
              min="0"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="filter-group">
          <label>Categories</label>
          <div className="checkbox-group">
            {CATEGORIES.map(category => (
              <label key={category} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={(localFilters.categories || []).includes(category)}
                  onChange={(e) => handleMultiSelectChange('categories', category, e.target.checked)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="filter-group">
          <label>Conditions</label>
          <div className="checkbox-group">
            {CONDITIONS.slice(0, 8).map(condition => (
              <label key={condition} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={(localFilters.conditions || []).includes(condition)}
                  onChange={(e) => handleMultiSelectChange('conditions', condition, e.target.checked)}
                />
                <span>{condition}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Teams */}
        <div className="filter-group">
          <label>Teams</label>
          <div className="checkbox-group limited">
            {uniqueTeams.slice(0, 10).map(team => (
              <label key={team} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={(localFilters.teams || []).includes(team)}
                  onChange={(e) => handleMultiSelectChange('teams', team, e.target.checked)}
                />
                <span>{team}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Years */}
        <div className="filter-group">
          <label>Years</label>
          <div className="checkbox-group limited">
            {uniqueYears.slice(0, 10).map(year => (
              <label key={year} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={(localFilters.years || []).includes(year)}
                  onChange={(e) => handleMultiSelectChange('years', year, e.target.checked)}
                />
                <span>{year}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;