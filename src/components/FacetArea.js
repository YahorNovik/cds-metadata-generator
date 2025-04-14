import React, { useState, useEffect } from 'react';
import DropZoneItem from './DropZoneItem';

function FacetArea({
  facet,
  fields,
  onDragOver,
  onDrop,
  selectedField,
  setSelectedField,
  removeField,
  updateFacetLabel,
  addChildFacet,
  setLineItemTargetElement,
  uiLabels,
  deleteFacet,
  updateFieldLabel  // Added this prop
}) {
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(facet.label);
  const [showTargetElementModal, setShowTargetElementModal] = useState(false);
  const [targetElement, setTargetElement] = useState(facet.targetElement || '');
  const [qualifierDisplay, setQualifierDisplay] = useState('');

  const handleDoubleClick = () => {
    setEditing(true);
    setEditLabel(facet.label);
  };

  const handleLabelChange = () => {
    updateFacetLabel(facet.id, editLabel);
    
    // If this is a fieldgroup or header, update the qualifier based on the new label
    if (facet.type === 'FIELDGROUP_REFERENCE' || facet.type === 'HEADER') {
      const prefix = facet.type === 'HEADER' ? 'hd' : 'fg';
      const newQualifier = `${prefix}${editLabel.replace(/\s+/g, '')}`;
      setQualifierDisplay(newQualifier);
      
      // This qualifier update is handled by the parent component through the updateFacetLabel function
      // The parent component needs to update the facet with the new qualifier
      // and update any fields that reference this qualifier
    }
    
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLabelChange();
    }
  };

  const handleLineItemSave = () => {
    setLineItemTargetElement(facet.id, targetElement);
    setShowTargetElementModal(false);
  };

  // Display the qualifier based on facet type and label
  useEffect(() => {
    if (facet.type === 'FIELDGROUP_REFERENCE' || facet.type === 'HEADER') {
      const prefix = facet.type === 'HEADER' ? 'hd' : 'fg';
      const calculatedQualifier = `${prefix}${facet.label.replace(/\s+/g, '')}`;
      setQualifierDisplay(facet.targetQualifier || calculatedQualifier);
    }
  }, [facet.type, facet.label, facet.targetQualifier]);

  // Check if this is a LINEITEM_REFERENCE without a targetElement
  React.useEffect(() => {
    if (facet.type === 'LINEITEM_REFERENCE' && !facet.targetElement) {
      setShowTargetElementModal(true);
    }
  }, [facet]);

  return (
    <div className={`facet-area facet-type-${facet.type.toLowerCase()}`}>
      <div className="facet-header" onDoubleClick={handleDoubleClick}>
        {editing ? (
          <input
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={handleLabelChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <h3>{facet.label}</h3>
        )}
        <div className="facet-properties">
          {qualifierDisplay && (
            <span className="facet-property">Qualifier: {qualifierDisplay}</span>
          )}
          {facet.targetElement && (
            <span className="facet-property">Target: {facet.targetElement}</span>
          )}
          <span className="facet-property">Position: {facet.position}</span>
        </div>
        
        {/* Delete button */}
        <button 
          className="remove-btn"
          onClick={() => deleteFacet(facet.id)} 
          title="Delete facet"
        >
          ×
        </button>
      </div>

      {/* Child facet buttons for collections */}
      {addChildFacet && (
        <div className="child-facet-buttons">
          <button onClick={() => addChildFacet(facet.id, 'IDENTIFICATION_REFERENCE')}>
            + Identification
          </button>
          <button onClick={() => addChildFacet(facet.id, 'FIELDGROUP_REFERENCE')}>
            + Fieldgroup
          </button>
        </div>
      )}

      {/* Child facets in collections */}
      {facet.children && facet.children.length > 0 && (
        <div className="child-facets">
          {facet.children.map(childFacet => (
            <div key={childFacet.id} className="child-facet">
              <div className="facet-header">
                <h4>{childFacet.label}</h4>
                <div className="facet-properties">
                  {childFacet.targetQualifier && (
                    <span className="facet-property">Qualifier: {childFacet.targetQualifier}</span>
                  )}
                  <span className="facet-property">Position: {childFacet.position}</span>
                </div>
                
                {/* Delete button for child facet */}
                <button 
                  className="remove-btn" 
                  onClick={() => deleteFacet(childFacet.id, facet.id)} 
                  title="Delete facet"
                >
                  ×
                </button>
              </div>
              <div 
                className="facet-content" 
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, childFacet.id)}
              >
                {childFacet.fields && childFacet.fields.length > 0 ? (
                  childFacet.fields.map(field => (
                    <DropZoneItem
                      key={`${childFacet.id}-${field.id}`}
                      field={field}
                      uiLabel={uiLabels[field.id]}
                      isSelected={field.id === selectedField?.id}
                      onClick={setSelectedField}
                      onRemove={(id) => removeField(id, childFacet.id)}
                      updateFieldLabel={updateFieldLabel}  // Pass the function
                    />
                  ))
                ) : (
                  <div className="empty-facet">Drag fields here</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Facet content area for fields */}
      {(!facet.children || facet.type !== 'COLLECTION') && (
        <div 
          className="facet-content" 
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, facet.id)}
        >
          {facet.fields && facet.fields.length > 0 ? (
            facet.fields.map(field => (
              <DropZoneItem
                key={`${facet.id}-${field.id}`}
                field={field}
                uiLabel={uiLabels[field.id]}
                isSelected={field.id === selectedField?.id}
                onClick={setSelectedField}
                onRemove={(id) => removeField(id, facet.id)}
                updateFieldLabel={updateFieldLabel}  // Pass the function
              />
            ))
          ) : (
            <div className="empty-facet">Drag fields here</div>
          )}
        </div>
      )}

      {/* Modal for LineItem Target Element */}
      {showTargetElementModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Line Item Reference</h3>
            <p>Please specify the target element for this Line Item:</p>
            <div className="form-group">
              <label>Target Element:</label>
              <input
                type="text"
                value={targetElement}
                onChange={(e) => setTargetElement(e.target.value)}
                placeholder="_EntityName"
              />
            </div>
            <div className="modal-buttons">
              <button
                className="save-button"
                onClick={handleLineItemSave}
                disabled={!targetElement}
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

export default FacetArea;