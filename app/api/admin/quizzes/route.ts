import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId") || "";

    const where: any = {};
    if (courseId) {
      where.courseId = courseId;
    }

    const quizzes = await db.quizQuestion.findMany({
      where,
      include: {
        course: { select: { title: true } },
        lesson: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quizzes);
  } catch (error: any) {
    console.error("Admin Quizzes GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, lessonId, question, options, answer, explanation, difficulty, marks, timeLimit } = body;

    if (!courseId || !question || !options || !answer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const quiz = await db.quizQuestion.create({
      data: {
        courseId,
        lessonId: lessonId || null,
        question,
        options,
        answer,
        explanation: explanation || "",
        difficulty: difficulty || "Medium",
        marks: marks ? parseInt(marks) : 5,
        timeLimit: timeLimit ? parseInt(timeLimit) : 10,
      },
    });

    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error("Admin Quizzes POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, courseId, lessonId, question, options, answer, explanation, difficulty, marks, timeLimit } = body;

    if (!id || !courseId || !question || !options || !answer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const quiz = await db.quizQuestion.update({
      where: { id },
      data: {
        courseId,
        lessonId: lessonId || null,
        question,
        options,
        answer,
        explanation: explanation || "",
        difficulty: difficulty || "Medium",
        marks: parseInt(marks),
        timeLimit: parseInt(timeLimit),
      },
    });

    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error("Admin Quizzes PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await db.quizQuestion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Quizzes DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
