# Render Deployment Instructions

## Current Status
- Code pushed to GitHub: ✓ (commit ff8641a)
- Production URL: https://meu-6ckl.onrender.com
- Production health check: 404 (deployment not yet triggered)

## Why Production Still Shows 404
Render has not yet detected the new code changes. You need to trigger a manual redeploy.

## Steps to Deploy

### Option 1: Render Dashboard (Recommended)
1. Go to https://dashboard.render.com
2. Navigate to your "panipath-backend" service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait 2-3 minutes for build and startup
5. Test: https://meu-6ckl.onrender.com/api/health

### Option 2: Render CLI
```bash
# Install Render CLI if not already installed
npm install -g render-cli

# Login
render login

# Trigger deploy
render deploy --service panipath-backend
```

### Option 3: Automatic Deploy
If automatic deploy is enabled, Render will deploy within 5-10 minutes of the push.

## Environment Variables (Must Set in Render Dashboard)

Go to: https://dashboard.render.com → panipath-backend → Environment

**Required:**
- `GROQ_API_KEY` = your_groq_api_key_here
  - Get from: https://console.groq.com/keys

**Optional:**
- `GROQ_VISION_MODEL` = llava-v1.5-7b (default)

## After Deployment - Verification Checklist

1. Health endpoint:
   ```bash
   curl https://meu-6ckl.onrender.com/api/health
   ```
   Expected: 200 with JSON response

2. Frontend loads:
   ```
   https://meu-6ckl.onrender.com
   ```
   Expected: PANI-PATH UI loads

3. Upload test image:
   - Open https://meu-6ckl.onrender.com
   - Upload a food photo
   - Click "Use GPS" or search location manually
   - Click "Find This Food Near Me"
   - Expected: Real vision analysis + real places from OpenStreetMap

4. Test GPS denied state:
   - Block location permission in browser
   - Expected: Clear error message with manual search fallback

5. Test no results state:
   - Search in an area with no restaurants
   - Expected: "No verified place found" (no fake data)

## Troubleshooting

### If build fails:
- Check Render build logs in dashboard
- Ensure Python 3.14 is available (Render uses 3.14.x)
- Ensure node_modules can install (512MB RAM limit)

### If runtime fails:
- Check Render service logs
- Ensure GROQ_API_KEY is set correctly
- Check for any runtime errors in backend/main.py

### If API routes return 404:
- Verify static file mount is AFTER API routes in backend/main.py
- This is fixed in commit 86bb3b8

### If frontend shows blank:
- Check that dist/ folder was built successfully
- Verify static file mount configuration
- Check browser console for errors

## Expected Behavior After Successful Deploy

1. `/api/health` returns 200 with backend status
2. Frontend loads with all components working
3. GPS permission request appears when clicking "Use GPS"
4. Vision analysis works with real GROQ API
5. Real OpenStreetMap businesses are discovered
6. No fake data anywhere in the application
7. Clear error messages for external API failures
