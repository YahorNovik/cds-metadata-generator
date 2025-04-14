import React, { useState } from 'react';

function DropZoneItem({ field, uiLabel, isSelected, onClick, onRemove, updateFieldLabel }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

  // Initialize editText when entering edit mode
  const handleDoubleClick = () => {
    setEditText(uiLabel || field.name);
    setEditing(true);
  };

  // Simple handler with minimal logic
  const handleBlur = () => {
    if (editText.trim() !== '') {
      updateFieldLabel(field.id, editText);
    }
    setEditing(false);
  };

  return (
    <div 
      className={`dropped-field ${isSelected ? 'selected-field' : ''}`}
      onClick={() => onClick(field)}
      onDoubleClick={handleDoubleClick}
    >
      {editing ? (
        <input 
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <span>{uiLabel || field.name}</span>
      )}
      <button
        className="remove-btn"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(field.id);
        }}
      >
        ×
      </button>
    </div>
  );
}

export default DropZoneItem;