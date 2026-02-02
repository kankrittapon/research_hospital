import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { meiliClient, INDEX_NEWS } from "@/lib/meili";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const onlyPublished = searchParams.get("published") === "true";

        const whereClause = onlyPublished ? { published: true } : {};

        const news = await prisma.news.findMany({
            where: whereClause,
            orderBy: { publishDate: "desc" },
        });

        return NextResponse.json(news);
    } catch (error) {
        console.error("Error fetching news:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        
        // Basic validation
        if (!data.title || !data.content) {
             return NextResponse.json({ error: "Title and Content are required" }, { status: 400 });
        }

        const news = await prisma.news.create({
            data: {
                title: data.title,
                content: data.content,
                imageUrl: data.imageUrl,
                published: data.published ?? true,
                publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
            },
        });

        // Index to Meilisearch
        try {
            if (news.published) {
                const index = meiliClient.index(INDEX_NEWS);
                await index.addDocuments([{
                    id: news.id,
                    title: news.title,
                    content: news.content,
                    publishDate: news.publishDate.toISOString(),
                    imageUrl: news.imageUrl
                }]);
            }
        } catch (error) {
            console.error("Meilisearch indexing error:", error);
            // Don't fail the request if indexing fails, just log it
        }

        return NextResponse.json(news, { status: 201 });
    } catch (error) {
        console.error("Error creating news:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
