# Deployment Guide

## GitHub Pages (Free)

1. **Push to GitHub**:
   ```bash
   git add web/
   git commit -m "Add web interface"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` → `/web` folder
   - Click Save

3. **Access your app**:
   - URL: `https://SuccessGit2025.github.io/scrum-ceremony-scheduler/`
   - Wait 1-2 minutes for deployment

## Netlify (Free, Fastest)

1. **Drag and Drop**:
   - Go to https://app.netlify.com/drop
   - Drag the `web` folder onto the page
   - Done! You'll get a URL like `https://random-name.netlify.app`

2. **Or use Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   cd web
   netlify deploy --prod
   ```

## Vercel (Free)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd web
   vercel --prod
   ```

3. **Access your app**:
   - You'll get a URL like `https://your-project.vercel.app`

## Cloudflare Pages (Free)

1. **Push to GitHub** (if not already done)

2. **Connect to Cloudflare**:
   - Go to https://pages.cloudflare.com
   - Click "Create a project"
   - Connect your GitHub repository
   - Build settings:
     - Build command: (leave empty)
     - Build output directory: `web`
   - Click "Save and Deploy"

## Custom Domain

After deploying to any platform:

1. **Get a domain** (optional):
   - Namecheap, Google Domains, etc.

2. **Configure DNS**:
   - Add CNAME record pointing to your deployment URL
   - Each platform has specific instructions

3. **Update platform settings**:
   - Add your custom domain in the platform's settings
   - Enable HTTPS (usually automatic)

## Testing Locally

Just open `index.html` in your browser - no server needed!

Or use a simple HTTP server:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`
