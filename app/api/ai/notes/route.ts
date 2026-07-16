import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { GeminiService } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Missing text to summarize" }, { status: 400 });
    }

    const summary = await GeminiService.summarize(text);
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("AI Notes API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
