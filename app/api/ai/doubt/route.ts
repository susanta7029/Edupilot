import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { GeminiService } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { doubt, context } = await req.json();
    if (!doubt) {
      return NextResponse.json({ error: "Missing doubt text" }, { status: 400 });
    }

    const solution = await GeminiService.doubt(doubt, context);
    return NextResponse.json({ solution });
  } catch (error: any) {
    console.error("AI Doubt Solver API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
