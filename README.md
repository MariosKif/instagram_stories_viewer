# 🚀 IGStoryPeek - Instagram Content Viewer

A modern Instagram content viewer powered by RapidAPI that provides access to Instagram profiles, posts, stories, and highlights through a clean, fast interface.

## ✨ Features

### ✅ What This CAN Do:
- **View Public Profiles** - Display profile information, bio, follower count
- **Show Public Posts** - Display recent posts with images and captions
- **Profile Statistics** - Follower count, following count, post count
- **Post Interactions** - Like count, comment count
- **Video Support** - Identify and display video posts
- **Stories Access** - View Instagram stories (when available)
- **Highlights Access** - View Instagram highlights
- **Responsive Design** - Works on all devices
- **Real-time Data** - Live data from Instagram profiles

### 🔧 Technical Features:
- **RapidAPI Integration** - Professional API service
- **Astro Framework** - Ultra-fast static site generation
- **Express.js Backend** - Robust API server
- **Real Instagram Data** - Direct access to Instagram content
- **Error Handling** - Graceful fallbacks and error messages

## 🛠️ How It Works

### 1. **RapidAPI Instagram API (Primary Method)**
```javascript
// Uses RapidAPI Instagram service for reliable data access
const response = await fetch('https://instagram120.p.rapidapi.com/api/instagram/posts', {
    method: 'POST',
    headers: {
        'x-rapidapi-host': 'instagram120.p.rapidapi.com',
        'x-rapidapi-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({ username: 'instagram' })
});
```

### 2. **Multiple Data Endpoints**
- **Profile Data** - User info, stats, bio
- **Posts Data** - Recent posts with media
- **Stories Data** - Active stories
- **Highlights Data** - Story highlights

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Internet connection
- RapidAPI account (for production)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd instagram_stories_viewer
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the backend server**
```bash
npm run server
# OR
node server.mjs
```

4. **Start the frontend**
```bash
npm run dev
```

5. **Open your browser**
```
Frontend: http://localhost:4321
Backend:  http://localhost:3001
```

## 📱 Usage

### Search for Profiles:
1. Open `http://localhost:4321`
2. Enter any Instagram username in the search bar
3. Wait for the 15-second countdown (allows data to load)
4. View profile data, posts, stories, and highlights
5. Click on content to view on Instagram

### Example Searches:
- `instagram` - Official Instagram account
- `natgeo` - National Geographic
- `cristiano` - Cristiano Ronaldo
- Any public Instagram username

## 🔧 API Endpoints

### Backend API (Port 3001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/profile/:username` | GET | Get profile data |
| `/api/posts/:username` | GET | Get posts data |
| `/api/stories/:username` | GET | Get stories data |
| `/api/highlights/:username` | GET | Get highlights data |
| `/api/full/:username` | GET | Get complete data (all above) |

### Example API Call
```bash
curl "http://localhost:3001/api/full/instagram"
```

### Response Format
```json
{
  "success": true,
  "data": {
    "username": "instagram",
    "profile": {
      "data": {
        "user": {
          "username": "instagram",
          "full_name": "Instagram",
          "biography": "Bringing you closer to the people and things you love. ❤️",
          "profile_pic_url": "https://instagram.fsub8-1.fna.fbcdn.net/..."
        },
        "edge_owner_to_timeline_media": {
          "count": 12
        },
        "edge_followed_by": {
          "count": 500000000
        },
        "edge_follow": {
          "count": 1
        }
      }
    },
    "posts": {
      "data": {
        "edge_owner_to_timeline_media": {
          "edges": [
            {
              "node": {
                "code": "ABC123",
                "caption": "Welcome to Instagram!",
                "image_versions2": {
                  "candidates": [
                    {
                      "url": "https://instagram.fsub8-1.fna.fbcdn.net/..."
                    }
                  ]
                },
                "media_type": 1,
                "like_count": 1250000,
                "comment_count": 45000
              }
            }
          ]
        }
      }
    },
    "stories": {
      "data": {
        "reels_media": []
      }
    },
    "highlights": {
      "data": {
        "result": []
      }
    }
  }
}
```

## 🏗️ Architecture

```
Frontend (Astro)          Backend (Express)          RapidAPI
┌─────────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Search UI     │─────▶│  Profile API     │─────▶│ Instagram   │
│   Profile View  │      │  Posts API       │      │ API Service │
│   Posts Grid    │      │  Stories API     │      │             │
│   Stories View  │      │  Highlights API  │      │             │
│   Responsive    │      │  Error Handling  │      │             │
└─────────────────┘      └──────────────────┘      └─────────────┘
```

