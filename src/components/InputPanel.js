import React from 'react';

function InputPanel({ 
  cdsView, 
  setCdsView, 
  apiKey, 
  setApiKey, 
  viewName, 
  setViewName, 
  handleProcessCdsView, 
  loading, 
  error 
}) {
  return (
    <div className="section">
      <h2>Input Window for CDS View</h2>
      <textarea
        className="cds-input"
        value={cdsView}
        onChange={(e) => setCdsView(e.target.value)}
        placeholder="Paste your CDS view here..."
        rows={8}
      />
      
      {/* API Key Input and View Name */}
      <div className="input-controls">
        <div className="input-group">
          <label>Gemini API Key (optional, will use env variable if empty):</label>
          <input
            type="text"
            className="api-key-input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
          />
        </div>
        
        <div className="input-group">
          <label>View Name:</label>
          <input
            type="text"
            className="view-name-input"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder="CDS View Name"
          />
        </div>
        
        <button 
          className="process-button"
          onClick={handleProcessCdsView}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Extract Fields'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default InputPanel;