import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { GeminiService } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, language } = await req.json();
    if (!code || !language) {
      return NextResponse.json({ error: "Missing code snippet or language specification" }, { status: 400 });
    }

    const explanation = await GeminiService.code(code, language);
    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error("AI Code Explainer API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
