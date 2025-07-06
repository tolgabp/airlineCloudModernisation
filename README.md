# Airline Modernization System

## Project Story
While studying IBM’s Introduction to Cloud Computing, I was inspired by a real-world example of how airlines modernize their systems. 
Most still run reservation systems on-prem, but use the cloud to build web apps and backend services that improve user experience—especially for things like flight delays and rebooking.

This project simulates that idea:
A frontend connects to a cloud backend, which integrates with a simulated reservation system. When a delay happens, a recommendation engine suggests alternative flights, helping users rebook instantly.

It’s my way of applying cloud concepts to solve a real problem.



## Architecture

```
Frontend (React) → Cloud API Layer → Airline Booking Service
                              ↓
                    Recommendation Engine
```

### Services

- **Frontend**: React + TypeScript + TailwindCSS
- **Cloud API Layer**: Spring Boot (API Gateway)
- **Airline Booking**: Spring Boot + PostgreSQL (Core booking service)
- **Recommendation Engine**: Spring Boot + PostgreSQL (Delay & rerouting logic)

## Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- Maven
- PostgreSQL

### Local Development

1. Start backend services:
```bash
cd airlineBooking && mvn spring-boot:run
cd ../cloudApiLayer && mvn spring-boot:run
cd ../recommendationEngine && mvn spring-boot:run
```

2. Start frontend:
```bash
cd airline-frontend && npm start
```

3. Access application:
- Frontend: http://localhost:3000
- Airline Booking API: http://localhost:8080
- Cloud API Layer: http://localhost:8081
- Recommendation Engine: http://localhost:8082

## Deployment

### Heroku Deployment

Use the automated deployment script:
```bash
./scripts/deployment/deploy-to-heroku.sh
```

### Deployment Checklist

**Pre-deployment:**
- Set `JWT_SECRET` environment variable on all backend services
- Ensure PostgreSQL databases are provisioned

**Deployment order:**
1. airlineBooking (core service with database)
2. recommendationEngine (depends on database)
3. cloudApiLayer (depends on other services)
4. airline-frontend (depends on cloud API layer)

**Post-deployment verification:**
- Health check endpoints respond
- Frontend connects to backend services
- Authentication flow works
- Flight booking functionality works

### Environment Variables

**Required:**
- `JWT_SECRET` - Must be set on all backend services
- `DATABASE_URL` - Auto-set by Heroku PostgreSQL
- `PORT` - Auto-set by Heroku

**Optional:**
- `ADMIN_USERNAME` - For basic auth
- `ADMIN_PASSWORD` - For basic auth

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Flights
- `GET /api/flights` - Get available flights
- `GET /api/flights/{id}` - Get flight details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - Get user bookings
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

### Recommendations
- `POST /api/recommendations/notify-delay` - Create delay notification
- `GET /api/recommendations/suggestions` - Get rebooking suggestions



## Development Scripts

- `./scripts/development/start-mvp.sh` - Start all services locally
- `./scripts/development/stop-mvp.sh` - Stop all services
- `./scripts/deployment/health-check.sh` - Check service health
- `./scripts/deployment/cleanup-heroku.sh` - Remove Heroku apps

 