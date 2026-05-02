# 🌴 Tourism Forecast Application - Docker Deployment

A containerized Sri Lanka Tourism Arrival Forecasting application with FastAPI backend and React frontend.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- At least 2GB free RAM
- Ports 80 and 8000 available

### Local Deployment

#### Option 1: Using Scripts (Recommended)
```bash
# Windows PowerShell
.\start-docker.ps1

# Windows Command Prompt  
start-docker.bat
```

#### Option 2: Manual Docker Commands
```bash
# Build and start services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📱 Access Points

- **Frontend Dashboard**: http://localhost
- **Backend API**: http://localhost:8000  
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/

## 🌐 Cloud Deployment Options

### 1. Railway (Recommended - Free Tier Available)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### 2. Render (Free Tier Available)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use Docker deployment
4. Set build command: `docker-compose up --build`

### 3. Heroku
```bash
# Install Heroku CLI, then:
heroku create your-app-name
heroku container:push web
heroku container:release web
```

### 4. DigitalOcean App Platform
1. Connect repository to DigitalOcean
2. Select Docker deployment
3. Use `docker-compose.yml` configuration

### 5. AWS ECS with Fargate
```bash
# Use AWS CLI to deploy
aws ecs create-cluster --cluster-name tourism-forecast
```

## 🔧 Environment Configuration

### Production Environment Variables
```env
NODE_ENV=production
API_URL=/api
PYTHONPATH=/app
```

### Development Override
```env
NODE_ENV=development
API_URL=http://localhost:8000
```

## 📊 Monitoring & Logs

```bash
# View logs
docker-compose logs backend
docker-compose logs frontend

# Monitor resources
docker stats

# Check service health
curl http://localhost:8000/
curl http://localhost/
```

## 🛠 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
netstat -ano | findstr ":80\|:8000"

# Kill processes (Windows)
taskkill /PID <PID> /F
```

#### Container Build Fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Frontend Not Loading
```bash
# Check nginx configuration
docker exec -it tourism-frontend cat /etc/nginx/conf.d/default.conf

# Restart frontend only
docker-compose restart frontend
```

## 🔄 Updates & Maintenance

```bash
# Update application
git pull origin main
docker-compose down
docker-compose up --build -d

# Clean up old images
docker image prune -f
```

## 📦 Container Specifications

### Backend Container
- **Image**: Python 3.11-slim
- **Port**: 8000
- **Memory**: ~200MB
- **CPU**: 0.5 cores

### Frontend Container  
- **Image**: Nginx Alpine
- **Port**: 80
- **Memory**: ~50MB  
- **CPU**: 0.1 cores

## 🌍 Free Hosting Options Summary

| Platform | Free Tier | Pros | Cons |
|----------|-----------|------|------|
| Railway | 500 hrs/month | Easy deployment | Limited resources |
| Render | 750 hrs/month | Auto-deploy from Git | Sleep after inactivity |
| Heroku | 550 hrs/month | Mature platform | Dyno sleeping |
| Vercel | Unlimited static | Great for frontend | Backend limitations |

## 📝 Notes

- The application uses ML models stored in `outputs/` directory
- Data files are mounted from `data/` directory  
- Frontend automatically proxies API calls through nginx
- CORS is handled by nginx configuration

## 🆘 Support

If you encounter issues:
1. Check Docker Desktop is running
2. Verify port availability
3. Review container logs
4. Ensure all files are present in project directory

For deployment to production, consider:
- Using environment-specific configurations
- Adding SSL certificates
- Implementing health checks
- Setting up monitoring and alerting

---

## 🚀 Vercel + Render Deployment (Recommended for Modern Stack)

Deploy the frontend to **Vercel** (best for React) and backend to **Render** (best for Python APIs).

### Step 1: Deploy Backend to Render

1. Push your repo to GitHub
2. Visit [render.com](https://render.com) and sign in
3. Click **New +** → **Web Service**
4. Connect your GitHub repository
5. Fill in the following:
   - **Name**: `tourism-forecast-api` (or your choice)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.app:app --host 0.0.0.0 --port $PORT`
6. Click **Create Web Service**
7. Wait for deployment (~2-3 mins)
8. Copy the service URL (e.g., `https://tourism-forecast-api.onrender.com`)

### Step 2: Update vercel.json with Backend URL

Edit `vercel.json` and replace `your-backend-url.onrender.com` with your actual Render backend URL:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR_RENDER_URL.onrender.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 3: Deploy Frontend to Vercel

#### Option A: Via Vercel Dashboard (Easiest)

1. Visit [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project**
3. Import your repository
4. In **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Install Command**: `npm install`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variables** (for both Preview & Production):
   - Key: `VITE_API_URL`
   - Value: `https://YOUR_RENDER_URL.onrender.com/api`
6. Click **Deploy**
7. Wait for deployment (~1-2 mins)
8. Visit your Vercel URL (e.g., `https://tourism-forecast.vercel.app`)

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from project root
vercel --prod

# Add environment variable interactively (or use dashboard)
vercel env add VITE_API_URL production
# Enter: https://YOUR_RENDER_URL.onrender.com/api
```

### Step 4: Verify End-to-End

1. Open your Vercel frontend URL
2. Open DevTools → Network tab
3. Try the forecast feature (select country, adjust dates, click any action)
4. Verify requests go to `/api/forecast` or `/api/countries`
5. Confirm responses return data (no 404 errors)

Optionally, test backend directly:
```bash
# Health check
curl https://YOUR_RENDER_URL.onrender.com/api/health

# Forecast endpoint
curl -X POST https://YOUR_RENDER_URL.onrender.com/api/forecast \
  -H "Content-Type: application/json" \
  -d '{"start_year":2026,"start_month":5,"horizon":12}'
```

### Step 5: Configure Custom Domain (Optional)

**For Vercel:**
1. Vercel Dashboard → Project Settings → Domains
2. Add your domain (e.g., `tourism-forecast.com`)
3. Update DNS records as instructed

**For Render:**
1. Render Dashboard → Web Service → Settings → Custom Domain
2. Add your subdomain (e.g., `api.tourism-forecast.com`)
3. Update DNS records

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend returns 404 for `/api/...` | Verify `vercel.json` rewrites and backend URL in Render |
| "Cannot GET /api/forecast" | Check backend deployed correctly; test `https://YOUR_RENDER_URL.onrender.com/api/health` |
| CORS errors in browser | Not an issue with Vercel rewrites; if using env var, ensure backend CORS is enabled |
| Backend spins down after 15 mins (Render free tier) | Upgrade to paid plan or add a scheduler to ping `/api/health` every 10 mins |

### Performance Notes

- **Vercel**: Infinite edge locations, globally fast
- **Render**: US-based; free tier may have 15-min cold starts
- **Upgrade Render** to avoid cold starts: Render Dashboard → Instance Type → change to `Starter` ($7/mo)