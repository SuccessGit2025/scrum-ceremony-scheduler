# GitHub Pages Setup Guide

## Quick Setup (5 minutes)

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/SuccessGit2025/scrum-ceremony-scheduler

2. Click **Settings** (top menu)

3. Scroll down and click **Pages** (left sidebar)

4. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/web`
   - Click **Save**

### Step 2: Wait for Deployment

- GitHub will build and deploy your site (1-2 minutes)
- You'll see a message: "Your site is live at..."

### Step 3: Access Your App

Your web app will be available at:

```
https://SuccessGit2025.github.io/scrum-ceremony-scheduler/
```

## Troubleshooting

### Site not loading?

1. **Check deployment status**:
   - Go to Actions tab in your repository
   - Look for "pages build and deployment" workflow
   - Wait for green checkmark

2. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Check Pages settings**:
   - Make sure branch is `main` and folder is `/web`

### 404 Error?

- Make sure you're accessing the correct URL
- The path should end with `/` or `/index.html`
- Wait a few more minutes for DNS propagation

## Custom Domain (Optional)

### Add Your Own Domain

1. **Buy a domain** (e.g., from Namecheap, Google Domains)

2. **Configure DNS**:
   - Add CNAME record: `www` → `SuccessGit2025.github.io`
   - Add A records for apex domain:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```

3. **Update GitHub Pages**:
   - Go to Settings → Pages
   - Enter your custom domain
   - Check "Enforce HTTPS"
   - Click Save

4. **Wait for DNS** (can take up to 24 hours)

## Updating Your Site

Every time you push changes to the `web/` folder:

```bash
git add web/
git commit -m "Update web interface"
git push origin main
```

GitHub Pages will automatically redeploy (1-2 minutes).

## Sharing Your App

Once deployed, share this URL with your team:

```
https://SuccessGit2025.github.io/scrum-ceremony-scheduler/
```

They can:
- Generate their own ceremony calendars
- Download .ics files
- No installation required
- Works on any device

## Need Help?

- GitHub Pages Docs: https://docs.github.com/en/pages
- Check repository Actions tab for deployment logs
- Open an issue in your repository
