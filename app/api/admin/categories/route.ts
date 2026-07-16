import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

// GET lists all categories
export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const categories = await db.category.findMany({
      include: {
        _count: {
          select: { courses: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST creates a new category
export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, slug, description } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ error: "Missing name or slug parameters" }, { status: 400 });
    }

    const slugLower = slug.toLowerCase().replace(/\s+/g, "-");

    const existing = await db.category.findUnique({
      where: { slug: slugLower },
    });

    if (existing) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 400 });
    }

    const category = await db.category.create({
      data: {
        name,
        slug: slugLower,
        description,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT updates an existing category
export async function PUT(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "edu-pilot-super-secret-key-12345" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, name, slug, description } = await req.json();
    if (!id || !name || !slug) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const slugLower = slug.toLowerCase().replace(/\s+/g, "-");

    const category = await db.category.update({
      where: { id },
      data: {
        name,
        slug: slugLower,
        description,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE removes a category
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

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
