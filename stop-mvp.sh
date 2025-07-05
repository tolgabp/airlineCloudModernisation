#!/bin/bash

# 🛑 MVP Flow Stop Script
# This script stops all services for the MVP flow

echo "🛑 Stopping Airline Modernization MVP Flow..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop service by PID file
stop_service() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}🛑 Stopping $service_name (PID: $pid)...${NC}"
            kill $pid
            sleep 2
            
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${YELLOW}⚠️  Force stopping $service_name...${NC}"
                kill -9 $pid
            fi
            
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name was not running${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}⚠️  PID file for $service_name not found${NC}"
    fi
}

# Stop services
echo -e "${BLUE}🛑 Stopping services...${NC}"

stop_service "Airline Booking Service" "logs/airline-booking.pid"
stop_service "Cloud API Layer" "logs/cloud-api.pid"
stop_service "Recommendation Engine" "logs/recommendation-engine.pid"
stop_service "Frontend" "logs/frontend.pid"

# Kill any remaining processes on the ports
echo -e "${BLUE}🔍 Checking for remaining processes...${NC}"

for port in 8080 8081 8082 3000; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}🛑 Stopping process on port $port (PID: $pid)...${NC}"
        kill $pid 2>/dev/null
        sleep 1
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Force stopping process on port $port...${NC}"
            kill -9 $pid 2>/dev/null
        fi
    fi
done

# Clean up logs directory
if [ -d "logs" ]; then
    echo -e "${BLUE}🧹 Cleaning up logs...${NC}"
    rm -f logs/*.pid
    echo -e "${GREEN}✅ Cleanup completed${NC}"
fi

echo -e "${GREEN}🎉 All services stopped successfully!${NC}" 