import React from 'react';

function OutputPanel({ outputAnnotation }) {
  return (
    <div className="section">
      <h2>Generated Annotation</h2>
      <pre className="output-annotation">{outputAnnotation}</pre>
      <button 
        className="copy-button"
        onClick={() => {
          navigator.clipboard.writeText(outputAnnotation);
          alert('Annotation copied to clipboard!');
        }}
      >
        Copy to Clipboard
      </button>
    </div>
  );
}

export default OutputPanel;