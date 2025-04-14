import React, { useState } from 'react';

function PropertiesPanel({ 
  selectedField, 
  lineItemFields, 
  identificationFields, 
  selectionFields, 
  toggleSelectionField, 
  toggleValueHelp,
  valueHelpFields,
  setValueHelpFields 
}) {
  const [showValueHelpModal, setShowValueHelpModal] = useState(false);
  const [entityName, setEntityName] = useState('');
  const [elementName, setElementName] = useState('');

  // Check if the selected field has a Value Help definition
  const hasValueHelp = selectedField && valueHelpFields.some(f => f.id === selectedField.id);
  // Get Value Help details if available
  const valueHelpDetails = hasValueHelp 
    ? valueHelpFields.find(f => f.id === selectedField.id)
    : null;

  // Handle Value Help checkbox click
  const handleValueHelpClick = () => {
    if (hasValueHelp) {
      // Remove Value Help if it already exists
      setValueHelpFields(valueHelpFields.filter(f => f.id !== selectedField.id));
    } else {
      // Show modal to enter entity and element names
      setShowValueHelpModal(true);
      // Pre-fill with field name as a suggestion
      setElementName(selectedField.name);
    }
  };

  // Handle save of Value Help details
  const handleSaveValueHelp = () => {
    if (!entityName.trim() || !elementName.trim()) {
      alert('Please enter both entity name and element name');
      return;
    }

    // Add or update Value Help for the selected field
    const newValueHelpField = {
      id: selectedField.id,
      fieldName: selectedField.name,
      entityName: entityName,
      elementName: elementName
    };

    // Remove any existing Value Help for this field
    const filteredFields = valueHelpFields.filter(f => f.id !== selectedField.id);
    // Add the new Value Help
    setValueHelpFields([...filteredFields, newValueHelpField]);
    
    // Close the modal and reset fields
    setShowValueHelpModal(false);
    setEntityName('');
    setElementName('');
  };

  return (
    <div className="section properties-section">
      <h2>Properties</h2>
      {selectedField ? (
        <div className="property-details">
          <div className="property-info">
            <p><strong>Field:</strong> {selectedField.name}</p>
            {selectedField.source && <p><strong>Source:</strong> {selectedField.source}</p>}
            {selectedField.isKey && <p><strong>Key Field:</strong> Yes</p>}
          </div>
          
          {/* Show Properties checkboxes only if field is in either object list or object page */}
          {(lineItemFields.some(f => f.id === selectedField.id) || 
            identificationFields.some(f => f.id === selectedField.id)) && (
            <div className="property-checkboxes">
              <h3>Available Properties</h3>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={selectionFields.some(f => f.id === selectedField.id)}
                    onChange={() => toggleSelectionField(selectedField.id)}
                  />
                  Selection Field
                </label>
              </div>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={hasValueHelp}
                    onChange={handleValueHelpClick}
                  />
                  Value Help
                </label>
                {hasValueHelp && (
                  <div className="value-help-details">
                    <p>Entity: <strong>{valueHelpDetails.entityName}</strong></p>
                    <p>Element: <strong>{valueHelpDetails.elementName}</strong></p>
                    <button 
                      className="edit-button"
                      onClick={() => {
                        setEntityName(valueHelpDetails.entityName);
                        setElementName(valueHelpDetails.elementName);
                        setShowValueHelpModal(true);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-selection-message">Select a field to view its properties</div>
      )}
  
      {/* Value Help Modal */}
      {showValueHelpModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Value Help Definition</h3>
            <div className="form-group">
              <label>Entity Name:</label>
              <input 
                type="text" 
                value={entityName} 
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="e.g., I_Country"
              />
            </div>
            <div className="form-group">
              <label>Element Name:</label>
              <input 
                type="text" 
                value={elementName} 
                onChange={(e) => setElementName(e.target.value)}
                placeholder="e.g., Country"
              />
            </div>
            <div className="modal-buttons">
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowValueHelpModal(false);
                  setEntityName('');
                  setElementName('');
                }}
              >
                Cancel
              </button>
              <button 
                className="save-button"
                onClick={handleSaveValueHelp}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertiesPanel;
