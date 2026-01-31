import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";
import { MeiliSearch } from 'meilisearch';

const meiliclient = new MeiliSearch({
    host: process.env.MEILI_HOST || 'http://localhost:7700',
    apiKey: process.env.MEILI_MASTER_KEY,
});

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // 1. Check Authentication & Role
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== "ADMIN" && userRole !== "EDITOR") {
            return NextResponse.json({ error: "Forbidden: You don't have permission to delete." }, { status: 403 });
        }

        const researchId = params.id;

        // 2. Get Research Data (to find file path)
        const research = await prisma.research.findUnique({
            where: { id: researchId },
        });

        if (!research) {
            return NextResponse.json({ error: "Research not found" }, { status: 404 });
        }

        // 3. Delete File from System
        if (research.filePath) {
            const absolutePath = path.join(process.cwd(), "public", research.filePath);
            try {
                await unlink(absolutePath);
                console.log(`Deleted file: ${absolutePath}`);
            } catch (err: any) {
                console.warn(`File not found or could not be deleted: ${absolutePath}`, err.message);
                // Continue execution even if file delete fails (maybe file was already gone)
            }
        }

        // 4. Delete from Meilisearch
        try {
            await meiliclient.index('research').deleteDocument(researchId);
        } catch (error) {
            console.error("Meilisearch delete error:", error);
        }

        // 5. Delete from Database
        await prisma.research.delete({
            where: { id: researchId },
        });

        return NextResponse.json({ success: true, message: "Research deleted successfully" });

    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
