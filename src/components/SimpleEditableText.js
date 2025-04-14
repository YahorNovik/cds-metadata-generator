import React, { useState, useEffect } from 'react';

// A very simplified EditableText component focused on stability
const SimpleEditableText = ({ 
  value,
  onSave,
  displayStyle = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value || '');

  // Update text when value prop changes and not in edit mode
  useEffect(() => {
    if (!isEditing) {
      setText(value || '');
    }
  }, [value, isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (text.trim() !== '') {
      onSave(text.trim());
    } else {
      setText(value || '');
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setText(value || '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        style={{
          fontSize: 'inherit',
          fontWeight: 'inherit',
          padding: '2px 4px',
          ...displayStyle
        }}
      />
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      style={{ 
        cursor: 'pointer',
        ...displayStyle
      }}
      title="Double-click to edit"
    >
      {value || ''}
    </span>
  );
};

export default SimpleEditableText;