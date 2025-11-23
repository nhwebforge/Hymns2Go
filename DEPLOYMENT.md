# Vercel Deployment Checklist

## ✅ Completed

### Critical Security Fixes
- [x] Removed DATABASE_URL from next.config.ts (was exposing credentials)
- [x] Verified .env not tracked in git
- [x] Added security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

### Production Optimizations
- [x] Enabled compression in Next.js config
- [x] Removed X-Powered-By header
- [x] Configured image optimization (AVIF, WebP)
- [x] Added Node.js version requirement (>=20.0.0)
- [x] Updated SEO metadata in root layout

### TypeScript Configuration
- [x] Fixed exclude patterns (scripts, .js, .sh files)
- [x] Excluded build artifacts (.next, out, prisma/migrations)

### Database Performance
- [x] Added indexes on createdAt, updatedAt
- [x] Added index on Tag.name

## ⚠️ Required Before Deployment

### Environment Variables in Vercel Dashboard
Set these in Vercel Project Settings → Environment Variables:

```env
DATABASE_URL=postgresql://neondb_owner:npg_C8BgDSPs4ule@ep-noisy-queen-ab3b69q6-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://neondb_owner:npg_C8BgDSPs4ule@ep-noisy-queen-ab3b69q6-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
AUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_URL_INTERNAL=https://your-domain.vercel.app
```

### Database Migration
Run Prisma migrations on production database:

```bash
# In Vercel dashboard, under Settings → Build & Development
# Add this as a build command override (one time only):
npx prisma migrate deploy && prisma generate && next build
```

## 📋 Post-Deployment Checklist

### Testing
- [ ] Visit homepage - verify it loads
- [ ] Test search functionality
- [ ] Download a hymn in each format (PowerPoint, ProPresenter 6/7, Text)
- [ ] Verify strip punctuation feature works
- [ ] Test admin login (if applicable)
- [ ] Check browser console for errors
- [ ] Test on mobile devices

### Performance
- [ ] Run Lighthouse audit (target: >90 performance score)
- [ ] Test page load speed (<2s)
- [ ] Verify images load in WebP/AVIF format

### Security
- [ ] Verify security headers with https://securityheaders.com
- [ ] Check that DATABASE_URL is NOT in client-side bundle (DevTools → Sources)
- [ ] Verify HTTPS is enforced
- [ ] Test that admin routes require authentication

## 🚀 Deployment Command

The build will run automatically when you push to main:

```bash
git push origin main
```

Or manually trigger in Vercel dashboard: Deployments → Redeploy

## 📊 Build Status

Expected build time: 2-4 minutes

Build steps:
1. Install dependencies
2. Run `prisma generate` (via postinstall)
3. Run `next build`
4. Deploy to edge network

## 🔍 Troubleshooting

### Build Fails with "Module not found: .prisma/client"
- Check that `postinstall` script in package.json includes `prisma generate`
- Verify DATABASE_URL is set in Vercel environment variables

### TypeScript errors during build
- Check that tsconfig.json excludes scripts directory
- Verify all .ts files in app/ compile locally

### Runtime errors about missing environment variables
- Verify all environment variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)

## 📈 Monitoring

After deployment, monitor:
- Vercel Analytics for page views and performance
- Vercel Logs for runtime errors
- Database connection pool usage in Neon dashboard

## 🎯 Success Criteria

Deployment is successful when:
- ✅ Build completes without errors
- ✅ Homepage loads in <2 seconds
- ✅ All hymn downloads work correctly
- ✅ No console errors on any page
- ✅ Security headers return 200 on securityheaders.com
- ✅ Lighthouse score >90
