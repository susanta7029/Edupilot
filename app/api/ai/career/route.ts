import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { GeminiService } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { skills, goal } = await req.json();
    if (!skills || !goal) {
      return NextResponse.json({ error: "Missing skills or goal details" }, { status: 400 });
    }

    const recommendation = await GeminiService.career(skills, goal);
    return NextResponse.json(recommendation);
  } catch (error: any) {
    console.error("AI Career Recommendation API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
