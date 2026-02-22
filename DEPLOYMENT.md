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