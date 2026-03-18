import { makeScraperRequest } from '../../../lib/instagramScraper.js';
import { getCachedApiData, setCachedApiData } from '../../../lib/apiCache.ts';

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

        // Check Firestore cache
        const cacheKey = `highlight_${highlightId}`;
        const cached = await getCachedApiData(cacheKey, 'highlightStories');
        if (cached) {
            console.log(`✓ Serving cached highlight: ${highlightId}`);
            return new Response(JSON.stringify(cached), {
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

        // Write to Firestore cache (fire-and-forget)
        setCachedApiData(cacheKey, 'highlightStories', responsePayload);

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
