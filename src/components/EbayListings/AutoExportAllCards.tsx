import React, { useEffect, useState } from 'react';
import { Card } from '../../types';
import { generateEbayFileExchange } from '../../utils/ebayExport';
import './AutoExportAllCards.css';

interface Props {
  cards: Card[];
  autoStart?: boolean;
  onComplete?: (result: ExportResult) => void;
}

interface ExportResult {
  success: boolean;
  totalCards: number;
  totalValue: number;
  filename: string;
  errors?: string[];
}

const AutoExportAllCards: React.FC<Props> = ({ cards, autoStart = true, onComplete }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<ExportResult | null>(null);

  useEffect(() => {
    if (autoStart && cards.length > 0) {
      startExport();
    }
  }, [autoStart, cards.length]);

  const startExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setStatus('Preparing export...');

    try {
      // Filter unsold cards
      const unsoldCards = cards.filter(card => !card.sellDate);
      setProgress(20);
      setStatus(`Found ${unsoldCards.length} unsold cards`);

      if (unsoldCards.length === 0) {
        throw new Error('No unsold cards to export');
      }

      // Simulate processing time for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(40);
      setStatus('Generating eBay listings...');

      // Generate the export
      const exportOptions = {
        priceMultiplier: 0.9,
        shippingCost: 4.99,
        duration: '7',
        location: 'United States',
        paypalEmail: 'seller@example.com',
        dispatchTime: 1
      };

      const fileContent = generateEbayFileExchange(unsoldCards, exportOptions);
      setProgress(60);
      setStatus('Creating export file...');

      await new Promise(resolve => setTimeout(resolve, 300));

      // Create and download file
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `ebay-all-cards-${timestamp}.csv`;
      
      const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      setProgress(80);
      setStatus('Downloading file...');
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(100);
      setStatus('Export complete!');

      // Calculate summary
      const totalValue = unsoldCards.reduce((sum, card) => sum + (card.currentValue * 0.9), 0);

      const exportResult: ExportResult = {
        success: true,
        totalCards: unsoldCards.length,
        totalValue,
        filename
      };

      setResult(exportResult);
      
      if (onComplete) {
        onComplete(exportResult);
      }

      // Auto-hide after success
      setTimeout(() => {
        setIsExporting(false);
      }, 3000);

    } catch (error) {
      console.error('Export error:', error);
      setStatus('Export failed!');
      setProgress(0);
      
      const exportResult: ExportResult = {
        success: false,
        totalCards: 0,
        totalValue: 0,
        filename: '',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      
      setResult(exportResult);
      
      if (onComplete) {
        onComplete(exportResult);
      }
    }
  };

  if (!isExporting && !result) {
    return (
      <div className="auto-export-container">
        <button 
          className="auto-export-button"
          onClick={startExport}
        >
          🚀 Export All Unsold Cards Now
        </button>
      </div>
    );
  }

  if (!isExporting && result) {
    return (
      <div className="auto-export-result">
        {result.success ? (
          <>
            <h3>✅ Export Successful!</h3>
            <p>{result.totalCards} cards exported</p>
            <p>Total value: ${result.totalValue.toFixed(2)}</p>
            <p>File: {result.filename}</p>
          </>
        ) : (
          <>
            <h3>❌ Export Failed</h3>
            <p>{result.errors?.join(', ')}</p>
          </>
        )}
        <button onClick={() => {
          setResult(null);
          startExport();
        }}>
          Export Again
        </button>
      </div>
    );
  }

  return (
    <div className="auto-export-progress">
      <div className="export-header">
        <h3>Exporting All Unsold Cards to eBay</h3>
        <p>{status}</p>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-text">
        {progress}% Complete
      </div>
    </div>
  );
};

export default AutoExportAllCards;