import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const filter = searchParams.get("filter") || ""; // "bookmarked"

    const userId = token.id as string;

    // Fetch categories
    const categories = await db.category.findMany();

    // Build Prisma query
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.categoryId = category;
    }

    if (filter === "bookmarked") {
      const userBookmarks = await db.bookmark.findMany({
        where: { userId },
        select: { lesson: { select: { courseId: true } } },
      });
      const bookmarkedCourseIds = Array.from(new Set(userBookmarks.map((b) => b.lesson.courseId)));
      where.id = { in: bookmarkedCourseIds };
    }

    const courses = await db.course.findMany({
      where,
      include: {
        category: true,
        lessons: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch user progress to compute completion percentages
    const progressList = await db.progress.findMany({
      where: { userId, completed: true },
    });
    const completedLessonIds = new Set(progressList.map((p) => p.lessonId));

    const coursesWithProgress = courses.map((course) => {
      const totalLessons = course.lessons.length;
      const completed = course.lessons.filter((l) => completedLessonIds.has(l.id)).length;
      const progressPercent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        duration: course.duration,
        level: course.level,
        rating: course.rating,
        enrolledCount: course.enrolledCount,
        category: course.category.name,
        categoryId: course.categoryId,
        lessonsCount: totalLessons,
        progressPercent,
      };
    });

    return NextResponse.json({
      courses: coursesWithProgress,
      categories,
    });
  } catch (error: any) {
    console.error("Courses API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
