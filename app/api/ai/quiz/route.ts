import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { GeminiService } from "@/lib/gemini";

// POST generates a new quiz
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

    const questionCount = count ? parseInt(count) : 3;

    // Call Gemini
    const quizQuestions = await GeminiService.quiz(topic, questionCount);

    return NextResponse.json(quizQuestions);
  } catch (error: any) {
    console.error("AI Quiz API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT records a completed quiz score
export async function PUT(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { score, totalQuestions, topic } = await req.json();
    if (score === undefined || !totalQuestions || !topic) {
      return NextResponse.json({ error: "Missing score params" }, { status: 400 });
    }

    const userId = token.id as string;

    // Save in QuizHistory
    const record = await db.quizHistory.create({
      data: {
        userId,
        score: parseInt(score),
        totalQuestions: parseInt(totalQuestions),
        topic,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET lists past quiz attempts
export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.id as string;
    const history = await db.quizHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
