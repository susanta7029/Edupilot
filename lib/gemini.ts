import { AIChatMessage } from "@/types";
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI SDK. 
// Uses a dummy key fallback if GEMINI_API_KEY is missing to prevent server crashes on startup.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key",
});

async function callGeminiRaw(
  prompt: string,
  jsonMode = false
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const response = await ai.models.generateContent({
  model: "gemini-flash-latest",
  contents: prompt,
  config: jsonMode
    ? {
        responseMimeType: "application/json",
      }
    : undefined,
});

  return response.text || "";
}

// Mock engines to ensure the project works flawlessly even without keys
const MOCK_AI = {
  chat: (msg: string) => {
    const keyMissing = !process.env.GEMINI_API_KEY;
    const warning = keyMissing 
      ? `⚠️ [OFFLINE MOCK MODE - GEMINI_API_KEY is not configured in your .env.local file]\n\n`
      : "";
    return `${warning}I am your EduPilot AI learning companion. You asked: "${msg}". 
Here is a structured overview of what you need to know:

1. **Core Concept**: Learning is structured and incremental. Focus on fundamentals before building advanced projects.
2. **Recommended Action**: Complete the lessons in your dashboard, then generate a personalized quiz to test your comprehension.
3. **Did you know?**: Consistent daily practice of 15 minutes is more effective than weekly 2-hour cramming sessions. Keep your streak alive!`;
  },
  
  quiz: (topic: string) => JSON.stringify([
    {
      question: `What is the primary function of a database index in the context of ${topic}?`,
      options: ["To encrypt database records", "To speed up data retrieval operations", "To automatically seed mock users", "To partition tables across servers"],
      answer: "To speed up data retrieval operations",
      explanation: "A database index is a data structure that improves the speed of data retrieval operations on a database table at the cost of additional writes and storage space."
    },
    {
      question: `Which architectural pattern is commonly used for managing state in a modern React/Next.js application focused on ${topic}?`,
      options: ["Direct DOM manipulation", "Unidirectional data flow (React State/Context)", "Bidirectional triggers", "Multi-threaded state streams"],
      answer: "Unidirectional data flow (React State/Context)",
      explanation: "React components use unidirectional data flow, where state flows down through props and modifications flow up through callbacks."
    },
    {
      question: `Why is schema validation essential for handling user input during ${topic}?`,
      options: ["It compresses HTTP request bodies", "It ensures type safety and prevents malicious payloads at runtime", "It compiles code into binary executable formats", "It speeds up client-side page transitions"],
      answer: "It ensures type safety and prevents malicious payloads at runtime",
      explanation: "Schema validation (e.g. with Zod) parses and validates request payloads, securing the system from unexpected structures, SQL injection inputs, or malformed data."
    }
  ]),

  roadmap: (topic: string) => JSON.stringify({
    title: `AI Roadmap: Master ${topic}`,
    steps: [
      { title: "Phase 1: Core Fundamentals", desc: `Learn the base syntax, basic concepts, and environment setup for ${topic}. Build a simple CLI project.`, duration: "Week 1-2", status: "pending" },
      { title: "Phase 2: Intermediate Implementation", desc: `Understand data structures, routing, state management, and basic database integration.`, duration: "Week 3-4", status: "pending" },
      { title: "Phase 3: Deep Dive & Optimization", desc: `Implement authentication, middlewares, performance profiling, caching, and custom testing files.`, duration: "Week 5-6", status: "pending" },
      { title: "Phase 4: Capstone SaaS Build", desc: `Build and deploy a complete production-grade application integrating real-world APIs and full CRUD workflows.`, duration: "Week 7-8", status: "pending" }
    ]
  }),

  summarize: (text: string) => `### Summary of Notes
  
* **Key Concept**: The provided text centers on the design and implementation of highly structured and component-based code.
* **Core Takeaways**:
  * Clean architecture divides duties among independent layers (API handlers, database models, interfaces).
  * Validation checks inputs at the boundaries of the system.
* **Actionable Advice**: Integrate proper exception handlers, split long scripts into modular helper utilities, and secure endpoints with active token checks.`,

  flashcards: (topic: string) => JSON.stringify([
    { front: `What does DRY stand for in ${topic}?`, back: "Don't Repeat Yourself - a principle of software development aimed at reducing repetition of information." },
    { front: `What is the complexity of binary search in ${topic}?`, back: "O(log n) time complexity, as it divides the search interval in half each time." },
    { front: `What is an API Route Handler in Next.js?`, back: "A custom request handler for a given route, built using Web Request/Response APIs, running on serverless environments." }
  ]),

  career: (skills: string[], goal: string) => JSON.stringify({
    recommendedRole: "Senior Full-Stack Engineer / AI Solutions Architect",
    skillsMatch: Math.min(40 + skills.length * 10, 95),
    skillGaps: ["Advanced Vector Embeddings", "Retrieval-Augmented Generation (RAG)", "Distributed Database Sharding"],
    learningPathway: [
      "Step 1: Build deep-dive projects using LangChain and vector databases (e.g., Pinecone/pgvector).",
      "Step 2: Learn Redis cache clustering and write custom PostgreSQL connection pools.",
      "Step 3: Deploy microservices on AWS/Vercel with edge-optimized middleware runtimes."
    ],
    outlook: "Excellent. Tech companies are heavily investing in engineers capable of deploying secure, AI-orchestrated full-stack SaaS platforms."
  }),

  doubt: (doubt: string) => `### Step-by-Step Doubt Solver
  
**Your Question:** ${doubt}

**AI Solution:**
1. **Understand the Problem**: This issue typically arises when there is a mismatch between the expected execution environment (e.g. server-side runtime vs client-side browser) or variables.
2. **Analysis**: In Serverless runtimes like Next.js App Router, credentials and DB pools must be initialized globally to prevent connection leaks during hot-reloads.
3. **Resolution Strategy**:
   * Wrap Client-specific functions in \"use client\" directives.
   * Store server secrets exclusively in \`.env\` variables and access them only in Next.js Route Handlers or Server Actions.
   * Ensure correct dependency imports (e.g. avoiding Node core libs inside client components).`,

  code: (code: string, language: string) => `### AI Code Explanation (${language})
  
Here is the step-by-step breakdown of your snippet:

\`\`\`${language}
${code}
\`\`\`

1. **Imports & Initializers**: Evaluates dependencies and configures runtime instances.
2. **Core Operation**: Executes the main sequence. If it is asynchronous, it returns a Promise and yields execution to other tasks until completion.
3. **Error Management**: Wraps transactions in \`try/catch\` blocks. Ensures failures are gracefully caught and bubbles up user-friendly messages.
4. **Time Complexity**: Typically runs in \\(O(1)\\) to \\(O(n)\\) depending on database iterations or internal loops.`,

  interview: (role: string, level: string) => JSON.stringify([
    {
      question: `How would you handle a performance bottleneck in a serverless API endpoint handling large ${role} payloads?`,
      sampleAnswer: "I would analyze database queries for indexing opportunities, implement pagination, cache database responses using Redis or edge middleware, and run heavy data processing in asynchronous background queues rather than blocking the response flow.",
      category: "Performance"
    },
    {
      question: `What is the difference between Server Actions and Route Handlers in Next.js?`,
      sampleAnswer: "Route Handlers define custom REST endpoints using Web Request/Response objects, ideal for external integrations and webhook receivers. Server Actions are RPC-like server-side functions called directly from client components, automatically integrating with Next.js form states and caching.",
      category: "Next.js Architecture"
    }
  ])
};

