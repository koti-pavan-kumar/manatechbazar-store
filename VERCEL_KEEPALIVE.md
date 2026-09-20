# Keep Your Vercel Site Awake (FREE)

## Why This Matters
Vercel free tier puts your server to sleep after ~30 minutes of no traffic.
When someone visits, it takes 3-5 seconds to "wake up" = **lag**.

## Solution: Free Cron Job Ping

### Option 1: cron-job.org (Recommended — Free, No Credit Card)

1. Go to **https://cron-job.org** and sign up (free)
2. Click **"Create cronjob"**
3. Fill in:
   - **URL**: `https://manatechbazar.in/api/health`
   - **Request method**: GET
   - **Schedule**: Every 10 minutes
4. Click **"Create"**

That's it! Your server stays awake 24/7.

### Option 2: UptimeRobot (Free, No Credit Card)

1. Go to **https://uptimerobot.com** and sign up
2. Click **"Add New Monitor"**
3. Fill in:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://manatechbazar.in/api/health`
   - **Monitoring Interval**: 5 minutes
4. Click **"Create Monitor"**

---

## Result
- Server stays awake 24/7
- No more cold starts
- All pages load instantly
- **100% free forever**
