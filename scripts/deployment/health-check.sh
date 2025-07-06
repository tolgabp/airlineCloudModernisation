#!/bin/bash

# Health Check Script for Airline Modernization System
# This script checks if all deployed services are responding correctly

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

# Full URLs for endpoint testing
FRONTEND_URL="airline-frontend-app-876da0517315"
BOOKING_URL="airline-booking-app-78a9493e24ea"
CLOUD_API_URL="cloud-api-layer-app-0d7c4d768b4f"
RECOMMENDATION_URL="recommendation-engine-app-ff57d4dacb47"

# Function to check if a URL is accessible
check_url() {
    local url=$1
    local service_name=$2
    local expected_status=${3:-200}
    
    print_status "Checking $service_name at $url"
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        print_success "$service_name is responding correctly"
        return 0
    else
        print_error "$service_name is not responding correctly"
        return 1
    fi
}

# Function to check Heroku app status
check_heroku_app() {
    local app_name=$1
    local service_name=$2
    
    print_status "Checking Heroku app status for $service_name"
    
    if heroku ps --app $app_name | grep -q "up"; then
        print_success "$service_name is running on Heroku"
        return 0
    else
        print_error "$service_name is not running on Heroku"
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    local app_name=$1
    local service_name=$2
    
    print_status "Checking database for $service_name"
    
    if heroku pg:info --app $app_name | grep -q "Available"; then
        print_success "Database is available for $service_name"
        return 0
    else
        print_error "Database is not available for $service_name"
        return 1
    fi
}

# Main health check function
main() {
    print_status "Starting health check for Airline Modernization System..."
    echo ""
    
    local all_checks_passed=true
    
    # Check Heroku app status
    print_status "=== Checking Heroku App Status ==="
    check_heroku_app $FRONTEND_APP "Frontend" || all_checks_passed=false
    check_heroku_app $BOOKING_APP "Airline Booking" || all_checks_passed=false
    check_heroku_app $CLOUD_API_APP "Cloud API Layer" || all_checks_passed=false
    check_heroku_app $RECOMMENDATION_APP "Recommendation Engine" || all_checks_passed=false
    echo ""
    
    # Check database connectivity
    print_status "=== Checking Database Connectivity ==="
    check_database $BOOKING_APP "Airline Booking" || all_checks_passed=false
    check_database $RECOMMENDATION_APP "Recommendation Engine" || all_checks_passed=false
    echo ""
    
    # Check service endpoints
    print_status "=== Checking Service Endpoints ==="
    
    # Frontend
    check_url "https://$FRONTEND_URL.herokuapp.com" "Frontend" || all_checks_passed=false
    
    # Backend services (basic health checks)
    check_url "https://$BOOKING_URL.herokuapp.com/api/flights" "Airline Booking API" || all_checks_passed=false
    
    check_url "https://$CLOUD_API_URL.herokuapp.com/api/flights" "Cloud API Layer" || all_checks_passed=false
    
    check_url "https://$RECOMMENDATION_URL.herokuapp.com/api/recommendations/suggestions?bookingId=1" "Recommendation Engine" || all_checks_passed=false
    echo ""
    
    # Check environment variables
    print_status "=== Checking Environment Variables ==="
    
    # Check if critical environment variables are set
    check_env_var() {
        local app_name=$1
        local var_name=$2
        local service_name=$3
        
        if heroku config --app $app_name | grep -q "$var_name"; then
            print_success "$service_name has $var_name configured"
            return 0
        else
            print_warning "$service_name is missing $var_name"
            return 1
        fi
    }
    
    check_env_var $FRONTEND_APP "REACT_APP_API_BASE_URL" "Frontend" || all_checks_passed=false
    check_env_var $BOOKING_APP "DATABASE_URL" "Airline Booking" || all_checks_passed=false
    check_env_var $BOOKING_APP "SPRING_PROFILES_ACTIVE" "Airline Booking" || all_checks_passed=false
    check_env_var $CLOUD_API_APP "SPRING_PROFILES_ACTIVE" "Cloud API Layer" || all_checks_passed=false
    check_env_var $RECOMMENDATION_APP "DATABASE_URL" "Recommendation Engine" || all_checks_passed=false
    check_env_var $RECOMMENDATION_APP "SPRING_PROFILES_ACTIVE" "Recommendation Engine" || all_checks_passed=false
    echo ""
    
    # Summary
    print_status "=== Health Check Summary ==="
    if [ "$all_checks_passed" = true ]; then
        print_success "🎉 All health checks passed! Your system is running correctly."
        echo ""
            echo "📋 Service URLs:"
    echo "  Frontend: https://$FRONTEND_URL.herokuapp.com"
    echo "  Airline Booking: https://$BOOKING_URL.herokuapp.com"
    echo "  Cloud API Layer: https://$CLOUD_API_URL.herokuapp.com"
    echo "  Recommendation Engine: https://$RECOMMENDATION_URL.herokuapp.com"
        echo ""
        echo "🔧 Next steps:"
        echo "  1. Test the frontend application"
        echo "  2. Verify all API endpoints are working"
        echo "  3. Test user registration and login"
        echo "  4. Test flight booking functionality"
        echo "  5. Monitor logs for any issues"
    else
        print_error "❌ Some health checks failed. Please review the issues above."
        echo ""
        echo "🔧 Troubleshooting steps:"
        echo "  1. Check Heroku logs: heroku logs --tail --app <app-name>"
        echo "  2. Verify environment variables: heroku config --app <app-name>"
        echo "  3. Restart dynos if needed: heroku restart --app <app-name>"
        echo "  4. Check Heroku status: https://status.heroku.com/"
    fi
}

# Run main function
main "$@" 