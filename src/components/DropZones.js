import React from 'react';
import DropZoneItem from './DropZoneItem';
import FacetManager from './FacetManager';
import SortingConfiguration from './SortingConfiguration';

function DropZones({ 
  handleDragOver, 
  handleDrop, 
  lineItemFields, 
  identificationFields, 
  selectionFields, 
  selectedField, 
  setSelectedField, 
  removeField,
  updateFieldLabel,
  uiLabels,
  facets,
  setFacets,
  fields,
  handleFacetDrop,
  removeFieldFromFacet,
  fieldGroups,
  setFieldGroups,
  deleteFacet,
  sortConfig,
  updateSortConfig
}) {
  return (
    <div className="drop-zones-container">
      {/* Object List Zone */}
      <div className="drop-zone object-list-zone">
        <h2>Object List</h2>
        
        {/* Add the SortingConfiguration component here */}
        {lineItemFields.length > 0 && (
          <SortingConfiguration
            fields={fields}
            lineItemFields={lineItemFields}
            sortConfig={sortConfig}
            updateSortConfig={updateSortConfig}
          />
        )}
        
        <div 
          className="drop-zone-content"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'objectList')}
        >
          {lineItemFields.length === 0 ? (
            <div className="empty-drop-zone">Drag fields here</div>
          ) : (
            lineItemFields.map(field => (
              <DropZoneItem 
                key={field.id}
                field={field}
                uiLabel={uiLabels[field.id]}
                isSelected={field.id === selectedField?.id}
                onClick={setSelectedField}
                onRemove={(id) => removeField(id, 'objectList')}
                updateFieldLabel={updateFieldLabel}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Object Page Zone */}
      <div className="drop-zone object-page-zone">
        <h2>Object Page</h2>
        
        {/* Standard identification section */}
        <div 
          className="identification-section"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'objectPage')}
        >
          <h3>Identification Section</h3>
          <div className="drop-zone-content">
            {identificationFields.length === 0 ? (
              <div className="empty-drop-zone">Drag fields here</div>
            ) : (
              identificationFields.map(field => (
                <DropZoneItem 
                  key={field.id}
                  field={field}
                  uiLabel={uiLabels[field.id]}
                  isSelected={field.id === selectedField?.id}
                  onClick={setSelectedField}
                  onRemove={(id) => removeField(id, 'objectPage')}
                  updateFieldLabel={updateFieldLabel}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Facet Manager for handling all facet types */}
        <FacetManager 
          facets={facets}
          setFacets={setFacets}
          fields={fields}
          handleDragOver={handleDragOver}
          handleFacetDrop={handleFacetDrop}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          removeFieldFromFacet={removeFieldFromFacet}
          updateFacetLabel={(facetId, newLabel) => {
            const updatedFacets = facets.map(facet => 
              facet.id === facetId ? { ...facet, label: newLabel } : facet
            );
            setFacets(updatedFacets);
          }}
          uiLabels={uiLabels}
          fieldGroups={fieldGroups}
          setFieldGroups={setFieldGroups}
          deleteFacet={deleteFacet}
          updateFieldLabel={updateFieldLabel}
        />
      </div>
    </div>
  );
}

export default DropZones;