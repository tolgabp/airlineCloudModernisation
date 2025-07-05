# 🚀 Heroku Deployment Guide - Airline Modernization System

This guide will help you deploy all 4 services of the Airline Modernization System to Heroku using buildpacks.

## 📋 System Overview

The system consists of 4 microservices:

1. **airline-frontend** - React + TypeScript + TailwindCSS
2. **airlineBooking** - Spring Boot + PostgreSQL (Core booking service)
3. **cloudApiLayer** - Spring Boot (API Gateway/Proxy)
4. **recommendationEngine** - Spring Boot + PostgreSQL (Delay & rerouting logic)

## 🛠️ Prerequisites

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- [Git](https://git-scm.com/) installed
- [Java 17](https://adoptium.net/) (for local testing)
- [Node.js](https://nodejs.org/) (for local testing)
- Heroku account with verified payment method (for PostgreSQL addons)

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

1. **Login to Heroku:**
   ```bash
   heroku login
   ```

2. **Run the deployment script:**
   ```bash
   ./deploy-to-heroku.sh
   ```

The script will:
- Create 4 Heroku apps
- Configure buildpacks
- Set up PostgreSQL databases
- Configure environment variables
- Deploy all services
- Provide you with the final URLs

### Option 2: Manual Deployment

If you prefer to deploy manually or need to customize the process, follow the sections below.

## 📦 Individual Service Deployment

### 1. Frontend (airline-frontend)

```bash
cd airline-frontend

# Create Heroku app
heroku create airline-frontend-app

# Set buildpack
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set REACT_APP_API_BASE_URL=https://your-cloud-api-layer-app.herokuapp.com
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy frontend"
git push heroku main
```

### 2. Airline Booking Service (airlineBooking)

```bash
cd airlineBooking

# Create Heroku app
heroku create airline-booking-app

# Set buildpack
heroku buildpacks:set heroku/java

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SPRING_PROFILES_ACTIVE=heroku
heroku config:set JWT_SECRET=your-secure-jwt-secret
heroku config:set ADMIN_USERNAME=admin
heroku config:set ADMIN_PASSWORD=your-secure-password

# Deploy
git add .
git commit -m "Deploy airline booking"
git push heroku main
```

### 3. Cloud API Layer (cloudApiLayer)

```bash
cd cloudApiLayer

# Create Heroku app
heroku create cloud-api-layer-app

# Set buildpack
heroku buildpacks:set heroku/java

# Set environment variables
heroku config:set SPRING_PROFILES_ACTIVE=heroku
heroku config:set JWT_SECRET=your-secure-jwt-secret
heroku config:set AIRLINE_BOOKING_URL=https://your-airline-booking-app.herokuapp.com
heroku config:set RECOMMENDATION_ENGINE_URL=https://your-recommendation-engine-app.herokuapp.com

# Deploy
git add .
git commit -m "Deploy cloud API layer"
git push heroku main
```

### 4. Recommendation Engine (recommendationEngine)

```bash
cd recommendationEngine

# Create Heroku app
heroku create recommendation-engine-app

# Set buildpack
heroku buildpacks:set heroku/java

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SPRING_PROFILES_ACTIVE=heroku
heroku config:set CLOUD_API_BASE_URL=https://your-cloud-api-layer-app.herokuapp.com
heroku config:set AIRLINE_BOOKING_BASE_URL=https://your-airline-booking-app.herokuapp.com

# Deploy
git add .
git commit -m "Deploy recommendation engine"
git push heroku main
```

## 🔧 Configuration Details

### Environment Variables

#### Frontend
- `REACT_APP_API_BASE_URL`: URL of the Cloud API Layer service
- `NODE_ENV`: Set to `production`

#### Airline Booking Service
- `SPRING_PROFILES_ACTIVE`: Set to `heroku`
- `DATABASE_URL`: Automatically set by Heroku PostgreSQL addon
- `JWT_SECRET`: Secure JWT secret key
- `ADMIN_USERNAME`: Admin username
- `ADMIN_PASSWORD`: Admin password

#### Cloud API Layer
- `SPRING_PROFILES_ACTIVE`: Set to `heroku`
- `JWT_SECRET`: Secure JWT secret key
- `AIRLINE_BOOKING_URL`: URL of the Airline Booking service
- `RECOMMENDATION_ENGINE_URL`: URL of the Recommendation Engine service

#### Recommendation Engine
- `SPRING_PROFILES_ACTIVE`: Set to `heroku`
- `DATABASE_URL`: Automatically set by Heroku PostgreSQL addon
- `CLOUD_API_BASE_URL`: URL of the Cloud API Layer service
- `AIRLINE_BOOKING_BASE_URL`: URL of the Airline Booking service

### Database Configuration

The system uses Heroku's automatic `DATABASE_URL` parsing. The `HerokuDatabaseConfig` classes in both `airlineBooking` and `recommendationEngine` services handle the URL parsing and connection setup.

### Buildpacks

- **Frontend**: `heroku/nodejs`
- **Backend Services**: `heroku/java`

## 🔍 Monitoring & Troubleshooting

### Check Application Status

```bash
# Check all apps
heroku apps

# Check specific app status
heroku ps --app airline-frontend-app
```

### View Logs

```bash
# View recent logs
heroku logs --app airline-frontend-app

# Follow logs in real-time
heroku logs --tail --app airline-frontend-app
```

### Common Issues & Solutions

#### 1. Build Failures
```bash
# Check build logs
heroku builds --app your-app-name

# Clear build cache
heroku builds:cache:purge --app your-app-name
```

#### 2. Database Connection Issues
```bash
# Check database status
heroku pg:info --app airline-booking-app

# Reset database (WARNING: This will delete all data)
heroku pg:reset DATABASE_URL --app airline-booking-app
```

#### 3. Environment Variable Issues
```bash
# List all config vars
heroku config --app your-app-name

# Set missing variables
heroku config:set VARIABLE_NAME=value --app your-app-name
```

#### 4. Port Issues
- Heroku automatically sets the `PORT` environment variable
- The application properties are configured to use `${PORT:8080}`

## 📊 Scaling & Performance

### Scale Dynos

```bash
# Scale to 1 web dyno (minimum for production)
heroku ps:scale web=1 --app your-app-name

# Scale to multiple dynos for high traffic
heroku ps:scale web=2 --app your-app-name
```

### Monitor Performance

```bash
# Open Heroku dashboard
heroku open --app your-app-name

# Check dyno usage
heroku ps --app your-app-name
```

## 🔒 Security Considerations

1. **JWT Secrets**: Use strong, unique secrets for each service
2. **Database Access**: Heroku PostgreSQL provides secure connections
3. **Environment Variables**: Never commit secrets to Git
4. **HTTPS**: Heroku automatically provides SSL certificates

## 🐳 Future Dockerization Strategy

When ready to migrate to Docker:

1. **Create Dockerfiles** for each service
2. **Use Docker Compose** for local development
3. **Deploy to Heroku Container Registry** or other container platforms
4. **Implement health checks** and proper logging
5. **Set up CI/CD pipelines** with GitHub Actions or similar

### Dockerfile Example (for future use)

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📞 Support

If you encounter issues:

1. Check the logs: `heroku logs --tail --app your-app-name`
2. Verify environment variables: `heroku config --app your-app-name`
3. Test locally first
4. Check Heroku status: https://status.heroku.com/

## 🎯 Next Steps

After successful deployment:

1. **Test all endpoints** using the provided URLs
2. **Set up monitoring** and alerting
3. **Configure custom domains** if needed
4. **Set up CI/CD** for automatic deployments
5. **Implement backup strategies** for databases
6. **Plan for scaling** based on usage patterns

---

**Happy Deploying! 🚀** 