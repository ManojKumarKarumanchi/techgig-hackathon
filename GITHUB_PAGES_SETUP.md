# 🚀 GitHub Pages Deployment Guide

## Quick Fix for GitHub Pages Issues

### 1. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **"Deploy from a branch"**
5. Choose **cursor-test** branch
6. Click **Save**

### 2. Check Repository Settings
- Ensure your repository is **public** (GitHub Pages requires this for free accounts)
- Make sure you're using the **cursor-test** branch

### 3. Common Issues & Solutions

#### Issue: "Please use a mobile device" message on mobile
**Solution**: This is likely due to HTTPS requirements. GitHub Pages uses HTTPS, which is required for device orientation API.

#### Issue: Service Worker errors
**Solution**: Fixed in this update - removed reference to non-existent `config.js`

#### Issue: App not loading
**Solution**: Check browser console for errors. Most common issues:
- Mixed content (HTTP/HTTPS)
- CORS issues
- Missing files

### 4. Test Your Deployment
1. After pushing changes, wait 2-5 minutes for GitHub Pages to update
2. Visit: `https://yourusername.github.io/techgig-hackathon/`
3. Test the deployment: `https://yourusername.github.io/techgig-hackathon/test-deployment.html`

### 5. Auto-Refresh on Commit
**GitHub Pages does NOT auto-refresh**. You need to:
1. **Manually refresh** your browser
2. **Clear cache** (Ctrl+F5 or Cmd+Shift+R)
3. **Wait 2-5 minutes** for deployment to complete

### 6. Force Cache Refresh
Add this to your HTML head section for development:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### 7. Debugging Steps
1. **Check GitHub Actions**: Go to Actions tab to see deployment status
2. **Check Console**: Open browser dev tools and check for errors
3. **Test on Different Devices**: Try mobile, tablet, desktop
4. **Check Network Tab**: Look for failed requests

### 8. Alternative Deployment Options
If GitHub Pages continues to have issues:

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify
1. Go to netlify.com
2. Drag your project folder
3. Instant deployment!

### 9. File Structure Check
Ensure these files are in your repository root:
```
techgig-hackathon/
├── index.html
├── styles.css
├── script.js
├── sw.js
├── package.json
├── README.md
└── .github/workflows/
    └── static.yml
```

### 10. Final Checklist
- [ ] Repository is public
- [ ] GitHub Pages is enabled
- [ ] cursor-test branch is selected
- [ ] All files are committed and pushed
- [ ] Wait 2-5 minutes after push
- [ ] Test on mobile device
- [ ] Check browser console for errors

## 🎉 Success!
Your app should now work perfectly on GitHub Pages at:
`https://yourusername.github.io/techgig-hackathon/` 