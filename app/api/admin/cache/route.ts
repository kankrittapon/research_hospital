import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const { path, type } = data;

        // Default to clearing everything useful if no path provided
        // or just "/" for layout
        const targetPath = path || "/";
        const revalidateType = type || "layout"; // 'page' or 'layout'

        revalidatePath(targetPath, revalidateType);
        
        // Also revalidate dashboard to see changes
        revalidatePath("/dashboard");

        console.log(`Cache cleared for: ${targetPath} (${revalidateType})`);

        return NextResponse.json({ success: true, message: `Cache cleared for ${targetPath}` });
    } catch (error) {
        console.error("Cache clear error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
