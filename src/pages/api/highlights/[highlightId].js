import { makeScraperRequest } from '../../../lib/instagramScraper.js';

const highlightCache = new Map();
const CACHE_TTL = 20 * 60 * 1000;

export async function GET({ params }) {
    try {
        const encodedId = params.highlightId;
        const highlightId = decodeURIComponent(encodedId || '').trim();

        if (!highlightId) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Highlight ID is required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const cacheKey = `highlight:${highlightId}`;
        const cached = highlightCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return new Response(JSON.stringify(cached.data), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const highlightData = await makeScraperRequest('highlightStories', {
            highlight_id: highlightId
        });

        const responsePayload = {
            success: true,
            data: {
                ...highlightData,
                highlightId
            }
        };

        highlightCache.set(cacheKey, {
            data: responsePayload,
            timestamp: Date.now()
        });

        return new Response(JSON.stringify(responsePayload), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Highlight stories endpoint error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Failed to fetch highlight stories'
        }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}


