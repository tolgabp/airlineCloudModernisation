#!/bin/bash

# Cleanup Script for Airline Modernization System
# This script removes all Heroku apps and resources

set -e

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

# App names (update these with your actual app names)
FRONTEND_APP="airline-frontend-app"
BOOKING_APP="airline-booking-app"
CLOUD_API_APP="cloud-api-layer-app"
RECOMMENDATION_APP="recommendation-engine-app"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    print_error "Heroku CLI is not installed."
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    print_error "You are not logged in to Heroku. Please run: heroku login"
    exit 1
fi

# Function to remove a Heroku app
remove_app() {
    local app_name=$1
    local service_name=$2
    
    print_status "Removing $service_name app: $app_name"
    
    if heroku apps:info $app_name &> /dev/null; then
        heroku apps:destroy $app_name --confirm $app_name
        print_success "Removed $service_name app: $app_name"
    else
        print_warning "App $app_name does not exist"
    fi
}

# Main cleanup function
main() {
    print_warning "⚠️  WARNING: This will permanently delete all Heroku apps and their data!"
    echo ""
    echo "The following apps will be removed:"
    echo "  - $FRONTEND_APP (Frontend)"
    echo "  - $BOOKING_APP (Airline Booking)"
    echo "  - $CLOUD_API_APP (Cloud API Layer)"
    echo "  - $RECOMMENDATION_APP (Recommendation Engine)"
    echo ""
    
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_status "Cleanup cancelled."
        exit 0
    fi
    
    print_status "Starting cleanup process..."
    echo ""
    
    # Remove apps in reverse order (dependencies last)
    remove_app $FRONTEND_APP "Frontend"
    remove_app $CLOUD_API_APP "Cloud API Layer"
    remove_app $RECOMMENDATION_APP "Recommendation Engine"
    remove_app $BOOKING_APP "Airline Booking"
    
    print_success "🎉 Cleanup completed successfully!"
    echo ""
    print_status "All Heroku apps and their associated resources have been removed."
}

# Run main function
main "$@" 