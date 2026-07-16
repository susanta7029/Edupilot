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
    const mode = searchParams.get("mode") || "assignments"; // "assignments" or "submissions"
    const courseId = searchParams.get("courseId") || "";

    if (mode === "submissions") {
      const submissions = await db.assignmentSubmission.findMany({
        include: {
          user: { select: { name: true, email: true } },
          assignment: { 
            include: { course: { select: { title: true } } }
          },
        },
        orderBy: { submittedAt: "desc" },
      });
      return NextResponse.json(submissions);
    }

    const where: any = {};
    if (courseId) {
      where.courseId = courseId;
    }

    const assignments = await db.assignment.findMany({
      where,
      include: {
        course: { select: { title: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error("Admin Assignments GET error:", error);
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
    const { courseId, title, description, deadline, fileUrl } = body;

    if (!courseId || !title || !description || !deadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const assignment = await db.assignment.create({
      data: {
        courseId,
        title,
        description,
        deadline: new Date(deadline),
        fileUrl: fileUrl || null,
      },
    });

    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error("Admin Assignments POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Grading / feedback on submissions
export async function PUT(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { submissionId, marks, feedback } = body;

    if (!submissionId) {
      return NextResponse.json({ error: "Submission ID required" }, { status: 400 });
    }

    const submission = await db.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marks: marks ? parseInt(marks) : null,
        feedback: feedback || null,
        status: "GRADED",
      },
    });

    return NextResponse.json(submission);
  } catch (error: any) {
    console.error("Admin Assignments PUT error:", error);
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

    await db.assignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Assignments DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
