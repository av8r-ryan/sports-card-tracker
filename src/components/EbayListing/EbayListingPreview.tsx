import React, { useState } from 'react';
import { Card } from '../../types';
import { ebayListingService, EbayListingOptions, EbayListing } from '../../services/ebayListingService';
import './EbayListingPreview.css';

interface EbayListingPreviewProps {
  card: Card;
  onClose: () => void;
}

export const EbayListingPreview: React.FC<EbayListingPreviewProps> = ({ card, onClose }) => {
  const [options, setOptions] = useState<EbayListingOptions>({
    includeImages: true,
    listingFormat: 'both',
    duration: 7,
    shippingType: 'standard',
    returnPolicy: true,
    watermarkImages: false,
    includeGradingDetails: true,
    includeMarketData: true
  });

  const [listing, setListing] = useState<EbayListing | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'preview' | 'export'>('settings');
  const [exportFormat, setExportFormat] = useState<'html' | 'csv' | 'json'>('html');
  const [copied, setCopied] = useState(false);

  const generateListing = () => {
    const generatedListing = ebayListingService.generateListing(card, options);
    setListing(generatedListing);
    setActiveTab('preview');
  };

  const handleExport = () => {
    if (!listing) return;

    const exported = ebayListingService.exportListing(listing, exportFormat);
    
    if (exportFormat === 'html') {
      // Copy HTML to clipboard
      navigator.clipboard.writeText(exported).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Download file
      const blob = new Blob([exported], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${card.player.replace(/\s+/g, '_')}_ebay_listing.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="ebay-listing-modal">
      <div className="ebay-listing-container">
        <div className="ebay-listing-header">
          <h2>Generate eBay Listing</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="ebay-listing-tabs">
          <button 
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button 
            className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
            disabled={!listing}
          >
            Preview
          </button>
          <button 
            className={`tab ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
            disabled={!listing}
          >
            Export
          </button>
        </div>

        <div className="ebay-listing-content">
          {activeTab === 'settings' && (
            <div className="settings-panel">
              <h3>Listing Options</h3>
              
              <div className="option-group">
                <label>Listing Format</label>
                <select 
                  value={options.listingFormat} 
                  onChange={(e) => setOptions({...options, listingFormat: e.target.value as any})}
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
                  onChange={(e) => setOptions({...options, duration: parseInt(e.target.value) as any})}
                >
                  <option value="3">3 Days</option>
                  <option value="5">5 Days</option>
                  <option value="7">7 Days</option>
                  <option value="10">10 Days</option>
                  <option value="30">30 Days (Buy It Now)</option>
                </select>
              </div>

              <div className="option-group">
                <label>Shipping Type</label>
                <select 
                  value={options.shippingType} 
                  onChange={(e) => setOptions({...options, shippingType: e.target.value as any})}
                >
                  <option value="standard">Standard (First Class)</option>
                  <option value="expedited">Expedited (Priority)</option>
                  <option value="express">Express (Priority Express)</option>
                </select>
              </div>

              <div className="option-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={options.includeImages}
                    onChange={(e) => setOptions({...options, includeImages: e.target.checked})}
                  />
                  Include Images
                </label>
              </div>

              <div className="option-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={options.watermarkImages}
                    onChange={(e) => setOptions({...options, watermarkImages: e.target.checked})}
                    disabled={!options.includeImages}
                  />
                  Watermark Images
                </label>
              </div>

              <div className="option-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={options.returnPolicy}
                    onChange={(e) => setOptions({...options, returnPolicy: e.target.checked})}
                  />
                  Accept Returns (30 days)
                </label>
              </div>

              <div className="option-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={options.includeGradingDetails}
                    onChange={(e) => setOptions({...options, includeGradingDetails: e.target.checked})}
                    disabled={!card.gradingCompany}
                  />
                  Include Grading Details
                </label>
              </div>

              <div className="option-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={options.includeMarketData}
                    onChange={(e) => setOptions({...options, includeMarketData: e.target.checked})}
                  />
                  Include Market Data
                </label>
              </div>

              <button className="generate-button" onClick={generateListing}>
                Generate Listing
              </button>
            </div>
          )}

          {activeTab === 'preview' && listing && (
            <div className="preview-panel">
              <div className="listing-field">
                <label>Title (80 char max):</label>
                <div className="field-with-copy">
                  <input 
                    type="text" 
                    value={listing.title} 
                    readOnly 
                    className="listing-title"
                  />
                  <button 
                    className="copy-button" 
                    onClick={() => copyToClipboard(listing.title)}
                  >
                    Copy
                  </button>
                </div>
                <span className="char-count">{listing.title.length}/80 characters</span>
              </div>

              <div className="listing-field">
                <label>Category:</label>
                <div className="category-info">
                  {listing.category} (ID: {listing.categoryId})
                </div>
              </div>

              <div className="listing-field">
                <label>Condition:</label>
                <div className="condition-info">
                  {listing.condition} (ID: {listing.conditionId})
                </div>
              </div>

              <div className="listing-field">
                <label>Pricing:</label>
                <div className="pricing-info">
                  {listing.startingPrice && (
                    <div>Starting Price: ${listing.startingPrice.toFixed(2)}</div>
                  )}
                  {listing.buyItNowPrice && (
                    <div>Buy It Now: ${listing.buyItNowPrice.toFixed(2)}</div>
                  )}
                  <div>Shipping: ${listing.shippingCost.toFixed(2)}</div>
                </div>
              </div>

              <div className="listing-field">
                <label>Item Specifics:</label>
                <div className="item-specifics">
                  {Object.entries(listing.itemSpecifics).map(([key, value]) => (
                    <div key={key} className="specific-item">
                      <span className="specific-key">{key}:</span>
                      <span className="specific-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="listing-field">
                <label>Search Keywords:</label>
                <div className="keywords-list">
                  {listing.searchKeywords.join(', ')}
                </div>
              </div>

              <div className="listing-field">
                <label>Description Preview:</label>
                <div 
                  className="description-preview" 
                  dangerouslySetInnerHTML={{ __html: listing.description }}
                />
              </div>
            </div>
          )}

          {activeTab === 'export' && listing && (
            <div className="export-panel">
              <h3>Export Listing</h3>
              
              <div className="export-options">
                <label>
                  <input 
                    type="radio" 
                    value="html" 
                    checked={exportFormat === 'html'}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                  />
                  HTML (Copy to clipboard)
                </label>
                <label>
                  <input 
                    type="radio" 
                    value="csv" 
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                  />
                  CSV (Download file)
                </label>
                <label>
                  <input 
                    type="radio" 
                    value="json" 
                    checked={exportFormat === 'json'}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                  />
                  JSON (Download file)
                </label>
              </div>

              <button className="export-button" onClick={handleExport}>
                {exportFormat === 'html' ? 'Copy to Clipboard' : 'Download File'}
              </button>

              {copied && (
                <div className="success-message">
                  ✓ Copied to clipboard!
                </div>
              )}

              <div className="export-tips">
                <h4>Tips for eBay:</h4>
                <ul>
                  <li>Use the HTML format to paste directly into eBay's description editor</li>
                  <li>CSV format is useful for bulk uploads using eBay's File Exchange</li>
                  <li>Always review the listing before publishing on eBay</li>
                  <li>Consider eBay's final value fees when setting prices</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};