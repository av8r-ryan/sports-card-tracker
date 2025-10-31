import React, { useState } from 'react';

import { useCards } from '../../context/SupabaseCardContext';
import { addSampleDataToCollection } from '../../utils/sampleData';
import './DevTools.css';

const DevTools: React.FC = () => {
  const { addCard, clearAllCards } = useCards();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) return null;

  const handleAddSampleData = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const count = await addSampleDataToCollection(addCard);
      setMessage(`Successfully added ${count} sample cards!`);
    } catch (error) {
      setMessage('Error adding sample data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all cards? This cannot be undone.')) {
      setIsLoading(true);
      try {
        await clearAllCards();
        setMessage('All cards cleared');
      } catch (error) {
        setMessage('Error clearing cards');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`dev-tools ${isMinimized ? 'minimized' : ''}`}>
      <div className="dev-tools-header" onClick={() => setIsMinimized(!isMinimized)}>
        <h3>
          <span className="toggle-icon">{isMinimized ? '▶' : '▼'}</span>
          🛠️ Development Tools
        </h3>
        <span className="dev-badge">DEV MODE</span>
      </div>

      {!isMinimized && (
        <div className="dev-tools-content">
          <p className="dev-description">
            Use these tools to quickly populate your collection with sample data for testing.
          </p>

          <div className="dev-actions">
            <button onClick={handleAddSampleData} disabled={isLoading} className="dev-btn primary">
              {isLoading ? 'Adding...' : '➕ Add Sample Cards (10)'}
            </button>

            <button onClick={handleClearData} className="dev-btn danger">
              🗑️ Clear All Cards
            </button>
          </div>

          {message && <div className={`dev-message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}

          <div className="dev-info">
            <h4>Sample Data Includes:</h4>
            <ul>
              <li>Mike Trout 2011 RC (PSA 9) - $3,500</li>
              <li>Luka Dončić 2018 Prizm Silver (PSA 10) - $1,500</li>
              <li>Patrick Mahomes 2017 Prizm (BGS 9.5) - SOLD</li>
              <li>Charizard Base Set (PSA 8) - $4,200</li>
              <li>Plus 6 more premium cards...</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevTools;
