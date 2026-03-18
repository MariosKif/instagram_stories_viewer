import { makeScraperRequest } from '../../../lib/instagramScraper.js';
import { getCachedApiData, setCachedApiData, getSearchCache } from '../../../lib/apiCache.ts';

export async function GET({ params }) {
    try {
        const cleanUsername = params.username.replace(/^@/, '').replace(/\/$/, '');

        // Check searchCache first
        const searchCached = await getSearchCache(cleanUsername);
        if (searchCached?.stories) {
            return new Response(JSON.stringify({ success: true, data: searchCached.stories }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check per-type apiCache
        const cached = await getCachedApiData(cleanUsername, 'stories');
        if (cached) {
            return new Response(JSON.stringify({ success: true, data: cached }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fetch from RapidAPI
        const data = await makeScraperRequest('stories', { username_or_url: cleanUsername });

        // Only cache if valid (no error/message)
        if (data && !data.error && !data.message) {
            setCachedApiData(cleanUsername, 'stories', data);
        }

        return new Response(JSON.stringify({ success: true, data }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Stories endpoint error:', error);
        return new Response(JSON.stringify({
            success: false, error: error.message || 'Failed to fetch stories'
        }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }
}
