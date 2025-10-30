import React, { useEffect, useState } from 'react';

import { useCards } from '../../context/DexieCardContext';
import { cardDatabase } from '../../db/simpleDatabase';
import './CardDebug.css';

const CardDebug: React.FC = () => {
  const { state } = useCards();
  const [dbCards, setDbCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDbCards = async () => {
      try {
        const cards = await cardDatabase.getAllCards();
        setDbCards(cards);
      } catch (error) {
        console.error('Error loading cards from DB:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDbCards();
  }, []);

  if (loading) {
    return <div className="card-debug">Loading debug info...</div>;
  }

  return (
    <div className="card-debug">
      <h3>Card Debug Information</h3>

      <div className="debug-section">
        <h4>Context State</h4>
        <p>Cards in context: {state.cards.length}</p>
        <p>Loading: {state.loading ? 'Yes' : 'No'}</p>
        <p>Error: {state.error || 'None'}</p>
      </div>

      <div className="debug-section">
        <h4>Database Cards</h4>
        <p>Cards in database: {dbCards.length}</p>
      </div>

      <div className="debug-section">
        <h4>Collection IDs in Context</h4>
        <div className="collection-list">
          {state.cards.slice(0, 5).map((card, index) => (
            <div key={index} className="card-info">
              <span>Card {index + 1}:</span>
              <span>ID: {card.id}</span>
              <span>Collection: {card.collectionId || 'NONE'}</span>
              <span>Player: {card.player}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="debug-section">
        <h4>Collection IDs in Database</h4>
        <div className="collection-list">
          {dbCards.slice(0, 5).map((card, index) => (
            <div key={index} className="card-info">
              <span>Card {index + 1}:</span>
              <span>ID: {card.id}</span>
              <span>Collection: {card.collectionId || 'NONE'}</span>
              <span>Player: {card.player}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="debug-section">
        <h4>Current User</h4>
        <p>User: {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : 'Not logged in'}</p>
        <p>User ID: {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : 'N/A'}</p>
      </div>
    </div>
  );
};

export default CardDebug;
