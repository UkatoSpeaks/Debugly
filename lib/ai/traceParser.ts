export interface TraceFrame {
  functionName: string;
  file: string;
  line: number;
  column: number;
  isInternal: boolean;
  raw: string;
}

/**
 * Robust stack trace parser for V8 (Chrome/Node) and SpiderMonkey (Firefox) formats.
 */
export const parseStackTrace = (stack: string): TraceFrame[] => {
  if (!stack) return [];

  const lines = stack.split('\n');
  const frames: TraceFrame[] = [];

  // Regex for V8 format: "  at FunctionName (path/to/file:line:col)" or "  at path/to/file:line:col"
  const v8Regex = /^\s*at\s+(?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+))\)?\s*$/;
  
  // Regex for SpiderMonkey/Safari format: "functionName@path/to/file:line:col" or "@path/to/file:line:col"
  const smRegex = /^(?:(.*)@)?(.+?):(\d+):(\d+)$/;

  for (const line of lines) {
    let match = line.match(v8Regex);
    if (match) {
      const [_, functionName, file, lineNum, colNum] = match;
      frames.push(createFrame(functionName || 'anonymous', file, lineNum, colNum, line));
      continue;
    }

    match = line.match(smRegex);
    if (match) {
      const [_, functionName, file, lineNum, colNum] = match;
      frames.push(createFrame(functionName || 'anonymous', file, lineNum, colNum, line));
      continue;
    }
  }

  return frames;
};

const createFrame = (
  functionName: string, 
  file: string, 
  lineStr: string, 
  colStr: string, 
  raw: string
): TraceFrame => {
  const fileLower = file.toLowerCase();
  const isInternal = 
    fileLower.includes('node_modules') || 
    fileLower.includes('node:') || 
    fileLower.startsWith('internal/') ||
    fileLower.includes('webpack-internal') ||
    fileLower.includes('next/dist');

  return {
    functionName,
    file,
    line: parseInt(lineStr, 10),
    column: parseInt(colStr, 10),
    isInternal,
    raw
  };
};
