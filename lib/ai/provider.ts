export interface DebugResult {
  title: string;
  framework: string;
  language: string;
  originalError: string;
  whatBroke: string;
  whyHappened: string;
  fixSteps: { id: string; text: string }[];
  codePatch: {
    comment: string;
    code: string;
  };
  prevention: string;
  severity: "Low" | "Medium" | "High" | "Critical";
}

export const analyzeError = async (error: string): Promise<DebugResult> => {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ error }),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze error");
  }

  return response.json();
};
