import { processPdf, createEmbeddings } from './pdf-processor.mjs';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage for embeddings (would be replaced with a proper vector database)
const embeddingsStore = {
  // Map of paper UUIDs to arrays of chunks with embeddings
  papers: {},
  
  // Add chunks with embeddings for a paper
  addPaper(uuid, chunks) {
    this.papers[uuid] = chunks;
  },
  
  // Get all chunks for a paper
  getPaper(uuid) {
    return this.papers[uuid] || [];
  },
  
  // Find relevant chunks for a query
  async findRelevantChunks(uuid, query, maxResults = 5) {
    if (!this.papers[uuid] || this.papers[uuid].length === 0) {
      return [];
    }
    
    try {
      // Create embedding for query
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        dimensions: 1536
      });
      const queryEmbedding = response.data[0].embedding;
      
      // Calculate cosine similarity for each chunk
      const chunks = this.papers[uuid].map(chunk => {
        const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
        return { ...chunk, similarity };
      });
      
      // Sort by similarity and get top results
      return chunks
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxResults);
    } catch (error) {
      console.error('Error finding relevant chunks:', error);
      return [];
    }
  },
  
  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
};

/**
 * Process a PDF and store its embeddings
 */
export async function processPaperForRag(filePath, uuid, metadata) {
  try {
    // Process PDF and get chunks with embeddings
    const chunksWithEmbeddings = await processPdf(filePath, {
      paper_uuid: uuid,
      ...metadata
    });
    
    // Store embeddings for this paper
    embeddingsStore.addPaper(uuid, chunksWithEmbeddings);
    
    return {
      success: true,
      message: 'Paper processed successfully',
      chunkCount: chunksWithEmbeddings.length
    };
  } catch (error) {
    console.error('Error processing paper for RAG:', error);
    return {
      success: false,
      message: 'Failed to process paper',
      error: error.message
    };
  }
}

/**
 * Process text chunks directly (for testing or external sources)
 */
export async function processChunksForRag(chunks, uuid, metadata) {
  try {
    // Add metadata to chunks
    const chunksWithMetadata = chunks.map(chunk => ({
      text: chunk,
      metadata: {
        paper_uuid: uuid,
        ...metadata
      }
    }));
    
    // Create embeddings for chunks
    const chunksWithEmbeddings = await createEmbeddings(chunksWithMetadata);
    
    // Store embeddings for this paper
    embeddingsStore.addPaper(uuid, chunksWithEmbeddings);
    
    return {
      success: true,
      message: 'Chunks processed successfully',
      chunkCount: chunksWithEmbeddings.length
    };
  } catch (error) {
    console.error('Error processing chunks for RAG:', error);
    return {
      success: false,
      message: 'Failed to process chunks',
      error: error.message
    };
  }
}

/**
 * Generate a response to a query using RAG
 */
export async function generateRagResponse(uuid, query) {
  try {
    // Find relevant chunks for query
    const relevantChunks = await embeddingsStore.findRelevantChunks(uuid, query);
    
    if (relevantChunks.length === 0) {
      return {
        answer: "I couldn't find any relevant information in this paper to answer your question.",
        sources: []
      };
    }
    
    // Create context from relevant chunks
    const context = relevantChunks.map(chunk => chunk.text).join('\n\n');
    
    // Generate response using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a research paper assistant. Answer questions based on the provided paper excerpts. 
          Only use the information in the excerpts. If the answer isn't in the excerpts, say so clearly.
          Be concise and accurate. Cite the relevant sections in your answer.`
        },
        {
          role: 'user',
          content: `Paper excerpts:\n\n${context}\n\nQuestion: ${query}`
        }
      ],
      temperature: 0.3
    });
    
    // Return response with sources
    return {
      answer: response.choices[0].message.content,
      sources: relevantChunks.map(chunk => ({
        text: chunk.text.substring(0, 200) + (chunk.text.length > 200 ? '...' : ''),
        metadata: chunk.metadata,
        similarity: chunk.similarity
      }))
    };
  } catch (error) {
    console.error('Error generating RAG response:', error);
    return {
      answer: "Sorry, I encountered an error while trying to answer your question.",
      sources: [],
      error: error.message
    };
  }
}
