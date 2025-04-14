import React, { useState } from 'react';
import './SortingConfiguration.css';

function SortingConfiguration({ fields, lineItemFields, sortConfig, updateSortConfig }) {
  const [showConfig, setShowConfig] = useState(false);
  
  // Function to add a new sort field
  const addSortField = () => {
    if (lineItemFields.length === 0) return;
    
    // Default to the first line item field if available
    const defaultField = lineItemFields[0];
    
    updateSortConfig([
      ...sortConfig,
      { fieldId: defaultField.id, direction: 'ASC' }
    ]);
  };
  
  // Function to remove a sort field
  const removeSortField = (index) => {
    const newConfig = [...sortConfig];
    newConfig.splice(index, 1);
    updateSortConfig(newConfig);
  };
  
  // Function to update a sort field
  const updateSortField = (index, fieldId, direction) => {
    const newConfig = [...sortConfig];
    newConfig[index] = { fieldId, direction };
    updateSortConfig(newConfig);
  };
  
  // Only show sort configuration for line item fields
  const availableFields = lineItemFields;
  
  return (
    <div className="sorting-configuration">
      <div className="sorting-header" onClick={() => setShowConfig(!showConfig)}>
        <h3>Sorting Configuration {showConfig ? '▼' : '▶'}</h3>
        <div className="sorting-actions">
          <button 
            type="button" 
            className="add-sort-button"
            onClick={(e) => {
              e.stopPropagation();
              addSortField();
            }}
            disabled={availableFields.length === 0}
          >
            + Add Sort Field
          </button>
        </div>
      </div>
      
      {showConfig && sortConfig.length > 0 && (
        <div className="sort-fields">
          {sortConfig.map((config, index) => {
            const field = fields.find(f => f.id === config.fieldId);
            return (
              <div key={index} className="sort-field-item">
                <select 
                  value={config.fieldId}
                  onChange={(e) => updateSortField(index, e.target.value, config.direction)}
                >
                  {availableFields.map(field => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
                <select 
                  value={config.direction}
                  onChange={(e) => updateSortField(index, config.fieldId, e.target.value)}
                >
                  <option value="ASC">Ascending</option>
                  <option value="DESC">Descending</option>
                </select>
                <button 
                  className="remove-sort-btn"
                  onClick={() => removeSortField(index)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {showConfig && sortConfig.length === 0 && (
        <div className="empty-sort-config">
          No sort fields configured. Click "Add Sort Field" to add sorting.
        </div>
      )}
    </div>
  );
}

export default SortingConfiguration;