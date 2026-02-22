# 🌐 Cloud Deployment Guide - No Docker Required

## 🚀 Railway Deployment (Recommended - Easiest)

Railway automatically detects your Python/Node.js apps and deploys them.

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Deploy
```bash
railway login
railway init
railway up
```

Railway will automatically:
- Detect your FastAPI backend
- Build and serve your React frontend  
- Provide HTTPS URLs
- Handle environment variables

### Step 3: Configure
- Set `NODE_ENV=production` in Railway dashboard
- Your app will be live at: `https://your-app.up.railway.app`

---

## 🎯 Vercel + PythonAnywhere Combo

### Frontend on Vercel (Free)
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Set build directory to `frontend`
5. Deploy automatically

### Backend on PythonAnywhere (Free)
1. Sign up at https://www.pythonanywhere.com
2. Upload your `src/` folder
3. Install dependencies: `pip install -r requirements.txt`
4. Create web app with FastAPI

---

## 🔥 Render Deployment (Free Tier)

### All-in-One Deployment
1. Push to GitHub
2. Go to https://render.com  
3. Create "Web Service"
4. Connect repository
5. Render auto-detects and deploys both frontend/backend

---

## ⚡ Netlify + Railway Split

### Frontend (Netlify)
```bash
# In frontend directory
npm run build
# Upload dist/ folder to Netlify
```

### Backend (Railway)
```bash
# Deploy just the backend
railway init --name tourism-api
railway up
```

---

## 🆓 Completely Free Options

| Platform | What It Hosts | Free Tier | Speed |
|----------|---------------|-----------|-------|
| **Railway** | Full Stack | 500 hrs/month | ⭐⭐⭐⭐⭐ |
| **Render** | Full Stack | 750 hrs/month | ⭐⭐⭐⭐ |
| **Vercel + PythonAnywhere** | Split | Unlimited frontend | ⭐⭐⭐ |
| **Netlify + Heroku** | Split | Generous limits | ⭐⭐⭐ |

## 🎯 Quick Start Recommendation

**For beginners**: Use Railway - it's the simplest!

```bash
# One-command deployment
npx @railway/cli login
npx @railway/cli init
npx @railway/cli up
```

Your app will be live with HTTPS in minutes! 🚀