import OpenAI from "openai";
import { getUserByToken, getUserProfile } from "@/lib/userService";
import { saveAnalysis } from "@/lib/analysisService";
import { analyzeWithGemini } from "@/lib/ai/gemini";

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    let authenticatedUser: any = null;

    if (authHeader?.startsWith("Bearer dbly_")) {
      const token = authHeader.replace("Bearer ", "");
      authenticatedUser = await getUserByToken(token);
      if (!authenticatedUser) {
        return Response.json({ error: "Invalid API Token" }, { status: 401 });
      }
    }

    const { 
      context = [], 
      error, 
      locale = "English", 
      messages = [],
      modelId = "llama-3.1-8b-instant",
      userKeys = {}
    } = await req.json();

    // If user is authenticated but didn't provide keys in request, try to get from profile
    let finalKeys = { ...userKeys };
    if (authenticatedUser && !finalKeys.gemini && !finalKeys.groq) {
      const profile = await getUserProfile(authenticatedUser.uid);
      if (profile?.preferredKeys) {
        finalKeys = { ...finalKeys, ...profile.preferredKeys };
      }
    }

    const systemPrompt = `You are a World-Class Senior Debugging Engineer (Staff Level). 
    Your task is to analyze error traces and related source code to provide extremely high-fidelity, actionable, and specific technical solutions.
    
    CRITICAL: All explanations, steps, and titles MUST be in ${locale}.
    However, keep code snippets and variable names in their original technical format.

    ### Multi-File Reasoning:
    You will receive context as a collection of files. One file may be the "Main Error Trace" (stack log), while others are relevant source code files.
    1. RELATIONSHIP MAPPING: Build a mental model of how these files interact (e.g., A calls B, B throws an error).
    2. SPECIFICITY: Point out the EXACT file and line number where the mismatch occurs if possible.
    3. BEST PRACTICES: Provide solutions that respect the existing architecture shown in the provided files.

    ### Response Guidelines:
    1. BE SPECIFIC: Do NOT give generic advice. Tell them EXACTLY where the failure is.
    2. FRAMEWORK AWARE: Detect the framework from the trace/code and provide solutions using best practices.
    3. JSON COMPLIANCE: Return ONLY a JSON object. No markdown wrappers.
    4. CODE QUALITY: The codePatch must be a working, high-quality snippet.
    
    If this is a follow-up conversation (messages provided), use the history to refine your previous analysis.
    
    The response MUST strictly follow this JSON format:
    {
      "title": "Concise technical title",
      "framework": "Framework name",
      "language": "Language name",
      "originalError": "The primary error trace provided",
      "whatBroke": "Clear, technical explanation of the immediate crash",
      "whyHappened": "Deep architectural root cause, citing relationships between files if applicable",
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
    
    Ensure the JSON is perfectly valid and complete.`;

    const chatMessages: any[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    if (messages.length === 0) {
      let userMsg = "";
      if (context.length > 0) {
        userMsg = "Analyzing the following code context:\n\n" + 
          context.map((f: any) => `### FILE: ${f.name}${f.isMainError ? ' (Main Error Trace)' : ''}\n\`\`\`\n${f.content}\n\`\`\``).join("\n\n");
      } else {
        userMsg = `Error to analyze: ${error}`;
      }
      chatMessages.push({ role: "user", content: userMsg });
    }

    let result: any;

    if (modelId.startsWith("gemini")) {
      const apiKey = finalKeys.gemini || process.env.GOOGLE_GEMINI_KEY;
      if (!apiKey) {
        return Response.json({ error: "Gemini API Key missing. Please configure it in settings." }, { status: 400 });
      }
      result = await analyzeWithGemini(chatMessages, apiKey, modelId);
    } else {
      // Default to Groq
      const apiKey = finalKeys.groq || process.env.GROQ_API_KEY;
      const client = finalKeys.groq ? new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" }) : groqClient;
      
      const completion = await client.chat.completions.create({
        model: modelId,
        messages: chatMessages,
        response_format: { type: "json_object" },
        max_tokens: 2048,
        temperature: 0.3
      });
      result = JSON.parse(completion.choices[0].message.content || "{}");
    }
    
    // Auto-persist for CLI/Token users
    if (authenticatedUser) {
      try {
        const mainError = context.find((f: any) => f.isMainError)?.content || error || "";
        const analysisId = await saveAnalysis({
          ...result,
          userId: authenticatedUser.uid,
          originalError: mainError,
          context: context,
          modelId: modelId
        });
        return Response.json({ ...result, analysisId });
      } catch (saveErr) {
        console.error("Failed to auto-save CLI analysis:", saveErr);
        return Response.json(result);
      }
    }

    return Response.json(result);
  } catch (err) {
    console.error("AI Analysis Error:", err);
    return Response.json({ error: "Failed to analyze error" }, { status: 500 });
  }
}
