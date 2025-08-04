# 🚀 Quick Deployment Commands

## For cursor-test branch

### 1. Push Changes
```bash
git add .
git commit -m "Fix GitHub Pages deployment for cursor-test branch"
git push origin cursor-test
```

### 2. Enable GitHub Pages
1. Go to: `https://github.com/ManojKumarKarumanchi/techgig-hackathon/settings/pages`
2. Source: **Deploy from a branch**
3. Branch: **cursor-test**
4. Click **Save**

### 3. Wait & Test
- Wait 2-5 minutes for deployment
- Test: `https://manojkumarkarumanchi.github.io/techgig-hackathon/`

### 4. Force Refresh (if needed)
```javascript
// In browser console:
window.deploymentHelper.forceRefresh()
```

### 5. Check Deployment Status
- Go to: `https://github.com/ManojKumarKarumanchi/techgig-hackathon/actions`
- Look for "Deploy static content to Pages" workflow

## 🔄 Auto-Refresh Answer
**GitHub Pages does NOT auto-refresh.** You must:
1. **Manually refresh** browser (F5)
2. **Clear cache** (Ctrl+F5)
3. **Wait 2-5 minutes** after pushing

## 🎯 Your App URL
`https://manojkumarkarumanchi.github.io/techgig-hackathon/` 