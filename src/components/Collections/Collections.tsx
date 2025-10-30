import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collection, CollectionStats } from '../../types/collection';
import { collectionsDatabase } from '../../db/collectionsDatabase';
import CollectionForm from './CollectionForm';
import CollectionCard from './CollectionCard';
import CollectionDiagnostic from '../CollectionDiagnostic/CollectionDiagnostic';
import AnimatedWrapper from '../Animation/AnimatedWrapper';
import CollapsibleMenu from '../UI/CollapsibleMenu';
import './Collections.css';

interface DragItem {
  id: string;
  type: 'collection';
  collection: Collection;
}

interface DropZone {
  id: string;
  type: 'group' | 'collection';
  position: 'before' | 'after' | 'inside';
}

interface SmartGroup {
  id: string;
  name: string;
  type: 'category' | 'value' | 'date' | 'custom';
  criteria: any;
  collections: string[];
  color: string;
  icon: string;
}

const Collections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionStats, setCollectionStats] = useState<{ [id: string]: CollectionStats }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  
  // Visual builder states
  const [viewMode, setViewMode] = useState<'grid' | 'builder' | 'groups'>('grid');
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropZone, setDropZone] = useState<DropZone | null>(null);
  const [smartGroups, setSmartGroups] = useState<SmartGroup[]>([]);
  const [showGroupBuilder, setShowGroupBuilder] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const userCollections = await collectionsDatabase.getUserCollections();
      setCollections(userCollections);
      
      // Load stats for each collection
      const stats: { [id: string]: CollectionStats } = {};
      for (const collection of userCollections) {
        const collectionStats = await collectionsDatabase.getCollectionStats(collection.id);
        stats[collection.id] = {
          cardCount: collectionStats.cardCount,
          totalValue: collectionStats.totalValue,
          totalCost: collectionStats.totalCost,
          categoryBreakdown: collectionStats.categoryBreakdown
        };
      }
      setCollectionStats(stats);
    } catch (err) {
      setError('Failed to load collections');
      console.error('Error loading collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (data: Omit<Collection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Ensure isDefault is not included in new collections
      const dataWithoutDefault = { ...data };
      if ('isDefault' in dataWithoutDefault) {
        delete (dataWithoutDefault as any).isDefault;
      }
      await collectionsDatabase.createCollection(dataWithoutDefault);
      setShowForm(false);
      loadCollections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection');
    }
  };

  const handleUpdateCollection = async (id: string, data: Partial<Collection>) => {
    try {
      // Remove isDefault from updates to prevent accidental changes
      const { isDefault, ...updateData } = data;
      await collectionsDatabase.updateCollection(id, updateData);
      setEditingCollection(null);
      loadCollections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update collection');
    }
  };

  const handleDeleteCollection = async (id: string) => {
    const collection = collections.find(c => c.id === id);
    const stats = collectionStats[id];
    
    if (stats && stats.cardCount > 0) {
      setError(`Cannot delete "${collection?.name || 'collection'}" because it contains ${stats.cardCount} card${stats.cardCount > 1 ? 's' : ''}. Move or delete the cards first.`);
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete the collection "${collection?.name || 'this collection'}"?`)) {
      return;
    }

    try {
      await collectionsDatabase.deleteCollection(id);
      loadCollections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete collection');
    }
  };

  const handleSetAsDefault = async (id: string) => {
    try {
      await collectionsDatabase.setCollectionAsDefault(id);
      loadCollections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set collection as default');
    }
  };

  const handleSelectCollection = (collectionId: string) => {
    if (bulkDeleteMode) {
      toggleDeleteSelection(collectionId);
    } else {
      setSelectedCollection(collectionId);
      // Navigate to inventory with collection filter
      window.location.hash = `#inventory?collection=${collectionId}`;
    }
  };

  const toggleDeleteSelection = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    const stats = collectionStats[collectionId];
    
    // Don't allow selecting default collection or collections with cards
    if (collection?.isDefault || (stats && stats.cardCount > 0)) {
      return;
    }
    
    setSelectedForDelete(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    const selectedCount = selectedForDelete.size;
    if (selectedCount === 0) {
      setError('No collections selected for deletion');
      return;
    }
    
    const selectedNames = Array.from(selectedForDelete)
      .map(id => collections.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');
    
    if (!window.confirm(`Are you sure you want to delete ${selectedCount} collection${selectedCount > 1 ? 's' : ''}?\n\n${selectedNames}`)) {
      return;
    }
    
    let successCount = 0;
    const errors: string[] = [];
    
    for (const collectionId of selectedForDelete) {
      try {
        await collectionsDatabase.deleteCollection(collectionId);
        successCount++;
      } catch (err) {
        const collection = collections.find(c => c.id === collectionId);
        errors.push(`${collection?.name || 'Unknown'}: ${err instanceof Error ? err.message : 'Failed'}`);
      }
    }
    
    if (successCount > 0) {
      await loadCollections();
      setSelectedForDelete(new Set());
    }
    
    if (errors.length > 0) {
      setError(`Failed to delete some collections:\n${errors.join('\n')}`);
    } else {
      setBulkDeleteMode(false);
    }
  };

  const toggleBulkDeleteMode = () => {
    setBulkDeleteMode(!bulkDeleteMode);
    setSelectedForDelete(new Set());
  };

  const selectAllEmpty = () => {
    const emptyCollections = collections.filter(c => 
      !c.isDefault && collectionStats[c.id]?.cardCount === 0
    );
    setSelectedForDelete(new Set(emptyCollections.map(c => c.id)));
  };

  // Smart grouping functions
  const generateSmartGroups = useCallback(() => {
    const groups: SmartGroup[] = [];
    
    // Group by category
    const categoryGroups = collections.reduce((acc, collection) => {
      const stats = collectionStats[collection.id];
      if (stats?.categoryBreakdown) {
        const topCategory = Object.entries(stats.categoryBreakdown)
          .sort(([,a], [,b]) => b - a)[0];
        if (topCategory) {
          const category = topCategory[0];
          if (!acc[category]) {
            acc[category] = {
              id: `category_${category}`,
              name: `${category} Collections`,
              type: 'category' as const,
              criteria: { category },
              collections: [],
              color: getCategoryColor(category),
              icon: getCategoryIcon(category)
            };
          }
          acc[category].collections.push(collection.id);
        }
      }
      return acc;
    }, {} as Record<string, SmartGroup>);
    
    groups.push(...Object.values(categoryGroups));
    
    // Group by value ranges
    const valueGroups = collections.reduce((acc, collection) => {
      const stats = collectionStats[collection.id];
      const value = stats?.totalValue || 0;
      let range = 'Low Value';
      if (value > 10000) range = 'High Value';
      else if (value > 1000) range = 'Medium Value';
      
      if (!acc[range]) {
        acc[range] = {
          id: `value_${range.toLowerCase().replace(' ', '_')}`,
          name: `${range} Collections`,
          type: 'value' as const,
          criteria: { range },
          collections: [],
          color: getValueColor(range),
          icon: getValueIcon(range)
        };
      }
      acc[range].collections.push(collection.id);
      return acc;
    }, {} as Record<string, SmartGroup>);
    
    groups.push(...Object.values(valueGroups));
    
    setSmartGroups(groups);
  }, [collections, collectionStats]);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Baseball': '#ff6b6b',
      'Basketball': '#4ecdc4',
      'Football': '#45b7d1',
      'Hockey': '#96ceb4',
      'Soccer': '#feca57',
      'Pokemon': '#ff9ff3',
      'Other': '#a55eea'
    };
    return colors[category] || '#6c757d';
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'Baseball': '⚾',
      'Basketball': '🏀',
      'Football': '🏈',
      'Hockey': '🏒',
      'Soccer': '⚽',
      'Pokemon': '⚡',
      'Other': '📦'
    };
    return icons[category] || '📦';
  };

  const getValueColor = (range: string): string => {
    const colors: Record<string, string> = {
      'High Value': '#e74c3c',
      'Medium Value': '#f39c12',
      'Low Value': '#27ae60'
    };
    return colors[range] || '#6c757d';
  };

  const getValueIcon = (range: string): string => {
    const icons: Record<string, string> = {
      'High Value': '💎',
      'Medium Value': '💰',
      'Low Value': '💵'
    };
    return icons[range] || '💰';
  };

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, collection: Collection) => {
    setDraggedItem({
      id: collection.id,
      type: 'collection',
      collection
    });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string, position: 'before' | 'after' | 'inside') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropZone({
      id: targetId,
      type: 'collection',
      position
    });
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropZone(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetId) {
      setDraggedItem(null);
      setDropZone(null);
      return;
    }

    try {
      // Reorder collections
      const newCollections = [...collections];
      const draggedIndex = newCollections.findIndex(c => c.id === draggedItem.id);
      const targetIndex = newCollections.findIndex(c => c.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedCollection] = newCollections.splice(draggedIndex, 1);
        newCollections.splice(targetIndex, 0, draggedCollection);
        setCollections(newCollections);
        
        // In a real app, you'd save the new order to the database
        console.log('Collection reordered:', newCollections.map(c => c.name));
      }
    } catch (err) {
      setError('Failed to reorder collections');
    } finally {
      setDraggedItem(null);
      setDropZone(null);
    }
  }, [draggedItem, collections]);

  // Group management
  const createSmartGroup = useCallback((group: Omit<SmartGroup, 'id'>) => {
    const newGroup: SmartGroup = {
      ...group,
      id: `group_${Date.now()}`
    };
    setSmartGroups(prev => [...prev, newGroup]);
  }, []);

  const updateSmartGroup = useCallback((id: string, updates: Partial<SmartGroup>) => {
    setSmartGroups(prev => 
      prev.map(group => 
        group.id === id ? { ...group, ...updates } : group
      )
    );
  }, []);

  const deleteSmartGroup = useCallback((id: string) => {
    setSmartGroups(prev => prev.filter(group => group.id !== id));
  }, []);

  const toggleGroupSelection = useCallback((groupId: string) => {
    setSelectedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Generate smart groups when collections or stats change
  useEffect(() => {
    if (collections.length > 0 && Object.keys(collectionStats).length > 0) {
      generateSmartGroups();
    }
  }, [collections, collectionStats, generateSmartGroups]);

  if (loading) {
    return (
      <div className="collections-container">
        <AnimatedWrapper animation="fadeInUp" duration={0.6}>
          <div className="loading card-glass">
            <motion.div
              className="loading-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <h2>Loading collections...</h2>
          </div>
        </AnimatedWrapper>
      </div>
    );
  }

  return (
    <div className="collections-container">
      <AnimatedWrapper animation="fadeInDown" duration={0.6}>
        <div className="collections-header card-glass">
          <div className="header-content">
            <h1 className="text-gradient">📚 Collection Hub</h1>
            <p>Organize and manage your sports card collections</p>
          </div>
          
          <div className="view-mode-toggle">
            <motion.button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📋 Grid
            </motion.button>
            <motion.button
              className={`view-mode-btn ${viewMode === 'builder' ? 'active' : ''}`}
              onClick={() => setViewMode('builder')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎨 Builder
            </motion.button>
            <motion.button
              className={`view-mode-btn ${viewMode === 'groups' ? 'active' : ''}`}
              onClick={() => setViewMode('groups')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🗂️ Groups
            </motion.button>
          </div>
        </div>
      </AnimatedWrapper>

      <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.2}>
        <div className="collections-controls card-glass">
          <CollapsibleMenu title="Collection Actions" icon="⚡" defaultOpen={true}>
            <div className="action-buttons">
              {!bulkDeleteMode ? (
                <>
                  <motion.button 
                    className="add-collection-btn"
                    onClick={() => setShowForm(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ➕ New Collection
                  </motion.button>
                  <motion.button 
                    className="group-builder-btn"
                    onClick={() => setShowGroupBuilder(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎯 Smart Groups
                  </motion.button>
                  {collections.some(c => !c.isDefault && collectionStats[c.id]?.cardCount === 0) && (
                    <motion.button 
                      className="bulk-delete-btn"
                      onClick={toggleBulkDeleteMode}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🗑️ Bulk Delete
                    </motion.button>
                  )}
                </>
              ) : (
                <div className="bulk-delete-controls">
                  <span className="selected-count">
                    {selectedForDelete.size} selected
                  </span>
                  <motion.button 
                    className="select-all-btn"
                    onClick={selectAllEmpty}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Select All Empty
                  </motion.button>
                  <motion.button 
                    className="delete-selected-btn"
                    onClick={handleBulkDelete}
                    disabled={selectedForDelete.size === 0}
                    whileHover={{ scale: selectedForDelete.size > 0 ? 1.05 : 1 }}
                    whileTap={{ scale: selectedForDelete.size > 0 ? 0.95 : 1 }}
                  >
                    Delete Selected
                  </motion.button>
                  <motion.button 
                    className="cancel-btn"
                    onClick={toggleBulkDeleteMode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>
          </CollapsibleMenu>

          <CollapsibleMenu title="View Options" icon="👁️">
            <div className="view-options">
              <div className="option-group">
                <label>Sort by:</label>
                <select>
                  <option value="name">Name</option>
                  <option value="value">Value</option>
                  <option value="cards">Card Count</option>
                  <option value="date">Date Created</option>
                </select>
              </div>
              <div className="option-group">
                <label>Filter:</label>
                <select>
                  <option value="all">All Collections</option>
                  <option value="empty">Empty Collections</option>
                  <option value="valued">High Value</option>
                </select>
              </div>
            </div>
          </CollapsibleMenu>
        </div>
      </AnimatedWrapper>

      <AnimatePresence>
        {error && (
          <motion.div
            className="error-message card-glass"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="error-icon">⚠️</span>
            {error}
            <motion.button 
              onClick={() => setError(null)} 
              className="dismiss-btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diagnostic Button */}
      <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.4}>
        <div className="diagnostic-section">
          <motion.button 
            className="diagnostic-btn"
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showDiagnostic ? 'Hide' : 'Show'} Collection Diagnostic
          </motion.button>
        </div>
      </AnimatedWrapper>

      <AnimatePresence>
        {showDiagnostic && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CollectionDiagnostic />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <CollectionForm
              onSubmit={handleCreateCollection}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingCollection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <CollectionForm
              collection={editingCollection}
              onSubmit={(data) => handleUpdateCollection(editingCollection.id, data)}
              onCancel={() => setEditingCollection(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Mode Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.6}>
              <div className="collections-grid">
                <AnimatePresence>
                  {collections.map((collection, index) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      draggable={false}
                      onDragStart={(e: any) => handleDragStart(e as React.DragEvent, collection)}
                      onDragOver={(e: any) => handleDragOver(e as React.DragEvent, collection.id, 'after')}
                      onDragLeave={handleDragLeave}
                      onDrop={(e: any) => handleDrop(e as React.DragEvent, collection.id)}
                      className={`collection-wrapper ${draggedItem?.id === collection.id ? 'dragging' : ''} ${dropZone?.id === collection.id ? 'drop-target' : ''}`}
                    >
                      <CollectionCard
                        collection={collection}
                        stats={collectionStats[collection.id] || {
                          cardCount: 0,
                          totalValue: 0,
                          totalCost: 0,
                          categoryBreakdown: {}
                        }}
                        onSelect={() => handleSelectCollection(collection.id)}
                        onEdit={() => setEditingCollection(collection)}
                        onDelete={() => handleDeleteCollection(collection.id)}
                        onSetAsDefault={() => handleSetAsDefault(collection.id)}
                        isSelected={selectedForDelete.has(collection.id)}
                        isBulkDeleteMode={bulkDeleteMode}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </AnimatedWrapper>
          </motion.div>
        )}

        {viewMode === 'groups' && (
          <motion.div
            key="groups"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.6}>
              <div className="smart-groups">
                <div className="groups-header">
                  <h3>Smart Groups</h3>
                  <motion.button
                    className="create-group-btn"
                    onClick={() => setShowGroupBuilder(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ➕ Create Group
                  </motion.button>
                </div>
                
                <div className="groups-grid">
                  {smartGroups.map((group, index) => (
                    <motion.div
                      key={group.id}
                      className={`group-card ${selectedGroups.has(group.id) ? 'selected' : ''}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleGroupSelection(group.id)}
                    >
                      <div className="group-header" style={{ backgroundColor: group.color }}>
                        <span className="group-icon">{group.icon}</span>
                        <h4>{group.name}</h4>
                      </div>
                      <div className="group-content">
                        <p className="group-type">{group.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="group-count">{group.collections.length} collections</p>
                        <div className="group-collections">
                          {group.collections.slice(0, 3).map(collectionId => {
                            const collection = collections.find(c => c.id === collectionId);
                            return collection ? (
                              <span key={collectionId} className="collection-tag">
                                {collection.name}
                              </span>
                            ) : null;
                          })}
                          {group.collections.length > 3 && (
                            <span className="more-tag">+{group.collections.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedWrapper>
          </motion.div>
        )}

        {viewMode === 'builder' && (
          <motion.div
            key="builder"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.6}>
              <div className="visual-builder">
                <div className="builder-header">
                  <h3>Visual Collection Builder</h3>
                  <p>Drag and drop collections to reorganize them</p>
                </div>
                
                <div className="builder-canvas">
                  {collections.map((collection, index) => (
                    <motion.div
                      key={collection.id}
                      className="builder-collection"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e as React.DragEvent, collection)}
                      onDragOver={(e: any) => handleDragOver(e as React.DragEvent, collection.id, 'after')}
                      onDragLeave={handleDragLeave}
                      onDrop={(e: any) => handleDrop(e as React.DragEvent, collection.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="builder-collection-header">
                        <span className="collection-icon">{collection.icon || '📦'}</span>
                        <h4>{collection.name}</h4>
                      </div>
                      <div className="builder-collection-stats">
                        <span>{collectionStats[collection.id]?.cardCount || 0} cards</span>
                        <span>${collectionStats[collection.id]?.totalValue || 0}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedWrapper>
          </motion.div>
        )}
      </AnimatePresence>

      {collections.length === 0 && (
        <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.8}>
          <div className="empty-state card-glass">
            <motion.div
              className="empty-icon"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              📚
            </motion.div>
            <h3>No Collections Yet</h3>
            <p>Create your first collection to organize your cards!</p>
            <motion.button 
              className="create-first-btn"
              onClick={() => setShowForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Your First Collection
            </motion.button>
          </div>
        </AnimatedWrapper>
      )}
    </div>
  );
};

export default Collections;