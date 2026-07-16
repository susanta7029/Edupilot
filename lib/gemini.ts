import { AIChatMessage } from "@/types";

const rawKey = process.env.GEMINI_API_KEY || "";
const cleanKey = rawKey.replace(/^["']|["']$/g, "").trim();

async function callGeminiRaw(
  prompt: string,
  jsonMode = false
): Promise<string> {
  if (!cleanKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

 const MODEL = "models/gemini-flash-latest";

const url =
`https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${cleanKey}`;

  const payload: {
    contents: { parts: { text: string }[] }[];
    generationConfig?: { responseMimeType: string };
  } = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  if (jsonMode) {
    payload.generationConfig = {
      responseMimeType: "application/json",
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gemini API Error (Status: ${response.status} ${response.statusText}): ${errorText}`
    );
  }

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
  const text =data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (text === undefined || text === null) {
    throw new Error(`Invalid Gemini API response structure: ${JSON.stringify(data)}`);
  }

  return text;
}

export const GeminiService = {
  async chat(messages: AIChatMessage[]): Promise<string> {
    const conversation = messages
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
      .join("\n");
    const prompt = `You are EduPilot AI, a brilliant EdTech learning assistant. Respond concisely to the user, answering their questions or giving advice. Keep your response in friendly Markdown format.\n\nConversation history:\n${conversation}\n\nAI:`;
    return await callGeminiRaw(prompt);
  },

  async quiz(topic: string, count: number): Promise<any[]> {
    const prompt = `You are a high-quality EdTech assessment engine. Create a quiz about "${topic}" consisting of exactly ${count} multiple choice questions.
    Return ONLY a JSON array of objects. Do not include markdown code block notation (like \`\`\`json). The objects must have the following keys:
    - "question" (string)
    - "options" (array of 4 strings)
    - "answer" (string, must exactly match one of the options)
    - "explanation" (string explaining why it is correct)
    
    Format:
    [
      {
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "answer": "...",
        "explanation": "..."
      }
    ]`;
    const res = await callGeminiRaw(prompt, true);
    return JSON.parse(res);
  },

  async roadmap(topic: string): Promise<any> {
    const prompt = `Create a detailed step-by-step career/skill roadmap to master "${topic}".
    Return ONLY a JSON object. Do not include markdown code block notation.
    Format:
    {
      "title": "Mastering ${topic}",
      "steps": [
        {
          "title": "Phase title",
          "desc": "Detail of what to learn and build",
          "duration": "Estimated time (e.g. Week 1-2)",
          "status": "pending"
        }
      ]
    }`;
    const res = await callGeminiRaw(prompt, true);
    return JSON.parse(res);
  },

  async summarize(text: string): Promise<string> {
    const prompt = `You are a professional educational summarizer. Condense the following learning materials into a bulleted Markdown summary with key takeaways and actionable tips:\n\n${text}`;
    return await callGeminiRaw(prompt);
  },

  async notes(text: string): Promise<string> {
    return this.summarize(text);
  },

  async flashcards(topic: string, count: number): Promise<any[]> {
    const prompt = `Generate exactly ${count} study flashcards for learning "${topic}".
    Return ONLY a JSON array of objects with "front" (question/concept) and "back" (answer/definition) keys. Do not include markdown wrappers.
    Format:
    [
      { "front": "...", "back": "..." }
    ]`;
    const res = await callGeminiRaw(prompt, true);
    return JSON.parse(res);
  },

  async career(skills: string[], goal: string): Promise<any> {
    const prompt = `Analyze this student's skills: [${skills.join(", ")}] and their career goal: "${goal}".
    Provide a career compatibility recommendation.
    Return ONLY a JSON object. Do not include markdown code block notation.
    Format:
    {
      "recommendedRole": "Recommended title",
      "skillsMatch": 85, 
      "skillGaps": ["gap 1", "gap 2"],
      "learningPathway": ["step 1", "step 2"],
      "outlook": "brief career industry outlook text"
    }`;
    const res = await callGeminiRaw(prompt, true);
    return JSON.parse(res);
  },

  async doubt(doubt: string, context?: string): Promise<string> {
    const prompt = `You are an expert tutor solving a student's academic doubt.
    Context / Materials: ${context || "None"}
    Doubt: "${doubt}"
    
    Provide a step-by-step tutorial resolving their doubt in helpful Markdown format. Include code snippets or mathematical expressions if necessary.`;
    return await callGeminiRaw(prompt);
  },

  async code(code: string, language: string): Promise<string> {
    const prompt = `You are a Senior Software Engineer. Explain the following ${language} code block line-by-line. Detail its complexity and suggest refactoring tips if applicable. Output in Markdown format:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    return await callGeminiRaw(prompt);
  },

  async interview(role: string, level: string): Promise<any[]> {
    const prompt = `Generate exactly 2 high-yield interview questions and sample answers for a ${level}-level ${role} position.
    Return ONLY a JSON array of objects. Do not include markdown wrappers.
    Format:
    [
      {
        "question": "...",
        "sampleAnswer": "...",
        "category": "e.g. System Design, Coding, Behavior"
      }
    ]`;
    const res = await callGeminiRaw(prompt, true);
    return JSON.parse(res);
  }
};
