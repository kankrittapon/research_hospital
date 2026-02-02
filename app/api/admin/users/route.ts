import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// GET: Fetch all users
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Update user role
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const { id, role } = data;

        if (!id || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Prevent admin from downgrading themselves (safety check)
        if (id === session.user.id && role !== 'ADMIN') {
             // Optional: Allow purely self-destruction? Usually dangerous. 
             // Let's block it for safety unless explicitly needed.
             return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, name: true, role: true }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
