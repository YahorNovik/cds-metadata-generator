// GeminiService.js
// Service to interact with Google's Gemini API using the official client library

import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  /**
   * Extract fields from a CDS view using Gemini API
   * @param {string} cdsViewContent - The ABAP CDS view content
   * @param {string} apiKey - Gemini API key
   * @returns {Promise<Array>} - Extracted fields with their properties
   */
  static async extractFieldsFromCdsView(cdsViewContent, apiKey) {
    try {
      // Initialize the Gemini API client with the provided API key
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Use Gemini Pro model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Creating a specific prompt for Gemini to extract only the fields
      const prompt = `
You are an expert in ABAP CDS views.

Please analyze this CDS view and extract all fields defined inside the curly braces. 
For each field, identify:
1. The field name (what comes after "as")
2. The source (what comes before "as")
3. Whether it's a key field (has "key" keyword)

Return ONLY a JSON array with objects having these properties:
[
  {
    "name": "FieldName",
    "source": "table.fieldname",
    "isKey": true/false
  },
  ...
]

IMPORTANT:
- Only extract actual fields inside the main curly braces
- Do not extract any associations or projections
- Do not include any explanation, only the JSON array

CDS VIEW:
${cdsViewContent}
`;

      console.log("Sending prompt to Gemini API:", prompt);

      // Generate content using the prompt
      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();
      
      console.log("Gemini response text:", responseText);

      // Try to extract JSON from the response
      let fields;
      try {
        // First, try to find a JSON array in the response
        let jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
        
        if (jsonMatch) {
          // Extract and parse the JSON array
          const jsonString = jsonMatch[0];
          console.log("Extracted JSON string:", jsonString);
          fields = JSON.parse(jsonString);
        } else {
          // If no match found, try to parse the entire response
          fields = JSON.parse(responseText);
          if (!Array.isArray(fields)) {
            throw new Error('Parsed response is not an array');
          }
        }
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        console.log('Response text:', responseText);
        throw new Error('Could not parse Gemini API response as JSON');
      }
      
      console.log("Parsed fields from Gemini:", fields);
      
      // Add id and position to each field
      return fields.map((field, index) => ({
        ...field,
        id: `field-${index}`,
        position: index
      }));
    } catch (error) {
      console.error('Error extracting fields with Gemini:', error);
      // If Gemini fails, fall back to our regex method
      return this.fallbackExtractFields(cdsViewContent);
    }
  }

  /**
   * Fallback method to extract fields using regex
   * @param {string} cdsViewContent - The ABAP CDS view content
   * @returns {Array} - Extracted fields
   */
  static fallbackExtractFields(cdsViewContent) {
    console.log('Using fallback extraction method');
    
    try {
      // Check if we can find a proper fields definition block
      const fieldsBlockMatch = cdsViewContent.match(/{([^{}]*)}/s);
      
      if (!fieldsBlockMatch) {
        console.warn('Could not find fields block in CDS view');
        return [];
      }
      
      // Get the content between the curly braces
      const fieldsBlock = fieldsBlockMatch[1];
      
      // Split the block into lines for more precise processing
      const lines = fieldsBlock.split(/[,\n]/);
      const extractedFields = [];
      
      // Skip known non-field keywords
      const keywordsToSkip = [
        'projection', 'association', 'join', 'on', 'where', 'select', 'from', 
        'group by', 'order by', 'having', 'union', 'except', 'intersect'
      ];
      
      lines.forEach((line, lineIndex) => {
        // Skip empty lines
        line = line.trim();
        if (!line) return;
        
        console.log(`Processing line: "${line}"`);
        
        // Check if this line contains any keywords to skip
        if (keywordsToSkip.some(keyword => line.toLowerCase().includes(keyword))) {
          console.log(`  Skipping line with keyword: ${line}`);
          return;
        }
        
        // Look for field definitions: [key] source as name
        const fieldMatch = line.match(/^\s*(key\s+)?(\w+(?:\.\w+)?)\s+as\s+(\w+)/i);
        
        if (fieldMatch) {
          console.log(`  Field match: ${JSON.stringify(fieldMatch)}`);
          const isKey = Boolean(fieldMatch[1]);
          const source = fieldMatch[2];
          const name = fieldMatch[3];
          
          extractedFields.push({
            id: `field-${lineIndex}`,
            name: name,
            source: source,
            isKey: isKey,
            position: extractedFields.length
          });
        } else {
          // If there's no "as" keyword, it might be a direct field name
          const directFieldMatch = line.match(/^(\w+)$/);
          if (directFieldMatch) {
            console.log(`  Direct field match: ${JSON.stringify(directFieldMatch)}`);
            const name = directFieldMatch[1];
            
            extractedFields.push({
              id: `field-${lineIndex}`,
              name: name,
              source: '',
              isKey: false,
              position: extractedFields.length
            });
          }
        }
      });
      
      console.log('Extracted fields:', extractedFields);
      return extractedFields;
    } catch (error) {
      console.error('Error in fallback extraction:', error);
      return [];
    }
  }
}

export default GeminiService;