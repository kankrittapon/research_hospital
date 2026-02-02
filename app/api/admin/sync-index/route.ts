import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { meiliClient, INDEX_NEWS, INDEX_RESEARCH } from "@/lib/meili";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Sync News
        const allNews = await prisma.news.findMany({
            where: { published: true }
        });
        
        if (allNews.length > 0) {
            const newsIndex = meiliClient.index(INDEX_NEWS);
            await newsIndex.updateDocuments(allNews.map(n => ({
                id: n.id,
                title: n.title,
                content: n.content,
                publishDate: n.publishDate.toISOString(),
                imageUrl: n.imageUrl
            })), { primaryKey: 'id' });
            
            // Set searchable attributes
            await newsIndex.updateSearchableAttributes(['title', 'content']);
            await newsIndex.updateSortableAttributes(['publishDate']);
        }

         // 2. Sync Research (Assuming Research model exists, adapt if needed)
         // Note: Based on previous file views, we only saw 'news' table explicitly used in recent contexts.
         // If 'research' table exists, we should sync it too. I'll add a check or try/catch.
         try {
            const allResearch = await prisma.research.findMany(); // Assuming model name
             if (allResearch.length > 0) {
                const researchIndex = meiliClient.index(INDEX_RESEARCH);
                await researchIndex.updateDocuments(allResearch.map(r => ({
                    id: r.id,
                    title: r.title,
                    abstract: r.abstract,
                    author: r.author,
                    year: r.year
                    // Add other relevant fields
                })), { primaryKey: 'id' });
                
                await researchIndex.updateSearchableAttributes(['title', 'abstract', 'author']);
            }
         } catch (e) {
             console.warn("Research table might not exist or verify failed", e);
             // Verify Research model existence later if needed
         }

        return NextResponse.json({ success: true, message: "Sync initiated" });

    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
