import React, { useState, useEffect } from 'react';
import { collectionsDatabase } from '../../db/collectionsDatabase';
import { cardDatabase } from '../../db/simpleDatabase';
import './CollectionDiagnostic.css';

const CollectionDiagnostic: React.FC = React.memo(() => {
  const [collections, setCollections] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [orphanedCards, setOrphanedCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiagnosticData();
  }, []);

  const loadDiagnosticData = async () => {
    try {
      setLoading(true);
      
      // Get all collections
      const allCollections = await collectionsDatabase.getUserCollections();
      setCollections(allCollections);
      
      // Get all cards
      const allCards = await cardDatabase.getAllCards();
      setCards(allCards);
      
      // Find orphaned cards (cards with collectionId that doesn't exist)
      const collectionIds = new Set(allCollections.map(c => c.id));
      const orphaned = allCards.filter(card => 
        card.collectionId && !collectionIds.has(card.collectionId)
      );
      setOrphanedCards(orphaned);
      
      console.log('Diagnostic Data:', {
        collections: allCollections,
        totalCards: allCards.length,
        orphanedCards: orphaned,
        cardsByCollection: allCards.reduce((acc, card) => {
          const key = card.collectionId || 'no-collection';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
    } catch (error) {
      console.error('Error loading diagnostic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fixOrphanedCards = async () => {
    if (orphanedCards.length === 0) return;
    
    if (!window.confirm(`Found ${orphanedCards.length} orphaned cards. Move them to your default collection?`)) {
      return;
    }
    
    try {
      const defaultCollection = await collectionsDatabase.getDefaultCollection();
      if (!defaultCollection) {
        alert('No default collection found!');
        return;
      }
      
      for (const card of orphanedCards) {
        await cardDatabase.updateCard({
          ...card,
          collectionId: defaultCollection.id
        });
      }
      
      alert(`Successfully moved ${orphanedCards.length} cards to your default collection.`);
      loadDiagnosticData();
    } catch (error) {
      console.error('Error fixing orphaned cards:', error);
      alert('Error fixing orphaned cards. Check console for details.');
    }
  };

  const moveAllCardsToDefault = async (fromCollectionId: string) => {
    const collection = collections.find(c => c.id === fromCollectionId);
    const collectionCards = cards.filter(c => c.collectionId === fromCollectionId);
    
    if (!window.confirm(`Move all ${collectionCards.length} cards from "${collection?.name}" to your default collection?`)) {
      return;
    }
    
    try {
      const defaultCollection = await collectionsDatabase.getDefaultCollection();
      if (!defaultCollection) {
        alert('No default collection found!');
        return;
      }
      
      for (const card of collectionCards) {
        await cardDatabase.updateCard({
          ...card,
          collectionId: defaultCollection.id
        });
      }
      
      alert(`Successfully moved ${collectionCards.length} cards to your default collection.`);
      loadDiagnosticData();
    } catch (error) {
      console.error('Error moving cards:', error);
      alert('Error moving cards. Check console for details.');
    }
  };

  if (loading) {
    return <div className="diagnostic-container">Loading diagnostic data...</div>;
  }

  return (
    <div className="diagnostic-container">
      <h2>Collection Diagnostic Tool</h2>
      
      <div className="diagnostic-section">
        <h3>Summary</h3>
        <p>Total Collections: {collections.length}</p>
        <p>Total Cards: {cards.length}</p>
        <p>Orphaned Cards: {orphanedCards.length}</p>
        {orphanedCards.length > 0 && (
          <button onClick={fixOrphanedCards} className="fix-btn">
            Fix Orphaned Cards
          </button>
        )}
      </div>

      <div className="diagnostic-section">
        <h3>Collections Breakdown</h3>
        <table className="diagnostic-table">
          <thead>
            <tr>
              <th>Collection Name</th>
              <th>Collection ID</th>
              <th>Card Count</th>
              <th>Is Default</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map(collection => {
              const cardCount = cards.filter(c => c.collectionId === collection.id).length;
              return (
                <tr key={collection.id}>
                  <td>{collection.name}</td>
                  <td className="mono">{collection.id}</td>
                  <td>{cardCount}</td>
                  <td>{collection.isDefault ? 'Yes' : 'No'}</td>
                  <td>
                    {cardCount > 0 && !collection.isDefault && (
                      <button 
                        onClick={() => moveAllCardsToDefault(collection.id)}
                        className="action-btn"
                      >
                        Move Cards to Default
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {orphanedCards.length > 0 && (
        <div className="diagnostic-section">
          <h3>Orphaned Cards Details</h3>
          <table className="diagnostic-table">
            <thead>
              <tr>
                <th>Card ID</th>
                <th>Player</th>
                <th>Year</th>
                <th>Invalid Collection ID</th>
              </tr>
            </thead>
            <tbody>
              {orphanedCards.slice(0, 10).map(card => (
                <tr key={card.id}>
                  <td className="mono">{card.id}</td>
                  <td>{card.player}</td>
                  <td>{card.year}</td>
                  <td className="mono error">{card.collectionId}</td>
                </tr>
              ))}
              {orphanedCards.length > 10 && (
                <tr>
                  <td colSpan={4}>...and {orphanedCards.length - 10} more</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

CollectionDiagnostic.displayName = 'CollectionDiagnostic';

export default CollectionDiagnostic;