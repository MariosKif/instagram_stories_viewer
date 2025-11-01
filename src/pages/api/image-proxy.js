export async function GET({ request, url }) {
    try {
        const imageUrl = url.searchParams.get('url');
        
        if (!imageUrl) {
            return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate that it's an Instagram URL
        if (!imageUrl.includes('instagram') && !imageUrl.includes('fbcdn.net') && !imageUrl.includes('picsum.photos')) {
            return new Response(JSON.stringify({ error: 'Invalid media URL' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`Proxying media: ${imageUrl}`);
        
        const response = await fetch(imageUrl, {
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
            console.error(`Media proxy failed for ${imageUrl}: ${response.status} ${response.statusText}`);
            // Return a placeholder response instead of failing
            return new Response(JSON.stringify({
                error: 'Media blocked by Instagram',
                placeholder: true,
                originalUrl: imageUrl
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const mediaBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        
        return new Response(mediaBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Accept-Ranges': 'bytes' // Enable range requests for video streaming
            }
        });
    } catch (error) {
        console.error('Media proxy error:', error);
        return new Response(JSON.stringify({ error: 'Failed to proxy media' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

