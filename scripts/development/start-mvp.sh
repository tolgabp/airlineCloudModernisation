#!/bin/bash

# 🚀 MVP Flow Startup Script
# This script starts all services required for the complete MVP flow

echo "🚀 Starting Airline Modernization MVP Flow..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ Waiting for $service_name to be ready on port $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:$port/actuator/health >/dev/null 2>&1 || curl -s http://localhost:$port/api/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start within expected time${NC}"
    return 1
}

# Check if required tools are installed
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is not installed. Please install Java 17 or higher.${NC}"
    exit 1
fi

if ! command -v mvn &> /dev/null; then
    echo -e "${RED}❌ Maven is not installed. Please install Maven.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16 or higher.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites are installed${NC}"

# Check if PostgreSQL is running
echo -e "${BLUE}🔍 Checking database connection...${NC}"
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running. Please start PostgreSQL first.${NC}"
    echo -e "${YELLOW}   You can start it with: brew services start postgresql (macOS)${NC}"
    echo -e "${YELLOW}   or: sudo systemctl start postgresql (Linux)${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
fi

# Check ports
echo -e "${BLUE}🔍 Checking port availability...${NC}"
check_port 8080 || exit 1
check_port 8081 || exit 1
check_port 8082 || exit 1
check_port 3000 || exit 1

# Create logs directory
mkdir -p logs

# Start services in background
echo -e "${BLUE}🚀 Starting services...${NC}"

# Start Airline Booking Service (Port 8080)
echo -e "${YELLOW}📦 Starting Airline Booking Service...${NC}"
cd airlineBooking
mvn spring-boot:run > ../logs/airline-booking.log 2>&1 &
AIRLINE_BOOKING_PID=$!
cd ..

# Start Cloud API Layer (Port 8081)
echo -e "${YELLOW}☁️  Starting Cloud API Layer...${NC}"
cd cloudApiLayer
mvn spring-boot:run > ../logs/cloud-api.log 2>&1 &
CLOUD_API_PID=$!
cd ..

# Start Recommendation Engine (Port 8082)
echo -e "${YELLOW}🧠 Starting Recommendation Engine...${NC}"
cd recommendationEngine
mvn spring-boot:run > ../logs/recommendation-engine.log 2>&1 &
RECOMMENDATION_ENGINE_PID=$!
cd ..

# Wait for backend services to be ready
echo -e "${BLUE}⏳ Waiting for backend services to start...${NC}"

wait_for_service "Airline Booking Service" 8080 || {
    echo -e "${RED}❌ Failed to start Airline Booking Service${NC}"
    kill $AIRLINE_BOOKING_PID $CLOUD_API_PID $RECOMMENDATION_ENGINE_PID 2>/dev/null
    exit 1
}

wait_for_service "Cloud API Layer" 8081 || {
    echo -e "${RED}❌ Failed to start Cloud API Layer${NC}"
    kill $AIRLINE_BOOKING_PID $CLOUD_API_PID $RECOMMENDATION_ENGINE_PID 2>/dev/null
    exit 1
}

wait_for_service "Recommendation Engine" 8082 || {
    echo -e "${RED}❌ Failed to start Recommendation Engine${NC}"
    kill $AIRLINE_BOOKING_PID $CLOUD_API_PID $RECOMMENDATION_ENGINE_PID 2>/dev/null
    exit 1
}

# Start Frontend (Port 3000)
echo -e "${YELLOW}🎨 Starting Frontend...${NC}"
cd airline-frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    npm install
fi

npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to be ready
echo -e "${BLUE}⏳ Waiting for frontend to start...${NC}"
sleep 10

# Check if frontend is running
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is ready!${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend may still be starting up...${NC}"
fi

# Save PIDs to file for cleanup
echo $AIRLINE_BOOKING_PID > logs/airline-booking.pid
echo $CLOUD_API_PID > logs/cloud-api.pid
echo $RECOMMENDATION_ENGINE_PID > logs/recommendation-engine.pid
echo $FRONTEND_PID > logs/frontend.pid

echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Service Status:${NC}"
echo -e "  🎫 Airline Booking Service: ${GREEN}http://localhost:8080${NC}"
echo -e "  ☁️  Cloud API Layer:         ${GREEN}http://localhost:8081${NC}"
echo -e "  🧠 Recommendation Engine:    ${GREEN}http://localhost:8082${NC}"
echo -e "  🎨 Frontend:                 ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}📖 Next Steps:${NC}"
echo -e "  1. Open ${GREEN}http://localhost:3000${NC} in your browser"
echo -e "  2. Register or login to the application"
echo -e "  3. Navigate to the 'MVP Demo' tab"
echo -e "  4. Follow the step-by-step flow: Booking → Delay → Rebooking"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "  • Check logs in the 'logs' directory for debugging"
echo -e "  • Use 'tail -f logs/*.log' to monitor all services"
echo -e "  • Run './stop-mvp.sh' to stop all services"
echo ""
echo -e "${BLUE}🔍 Health Checks:${NC}"
echo -e "  • Airline Booking: ${GREEN}http://localhost:8080/actuator/health${NC}"
echo -e "  • Cloud API:       ${GREEN}http://localhost:8081/actuator/health${NC}"
echo -e "  • Recommendation:  ${GREEN}http://localhost:8082/api/recommendations/health${NC}"
echo ""

# Keep script running and handle cleanup on exit
trap 'echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"; kill $AIRLINE_BOOKING_PID $CLOUD_API_PID $RECOMMENDATION_ENGINE_PID $FRONTEND_PID 2>/dev/null; rm -f logs/*.pid; echo -e "${GREEN}✅ All services stopped${NC}"; exit 0' INT TERM

echo -e "${BLUE}⏳ Press Ctrl+C to stop all services${NC}"
wait 