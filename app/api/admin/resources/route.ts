import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

// GET lists all resources
export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const where = courseId ? { courseId } : {};

    const resources = await db.resource.findMany({
      where,
      include: {
        course: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST creates a new resource
export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, fileUrl, type, courseId } = await req.json();
    if (!title || !fileUrl || !type || !courseId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const resource = await db.resource.create({
      data: {
        title,
        fileUrl,
        type,
        courseId,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT updates a resource
export async function PUT(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, title, fileUrl, type, courseId } = await req.json();
    if (!id || !title || !fileUrl || !type || !courseId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const resource = await db.resource.update({
      where: { id },
      data: {
        title,
        fileUrl,
        type,
        courseId,
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE removes a resource
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

    await db.resource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
