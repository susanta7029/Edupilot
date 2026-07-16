import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

// GET lists all lessons for a course
export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    const lessons = await db.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST creates a new lesson or updates lesson orders in bulk
export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, content, duration, youtubeUrl, pdfUrl, courseId, order, reorderList } = body;

    // Handle bulk lesson reordering
    if (reorderList && Array.isArray(reorderList)) {
      for (const item of reorderList) {
        await db.lesson.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (!title || !content || !courseId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Determine order automatically if not specified
    let lessonOrder = order ? parseInt(order) : 1;
    if (!order) {
      const lastLesson = await db.lesson.findFirst({
        where: { courseId },
        orderBy: { order: "desc" },
      });
      lessonOrder = lastLesson ? lastLesson.order + 1 : 1;
    }

    const lesson = await db.lesson.create({
      data: {
        title,
        description: description || "",
        content,
        duration: duration || "15 mins",
        youtubeUrl: youtubeUrl || "",
        pdfUrl: pdfUrl || "",
        courseId,
        order: lessonOrder,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Lesson POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT updates an existing lesson
export async function PUT(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, title, description, content, duration, youtubeUrl, pdfUrl, order } = await req.json();
    if (!id || !title || !content) {
      return NextResponse.json({ error: "Missing details" }, { status: 400 });
    }

    const lesson = await db.lesson.update({
      where: { id },
      data: {
        title,
        description: description || "",
        content,
        duration: duration || "15 mins",
        youtubeUrl: youtubeUrl || "",
        pdfUrl: pdfUrl || "",
        order: order ? parseInt(order) : undefined,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Lesson PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE removes a lesson
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

    await db.lesson.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
