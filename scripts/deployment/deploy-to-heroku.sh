#!/bin/bash

# Airline Modernization System - Heroku Deployment Script
# This script deploys all 4 services to Heroku

set -e

echo "🚀 Starting Heroku deployment for Airline Modernization System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    print_error "Heroku CLI is not installed. Please install it first:"
    echo "https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    print_error "You are not logged in to Heroku. Please run: heroku login"
    exit 1
fi

# App names (you can customize these)
FRONTEND_APP="airline-frontend-app"
BOOKING_APP="airline-booking-app"
CLOUD_API_APP="cloud-api-layer-app"
RECOMMENDATION_APP="recommendation-engine-app"

print_status "Using app names:"
echo "  Frontend: $FRONTEND_APP"
echo "  Booking: $BOOKING_APP"
echo "  Cloud API: $CLOUD_API_APP"
echo "  Recommendation: $RECOMMENDATION_APP"

# Create Heroku apps if they don't exist
create_app() {
    local app_name=$1
    local region=${2:-eu}
    
    if ! heroku apps:info $app_name &> /dev/null; then
        print_status "Creating Heroku app: $app_name in Europe region"
        heroku create $app_name --region $region
        print_success "Created app: $app_name"
    else
        print_warning "App $app_name already exists"
    fi
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to $FRONTEND_APP..."
    
    cd airline-frontend
    
    # Set buildpacks
    heroku buildpacks:clear --app $FRONTEND_APP
    heroku buildpacks:add heroku/nodejs --app $FRONTEND_APP
    
    # Set environment variables
    heroku config:set REACT_APP_API_BASE_URL="https://$CLOUD_API_APP.herokuapp.com" --app $FRONTEND_APP
    heroku config:set NODE_ENV=production --app $FRONTEND_APP
    
    # Deploy
    git add .
    git commit -m "Deploy frontend to Heroku" || true
    git push heroku main
    
    print_success "Frontend deployed to: https://$FRONTEND_APP.herokuapp.com"
    cd ..
}

# Deploy airline booking service
deploy_booking() {
    print_status "Deploying airline booking service to $BOOKING_APP..."
    
    cd airlineBooking
    
    # Set buildpacks
    heroku buildpacks:clear --app $BOOKING_APP
    heroku buildpacks:add heroku/java --app $BOOKING_APP
    
    # Add PostgreSQL addon
    heroku addons:create heroku-postgresql:essential-0 --app $BOOKING_APP
    
    # Set environment variables
    heroku config:set SPRING_PROFILES_ACTIVE=heroku --app $BOOKING_APP
    heroku config:set JWT_SECRET="$(openssl rand -base64 12)" --app $BOOKING_APP
    heroku config:set ADMIN_USERNAME=admin --app $BOOKING_APP
    heroku config:set ADMIN_PASSWORD="$(openssl rand -base64 12)" --app $BOOKING_APP
    
    # Deploy
    git add .
    git commit -m "Deploy airline booking to Heroku" || true
    git push heroku main
    
    print_success "Airline booking deployed to: https://$BOOKING_APP.herokuapp.com"
    cd ..
}

# Deploy cloud API layer
deploy_cloud_api() {
    print_status "Deploying cloud API layer to $CLOUD_API_APP..."
    
    cd cloudApiLayer
    
    # Set buildpacks
    heroku buildpacks:clear --app $CLOUD_API_APP
    heroku buildpacks:add heroku/java --app $CLOUD_API_APP
    
    # Set environment variables
    heroku config:set SPRING_PROFILES_ACTIVE=heroku --app $CLOUD_API_APP
    heroku config:set JWT_SECRET="$(openssl rand -base64 32)" --app $CLOUD_API_APP
    heroku config:set AIRLINE_BOOKING_URL="https://$BOOKING_APP.herokuapp.com" --app $CLOUD_API_APP
    heroku config:set RECOMMENDATION_ENGINE_URL="https://$RECOMMENDATION_APP.herokuapp.com" --app $CLOUD_API_APP
    
    # Deploy
    git add .
    git commit -m "Deploy cloud API layer to Heroku" || true
    git push heroku main
    
    print_success "Cloud API layer deployed to: https://$CLOUD_API_APP.herokuapp.com"
    cd ..
}

# Deploy recommendation engine
deploy_recommendation() {
    print_status "Deploying recommendation engine to $RECOMMENDATION_APP..."
    
    cd recommendationEngine
    
    # Set buildpacks
    heroku buildpacks:clear --app $RECOMMENDATION_APP
    heroku buildpacks:add heroku/java --app $RECOMMENDATION_APP
    
    # Add PostgreSQL addon
    heroku addons:create heroku-postgresql:essential-0 --app $RECOMMENDATION_APP
    
    # Set environment variables
    heroku config:set SPRING_PROFILES_ACTIVE=heroku --app $RECOMMENDATION_APP
    heroku config:set CLOUD_API_BASE_URL="https://$CLOUD_API_APP.herokuapp.com" --app $RECOMMENDATION_APP
    heroku config:set AIRLINE_BOOKING_BASE_URL="https://$BOOKING_APP.herokuapp.com" --app $RECOMMENDATION_APP
    
    # Deploy
    git add .
    git commit -m "Deploy recommendation engine to Heroku" || true
    git push heroku main
    
    print_success "Recommendation engine deployed to: https://$RECOMMENDATION_APP.herokuapp.com"
    cd ..
}

# Main deployment process
main() {
    print_status "Starting deployment process..."
    
    # Create apps
    create_app $FRONTEND_APP
    create_app $BOOKING_APP
    create_app $CLOUD_API_APP
    create_app $RECOMMENDATION_APP
    
    # Deploy in order (dependencies first)
    deploy_booking
    deploy_recommendation
    deploy_cloud_api
    deploy_frontend
    
    print_success "🎉 All services deployed successfully!"
    
    echo ""
    echo "📋 Deployment Summary:"
    echo "  Frontend: https://$FRONTEND_APP.herokuapp.com"
    echo "  Airline Booking: https://$BOOKING_APP.herokuapp.com"
    echo "  Cloud API Layer: https://$CLOUD_API_APP.herokuapp.com"
    echo "  Recommendation Engine: https://$RECOMMENDATION_APP.herokuapp.com"
    echo ""
    echo "🔧 Next steps:"
    echo "  1. Test the frontend application"
    echo "  2. Check logs if there are any issues: heroku logs --tail --app <app-name>"
    echo "  3. Scale dynos if needed: heroku ps:scale web=1 --app <app-name>"
    echo "  4. Monitor performance in Heroku dashboard"
}

# Run main function
main "$@" 