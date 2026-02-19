import Dexie, { Table } from 'dexie';

export interface CodeChunk {
  id?: number;
  filePath: string;
  content: string;
  embedding: number[];
  metadata: {
    startLine: number;
    endLine: number;
    language: string;
    type: 'function' | 'class' | 'block' | 'global';
  };
}

export class VectorDatabase extends Dexie {
  chunks!: Table<CodeChunk>;

  constructor() {
    super('DebuglyVectorDB');
    this.version(1).stores({
      chunks: '++id, filePath'
    });
  }

  async clearWorkspace(filePathPrefix: string) {
    return this.chunks.where('filePath').startsWith(filePathPrefix).delete();
  }

  async search(queryEmbedding: number[], limit: number = 5) {
    const allChunks = await this.chunks.toArray();
    
    const scoredChunks = allChunks.map(chunk => ({
      ...chunk,
      score: this.cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    return scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const db = new VectorDatabase();
