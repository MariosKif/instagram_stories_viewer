/**
 * DEPRECATED: This server is for local development only.
 * Production deployment uses Vercel serverless functions in src/pages/api/
 * 
 * To run locally:
 *   npm run server
 *   
 * For production deployment to Vercel, this file is ignored.
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Cache system with 20-minute TTL
const cache = new Map();
const CACHE_TTL = 20 * 60 * 1000; // 20 minutes in milliseconds

// Clean up expired cache entries every 20 minutes
setInterval(() => {
    const now = Date.now();
    const keysToDelete = [];
    cache.forEach((value, key) => {
        if (now - value.timestamp > CACHE_TTL) {
            keysToDelete.push(key);
        }
    });
    keysToDelete.forEach(key => cache.delete(key));
    if (keysToDelete.length > 0) {
        console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
    }
}, 20 * 60 * 1000); // Check every 20 minutes

// RapidAPI Instagram API configuration
const RAPIDAPI_CONFIG = {
    host: 'instagram120.p.rapidapi.com',
    key: '663ef24eedmsha6824f05f5bee0bp1c071bjsnef3779a17b07',
    baseUrl: 'https://instagram120.p.rapidapi.com/api/instagram'
};

// Helper function to make RapidAPI requests
async function makeRapidAPIRequest(endpoint, data = {}) {
    try {
        const response = await fetch(`${RAPIDAPI_CONFIG.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': RAPIDAPI_CONFIG.host,
                'x-rapidapi-key': RAPIDAPI_CONFIG.key
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('RapidAPI request error:', error);
        throw error;
    }
}

// Get posts for a username
async function getPosts(username, maxId = '') {
    try {
        console.log(`Fetching posts for: ${username}`);
        
        const data = await makeRapidAPIRequest('/posts', {
            username: username,
            maxId: maxId
        });

        console.log(`Successfully fetched posts for: ${username}`);
        return data;
    } catch (error) {
        console.error(`Error fetching posts for ${username}:`, error);
        throw error;
    }
}

// Get profile information for a username
async function getProfile(username) {
    try {
        console.log(`Fetching profile for: ${username}`);
        
        const data = await makeRapidAPIRequest('/profile', {
            username: username
        });

        console.log(`Successfully fetched profile for: ${username}`);
        return data;
    } catch (error) {
        console.error(`Error fetching profile for ${username}:`, error);
        throw error;
    }
}

// Get stories for a username
async function getStories(username) {
    try {
        console.log(`Fetching stories for: ${username}`);
        
        const data = await makeRapidAPIRequest('/stories', {
            username: username
        });

        console.log(`Successfully fetched stories for: ${username}`);
        return data;
    } catch (error) {
        console.error(`Error fetching stories for ${username}:`, error);
        throw error;
    }
}

// Get highlights for a username
async function getHighlights(username) {
    try {
        console.log(`Fetching highlights for: ${username}`);
        
        const data = await makeRapidAPIRequest('/highlights', {
            username: username
        });

        console.log(`Successfully fetched highlights for: ${username}`);
        return data;
    } catch (error) {
        console.error(`Error fetching highlights for ${username}:`, error);
        throw error;
    }
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Instagram API server is running',
        timestamp: new Date().toISOString()
    });
});

// Get profile data
app.get('/api/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const cleanUsername = username.replace(/^@/, '').replace(/\/$/, '');

        const profileData = await getProfile(cleanUsername);
        
        res.json({
            success: true,
            data: profileData
        });
    } catch (error) {
        console.error('Profile endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch profile data'
        });
    }
});

// Get posts data
app.get('/api/posts/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { maxId } = req.query;
        const cleanUsername = username.replace(/^@/, '').replace(/\/$/, '');

        const postsData = await getPosts(cleanUsername, maxId || '');
        
        res.json({
            success: true,
            data: postsData
        });
    } catch (error) {
        console.error('Posts endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch posts data'
        });
    }
});

// Get stories data
app.get('/api/stories/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const cleanUsername = username.replace(/^@/, '').replace(/\/$/, '');

        const storiesData = await getStories(cleanUsername);
        
        res.json({
            success: true,
            data: storiesData
        });
    } catch (error) {
        console.error('Stories endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch stories data'
        });
    }
});

// Get highlights data
app.get('/api/highlights/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const cleanUsername = username.replace(/^@/, '').replace(/\/$/, '');

        const highlightsData = await getHighlights(cleanUsername);
        
        res.json({
            success: true,
            data: highlightsData
        });
    } catch (error) {
        console.error('Highlights endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch highlights data'
        });
    }
});

// Get complete profile data (profile + posts + stories + highlights)
app.get('/api/full/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const cleanUsername = username.replace(/^@/, '').replace(/\/$/, '');
        
        // Check cache first
        const cacheKey = `full:${cleanUsername}`;
        const cached = cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            console.log(`✓ Serving cached data for: ${cleanUsername}`);
            return res.json(cached.data);
        }

        console.log(`Starting complete data fetch for: ${cleanUsername}`);

        // Fetch all data in parallel
        const [profileData, postsData, storiesData, highlightsData] = await Promise.allSettled([
            getProfile(cleanUsername),
            getPosts(cleanUsername),
            getStories(cleanUsername),
            getHighlights(cleanUsername)
        ]);

        // Combine results
        const result = {
            success: true,
            data: {
                username: cleanUsername,
                profile: profileData.status === 'fulfilled' ? profileData.value : null,
                posts: postsData.status === 'fulfilled' ? postsData.value : null,
                stories: storiesData.status === 'fulfilled' ? storiesData.value : null,
                highlights: highlightsData.status === 'fulfilled' ? highlightsData.value : null
            }
        };

        // Log any failed requests
        if (profileData.status === 'rejected') {
            console.error('Profile fetch failed:', profileData.reason);
        }
        if (postsData.status === 'rejected') {
            console.error('Posts fetch failed:', postsData.reason);
        }
        if (storiesData.status === 'rejected') {
            console.error('Stories fetch failed:', storiesData.reason);
        }
        if (highlightsData.status === 'rejected') {
            console.error('Highlights fetch failed:', highlightsData.reason);
        }

        // Cache the result
        cache.set(cacheKey, { data: result, timestamp: Date.now() });
        console.log(`✓ Cached data for: ${cleanUsername}`);
        
        res.json(result);
    } catch (error) {
        console.error('Full data endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch complete data'
        });
    }
});

// Media proxy endpoint to bypass CORS (images and videos)
app.get('/api/image-proxy', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Validate that it's an Instagram URL
        if (!url.includes('instagram') && !url.includes('fbcdn.net') && !url.includes('picsum.photos')) {
            return res.status(400).json({ error: 'Invalid media URL' });
        }

        console.log(`Proxying media: ${url}`);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/*,video/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.instagram.com/',
                'Origin': 'https://www.instagram.com',
                'Sec-Fetch-Dest': 'media',
                'Sec-Fetch-Mode': 'no-cors',
                'Sec-Fetch-Site': 'cross-site',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            console.error(`Media proxy failed for ${url}: ${response.status} ${response.statusText}`);
            // Return a placeholder response instead of failing
            return res.status(200).json({
                error: 'Media blocked by Instagram',
                placeholder: true,
                originalUrl: url
            });
        }

        const mediaBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        
        res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Accept-Ranges': 'bytes' // Enable range requests for video streaming
        });
        
        res.send(Buffer.from(mediaBuffer));
    } catch (error) {
        console.error('Media proxy error:', error);
        res.status(500).json({ error: 'Failed to proxy media' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Instagram API server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log(`  GET /api/health - Health check`);
    console.log(`  GET /api/profile/:username - Get profile data`);
    console.log(`  GET /api/posts/:username - Get posts data`);
    console.log(`  GET /api/stories/:username - Get stories data`);
    console.log(`  GET /api/highlights/:username - Get highlights data`);
    console.log(`  GET /api/full/:username - Get complete data`);
    console.log(`  GET /api/image-proxy?url=<image_url> - Proxy images to bypass CORS`);
    console.log(`\nUsing RapidAPI Instagram API`);
});