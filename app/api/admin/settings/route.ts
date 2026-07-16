import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Evaluate Database Health
    let dbStatus = "Offline";
    try {
      await db.$queryRaw`SELECT 1`;
      dbStatus = "Connected (Healthy)";
    } catch (e) {
      console.error("Database connection check failed", e);
      dbStatus = "Disconnected";
    }

    // Evaluate Gemini API Key configuration status
    const geminiStatus = process.env.GEMINI_API_KEY 
      ? "Connected (Active)" 
      : "Running (Offline Mock Mode)";

    return NextResponse.json({
      platformName: "EduPilot AI",
      platformLogo: "🤖 EduPilot",
      platformTheme: "Violet Indigo Theme",
      platformEmailSupport: "support@edupilot.ai",
      dbStatus,
      geminiStatus,
    });
  } catch (error: any) {
    console.error("Settings GET error:", error);
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
    // Simulate settings saving response
    return NextResponse.json({ success: true, savedSettings: body });
  } catch (error: any) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
