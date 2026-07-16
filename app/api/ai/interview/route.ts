import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { GeminiService } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, level } = await req.json();
    if (!role || !level) {
      return NextResponse.json({ error: "Missing job role or experience level" }, { status: 400 });
    }

    const questions = await GeminiService.interview(role, level);
    return NextResponse.json(questions);
  } catch (error: any) {
    console.error("AI Interview Questions API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
