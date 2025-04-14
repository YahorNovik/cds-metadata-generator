import React, { useState, useEffect } from 'react';
import './HeaderInfo.css';

function HeaderInfo({ typeName, typeNamePlural, titleField, descriptionField, updateHeaderInfo }) {
  const [formData, setFormData] = useState({
    typeName: typeName || '',
    typeNamePlural: typeNamePlural || '',
    titleField: titleField || '',
    descriptionField: descriptionField || ''
  });

  // Update form data when props change
  useEffect(() => {
    setFormData({
      typeName: typeName || '',
      typeNamePlural: typeNamePlural || '',
      titleField: titleField || '',
      descriptionField: descriptionField || ''
    });
  }, [typeName, typeNamePlural, titleField, descriptionField]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateHeaderInfo(formData);
  };

  return (
    <div className="header-info-section">
      <div className="header-info-header">
        <h2>Header Information</h2>
        <button 
          type="button" 
          className="update-button"
          onClick={handleSubmit}
        >
          Update
        </button>
      </div>
      <div className="header-info-content">
        <div className="header-info-grid">
          <div className="grid-item">
            <label htmlFor="typeName">Type Name:</label>
            <input
              id="typeName"
              name="typeName"
              type="text"
              value={formData.typeName}
              onChange={handleChange}
              placeholder="e.g., Travel"
            />
          </div>
          <div className="grid-item">
            <label htmlFor="typeNamePlural">Type Name Plural:</label>
            <input
              id="typeNamePlural"
              name="typeNamePlural"
              type="text"
              value={formData.typeNamePlural}
              onChange={handleChange}
              placeholder="e.g., Travels"
            />
          </div>
          <div className="grid-item">
            <label htmlFor="titleField">Title Field:</label>
            <input
              id="titleField"
              name="titleField"
              type="text"
              value={formData.titleField}
              onChange={handleChange}
              placeholder="e.g., TravelID"
            />
          </div>
          <div className="grid-item">
            <label htmlFor="descriptionField">Description Field:</label>
            <input
              id="descriptionField"
              name="descriptionField"
              type="text"
              value={formData.descriptionField}
              onChange={handleChange}
              placeholder="e.g., Description"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderInfo;