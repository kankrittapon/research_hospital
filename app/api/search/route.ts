import { NextRequest, NextResponse } from "next/server";
import { meiliClient, INDEX_RESEARCH, INDEX_NEWS } from "@/lib/meili";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ hits: [] });
    }

    try {
        const researchIndex = meiliClient.index(INDEX_RESEARCH);
        const newsIndex = meiliClient.index(INDEX_NEWS);

        const [researchResults, newsResults] = await Promise.all([
            researchIndex.search(query, {
                limit: 5,
                attributesToHighlight: ['title', 'abstract'],
            }),
            newsIndex.search(query, {
                limit: 5,
                attributesToHighlight: ['title', 'content'],
            })
        ]);

        const combinedHits = [
            ...researchResults.hits.map(hit => ({ ...hit, type: 'research' })),
            ...newsResults.hits.map(hit => ({ ...hit, type: 'news' }))
        ];

        return NextResponse.json({ hits: combinedHits });

    } catch (error) {
        console.error("Meilisearch error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
