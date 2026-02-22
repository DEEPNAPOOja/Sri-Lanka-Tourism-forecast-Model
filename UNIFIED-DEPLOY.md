# 🚀 Unified Full-Stack Deployment Guide

Deploy both your FastAPI backend and React frontend from a **single service**. The backend serves both API endpoints and the built React app.

## 🎯 Local Testing (Unified)

Test the unified setup locally before deploying:

```powershell
.\start-unified.ps1
```

This will:
1. Build the React frontend (`npm run build`)
2. Install Python dependencies
3. Start FastAPI serving both frontend and API on **port 8000**

**Access points:**
- 🌐 **App**: http://localhost:8000
- 🔗 **API**: http://localhost:8000/api  
- 📚 **Docs**: http://localhost:8000/docs

---

## ☁️ Cloud Deployment Options

### 1. Railway (Recommended - Free 500 hrs/month)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login  
railway init
railway up
```

**Configuration**: Uses `railway.json` (already created)

### 2. Render (Free 750 hrs/month)

1. **Connect GitHub**: Push code to GitHub repository
2. **Create Service**: Go to https://render.com → "New Web Service"  
3. **Auto-detect**: Render will use `render.yaml` configuration
4. **Deploy**: Automatic deployment with free SSL

### 3. Heroku (Free 550 hrs/month)

```bash
# Install Heroku CLI, then:
heroku create your-app-name
git push heroku main
```

**Configuration**: Uses `Procfile` and `app.json` (already created)

### 4. Vercel (Serverless)

While Vercel is great for frontends, for this full-stack app with ML models, **Railway or Render** are better choices.

---

## 🏗️ How It Works

### Unified Architecture
```
FastAPI Server (Port 8000)
├── /api/*          → API endpoints  
├── /docs           → API documentation
├── /static/*       → React assets
└── /*              → React app (catch-all)
```

### File Structure  
```
├── frontend/dist/          # Built React app
├── src/app.py             # FastAPI with static serving
├── requirements.txt       # Python dependencies  
├── railway.json          # Railway config
├── render.yaml           # Render config  
├── Procfile              # Heroku config
└── start-unified.ps1     # Local testing
```

---

## 🔧 Deployment Commands

### Railway
```bash
railway login
railway init
railway up
```

### Render  
```bash
# Just push to GitHub and connect repository
git push origin main
```

### Heroku
```bash
heroku create
git push heroku main
```

---

## 🌐 Environment Variables

These are automatically set by each platform:

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `production` | React production build |
| `PORT` | Platform-assigned | Server port |
| `PYTHONPATH` | `/app` | Python module path |

---

## 📊 Platform Comparison

| Platform | Setup | Free Tier | Auto-SSL | Custom Domain |
|----------|-------|-----------|----------|---------------|
| **Railway** | ⭐⭐⭐⭐⭐ | 500 hrs | ✅ | ✅ Free |
| **Render** | ⭐⭐⭐⭐ | 750 hrs | ✅ | ✅ Free |  
| **Heroku** | ⭐⭐⭐ | 550 hrs | ✅ | ❌ Paid |

---

## 🚀 Quick Start (Recommended)

1. **Test locally:**
   ```powershell
   .\start-unified.ps1 
   ```

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Unified deployment ready"
   git push origin main
   ```

3. **Deploy to Railway:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init 
   railway up
   ```

4. **Get your URL:**
   ```
   https://your-app.up.railway.app
   ```

---

## 🔍 Troubleshooting

### Build Issues
```bash
# Test build locally
cd frontend
npm install  
npm run build

# Check if dist/ folder was created
ls frontend/dist/
```

### API Issues
```bash
# Test API endpoints
curl http://localhost:8000/api/health
curl http://localhost:8000/api/countries
```

### Deployment Issues  
```bash
# Check logs on Railway
railway logs

# Check logs on Render  
# (Available in Render dashboard)
```

---

## ✅ Success Checklist

- [ ] Local unified server works (`.\start-unified.ps1`)
- [ ] Frontend builds successfully (`frontend/dist/` exists)
- [ ] API endpoints respond (`/api/health`, `/api/countries`)  
- [ ] Code pushed to GitHub
- [ ] Platform deployment successful
- [ ] Public URL accessible

---

**🎉 Your app will be live with a single command!**