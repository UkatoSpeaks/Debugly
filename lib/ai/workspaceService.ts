import { generateEmbedding } from './embeddings';
import { db, CodeChunk } from './vectorStore';

export interface IndexingProgress {
  totalFiles: number;
  processedFiles: number;
  currentFile: string;
}

/**
 * Simple semantic chunker for code.
 * Splits by logical blocks like functions, classes, and top-level declarations.
 */
export const chunkCode = (content: string, filePath: string): Omit<CodeChunk, 'embedding'>[] => {
  const lines = content.split('\n');
  const chunks: Omit<CodeChunk, 'embedding'>[] = [];
  
  // Basic heuristic: Split every 40-60 lines or at obvious boundaries
  // Future: Use a proper parser for more granular semantic chunking
  const chunkSize = 50;
  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunkLines = lines.slice(i, i + chunkSize);
    chunks.push({
      filePath,
      content: chunkLines.join('\n'),
      metadata: {
        startLine: i + 1,
        endLine: Math.min(i + chunkSize, lines.length),
        language: filePath.split('.').pop() || 'text',
        type: 'block'
      }
    });
  }

  return chunks;
};

export const indexWorkspace = async (
  files: { path: string; content: string }[],
  onProgress?: (progress: IndexingProgress) => void
) => {
  const totalFiles = files.length;
  let processedFiles = 0;

  for (const file of files) {
    onProgress?.({
      totalFiles,
      processedFiles,
      currentFile: file.path
    });

    const chunks = chunkCode(file.content, file.path);
    
    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbedding(chunk.content);
        await db.chunks.add({
          ...chunk,
          embedding
        });
      } catch (err) {
        console.error(`Failed to index chunk in ${file.path}:`, err);
      }
    }

    processedFiles++;
  }

  onProgress?.({
    totalFiles,
    processedFiles,
    currentFile: 'Complete'
  });
};

export const searchWorkspace = async (query: string, limit: number = 3) => {
  const queryEmbedding = await generateEmbedding(query);
  return db.search(queryEmbedding, limit);
};
