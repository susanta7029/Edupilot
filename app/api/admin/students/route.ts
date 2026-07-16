import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

// GET lists all students with stats
export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const students = await db.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        skills: true,
        careerGoal: true,
        studyTime: true,
        createdAt: true,
        _count: {
          select: {
            progress: { where: { completed: true } },
            bookmarks: true,
            quizHistory: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format list
    const list = students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      avatar: s.avatar,
      skills: s.skills,
      careerGoal: s.careerGoal || "Not configured",
      studyTime: s.studyTime,
      createdAt: s.createdAt,
      completedLessons: s._count.progress,
      bookmarksCount: s._count.bookmarks,
      quizzesTaken: s._count.quizHistory,
    }));

    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE removes a student
export async function DELETE(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function PUT(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, studyTime } = await req.json();
    if (!id || studyTime === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id },
      data: {
        studyTime: parseInt(studyTime),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
