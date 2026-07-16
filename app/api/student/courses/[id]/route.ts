import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = token.id as string;

    const course = await db.course.findUnique({
      where: { id },
      include: {
        category: true,
        lessons: {
          orderBy: { order: "asc" },
        },
        resources: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch user progress for this course's lessons
    const progressList = await db.progress.findMany({
      where: {
        userId,
        lessonId: { in: course.lessons.map((l) => l.id) },
      },
    });
    const completedLessonIds = new Set(
      progressList.filter((p) => p.completed).map((p) => p.lessonId)
    );

    // Fetch user bookmarks for this course's lessons
    const bookmarks = await db.bookmark.findMany({
      where: {
        userId,
        lessonId: { in: course.lessons.map((l) => l.id) },
      },
    });
    const bookmarkedLessonIds = new Set(bookmarks.map((b) => b.lessonId));

    // Combine states into lesson objects
    const lessonsWithStates = course.lessons.map((lesson) => ({
      ...lesson,
      completed: completedLessonIds.has(lesson.id),
      bookmarked: bookmarkedLessonIds.has(lesson.id),
    }));

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        category: course.category.name,
      },
      lessons: lessonsWithStates,
      resources: course.resources,
    });
  } catch (error: any) {
    console.error("Course detail API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
