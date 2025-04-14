import React from 'react';
import FacetArea from './FacetArea';

function FacetManager({
  facets,
  setFacets,
  fields,
  handleDragOver,
  handleFacetDrop,
  selectedField,
  setSelectedField,
  removeFieldFromFacet,
  updateFacetLabel,
  uiLabels,
  fieldGroups,
  setFieldGroups,
  deleteFacet // This function comes directly from App.js now
}) {
  // Function to add a new facet of the specified type
  const addFacet = (type) => {
    const position = facets.length + 1;
    const facetId = `id${type.split('_')[0].toLowerCase()}${position * 10}`;
    const defaultLabel = getFacetDefaultLabel(type);
    
    const newFacet = {
      id: facetId,
      type: type,
      label: defaultLabel,
      position: position * 10, // Use 10, 20, 30... for positions
      fields: [],
      // Additional properties based on facet type
      ...(type === 'HEADER' && { 
        targetQualifier: `hd${defaultLabel.replace(/\s+/g, '')}` 
      }),
      ...(type === 'FIELDGROUP_REFERENCE' && { 
        targetQualifier: `fg${defaultLabel.replace(/\s+/g, '')}` 
      }),
      ...(type === 'LINEITEM_REFERENCE' && { 
        targetElement: '' 
      }),
      ...(type === 'COLLECTION' && { 
        children: [] 
      })
    };
    
    setFacets([...facets, newFacet]);
  };

  // Function to generate default label based on facet type
  const getFacetDefaultLabel = (type) => {
    switch (type) {
      case 'HEADER':
        return 'Header';
      case 'COLLECTION':
        return 'Collection';
      case 'FIELDGROUP_REFERENCE':
        return 'Field Group';
      case 'IDENTIFICATION_REFERENCE':
        return 'Identification';
      case 'LINEITEM_REFERENCE':
        return 'Line Items';
      default:
        return 'New Facet';
    }
  };

  // Function to add a child facet to a collection
  const addChildFacet = (parentFacetId, childType) => {
    const updatedFacets = [...facets];
    const parentFacetIndex = updatedFacets.findIndex(f => f.id === parentFacetId);
    
    if (parentFacetIndex === -1) return;
    
    const parentFacet = updatedFacets[parentFacetIndex];
    const childPosition = (parentFacet.children?.length || 0) + 1;
    const childId = `${parentFacetId}Child${childType.split('_')[0].toLowerCase()}${childPosition * 10}`;
    const defaultLabel = getFacetDefaultLabel(childType);
    
    const childFacet = {
      id: childId,
      type: childType,
      label: defaultLabel,
      position: childPosition * 10, // Use 10, 20, 30... for positions
      parentId: parentFacetId,
      fields: [],
      // Additional properties based on facet type
      ...(childType === 'FIELDGROUP_REFERENCE' && { 
        targetQualifier: `fg${defaultLabel.replace(/\s+/g, '')}` 
      }),
    };
    
    updatedFacets[parentFacetIndex].children = [
      ...(updatedFacets[parentFacetIndex].children || []),
      childFacet
    ];
    
    setFacets(updatedFacets);
  };

  // Set lineItem targetElement
  const setLineItemTargetElement = (facetId, targetElement) => {
    const updatedFacets = facets.map(facet => {
      if (facet.id === facetId) {
        return { ...facet, targetElement };
      }
      return facet;
    });
    
    setFacets(updatedFacets);
  };

  return (
    <div className="facet-manager">
      <div className="facet-buttons">
        <button className="facet-button" onClick={() => addFacet('HEADER')}>
          + Header
        </button>
        <button className="facet-button" onClick={() => addFacet('COLLECTION')}>
          + Collection
        </button>
        <button className="facet-button" onClick={() => addFacet('FIELDGROUP_REFERENCE')}>
          + Fieldgroup
        </button>
        <button className="facet-button" onClick={() => addFacet('IDENTIFICATION_REFERENCE')}>
          + Identification
        </button>
        <button className="facet-button" onClick={() => addFacet('LINEITEM_REFERENCE')}>
          + Lineitem
        </button>
      </div>
      
      <div className="facet-areas">
        {facets.map(facet => (
          <FacetArea
            key={facet.id}
            facet={facet}
            fields={fields}
            onDragOver={handleDragOver}
            onDrop={handleFacetDrop}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
            removeField={removeFieldFromFacet}
            updateFacetLabel={(facetId, newLabel) => {
              const updatedFacets = facets.map(f => {
                if (f.id === facetId) {
                  // Update the label
                  const updatedFacet = { ...f, label: newLabel };
                  
                  // Also update the targetQualifier if this is a fieldgroup or header
                  if (f.type === 'FIELDGROUP_REFERENCE') {
                    updatedFacet.targetQualifier = `fg${newLabel.replace(/\s+/g, '')}`;
                  } else if (f.type === 'HEADER') {
                    updatedFacet.targetQualifier = `hd${newLabel.replace(/\s+/g, '')}`;
                  }
                  
                  return updatedFacet;
                }
                return f;
              });
              
              setFacets(updatedFacets);
            }}
            addChildFacet={facet.type === 'COLLECTION' ? addChildFacet : null}
            setLineItemTargetElement={facet.type === 'LINEITEM_REFERENCE' ? setLineItemTargetElement : null}
            uiLabels={uiLabels}
            deleteFacet={deleteFacet} // Directly pass the deleteFacet function from props
          />
        ))}
      </div>
    </div>
  );
}

export default FacetManager;