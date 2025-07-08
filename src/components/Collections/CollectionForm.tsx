import React, { useState } from 'react';
import { Collection } from '../../types/collection';
import './CollectionForm.css';

interface CollectionFormProps {
  collection?: Collection;
  onSubmit: (data: Omit<Collection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#4F46E5', // Indigo
  '#DC2626', // Red
  '#059669', // Green
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#DB2777', // Pink
  '#EA580C', // Orange
  '#0891B2', // Cyan
  '#84CC16', // Lime
  '#6366F1', // Violet
];

const PRESET_ICONS = [
  '📦', '🏆', '⭐', '💎', '🔥', '⚡', '🎯', '🏅', '🎨', '🎪',
  '🌟', '💰', '👑', '🏒', '🎮', '🎸', '🏀', '⚾', '🏈', '⚽'
];

const CollectionForm: React.FC<CollectionFormProps> = ({ collection, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: collection?.name || '',
    description: collection?.description || '',
    color: collection?.color || PRESET_COLORS[0],
    icon: collection?.icon || PRESET_ICONS[0],
    visibility: collection?.visibility || 'private' as 'private' | 'public' | 'shared',
    tags: collection?.tags?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Collection name is required');
      return;
    }

    const submitData: any = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      icon: formData.icon,
      visibility: formData.visibility,
      tags: formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    };

    // Only include isDefault when editing an existing collection
    if (collection && collection.isDefault !== undefined) {
      submitData.isDefault = collection.isDefault;
    }

    onSubmit(submitData);
  };

  return (
    <div className="collection-form-overlay">
      <div className="collection-form">
        <h2>{collection ? 'Edit Collection' : 'Create New Collection'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Collection Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Rookie Cards, Vintage Collection"
              maxLength={50}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this collection..."
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Icon</label>
              <div className="icon-picker">
                {PRESET_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
            >
              <option value="private">Private - Only you can see</option>
              <option value="public">Public - Anyone can view</option>
              <option value="shared">Shared - Specific users can view</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., baseball, vintage, investment"
            />
          </div>

          <div className="form-preview">
            <h4>Preview:</h4>
            <div 
              className="collection-preview"
              style={{ backgroundColor: formData.color + '20', borderColor: formData.color }}
            >
              <span className="preview-icon">{formData.icon}</span>
              <span className="preview-name">{formData.name || 'Collection Name'}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {collection ? 'Update Collection' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionForm;