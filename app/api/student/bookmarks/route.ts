import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, bookmarked } = await req.json();
    if (!lessonId) {
      return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
    }

    const userId = token.id as string;

    if (bookmarked) {
      // Create bookmark
      const bookmark = await db.bookmark.upsert({
        where: {
          userId_lessonId: { userId, lessonId },
        },
        update: {},
        create: {
          userId,
          lessonId,
        },
      });
      return NextResponse.json({ success: true, bookmarked: true, bookmark });
    } else {
      // Remove bookmark
      await db.bookmark.deleteMany({
        where: {
          userId,
          lessonId,
        },
      });
      return NextResponse.json({ success: true, bookmarked: false });
    }
  } catch (error: any) {
    console.error("Bookmark API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
