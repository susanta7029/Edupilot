import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

// GET lists all courses
export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const courses = await db.course.findMany({
      include: {
        category: true,
        _count: {
          select: { lessons: true, resources: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST creates a new course or duplicates an existing one
export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      title, 
      subtitle, 
      description, 
      thumbnail, 
      banner, 
      instructor, 
      duration, 
      level, 
      price, 
      tags, 
      status, 
      categoryId,
      duplicateOfId 
    } = body;

    // Handle course duplication
    if (duplicateOfId) {
      const sourceCourse = await db.course.findUnique({
        where: { id: duplicateOfId },
        include: { lessons: true, resources: true },
      });

      if (!sourceCourse) {
        return NextResponse.json({ error: "Source course not found" }, { status: 404 });
      }

      // Create duplicate course
      const duplicatedCourse = await db.course.create({
        data: {
          title: `${sourceCourse.title} (Copy)`,
          subtitle: sourceCourse.subtitle,
          description: sourceCourse.description,
          thumbnail: sourceCourse.thumbnail,
          banner: sourceCourse.banner,
          instructor: sourceCourse.instructor,
          duration: sourceCourse.duration,
          level: sourceCourse.level,
          price: sourceCourse.price,
          tags: sourceCourse.tags,
          status: "DRAFT", // Copy is draft by default
          categoryId: sourceCourse.categoryId,
        },
      });

      // Duplicate all lessons
      for (const lesson of sourceCourse.lessons) {
        await db.lesson.create({
          data: {
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            duration: lesson.duration,
            youtubeUrl: lesson.youtubeUrl,
            pdfUrl: lesson.pdfUrl,
            quiz: lesson.quiz || undefined,
            courseId: duplicatedCourse.id,
            order: lesson.order,
          },
        });
      }

      return NextResponse.json(duplicatedCourse, { status: 201 });
    }

    if (!title || !description || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const course = await db.course.create({
      data: {
        title,
        subtitle: subtitle || "",
        description,
        thumbnail: thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600",
        banner: banner || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200",
        instructor: instructor || "Sarah Johnson",
        duration: duration || "10 Hours",
        level: level || "Intermediate",
        price: price ? parseFloat(price) : 0.00,
        tags: tags || [],
        status: status || "DRAFT",
        categoryId,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Course POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT updates an existing course
export async function PUT(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      id, 
      title, 
      subtitle, 
      description, 
      thumbnail, 
      banner, 
      instructor, 
      duration, 
      level, 
      price, 
      tags, 
      status, 
      categoryId 
    } = body;

    if (!id || !title || !description || !categoryId) {
      return NextResponse.json({ error: "Missing course details" }, { status: 400 });
    }

    const course = await db.course.update({
      where: { id },
      data: {
        title,
        subtitle: subtitle || "",
        description,
        thumbnail,
        banner: banner || "",
        instructor: instructor || "Sarah Johnson",
        duration: duration || "10 Hours",
        level: level || "Intermediate",
        price: price ? parseFloat(price) : 0.00,
        tags: tags || [],
        status: status || "PUBLISHED",
        categoryId,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Course PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE removes a course
export async function DELETE(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    }

    await db.course.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
