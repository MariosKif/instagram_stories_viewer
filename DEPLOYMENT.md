# Deployment Guide for Vercel

This guide will help you deploy the Instagram Stories Viewer to Vercel.

## Prerequisites

1. A Vercel account (free tier is sufficient)
2. GitHub repository pushed to your account
3. A RapidAPI account with Instagram API access

## Quick Deploy

### Option 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub** (already done ✅)
   
2. **Go to Vercel.com** and sign in with GitHub

3. **Click "Add New..." → "Project"**

4. **Import your GitHub repository**
   - Select `MariosKif/instagram_stories_viewer`
   - Vercel will auto-detect Astro

5. **Configure the project:**
   - **Framework Preset**: Astro (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. **Add Environment Variables** (if needed):
   - Currently, the RapidAPI key is hardcoded in the code
   - For production, you should move it to environment variables:
     - `RAPIDAPI_KEY`: `663ef24eedmsha6824f05f5bee0bp1c071bjsnef3779a17b07`
     - `RAPIDAPI_HOST`: `instagram120.p.rapidapi.com`

7. **Click "Deploy"**

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? No (first time)
   - What's your project's name? instagram-stories-viewer
   - In which directory is your code located? ./
   - Want to override the settings? No

5. **Production deploy**:
   ```bash
   vercel --prod
   ```

## Environment Variables

For better security, move the RapidAPI key to environment variables:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - `RAPIDAPI_KEY`: Your RapidAPI key
   - `RAPIDAPI_HOST`: `instagram120.p.rapidapi.com`

Then update the API route files to use:
```javascript
key: import.meta.env.RAPIDAPI_KEY,
```

## What's Configured

✅ Astro output set to 'server' mode  
✅ Vercel adapter installed  
✅ API routes created:
- `/api/full/[username]` - Main data fetching endpoint
- `/api/image-proxy` - Media proxy for images/videos  
✅ Relative URLs in frontend (no more localhost:3001)  
✅ Cache system (20-minute TTL)  
✅ CORS handling  

## Testing Locally

Test the serverless build locally before deploying:

```bash
npm run build
vercel dev
```

This will start a local development server that mimics Vercel's production environment.

## Important Notes

⚠️ **RapidAPI Key**: Currently hardcoded in the API routes. Move to environment variables for production!

⚠️ **Cache**: The in-memory cache will be per-instance in Vercel's serverless environment. Consider using Vercel KV or another cache for production scaling.

⚠️ **Rate Limits**: Make sure your RapidAPI subscription can handle the expected traffic.

## Troubleshooting

### Build Fails
- Check that `@astrojs/vercel` is installed
- Ensure `astro.config.mjs` has `output: 'server'` and `adapter: vercel()`

### API Routes Not Working
- Make sure API files are in `src/pages/api/`
- Check Vercel function logs in the dashboard
- Verify RapidAPI key is valid

### Images Not Loading
- Check that `/api/image-proxy` route is accessible
- Verify CORS headers in the proxy function
- Check browser console for errors

## Custom Domain

After deployment:

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update the DNS records as instructed

## Monitoring

Monitor your deployment:
- **Logs**: Vercel Dashboard → Deployments → Click deployment → Functions
- **Analytics**: Vercel Dashboard → Analytics
- **Speed Insights**: Automatic Core Web Vitals tracking

## Next Steps

After successful deployment:
1. Test all features on production
2. Set up environment variables for the API key
3. Configure a custom domain
4. Monitor usage and costs
5. Set up error tracking (e.g., Sentry)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check function logs in Vercel dashboard
3. Verify environment variables are set correctly
4. Check RapidAPI quota/usage

