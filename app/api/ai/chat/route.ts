import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { GeminiService } from "@/lib/gemini";
import { AIChatMessage } from "@/types";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing conversation messages" }, { status: 400 });
    }

    const userId = token.id as string;
    const lastUserMsg = messages[messages.length - 1].content;

    // Call Gemini
    const aiResponse = await GeminiService.chat(messages as AIChatMessage[]);

    // Save in ChatHistory
    await db.chatHistory.create({
      data: {
        userId,
        message: lastUserMsg,
        response: aiResponse,
      },
    });

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error("AI Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = token.id as string;
    const history = await db.chatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