## 🔒 Legal Compliance

### ✅ Legal Methods Used:
- **RapidAPI Service** - Professional API service with proper licensing
- **Public Data Only** - Only accesses publicly available information
- **Rate Limited** - Respects API rate limits
- **Terms Compliant** - Uses licensed API services

### ⚠️ Important Notes:
- **API Key Required** - Uses RapidAPI subscription
- **Rate Limited** - Subject to API usage limits
- **Public Profiles Only** - Cannot access private accounts
- **Data Accuracy** - Real-time data from Instagram

## 🚨 Limitations

### API Restrictions:
1. **Rate Limiting** - Limited requests per subscription tier
2. **Private Content** - Only public profiles accessible
3. **Data Availability** - Some data may not be available for all profiles
4. **Subscription Required** - RapidAPI subscription needed for production

### Technical Limitations:
1. **API Dependencies** - Relies on RapidAPI service availability
2. **Error Handling** - May fail if API is unavailable
3. **Data Freshness** - Data depends on API update frequency

## 🛡️ Security & Privacy

### Data Handling:
- **No Storage** - Data is not stored permanently
- **API Key Security** - API key stored securely
- **Public Data Only** - Only accesses public information
- **No Personal Data** - No private information accessed

### Rate Limiting:
- **API Limits** - Respects RapidAPI rate limits
- **Error Handling** - Gracefully handles API errors
- **Fallback Handling** - Handles API unavailability

## 🔧 Development

### Project Structure:
```
instagram_stories_viewer/
├── src/
│   └── pages/
│       └── index.astro          # Main frontend page
├── public/
│   ├── favicon.svg              # Site favicon
│   ├── robots.txt               # SEO robots file
│   └── sitemap.xml              # SEO sitemap
├── server.mjs                   # RapidAPI backend server
├── package.json                 # Dependencies
├── astro.config.mjs             # Astro configuration
└── README.md                    # This file
```

### Available Scripts:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run server       # Start RapidAPI backend
```

## 🌟 Features in Detail

### Profile View:
- **Profile Picture** - High-resolution profile image
- **Username & Name** - Display name and username
- **Bio** - Profile description
- **Statistics** - Followers, following, posts count
- **Verification Badge** - Shows verified accounts

### Posts Grid:
- **Image Posts** - High-quality images
- **Video Posts** - Video thumbnails with play button
- **Post Stats** - Like and comment counts
- **Click to View** - Opens post on Instagram
- **Responsive Layout** - Adapts to screen size

### Stories & Highlights:
- **Stories View** - Active stories when available
- **Highlights View** - Story highlights
- **Interactive Elements** - Click to view content

### Interactive Elements:
- **Search Bar** - Enter any Instagram username
- **Loading States** - Shows progress during data fetching
- **Error Handling** - Graceful error messages
- **Tab Navigation** - Switch between posts, stories, highlights

## 🚀 Deployment

### Frontend (Static Hosting):
```bash
npm run build
# Deploy dist/ folder to any static hosting service
```

### Backend (Server Required):
```bash
# Deploy server.mjs to a Node.js hosting service
# Examples: Vercel, Netlify Functions, Heroku, DigitalOcean
# Don't forget to set up your RapidAPI key as an environment variable
```

## 📊 Performance

### Frontend:
- **Astro Framework** - Ultra-fast static site generation
- **Optimized Images** - Lazy loading and responsive images
- **Minimal JavaScript** - Fast loading and interaction
- **CDN Ready** - Can be served from any CDN

### Backend:
- **Express.js** - Fast and lightweight server
- **RapidAPI Integration** - Professional API service
- **Error Handling** - Robust error management
- **Parallel Requests** - Efficient data fetching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## ⚠️ Disclaimer

This project uses RapidAPI's Instagram service for accessing public Instagram data. Users are responsible for complying with Instagram's Terms of Service, RapidAPI's terms, and applicable laws.

## 🆘 Support

If you encounter issues:
1. Check that both frontend and backend are running
2. Verify the backend is accessible at `http://localhost:3001`
3. Check that your RapidAPI key is valid
4. Check browser console for error messages
5. Verify the Instagram username exists and is public

## 🎯 Next Steps

To extend this project:
1. **Add Caching** - Cache responses to reduce API calls
2. **Add Authentication** - Optional user accounts
3. **Add More Features** - Comments, likes, etc.
4. **Improve UI** - Better design and animations
5. **Add Analytics** - Track usage and performance

---

**Built with ❤️ using Astro, Express.js, and RapidAPI Instagram service**