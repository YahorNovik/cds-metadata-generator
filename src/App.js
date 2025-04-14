import React, { useState, useEffect } from 'react';
import './App.css';
import './FacetStyles.css';
import GeminiService from './GeminiService';
import HeaderInfo from './components/HeaderInfo';
import './components/HeaderInfo.css'; // If you created a separate CSS file
import SortingConfiguration from './components/SortingConfiguration';

// Import components
import InputPanel from './components/InputPanel';
import ExtractedFields from './components/ExtractedFields';
import PropertiesPanel from './components/PropertiesPanel';
import DropZones from './components/DropZones';
import OutputPanel from './components/OutputPanel';

function App() {
  const [cdsView, setCdsView] = useState(`@Metadata.allowExtensions: true
@EndUserText.label: '###GENERATED Core Data Service Entity'
@AccessControl.authorizationCheck: #CHECK
define root view entity ZC_NOV_TRAVEL
  provider contract TRANSACTIONAL_QUERY
  as projection on ZR_NOV_TRAVEL
{
  key TravelUuid,
  TravelId,
  AgencyId,
  CustomerId,
  BeginDate,
  EndDate,
  BookingFee,
  TotalPrice,
  @Semantics.currencyCode: true
  CurrencyCode,
  Description,
  OverallStatus,
  LocalCreatedBy,
  LocalCreatedAt,
  LocalLastChangedBy,
  LocalLastChangedAt,
  LastChangedAt
}`);
  const [fields, setFields] = useState([]);
  const [lineItemFields, setLineItemFields] = useState([]);
  const [identificationFields, setIdentificationFields] = useState([]);
  const [selectionFields, setSelectionFields] = useState([]);
  const [valueHelpFields, setValueHelpFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [outputAnnotation, setOutputAnnotation] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewName, setViewName] = useState('ZC_NOV_TRAVEL');
  const [uiLabels, setUiLabels] = useState({});
  // Facets state to store all facet configurations
  const [facets, setFacets] = useState([]);
  // Fieldgroups to store fields assigned to fieldgroups
  const [fieldGroups, setFieldGroups] = useState({});

  const [headerInfo, setHeaderInfo] = useState({
    typeName: '',
    typeNamePlural: '',
    titleField: '',
    descriptionField: ''
  });

  // Add this state to your App component
 const [sortConfig, setSortConfig] = useState([]);

// Add this function to update sort configuration
 const updateSortConfig = (newConfig) => {
  setSortConfig(newConfig);
};

  const updateHeaderInfo = (newHeaderInfo) => {
    setHeaderInfo(newHeaderInfo);
  };

  // Update UI label for a field
  const updateFieldLabel = (fieldId, newLabel) => {
    setUiLabels(prevLabels => ({ ...prevLabels, [fieldId]: newLabel }));
  };

  // Toggle selection field property for a field
  const toggleSelectionField = (fieldId) => {
    if (selectionFields.some(f => f.id === fieldId)) {
      setSelectionFields(selectionFields.filter(f => f.id !== fieldId));
    } else {
      const field = fields.find(f => f.id === fieldId);
      if (field) {
        setSelectionFields([...selectionFields, field]);
      }
    }
  };

  // Toggle value help property for a field
  const toggleValueHelp = (fieldId) => {
    console.log("Toggle Value Help for field:", fieldId);
  };

  // Handle extraction of fields from CDS view
  const handleProcessCdsView = async () => {
    console.log("Extract Fields button clicked");

    if (!cdsView.trim()) {
      setError('Please enter a CDS view');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const viewNameMatch = cdsView.match(/define\s+(root\s+)?view\s+entity\s+(\w+)/i);
      if (viewNameMatch && viewNameMatch[2]) {
        setViewName(viewNameMatch[2]);
      }

      const extractedFields = GeminiService.fallbackExtractFields(cdsView);
      console.log("Extracted fields using fallback method:", extractedFields);

      let effectiveApiKey = apiKey.trim();
      if (!effectiveApiKey && process.env.REACT_APP_GEMINI_API_KEY) {
        effectiveApiKey = process.env.REACT_APP_GEMINI_API_KEY;
        console.log("Using API key from environment variables");
      }

      if (effectiveApiKey) {
        try {
          console.log("Attempting to use Gemini API with key:", effectiveApiKey.substring(0, 5) + "..." + effectiveApiKey.substring(effectiveApiKey.length - 5));
          const geminiFields = await GeminiService.extractFieldsFromCdsView(cdsView, effectiveApiKey);
          console.log("Gemini API extraction result:", geminiFields);

          if (geminiFields && geminiFields.length > 0) {
            setFields(geminiFields);
          } else {
            console.log("Using fallback fields as Gemini returned no fields");
            setFields(extractedFields);
          }
        } catch (apiError) {
          console.error('Gemini API error:', apiError);
          setError(`Gemini API error: ${apiError.message}. Using fallback extraction.`);
          setFields(extractedFields);
        }
      } else {
        console.log("No API key provided, using fallback fields");
        setFields(extractedFields);
      }

      // Reset drop zones and label overrides
      setLineItemFields([]);
      setIdentificationFields([]);
      setSelectionFields([]);
      setValueHelpFields([]);
      setUiLabels({});
      setFacets([]);
      setFieldGroups({});
    } catch (err) {
      console.error("Error processing CDS view:", err);
      setError(`Error processing CDS view: ${err.message}`);
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, field) => {
    e.dataTransfer.setData('fieldId', field.id);
    setSelectedField(field);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetZone) => {
    e.preventDefault();
    const fieldId = e.dataTransfer.getData('fieldId');
    const draggedField = fields.find(field => field.id === fieldId);

    if (!draggedField) return;

    if (targetZone === 'objectList') {
      if (!lineItemFields.find(f => f.id === fieldId)) {
        setLineItemFields([...lineItemFields, draggedField]);
      }
    } else if (targetZone === 'objectPage') {
      if (!identificationFields.find(f => f.id === fieldId)) {
        setIdentificationFields([...identificationFields, draggedField]);
      }
    }
  };

  const deleteFacet = (facetId, parentFacetId = null) => {
    console.log("Deleting facet:", facetId, "Parent:", parentFacetId);
    
    // Find the facet that's being deleted
    let facetToDelete;
    
    if (parentFacetId) {
      // This is a child facet
      const parentFacet = facets.find(f => f.id === parentFacetId);
      if (parentFacet && parentFacet.children) {
        facetToDelete = parentFacet.children.find(child => child.id === facetId);
      }
    } else {
      // This is a top-level facet
      facetToDelete = facets.find(f => f.id === facetId);
    }
    
    if (!facetToDelete) return;
    
    // Determine the qualifier used by this facet
    const qualifier = facetToDelete.targetQualifier || 
                     (facetToDelete.type === 'HEADER' ? 'hdHeader' : 
                     (facetToDelete.type === 'FIELDGROUP_REFERENCE' ? `fg${facetToDelete.label.replace(/\s+/g, '')}` : 
                     `facet${facetToDelete.id.replace(/[^a-zA-Z0-9]/g, '')}`));
    
    console.log("Cleaning up qualifier:", qualifier);
    
    // Clean up the fieldGroups object by removing entries for this qualifier
    if (qualifier && fieldGroups[qualifier]) {
      // Create a new fieldGroups object without the deleted qualifier
      const updatedFieldGroups = { ...fieldGroups };
      delete updatedFieldGroups[qualifier];
      
      console.log("Updated fieldGroups:", updatedFieldGroups);
      
      // Update the fieldGroups state
      setFieldGroups(updatedFieldGroups);
    }
    
    // If this is a child facet (has a parent)
    if (parentFacetId) {
      setFacets(prevFacets => 
        prevFacets.map(facet => {
          if (facet.id === parentFacetId) {
            return {
              ...facet,
              children: facet.children.filter(child => child.id !== facetId)
            };
          }
          return facet;
        })
      );
    } else {
      // This is a top-level facet
      setFacets(prevFacets => prevFacets.filter(facet => facet.id !== facetId));
    }
  };

  // Handle dropping a field onto a facet
  const handleFacetDrop = (e, facetId) => {
    e.preventDefault();
    const fieldId = e.dataTransfer.getData('fieldId');
    const draggedField = fields.find(field => field.id === fieldId);
  
    if (!draggedField) return;
  
    // Find the target facet
    const targetFacet = facets.find(f => f.id === facetId) || 
                         facets.flatMap(f => f.children || []).find(c => c.id === facetId);
    
    if (!targetFacet) return;
  
    // Update facets state
    const updatedFacets = facets.map(facet => {
      if (facet.id === facetId) {
        // Add field to facet
        if (!facet.fields.some(f => f.id === fieldId)) {
          return {
            ...facet,
            fields: [...facet.fields, draggedField]
          };
        }
      } else if (facet.children) {
        // Check if dropping into a child facet of a collection
        const childIndex = facet.children.findIndex(child => child.id === facetId);
        if (childIndex >= 0) {
          const updatedChildren = [...facet.children];
          if (!updatedChildren[childIndex].fields.some(f => f.id === fieldId)) {
            updatedChildren[childIndex] = {
              ...updatedChildren[childIndex],
              fields: [...updatedChildren[childIndex].fields, draggedField]
            };
          }
          return {
            ...facet,
            children: updatedChildren
          };
        }
      }
      return facet;
    });
  
    setFacets(updatedFacets);
  
    // Always add field to fieldGroups state with the appropriate qualifier
    // The qualifier comes from the facet's targetQualifier or is derived from the facet's ID if not available
    const qualifier = targetFacet.targetQualifier || 
                      (targetFacet.type === 'HEADER' ? 'hdHeader' : 
                      (targetFacet.type === 'FIELDGROUP_REFERENCE' ? `fg${targetFacet.label.replace(/\s+/g, '')}` : 
                      `facet${targetFacet.id.replace(/[^a-zA-Z0-9]/g, '')}`));
  
    // Calculate the position based on existing fields in this qualifier
    const position = (fieldGroups[qualifier]?.length || 0) + 1;
    
    setFieldGroups(prev => ({
      ...prev,
      [qualifier]: [
        ...(prev[qualifier] || []),
        {
          fieldId: fieldId,
          position: position * 10
        }
      ]
    }));
  };

  // Remove a field from a facet
  const removeFieldFromFacet = (fieldId, facetId) => {
    const updatedFacets = facets.map(facet => {
      if (facet.id === facetId) {
        return {
          ...facet,
          fields: facet.fields.filter(f => f.id !== fieldId)
        };
      } else if (facet.children) {
        // Check if removing from a child facet
        const childIndex = facet.children.findIndex(child => child.id === facetId);
        if (childIndex >= 0) {
          const updatedChildren = [...facet.children];
          updatedChildren[childIndex] = {
            ...updatedChildren[childIndex],
            fields: updatedChildren[childIndex].fields.filter(f => f.id !== fieldId)
          };
          return {
            ...facet,
            children: updatedChildren
          };
        }
      }
      return facet;
    });

    setFacets(updatedFacets);

    // Remove from fieldGroups if necessary
    const targetFacet = facets.find(f => f.id === facetId) || 
                         facets.flatMap(f => f.children || []).find(c => c.id === facetId);

    if (targetFacet) {
      const qualifier = targetFacet.targetQualifier || 
                      (targetFacet.type === 'HEADER' ? 'hdHeader' : 
                      (targetFacet.type === 'FIELDGROUP_REFERENCE' ? `fg${targetFacet.label.replace(/\s+/g, '')}` : 
                      `facet${targetFacet.id.replace(/[^a-zA-Z0-9]/g, '')}`));
      
      setFieldGroups(prev => ({
        ...prev,
        [qualifier]: (prev[qualifier] || []).filter(item => item.fieldId !== fieldId)
      }));
    }
  };

  const removeField = (fieldId, zone) => {
    if (zone === 'objectList') {
      setLineItemFields(lineItemFields.filter(field => field.id !== fieldId));
      setSelectionFields(selectionFields.filter(field => field.id !== fieldId));
      setValueHelpFields(valueHelpFields.filter(field => field.id !== fieldId));
    } else if (zone === 'objectPage') {
      setIdentificationFields(identificationFields.filter(field => field.id !== fieldId));
      setSelectionFields(selectionFields.filter(field => field.id !== fieldId));
      setValueHelpFields(valueHelpFields.filter(field => field.id !== fieldId));
    }
  };

// Generate the annotation output
useEffect(() => {
  if (fields.length === 0) return;

  const getFieldUiLabel = (field) => {
    return uiLabels[field.id] || field.name;
  };

  // Step 1: Rebuild the fieldGroups from scratch based on current facets
  // This ensures fieldGroups always accurately reflect facet qualifiers
  const rebuildFieldGroups = {};
  
  // Process all facets and their fields to rebuild field groups 
  facets.forEach(facet => {
    if ((facet.type === 'HEADER' || facet.type === 'FIELDGROUP_REFERENCE') && facet.fields?.length > 0) {
      const qualifier = facet.targetQualifier || 
                       (facet.type === 'HEADER' ? 'hdHeader' : 
                       `fg${facet.label.replace(/\s+/g, '')}`);
      
      rebuildFieldGroups[qualifier] = rebuildFieldGroups[qualifier] || [];
      
      facet.fields.forEach((field, index) => {
        rebuildFieldGroups[qualifier].push({
          fieldId: field.id,
          position: (index + 1) * 10
        });
      });
    }
    
    // Also process child facets if any
    if (facet.children) {
      facet.children.forEach(childFacet => {
        if ((childFacet.type === 'FIELDGROUP_REFERENCE') && childFacet.fields?.length > 0) {
          const qualifier = childFacet.targetQualifier || 
                           `fg${childFacet.label.replace(/\s+/g, '')}`;
          
          rebuildFieldGroups[qualifier] = rebuildFieldGroups[qualifier] || [];
          
          childFacet.fields.forEach((field, index) => {
            rebuildFieldGroups[qualifier].push({
              fieldId: field.id,
              position: (index + 1) * 10
            });
          });
        }
      });
    }
  });

  let annotation = '@Metadata.layer: #CORE\n';

  // Add UI.headerInfo with custom values if provided, or default to first field
  if (headerInfo.typeName || headerInfo.typeNamePlural || headerInfo.titleField || headerInfo.descriptionField) {
    annotation += '@UI.headerInfo: {\n';
    
    if (headerInfo.typeName) {
      annotation += `  typeName: '${headerInfo.typeName}',\n`;
    }
    
    if (headerInfo.typeNamePlural) {
      annotation += `  typeNamePlural: '${headerInfo.typeNamePlural}',\n`;
    }
    
    annotation += '  title: { type: #STANDARD';
    if (headerInfo.titleField) {
      annotation += `, value: '${headerInfo.titleField}'`;
    } else if (fields.length > 0) {
      annotation += `, value: '${fields[0].name}'`;
    }
    annotation += ' },\n';
    
    annotation += '  description: { type: #STANDARD';
    if (headerInfo.descriptionField) {
      annotation += `, value: '${headerInfo.descriptionField}'`;
    } else if (fields.length > 0) {
      annotation += `, value: '${fields[0].name}'`;
    }
    annotation += ' }\n';
    
    annotation += '}\n';
  } else if (fields.length > 0) {
    // Original headerInfo implementation as fallback
    const firstField = fields[0].name;
    annotation += `@UI.headerInfo.title.type: #STANDARD\n`;
    annotation += `@UI.headerInfo.title.value: '${firstField}'\n`;
    annotation += `@UI.headerInfo.description.type: #STANDARD\n`;
    annotation += `@UI.headerInfo.description.value: '${firstField}'\n`;
  }

    // Add presentationVariant annotation if sort configuration exists
    if (sortConfig.length > 0) {
      annotation += '@UI.presentationVariant: [{\n';
      
      // Add sortOrder configuration
      annotation += '  sortOrder: [\n';
      
      sortConfig.forEach((config, index) => {
        const field = fields.find(f => f.id === config.fieldId);
        if (field) {
          annotation += `    { by: '${field.name}', direction: #${config.direction} }`;
          if (index < sortConfig.length - 1) {
            annotation += ',';
          }
          annotation += '\n';
        }
      });
      
      annotation += '  ]\n';
      annotation += '}]\n';
    }

  // Start the main annotation block
  annotation += `annotate view ${viewName} with\n{\n`;
  
  // Add UI.facet annotations if facets are defined
  if (facets.length > 0) {
    annotation += '@UI.facet: [\n';
    
    facets.forEach((facet) => {
      annotation += `  { id: '${facet.id}',\n`;
      
      // Only add purpose for HEADER type
      if (facet.type === 'HEADER') {
        annotation += `    purpose: #${facet.type},\n`;
      }
      
      annotation += `    label: '${facet.label}',\n`;
      
      if (facet.type === 'HEADER') {
        // Change HEADER to FIELDGROUP_REFERENCE for the type
        annotation += `    type: #FIELDGROUP_REFERENCE,\n`;
        annotation += `    targetQualifier: '${facet.targetQualifier || 'hdHeader'}',\n`;
        annotation += `    position: ${facet.position}},\n`;
      } else if (facet.type === 'FIELDGROUP_REFERENCE') {
        annotation += `    type: #${facet.type},\n`;
        annotation += `    targetQualifier: '${facet.targetQualifier || `fg${facet.label.replace(/\s+/g, '')}`}',\n`;
        annotation += `    position: ${facet.position}},\n`;
      } else if (facet.type === 'LINEITEM_REFERENCE') {
        annotation += `    type: #${facet.type},\n`;
        annotation += `    targetElement: '${facet.targetElement}',\n`;
        annotation += `    position: ${facet.position}},\n`;
      } else if (facet.type === 'COLLECTION') {
        annotation += `    type: #${facet.type},\n`;
        annotation += `    position: ${facet.position}},\n`;
        
        // Add child facets under the collection
        if (facet.children && facet.children.length > 0) {
          facet.children.forEach((child) => {
            annotation += `  { type: #${child.type},\n`;
            annotation += `    label: '${child.label}',\n`;
            annotation += `    parentId: '${facet.id}',\n`;
            annotation += `    id: '${child.id}',\n`;
            
            if (child.type === 'FIELDGROUP_REFERENCE') {
              annotation += `    targetQualifier: '${child.targetQualifier || `fg${child.label.replace(/\s+/g, '')}`}',\n`;
            }
            
            annotation += `    position: ${child.position}},\n`;
          });
        }
      } else {
        annotation += `    type: #${facet.type},\n`;
        annotation += `    position: ${facet.position}},\n`;
      }
    });
    
    annotation = annotation.slice(0, -2); // Remove the last comma
    annotation += '\n]\n';
  }

  // Process all fields
  fields.forEach((field, index) => {
    const isInLineItem = lineItemFields.some(f => f.id === field.id);
    const isInIdentification = identificationFields.some(f => f.id === field.id);
    const isInSelectionField = selectionFields.some(f => f.id === field.id);
    const valueHelpData = valueHelpFields.find(f => f.id === field.id);
    let annotations = [];

    // Check if this field is used in any fieldgroup and add fieldGroup annotations
    // Use the rebuilt fieldGroups instead of the state variable
    Object.entries(rebuildFieldGroups).forEach(([qualifier, items]) => {
      const item = items.find(i => i.fieldId === field.id);
      if (item) {
        annotations.push(`@UI.fieldGroup: [{ qualifier: '${qualifier}', position: ${item.position}, label: '${getFieldUiLabel(field)}' }]`);
      }
    });

    // Find all facets that contain this field and ensure they have fieldGroup annotations
    facets.forEach(facet => {
      if (facet.fields && facet.fields.some(f => f.id === field.id)) {
        // For facets with fields directly in them
        const qualifier = facet.targetQualifier || 
                          (facet.type === 'HEADER' ? 'hdHeader' : 
                          (facet.type === 'FIELDGROUP_REFERENCE' ? `fg${facet.label.replace(/\s+/g, '')}` : 
                          `facet${facet.id.replace(/[^a-zA-Z0-9]/g, '')}`));
        
        // Only add if not already in the rebuilt fieldGroups
        if (!Object.entries(rebuildFieldGroups).some(([q, items]) => 
            q === qualifier && items.some(i => i.fieldId === field.id))) {
          
          // Find the position (index + 1) * 10 of this field in the facet's fields
          const position = (facet.fields.findIndex(f => f.id === field.id) + 1) * 10;
          annotations.push(`@UI.fieldGroup: [{ qualifier: '${qualifier}', position: ${position}, label: '${getFieldUiLabel(field)}' }]`);
        }
      }
      
      // Also check children facets if this is a collection
      if (facet.children) {
        facet.children.forEach(childFacet => {
          if (childFacet.fields && childFacet.fields.some(f => f.id === field.id)) {
            const qualifier = childFacet.targetQualifier || 
                            (childFacet.type === 'FIELDGROUP_REFERENCE' ? `fg${childFacet.label.replace(/\s+/g, '')}` : 
                            `facet${childFacet.id.replace(/[^a-zA-Z0-9]/g, '')}`);
            
            // Only add if not already in the rebuilt fieldGroups
            if (!Object.entries(rebuildFieldGroups).some(([q, items]) => 
                q === qualifier && items.some(i => i.fieldId === field.id))) {
              
              const position = (childFacet.fields.findIndex(f => f.id === field.id) + 1) * 10;
              annotations.push(`@UI.fieldGroup: [{ qualifier: '${qualifier}', position: ${position}, label: '${getFieldUiLabel(field)}' }]`);
            }
          }
        });
      }
    });

    // Add UI.identification annotation
    if (isInIdentification) {
      const position = identificationFields.findIndex(f => f.id === field.id) * 10 + 10;
      annotations.push(`@UI.identification: [{ position: ${position}, label: '${getFieldUiLabel(field)}' }]`);
    }

    // Add UI.lineItem annotation
    if (isInLineItem) {
      const position = lineItemFields.findIndex(f => f.id === field.id) * 10 + 10;
      annotations.push(`@UI.lineItem: [{ position: ${position}, label: '${getFieldUiLabel(field)}' }]`);
    }

    // Add UI.selectionField annotation
    if (isInSelectionField) {
      const position = selectionFields.findIndex(f => f.id === field.id) * 10 + 10;
      annotations.push(`@UI.selectionField: [{ position: ${position} }]`);
    }

    // Add valueHelpDefinition if configured
    if (valueHelpData) {
      annotations.push(`@Consumption.valueHelpDefinition: [{ entity: { name: '${valueHelpData.entityName}', element: '${valueHelpData.elementName}' } }]`);
    }

    // Add UI.hidden annotation for unused fields
    const isHidden = !isInLineItem && !isInIdentification && annotations.length === 0;
    if (isHidden) {
      annotations.push(`@UI.hidden: true`);
    }

    // Add all annotations for this field
    if (annotations.length > 0) {
      annotations.forEach(a => {
        annotation += `  ${a}\n`;
      });
    }

    // Add the field name with semicolon instead of comma
    annotation += `  ${field.name};`;
    
    // Add newlines between fields
    annotation += index < fields.length - 1 ? '\n\n' : '\n';
  });

  // Close the annotation block
  annotation += '}';

  setOutputAnnotation(annotation);
}, [fields, lineItemFields, identificationFields, selectionFields, valueHelpFields, uiLabels, viewName, facets, headerInfo, sortConfig]);
  return (
    <div className="app-container">
      <h1>CDS Metadata Extension Generator</h1>

      <InputPanel 
        cdsView={cdsView}
        setCdsView={setCdsView}
        apiKey={apiKey}
        setApiKey={setApiKey}
        viewName={viewName}
        setViewName={setViewName}
        handleProcessCdsView={handleProcessCdsView}
        loading={loading}
        error={error}
      />

     {fields.length > 0 && (
      <HeaderInfo 
        typeName={headerInfo.typeName}
        typeNamePlural={headerInfo.typeNamePlural}
        titleField={headerInfo.titleField}
        descriptionField={headerInfo.descriptionField}
        updateHeaderInfo={updateHeaderInfo}
      />
    )}

      <div className="main-content">
        <ExtractedFields 
          fields={fields}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          handleDragStart={handleDragStart}
          loading={loading}
        />

        {fields.length > 0 && (
          <PropertiesPanel 
            selectedField={selectedField}
            lineItemFields={lineItemFields}
            identificationFields={identificationFields}
            selectionFields={selectionFields}
            toggleSelectionField={toggleSelectionField}
            toggleValueHelp={toggleValueHelp}
            valueHelpFields={valueHelpFields}
            setValueHelpFields={setValueHelpFields}
          />
        )}
      </div>

  {fields.length > 0 && (
    <DropZones 
      handleDragOver={handleDragOver}
      handleDrop={handleDrop}
      lineItemFields={lineItemFields}
      identificationFields={identificationFields}
      selectionFields={selectionFields}
      selectedField={selectedField}
      setSelectedField={setSelectedField}
      removeField={removeField}
      updateFieldLabel={updateFieldLabel}
      uiLabels={uiLabels}
      facets={facets}
      setFacets={setFacets}
      fields={fields}
      handleFacetDrop={handleFacetDrop}
      removeFieldFromFacet={removeFieldFromFacet}
      deleteFacet={deleteFacet}
      sortConfig={sortConfig}
      updateSortConfig={updateSortConfig}
    />
)}

      {outputAnnotation && fields.length > 0 && (
        <OutputPanel outputAnnotation={outputAnnotation} />
      )}
    </div>
  );
}

export default App;