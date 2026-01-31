import { NextRequest, NextResponse } from "next/server";
import { MeiliSearch } from 'meilisearch';

const meiliclient = new MeiliSearch({
    host: process.env.MEILI_HOST || 'http://localhost:7700',
    apiKey: process.env.MEILI_MASTER_KEY,
});

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ hits: [] });
    }

    try {
        const index = meiliclient.index('research');
        const searchResults = await index.search(query, {
            limit: 10,
            attributesToHighlight: ['title', 'abstract'],
        });

        return NextResponse.json(searchResults);

    } catch (error) {
        console.error("Meilisearch error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
