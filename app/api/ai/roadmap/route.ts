import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { GeminiService } from "@/lib/gemini";

// POST builds and saves a new roadmap
export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    const userId = token.id as string;

    // Call Gemini
    const roadmapData = await GeminiService.roadmap(topic);

    // Save in DB
    const record = await db.careerRoadmap.create({
      data: {
        userId,
        title: roadmapData.title || `Mastering ${topic}`,
        steps: roadmapData.steps || [],
      },
    });

    return NextResponse.json(record);
  } catch (error: any) {
    console.error("AI Roadmap API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET retrieves student roadmaps
export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.id as string;
    const roadmaps = await db.careerRoadmap.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(roadmaps);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function DELETE(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await req.json();
    await db.careerRoadmap.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
