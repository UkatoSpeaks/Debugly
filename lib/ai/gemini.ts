export const analyzeWithGemini = async (
  messages: any[],
  apiKey: string,
  modelId: string = "gemini-1.5-flash"
) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const systemMsg = messages.find(m => m.role === "system");
  const userMessages = messages.filter(m => m.role !== "system");

  const body = {
    system_instruction: systemMsg ? { 
      parts: [{ text: systemMsg.content }] 
    } : undefined,
    contents: userMessages.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    })),
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.3,
      max_output_tokens: 2048,
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Gemini analysis failed");
  }

  const data = await res.json();
  try {
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    throw new Error("Invalid response format from Gemini");
  }
};
