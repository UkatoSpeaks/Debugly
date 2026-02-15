import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { error } = await req.json();

    const systemPrompt = `You are a World-Class Senior Debugging Engineer (Staff Level). 
    Your task is to analyze error traces and provide extremely high-fidelity, actionable, and specific technical solutions.
    
    CRITICAL INSTRUCTIONS:
    1. BE SPECIFIC: Do NOT give generic advice like "check your code". Tell them EXACTLY where the mismatch or failure is (e.g., "The hydration error is likely caused by a <div> being inside a <p> tag").
    2. FRAMEWORK AWARE: Detect the framework (Next.js, React, Node, Python, etc.) from the trace and provide solutions using that framework's best practices.
    3. JSON COMPLIANCE: You must return ONLY a JSON object. No markdown wrappers.
    4. CODE QUALITY: The codePatch must be a working, high-quality snippet that demonstrates the best-practice fix.
    
    The response MUST strictly follow this JSON format:
    {
      "title": "Concise technical title",
      "framework": "Framework name",
      "language": "Language name",
      "originalError": "The original trace",
      "whatBroke": "Clear, technical explanation of the immediate crash",
      "whyHappened": "Deep architectural root cause of the bug",
      "fixSteps": [
        {"id": "01", "text": "Specific, actionable step 1"},
        {"id": "02", "text": "Specific, actionable step 2"}
      ],
      "codePatch": {
        "comment": "// Concise comment describing the logic change",
        "code": "Actual code implementation of the fix"
      },
      "prevention": "A deep engineering tip to avoid this class of bugs entirely",
      "severity": "Low" | "Medium" | "High" | "Critical"
    }
    
    Ensure the JSON is perfectly valid and complete. Do not truncate the response.`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Error to analyze: ${error}` }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
      temperature: 0.3
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    
    return Response.json(result);
  } catch (err) {
    console.error("AI Analysis Error:", err);
    return Response.json({ error: "Failed to analyze error" }, { status: 500 });
  }
}
