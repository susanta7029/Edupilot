import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // List all users and their progress states grouped by course
    const courses = await db.course.findMany({
      include: {
        lessons: { select: { id: true } },
      },
    });

    const enrollments = [];

    for (const course of courses) {
      // Find all unique students who have progress in this course's lessons
      const lessonIds = course.lessons.map(l => l.id);
      
      if (lessonIds.length > 0) {
        const studentProgress = await db.progress.findMany({
          where: { lessonId: { in: lessonIds } },
          distinct: ["userId"],
          include: {
            user: { select: { name: true, email: true } },
          },
        });

        for (const prog of studentProgress) {
          if (!prog.user) continue;
          
          // Calculate progress percentage
          const studentCompletions = await db.progress.count({
            where: { 
              userId: prog.userId, 
              lessonId: { in: lessonIds },
              completed: true 
            },
          });

          enrollments.push({
            id: `${course.id}-${prog.userId}`,
            courseId: course.id,
            courseTitle: course.title,
            userId: prog.userId,
            userName: prog.user.name,
            userEmail: prog.user.email,
            completedLessons: studentCompletions,
            totalLessons: lessonIds.length,
            progressPercent: Math.round((studentCompletions / lessonIds.length) * 100),
            enrolledAt: prog.createdAt,
          });
        }
      }
    }

    return NextResponse.json(enrollments);
  } catch (error: any) {
    console.error("Admin Enrollments GET error:", error);
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
    const { userId, courseId, bulkUserIds, bulkCourseIds } = body;

    // Handle single enrollment
    if (userId && courseId) {
      const lessons = await db.lesson.findMany({ where: { courseId } });
      if (lessons.length === 0) {
        return NextResponse.json({ error: "Cannot enroll in a course with no lessons" }, { status: 400 });
      }

      // Initialize progress at 0% (incomplete) for first lesson to mark active enrollment
      const existing = await db.progress.findFirst({
        where: { userId, lessonId: lessons[0].id },
      });

      if (!existing) {
        await db.progress.create({
          data: {
            userId,
            lessonId: lessons[0].id,
            completed: false,
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    // Handle Bulk Enrollments (Multiple students into one course)
    if (bulkUserIds && courseId) {
      const lessons = await db.lesson.findMany({ where: { courseId } });
      if (lessons.length === 0) {
        return NextResponse.json({ error: "Course has no lessons" }, { status: 400 });
      }

      for (const uid of bulkUserIds) {
        const existing = await db.progress.findFirst({
          where: { userId: uid, lessonId: lessons[0].id },
        });
        if (!existing) {
          await db.progress.create({
            data: { userId: uid, lessonId: lessons[0].id, completed: false },
          });
        }
      }

      return NextResponse.json({ success: true, count: bulkUserIds.length });
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin Enrollments POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Remove student enrollment
export async function DELETE(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");

    if (!userId || !courseId) {
      return NextResponse.json({ error: "User ID and Course ID required" }, { status: 400 });
    }

    // Delete progress for all lessons in this course
    const lessons = await db.lesson.findMany({ where: { courseId }, select: { id: true } });
    const lessonIds = lessons.map(l => l.id);

    await db.progress.deleteMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
      },
    });

    await db.bookmark.deleteMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Enrollments DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
