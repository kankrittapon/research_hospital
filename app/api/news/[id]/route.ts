import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { meiliClient, INDEX_NEWS } from "@/lib/meili";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const newsItem = await prisma.news.findUnique({
            where: { id },
        });

        if (!newsItem) {
            return NextResponse.json({ error: "News not found" }, { status: 404 });
        }

        return NextResponse.json(newsItem);
    } catch (error) {
        console.error("Error fetching news item:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();

        // Prevent updating ID
        delete data.id;
        delete data.createdAt;
        delete data.updatedAt;

        if (data.publishDate) {
            data.publishDate = new Date(data.publishDate);
        }

        const updatedNews = await prisma.news.update({
            where: { id },
            data,
        });

        // Sync with Meilisearch
        try {
            const index = meiliClient.index(INDEX_NEWS);
            if (updatedNews.published) {
                await index.updateDocuments([{
                    id: updatedNews.id,
                    title: updatedNews.title,
                    content: updatedNews.content,
                    publishDate: updatedNews.publishDate.toISOString(),
                    imageUrl: updatedNews.imageUrl
                }]);
            } else {
                // If unpublished, remove from index
                await index.deleteDocument(updatedNews.id);
            }
        } catch (error) {
            console.error("Meilisearch sync error:", error);
        }

        return NextResponse.json(updatedNews);
    } catch (error) {
        console.error("Error updating news:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.news.delete({
            where: { id },
        });

        // Remove from Meilisearch
        try {
            const index = meiliClient.index(INDEX_NEWS);
            await index.deleteDocument(id);
        } catch (error) {
            console.error("Meilisearch delete error:", error);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting news:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
