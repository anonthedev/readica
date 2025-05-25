import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Parse and extract text from PDF buffer
 */
export async function extractTextFromPdf(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Identify document structure (abstract, introduction, sections, etc.)
 */
async function identifyDocumentStructure(text) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a research paper analyzer. Given the text of a research paper, 
          identify the major sections (like Abstract, Introduction, Methods, Results, Discussion, 
          Conclusion, References) and return their approximate start positions as character indices. 
          Return the result as JSON with section name as key and index as value.`
        },
        {
          role: 'user',
          content: text.substring(0, 4000) // Use first 4000 chars to identify structure
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    // Parse the JSON response
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error identifying document structure:', error);
    // Return empty structure if there's an error
    return {};
  }
}

/**
 * Extract meaningful sections from raw text
 */
export async function extractSections(text) {
  // First try to identify document structure
  const structure = await identifyDocumentStructure(text);
  const sections = [];

  if (Object.keys(structure).length > 0) {
    // Sort positions
    const positions = Object.entries(structure).sort((a, b) => a[1] - b[1]);
    
    // Extract each section
    for (let i = 0; i < positions.length; i++) {
      const [sectionName, startPos] = positions[i];
      const endPos = i < positions.length - 1 ? positions[i + 1][1] : text.length;
      
      const sectionText = text.substring(startPos, endPos).trim();
      if (sectionText.length > 0) {
        sections.push({
          type: sectionName,
          content: sectionText
        });
      }
    }
  } else {
    // Fallback: Split by double newlines if structure identification fails
    const paragraphs = text.split(/\n\s*\n/);
    
    // Group paragraphs into reasonable chunks
    for (let i = 0; i < paragraphs.length; i += 5) {
      const chunk = paragraphs.slice(i, i + 5).join('\n\n');
      if (chunk.trim().length > 0) {
        sections.push({
          type: i === 0 ? 'Abstract' : 'Content',
          content: chunk
        });
      }
    }
  }
  
  return sections;
}

/**
 * Create chunks from document text based on semantic meaning
 */
export async function createChunks(text, metadata = {}) {
  // Extract sections from text
  const sections = await extractSections(text);
  const chunks = [];
  
  // Process each section into chunks
  for (const section of sections) {
    const { type, content } = section;
    
    // Skip very short sections
    if (content.length < 50) continue;
    
    // Split long sections into multiple chunks
    if (content.length > 1500) {
      // Split by sentences, then group into chunks of reasonable size
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
      let currentChunk = '';
      
      for (const sentence of sentences) {
        // If adding this sentence would make the chunk too large, create a new chunk
        if (currentChunk.length + sentence.length > 1500) {
          if (currentChunk.length > 0) {
            chunks.push({
              text: currentChunk.trim(),
              metadata: {
                ...metadata,
                section_type: type
              }
            });
          }
          currentChunk = sentence;
        } else {
          currentChunk += ' ' + sentence;
        }
      }
      
      // Add the last chunk if it exists
      if (currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.trim(),
          metadata: {
            ...metadata,
            section_type: type
          }
        });
      }
    } else {
      // Add the whole section as one chunk if it's a reasonable size
      chunks.push({
        text: content.trim(),
        metadata: {
          ...metadata,
          section_type: type
        }
      });
    }
  }
  
  return chunks;
}

/**
 * Create embeddings for chunks using OpenAI
 */
export async function createEmbeddings(chunks) {
  try {
    const batchSize = 20; // Process in batches to avoid rate limits
    const allEmbeddings = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch.map(chunk => chunk.text),
        dimensions: 1536
      });
      
      const batchEmbeddings = response.data.map((item, index) => ({
        ...chunks[i + index],
        embedding: item.embedding
      }));
      
      allEmbeddings.push(...batchEmbeddings);
    }
    
    return allEmbeddings;
  } catch (error) {
    console.error('Error creating embeddings:', error);
    throw new Error('Failed to create embeddings');
  }
}

/**
 * Process a PDF file and return chunks with embeddings
 */
export async function processPdf(filePath, metadata) {
  try {
    // Read PDF file
    const pdfBuffer = fs.readFileSync(filePath);
    
    // Extract text
    const text = await extractTextFromPdf(pdfBuffer);
    
    // Create chunks
    const chunks = await createChunks(text, metadata);
    
    // Create embeddings
    const chunksWithEmbeddings = await createEmbeddings(chunks);
    
    return chunksWithEmbeddings;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}
