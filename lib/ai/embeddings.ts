let extractor: any = null;

export const getExtractor = async () => {
  if (extractor) return extractor;
  
  // Dynamic import to prevent SSR/Module evaluation errors
  const { pipeline } = await import('@xenova/transformers');
  
  // Using MiniLM - Very fast, small (~24MB), and accurate for semantic search
  extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  return extractor;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const extract = await getExtractor();
  const output = await extract(text, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(output.data);
};

export const generateEmbeddingsBatch = async (texts: string[]): Promise<number[][]> => {
  const extract = await getExtractor();
  const results = [];
  
  // Note: Batching can be further optimized, but for local use this is a clean baseline
  for (const text of texts) {
    const output = await extract(text, {
      pooling: 'mean',
      normalize: true,
    });
    results.push(Array.from(output.data as any) as number[]);
  }
  
  return results;
};
