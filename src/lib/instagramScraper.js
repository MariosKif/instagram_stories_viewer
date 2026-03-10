const SCRAPER_API_HOST = 'instagram-scraper-stable-api.p.rapidapi.com';
const FALLBACK_RAPIDAPI_KEY = '663ef24eedmsha6824f05f5bee0bp1c071bjsnef3779a17b07';

function resolveApiKey() {
    if (typeof process !== 'undefined' && process.env?.RAPIDAPI_KEY) {
        return process.env.RAPIDAPI_KEY;
    }
    if (typeof import.meta !== 'undefined' && import.meta.env?.RAPIDAPI_KEY) {
        return import.meta.env.RAPIDAPI_KEY;
    }
    return '';
}

function requireApiKey() {
    const key = resolveApiKey();
    if (key) {
        return key;
    }
    console.warn('[instagramScraper] RAPIDAPI_KEY not set. Falling back to baked-in key.');
    return FALLBACK_RAPIDAPI_KEY;
}

export const SCRAPER_ENDPOINTS = {
    search: 'https://instagram-scraper-stable-api.p.rapidapi.com/search_ig.php',
    posts: 'https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_posts.php',
    stories: 'https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_stories.php',
    highlights: 'https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_highlights.php',
    highlightStories: 'https://instagram-scraper-stable-api.p.rapidapi.com/get_highlights_stories.php'
};

function resolveEndpoint(endpointKeyOrUrl) {
    if (!endpointKeyOrUrl) {
        throw new Error('Missing endpoint for scraper request');
    }

    if (SCRAPER_ENDPOINTS[endpointKeyOrUrl]) {
        return SCRAPER_ENDPOINTS[endpointKeyOrUrl];
    }

    return endpointKeyOrUrl;
}

export async function makeScraperRequest(endpointKeyOrUrl, params = {}) {
    try {
        const endpoint = resolveEndpoint(endpointKeyOrUrl);
        const body = new URLSearchParams(params);
        const apiKey = requireApiKey();

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-rapidapi-host': SCRAPER_API_HOST,
                'x-rapidapi-key': apiKey
            },
            body
        });

        if (!response.ok) {
            throw new Error(`Scraper API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data?.error) {
            throw new Error(`Scraper API error: ${data.error}`);
        }

        if (data?.message) {
            throw new Error(`Scraper API message: ${data.message}`);
        }

        return data;
    } catch (error) {
        console.error('Scraper request error:', error);
        throw error;
    }
}

export function getScraperApiKey() {
    return resolveApiKey();
}

