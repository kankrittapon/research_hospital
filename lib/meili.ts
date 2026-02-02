import { MeiliSearch } from 'meilisearch';

export const INDEX_NEWS = 'news';
export const INDEX_RESEARCH = 'research';

// Singleton client to avoid multiple connections in dev mode
const globalForMeili = global as unknown as { meiliClient: MeiliSearch };

export const meiliClient =
    globalForMeili.meiliClient ||
    new MeiliSearch({
        host: process.env.MEILI_HOST || 'http://localhost:7700',
        apiKey: process.env.MEILI_MASTER_KEY,
    });

if (process.env.NODE_ENV !== 'production') globalForMeili.meiliClient = meiliClient;