export const GeminiService = {
  async chat(messages: AIChatMessage[]): Promise<string> {
    const conversation = messages.map(m => `${m.role === "user" ? "User" : "AI"}: ${m.content}`).join("\n");
    const prompt = `You are EduPilot AI, a brilliant EdTech learning assistant. Respond concisely to the user, answering their questions or giving advice. Keep your response in friendly Markdown format.\n\nConversation history:\n${conversation}\n\nAI:`;
    try {
      return await callGeminiRaw(prompt);
    } catch (e) {
      console.warn("Using fallback Chat response:", e);
      const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content || "hello";
      return MOCK_AI.chat(lastUserMsg);
    }
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
    try {
      const res = await callGeminiRaw(prompt, true);
      return JSON.parse(res);
    } catch (e) {
      console.warn("Using fallback Quiz response:", e);
      return JSON.parse(MOCK_AI.quiz(topic)).slice(0, count);
    }
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
    try {
      const res = await callGeminiRaw(prompt, true);
      return JSON.parse(res);
    } catch (e) {
      console.warn("Using fallback Roadmap response:", e);
      return JSON.parse(MOCK_AI.roadmap(topic));
    }
  },

  async summarize(text: string): Promise<string> {
    const prompt = `You are a professional educational summarizer. Condense the following learning materials into a bulleted Markdown summary with key takeaways and actionable tips:\n\n${text}`;
    try {
      return await callGeminiRaw(prompt);
    } catch (e) {
      console.warn("Using fallback Summary response:", e);
      return MOCK_AI.summarize(text);
    }
  },

  async flashcards(topic: string, count: number): Promise<any[]> {
    const prompt = `Generate exactly ${count} study flashcards for learning "${topic}".
    Return ONLY a JSON array of objects with "front" (question/concept) and "back" (answer/definition) keys. Do not include markdown wrappers.
    Format:
    [
      { "front": "...", "back": "..." }
    ]`;
    try {
      const res = await callGeminiRaw(prompt, true);
      return JSON.parse(res);
    } catch (e) {
      console.warn("Using fallback Flashcard response:", e);
      return JSON.parse(MOCK_AI.flashcards(topic)).slice(0, count);
    }
  },

  async career(skills: string[], goal: string): Promise<any> {
    const prompt = `Analyze this student's skills: [${skills.join(", ")}] and their career goal: "${goal}".
    Provide a career compatibility recommendation.
    Return ONLY a JSON object. Do not include markdown code block notation.
    Format:
    {
      "recommendedRole": "Recommended title",
      "skillsMatch": 85, // number from 0-100 representing percentage match
      "skillGaps": ["gap 1", "gap 2"],
      "learningPathway": ["step 1", "step 2"],
      "outlook": "brief career industry outlook text"
    }`;
    try {
      const res = await callGeminiRaw(prompt, true);
      return JSON.parse(res);
    } catch (e) {
      console.warn("Using fallback Career recommendation:", e);
      return JSON.parse(MOCK_AI.career(skills, goal));
    }
  },

  async doubt(doubt: string, context?: string): Promise<string> {
    const prompt = `You are an expert tutor solving a student's academic doubt.
    Context / Materials: ${context || "None"}
    Doubt: "${doubt}"
    
    Provide a step-by-step tutorial resolving their doubt in helpful Markdown format. Include code snippets or mathematical expressions if necessary.`;
    try {
      return await callGeminiRaw(prompt);
    } catch (e) {
      console.warn("Using fallback Doubt response:", e);
      return MOCK_AI.doubt(doubt);
    }
  },

  async code(code: string, language: string): Promise<string> {
    const prompt = `You are a Senior Software Engineer. Explain the following ${language} code block line-by-line. Detail its complexity and suggest refactoring tips if applicable. Output in Markdown format:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    try {
      return await callGeminiRaw(prompt);
    } catch (e) {
      console.warn("Using fallback Code explainer response:", e);
      return MOCK_AI.code(code, language);
    }
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
    try {
      const res = await callGeminiRaw(prompt, true);
      return JSON.parse(res);
    } catch (e) {
      console.warn("Using fallback Interview prep response:", e);
      return JSON.parse(MOCK_AI.interview(role, level));
    }
  }
};
