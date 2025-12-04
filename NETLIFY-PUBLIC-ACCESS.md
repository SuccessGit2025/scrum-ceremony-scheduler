# Fix Netlify Credential Issue

## Problem
Your Netlify site is asking for credentials when people try to access it.

## Cause
The Netlify site has password protection enabled, OR you're sharing the wrong URL.

## Solution

### Step 1: Check Which URL You're Sharing

Netlify gives you different URLs:

❌ **WRONG** - Admin/Deploy URL (requires login):
- `https://app.netlify.com/sites/your-site/...`
- Anything with `app.netlify.com` in it

✅ **CORRECT** - Public Site URL (no login):
- `https://your-site-name.netlify.app`
- OR your custom domain

**Make sure you're sharing the PUBLIC site URL, not the admin URL!**

### Step 2: Remove Password Protection

If you're sharing the correct URL but it still asks for credentials:

1. **Go to Netlify Dashboard**:
   - Visit: https://app.netlify.com/
   - Log in to your account
   - Click on your site

2. **Check Site Settings**:
   - Click **Site settings** (top menu)
   - Look in the left sidebar for **Access control**
   - Click **Visitor access**

3. **Disable Password Protection**:
   - If you see "Password protection" enabled
   - Click **Edit settings**
   - Select **Public** (not "Password protected")
   - Click **Save**

### Step 3: Verify Public Access

1. **Get Your Public URL**:
   - In Netlify dashboard, look at the top
   - You'll see something like: `https://amazing-name-123456.netlify.app`
   - This is your PUBLIC URL

2. **Test in Incognito/Private Window**:
   - Open an incognito/private browser window
   - Visit your Netlify URL
   - It should load WITHOUT asking for credentials

3. **Share the Correct URL**:
   - Share: `https://your-site-name.netlify.app`
   - NOT: `https://app.netlify.com/...`

## Quick Checklist

- [ ] I'm sharing the `.netlify.app` URL (not `app.netlify.com`)
- [ ] Password protection is disabled in Site Settings → Visitor access
- [ ] Site is set to "Public" not "Password protected"
- [ ] I tested in an incognito window and it works

## Alternative: Redeploy Without Password

If you're still having issues, redeploy:

### Option A: Drag and Drop (Easiest)

1. Go to: https://app.netlify.com/drop
2. Drag the `web` folder from your computer
3. Drop it on the page
4. Get a NEW public URL (no password)
5. Share that URL

### Option B: CLI Redeploy

```bash
cd web
npx netlify-cli deploy --prod
```

When prompted:
- Choose "Create & configure a new site"
- Follow the prompts
- Get your public URL at the end

## Common Mistakes

### Mistake 1: Sharing Admin URL
❌ `https://app.netlify.com/sites/my-site/overview`
✅ `https://my-site.netlify.app`

### Mistake 2: Password Protection Enabled
- Check: Site Settings → Visitor access → Should be "Public"

### Mistake 3: Wrong Deployment
- Make sure you deployed the `web` folder, not the root folder

## How to Find Your Public URL

1. Log in to Netlify: https://app.netlify.com/
2. Click on your site
3. Look at the top - you'll see a URL like:
   ```
   https://scrum-ceremony-scheduler.netlify.app
   ```
4. That's your public URL - share that!

## Test Your Deployment

Run this test:

1. **Open incognito/private window**
2. **Visit your Netlify URL**
3. **Expected result**: Web interface loads immediately
4. **If it asks for password**: Follow steps above to disable password protection

## Still Having Issues?

### Check Deployment Status

1. Go to Netlify dashboard
2. Click on your site
3. Click "Deploys" tab
4. Make sure latest deploy shows "Published" (green)

### Check Build Settings

1. Site Settings → Build & deploy
2. Make sure:
   - Build command: (empty or none)
   - Publish directory: `web` or `.` (if you deployed just the web folder)

### Redeploy Fresh

If all else fails:

1. Delete the current Netlify site
2. Go to https://app.netlify.com/drop
3. Drag ONLY the `web` folder
4. Get a fresh, public URL
5. Share that URL

## What Your Users Should See

When they visit your Netlify URL, they should see:
- 🗓️ Scrum Ceremony Scheduler header
- Configuration form on the left
- Preview section on the right
- NO login prompt
- NO password request

## Example Working URLs

Your URL should look like one of these:
- `https://scrum-scheduler-123.netlify.app`
- `https://ceremony-scheduler.netlify.app`
- `https://your-custom-domain.com` (if you set up custom domain)

## Need Your Netlify URL?

If you don't know your Netlify URL:

1. Log in to Netlify
2. Click on your site
3. Look at the top of the page
4. Copy the URL that ends with `.netlify.app`
5. Share that URL

---

**Quick Fix Summary:**
1. Make sure you're sharing `https://your-site.netlify.app` (not `app.netlify.com`)
2. Disable password protection in Site Settings → Visitor access
3. Test in incognito window
4. Share the correct public URL
