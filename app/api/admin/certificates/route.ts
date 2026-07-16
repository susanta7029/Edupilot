import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const certificates = await db.certificate.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json(certificates);
  } catch (error: any) {
    console.error("Admin Certificates GET error:", error);
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
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if certificate already exists
    const existing = await db.certificate.findFirst({
      where: { userId, courseId },
    });

    if (existing) {
      return NextResponse.json({ error: "Certificate already issued for this student" }, { status: 400 });
    }

    const uniqueId = `EP-${courseId.substring(0, 4)}-${userId.substring(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`.toUpperCase();

    const cert = await db.certificate.create({
      data: {
        userId,
        courseId,
        certificateId: uniqueId,
      },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    });

    return NextResponse.json(cert);
  } catch (error: any) {
    console.error("Admin Certificates POST error:", error);
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

    await db.certificate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Certificates DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
