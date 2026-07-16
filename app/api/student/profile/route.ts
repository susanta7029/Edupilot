import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

// GET returns user profile
export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.id as string;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        skills: true,
        careerGoal: true,
        studyTime: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT updates user profile details
export async function PUT(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = token.id as string;
    const { name, skills, careerGoal, avatar } = await req.json();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (skills && Array.isArray(skills)) updateData.skills = skills;
    if (careerGoal !== undefined) updateData.careerGoal = careerGoal;
    if (avatar) updateData.avatar = avatar;

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        skills: true,
        careerGoal: true,
        studyTime: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile update API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
