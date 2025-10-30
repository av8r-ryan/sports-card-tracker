import React, { useState } from 'react';

import { ebayListingService, EbayListingOptions } from '../../services/ebayListingService';
import { Card } from '../../types';
import './BulkEbayExport.css';

interface BulkEbayExportProps {
  cards: Card[];
  onClose: () => void;
}

export const BulkEbayExport: React.FC<BulkEbayExportProps> = ({ cards, onClose }) => {
  const [options, setOptions] = useState<EbayListingOptions>({
    includeImages: true,
    listingFormat: 'both',
    duration: 7,
    shippingType: 'standard',
    returnPolicy: true,
    watermarkImages: false,
    includeGradingDetails: true,
    includeMarketData: true,
  });

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set(cards.map((c) => c.id)));

  const toggleCardSelection = (cardId: string) => {
    const newSelection = new Set(selectedCards);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.add(cardId);
    }
    setSelectedCards(newSelection);
  };

  const selectAll = () => {
    setSelectedCards(new Set(cards.map((c) => c.id)));
  };

  const deselectAll = () => {
    setSelectedCards(new Set());
  };

  const exportListings = async () => {
    setProcessing(true);
    setProgress(0);

    const selectedCardsList = cards.filter((card) => selectedCards.has(card.id));
    const listings = ebayListingService.generateBulkListings(selectedCardsList, options);

    // Simulate processing time
    for (let i = 0; i < listings.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setProgress(((i + 1) / listings.length) * 100);
    }

    // Export to CSV
    const csv = ebayListingService.exportToCSV(listings);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebay_listings_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setProcessing(false);

    // Show success message briefly before closing
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bulk-ebay-modal">
      <div className="bulk-ebay-container">
        <div className="bulk-ebay-header">
          <h2>Bulk eBay Export</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {!processing ? (
          <>
            <div className="bulk-ebay-content">
              <div className="card-selection">
                <div className="selection-header">
                  <h3>
                    Select Cards ({selectedCards.size} of {cards.length})
                  </h3>
                  <div className="selection-actions">
                    <button onClick={selectAll} className="select-btn">
                      Select All
                    </button>
                    <button onClick={deselectAll} className="select-btn">
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="cards-list">
                  {cards.map((card) => (
                    <label key={card.id} className="card-item">
                      <input
                        type="checkbox"
                        checked={selectedCards.has(card.id)}
                        onChange={() => toggleCardSelection(card.id)}
                      />
                      <div className="card-info">
                        <div className="card-title">
                          {card.year} {card.brand} {card.player} #{card.cardNumber}
                        </div>
                        <div className="card-details">
                          {card.team} • {card.condition} • {formatCurrency(card.currentValue)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="export-options">
                <h3>Export Options</h3>

                <div className="option-group">
                  <label>Listing Format</label>
                  <select
                    value={options.listingFormat}
                    onChange={(e) => setOptions({ ...options, listingFormat: e.target.value as any })}
                  >
                    <option value="auction">Auction Only</option>
                    <option value="buyItNow">Buy It Now Only</option>
                    <option value="both">Auction with Buy It Now</option>
                  </select>
                </div>

                <div className="option-group">
                  <label>Duration</label>
                  <select
                    value={options.duration}
                    onChange={(e) => setOptions({ ...options, duration: parseInt(e.target.value) as any })}
                  >
                    <option value="3">3 Days</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                    <option value="10">10 Days</option>
                  </select>
                </div>

                <div className="option-group">
                  <label>Shipping Type</label>
                  <select
                    value={options.shippingType}
                    onChange={(e) => setOptions({ ...options, shippingType: e.target.value as any })}
                  >
                    <option value="standard">Standard</option>
                    <option value="expedited">Expedited</option>
                    <option value="express">Express</option>
                  </select>
                </div>

                <div className="checkbox-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={options.returnPolicy}
                      onChange={(e) => setOptions({ ...options, returnPolicy: e.target.checked })}
                    />
                    Accept Returns
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={options.includeGradingDetails}
                      onChange={(e) => setOptions({ ...options, includeGradingDetails: e.target.checked })}
                    />
                    Include Grading Details
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={options.includeMarketData}
                      onChange={(e) => setOptions({ ...options, includeMarketData: e.target.checked })}
                    />
                    Include Market Data
                  </label>
                </div>
              </div>
            </div>

            <div className="bulk-ebay-footer">
              <div className="export-summary">
                <span>{selectedCards.size} cards selected</span>
                <span>•</span>
                <span>CSV format for eBay File Exchange</span>
              </div>
              <button className="export-button" onClick={exportListings} disabled={selectedCards.size === 0}>
                Export to CSV
              </button>
            </div>
          </>
        ) : (
          <div className="processing-view">
            <h3>Generating eBay Listings...</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p>{Math.round(progress)}% Complete</p>
            {progress === 100 && <p className="success-message">✓ Export complete! Download starting...</p>}
          </div>
        )}
      </div>
    </div>
  );
};
