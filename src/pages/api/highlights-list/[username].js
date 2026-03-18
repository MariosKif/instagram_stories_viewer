import { makeScraperRequest } from '../../../lib/instagramScraper.js';
import { getCachedApiData, setCachedApiData, getSearchCache } from '../../../lib/apiCache.ts';

export async function GET({ params }) {
    try {
        const cleanUsername = params.username.replace(/^@/, '').replace(/\/$/, '');

        // Check searchCache first
        const searchCached = await getSearchCache(cleanUsername);
        if (searchCached?.highlights) {
            return new Response(JSON.stringify({ success: true, data: searchCached.highlights }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check per-type apiCache
        const cached = await getCachedApiData(cleanUsername, 'highlights');
        if (cached) {
            return new Response(JSON.stringify({ success: true, data: cached }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fetch from RapidAPI
        const data = await makeScraperRequest('highlights', { username_or_url: cleanUsername });

        setCachedApiData(cleanUsername, 'highlights', data);

        return new Response(JSON.stringify({ success: true, data }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Highlights-list endpoint error:', error);
        return new Response(JSON.stringify({
            success: false, error: error.message || 'Failed to fetch highlights'
        }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }
}
