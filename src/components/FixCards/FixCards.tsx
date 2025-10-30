import React, { useState } from 'react';

import { collectionsDatabase } from '../../db/collectionsDatabase';
import { db } from '../../db/simpleDatabase';

const FixCards: React.FC = () => {
  const [status, setStatus] = useState('');
  const [isFixing, setIsFixing] = useState(false);

  const fixAllCards = async () => {
    setIsFixing(true);
    setStatus('Starting fix...');

    try {
      // Get the default collection
      const defaultCollection = await collectionsDatabase.getDefaultCollection();
      if (!defaultCollection) {
        setStatus('Error: No default collection found');
        return;
      }

      setStatus(`Found default collection: ${defaultCollection.name}`);

      // Force reload all cards
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : null;
      if (!userId) {
        setStatus('Error: No user logged in');
        return;
      }

      // Get all cards directly from database
      const allCards = await db.cards.where('userId').equals(userId).toArray();

      setStatus(`Found ${allCards.length} cards in database`);

      // Fix cards without collectionId
      let fixedCount = 0;
      for (const card of allCards) {
        if (!card.collectionId) {
          await db.cards.update(card.id, { collectionId: defaultCollection.id });
          fixedCount++;
        }
      }

      setStatus(`Fixed ${fixedCount} cards. Reloading...`);

      // Force reload the page to refresh all data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setStatus(`Error: ${error}`);
      console.error('Fix cards error:', error);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'white',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        maxWidth: '300px',
      }}
    >
      <h4 style={{ margin: '0 0 10px 0' }}>Fix Cards Tool</h4>
      <p style={{ fontSize: '12px', margin: '0 0 10px 0' }}>
        This will assign all cards without a collection to your default collection.
      </p>
      <button
        onClick={fixAllCards}
        disabled={isFixing}
        style={{
          padding: '8px 16px',
          background: isFixing ? '#ccc' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isFixing ? 'not-allowed' : 'pointer',
          width: '100%',
        }}
      >
        {isFixing ? 'Fixing...' : 'Fix All Cards'}
      </button>
      {status && (
        <p
          style={{
            fontSize: '12px',
            marginTop: '10px',
            padding: '8px',
            background: '#f5f5f5',
            borderRadius: '4px',
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
};

export default FixCards;
