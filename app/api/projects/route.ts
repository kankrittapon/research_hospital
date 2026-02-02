import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description } = await request.json();

    if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Generate a simple code e.g. RES-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await prisma.project.count();
    const code = `RES-${year}-${String(count + 1).padStart(3, '0')}`;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        code,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const isAdmin = session.user.role === 'ADMIN';

        // Admin sees all, User sees own
        const projects = await prisma.project.findMany({
            where: isAdmin ? {} : { ownerId: session.user.id },
            include: { owner: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
