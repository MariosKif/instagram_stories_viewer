# 🚀 Quick Start - Deploy to Vercel

Your IGStoryPeek is ready to deploy to Vercel!

## One-Click Deploy

### Method 1: GitHub Integration (Easiest)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "Add New..." → "Project"**
3. **Import repository**: `MariosKif/instagram_stories_viewer`
4. **Click "Deploy"** - Vercel will auto-detect Astro! 🎉

That's it! Your site will be live in about 60 seconds.

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# For production
vercel --prod
```

## What You'll Get

- ✅ Custom Vercel domain: `your-project.vercel.app`
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions for your API
- ✅ Automatic deploys on every git push

## Your Deployed URLs

After deployment, your site will be available at:
- **Production**: `https://your-project.vercel.app`
- **Preview**: Each git push gets a preview URL

## Testing Locally (Optional)

Test your Vercel deployment locally before pushing:

```bash
npm run build
vercel dev
```

This starts a local server that mimics Vercel's production environment.

## Next Steps

1. ✨ **Deploy** (use Method 1 above)
2. 🎉 **Share your live URL**!
3. 🎨 **Add a custom domain** (optional)
4. 📊 **Monitor usage** in Vercel Dashboard

## Issues?

Check `DEPLOYMENT.md` for detailed troubleshooting, or check the logs in Vercel Dashboard → Functions tab.

---

**You're all set!** 🚀 Deploy now and your IGStoryPeek will be live!

