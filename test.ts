import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  console.log("API Key:", !!process.env.GEMINI_API_KEY);

  const pager = await ai.models.list();

  let count = 0;

  for await (const model of pager) {
    count++;
    console.dir(model, { depth: null });
  }

  console.log("TOTAL MODELS:", count);
}

main().catch(console.error);