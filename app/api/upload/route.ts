import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { MeiliSearch } from 'meilisearch';


const meiliclient = new MeiliSearch({
    host: process.env.MEILI_HOST || 'http://localhost:7700',
    apiKey: process.env.MEILI_MASTER_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;
        const title = data.get("title") as string;
        const author = data.get("author") as string;
        const abstract = data.get("abstract") as string;
        const dateStr = data.get("date") as string;

        if (!file || !title || !dateStr) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const publicationDate = new Date(dateStr);
        const year = publicationDate.getFullYear();
        const month = publicationDate.getMonth() + 1; // 0-indexed
        const day = publicationDate.getDate();

        // 1. Defind storage path: public/uploads/YYYY/MM/DD/
        const uploadDir = path.join(process.cwd(), "public", "uploads", `${year}`, `${month}`, `${day}`);

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // 2. Save File
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename to prevent issues
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = path.join(uploadDir, sanitizedFilename);
        const relativePath = `/uploads/${year}/${month}/${day}/${sanitizedFilename}`;

        await writeFile(filePath, buffer);

        // 3. Save to Database (Prisma)
        const researchRecord = await prisma.research.create({
            data: {
                title,
                author,
                abstract,
                publicationDate,
                filePath: relativePath,
                year,
                month,
                tags: [], // Can implement tags later
            },
        });

        // 4. Index in Meilisearch (Async)
        // We don't await this to speed up response, or we can use a queue
        meiliclient.index('research').addDocuments([{
            id: researchRecord.id,
            title: researchRecord.title,
            author: researchRecord.author,
            abstract: researchRecord.abstract,
            year: researchRecord.year,
            month: researchRecord.month,
            publicationDate: researchRecord.publicationDate.toISOString(),
            filePath: researchRecord.filePath,
        }]).catch(console.error);

        return NextResponse.json({ success: true, id: researchRecord.id });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
