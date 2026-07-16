import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, completed } = await req.json();
    if (!lessonId) {
      return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
    }

    const userId = token.id as string;

    // Upsert the progress record
    const progress = await db.progress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        completed,
      },
      create: {
        userId,
        lessonId,
        completed,
      },
    });

    // Award simulated study time on lesson completion
    if (completed) {
      await db.user.update({
        where: { id: userId },
        data: {
          studyTime: {
            increment: 15, // add 15 minutes per lesson completed
          },
        },
      });
    }

    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    console.error("Progress API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
