import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { GeminiService } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, count } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    const deckCount = count ? parseInt(count) : 3;

    const cards = await GeminiService.flashcards(topic, deckCount);
    return NextResponse.json(cards);
  } catch (error: any) {
    console.error("AI Flashcards API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
