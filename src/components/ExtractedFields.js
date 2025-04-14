import React from 'react';

function ExtractedFields({ 
  fields, 
  selectedField, 
  setSelectedField, 
  handleDragStart, 
  loading 
}) {
  const renderFields = () => {
    if (fields.length === 0) {
      return <div className="no-fields-message">No fields extracted yet</div>;
    }
    
    return (
      <div className="fields-container">
        {fields.map(field => (
          <div
            key={field.id}
            className={`field-block ${field.isKey ? 'key-field' : ''} ${field.id === selectedField?.id ? 'selected-field' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, field)}
            onClick={() => setSelectedField(field)}
          >
            {field.name}
            {field.isKey && <span className="key-indicator">🔑</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="section extracted-fields-section">
      <h2>Extracted Fields</h2>
      {loading ? (
        <div className="loading-indicator">Extracting fields...</div>
      ) : (
        renderFields()
      )}
    </div>
  );
}

export default ExtractedFields;