import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email: emailLower,
        password: hashedPassword,
        role: "STUDENT",
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
