import React, { useState } from 'react';

import { ReportingService } from '../../services/reportingService';
import { ReportFilter, ReportTemplate } from '../../types/reports';
import { exportAdvancedReportToPDF } from '../../utils/advancedPdfExport';

interface Props {
  reportingService: ReportingService;
  activeReport: ReportTemplate;
  filters?: ReportFilter;
}

const ReportExport: React.FC<Props> = ({ reportingService, activeReport, filters }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'pdf':
          await exportAdvancedReportToPDF(reportingService, activeReport, filters);
          break;
        case 'excel':
          exportToExcel();
          break;
        case 'csv':
          exportToCSV();
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const exportToExcel = () => {
    // TODO: Implement Excel export with multiple sheets
    const data = generateExportData();
    const csvContent = convertToCSV(data);
    downloadFile(csvContent, `${activeReport}-report.csv`, 'text/csv');
  };

  const exportToCSV = () => {
    const data = generateExportData();
    const csvContent = convertToCSV(data);
    downloadFile(csvContent, `${activeReport}-report.csv`, 'text/csv');
  };

  const generateExportData = () => {
    const cards = reportingService.filterCards(filters);
    return cards.map((card) => ({
      Player: card.player,
      Team: card.team,
      Year: card.year,
      Brand: card.brand,
      Category: card.category,
      CardNumber: card.cardNumber,
      Condition: card.condition,
      PurchasePrice: card.purchasePrice,
      CurrentValue: card.currentValue,
      ProfitLoss: (card.currentValue || 0) - (card.purchasePrice || 0),
      ROI:
        card.purchasePrice && card.purchasePrice > 0
          ? (((card.currentValue || 0) - card.purchasePrice) / card.purchasePrice) * 100
          : 0,
      PurchaseDate: card.purchaseDate,
      Notes: card.notes,
    }));
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
          })
          .join(',')
      ),
    ];

    return csvRows.join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="report-export">
      <button className="export-btn" onClick={() => setShowExportMenu(!showExportMenu)} disabled={isExporting}>
        {isExporting ? <span>📤 Exporting...</span> : <span>📤 Export</span>}
      </button>

      {showExportMenu && (
        <div className="export-dropdown">
          <button onClick={() => handleExport('pdf')} className="export-option">
            📄 Export as PDF
          </button>
          <button onClick={() => handleExport('csv')} className="export-option">
            📊 Export as CSV
          </button>
          <button onClick={() => handleExport('excel')} className="export-option">
            📋 Export as Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportExport;
