# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shift-Agent is a fullstack web application for AI-powered workforce scheduling management in restaurants and retail stores. It uses Google's Gemini LLM to generate optimized shift schedules while considering business constraints, labor costs, and employee preferences.

## Development Commands

### Frontend (React TypeScript)
```bash
cd frontend

# Install dependencies
npm install

# Start development server (runs on port 8080)
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npm test -- --testNamePattern="ComponentName"
```

### Backend (Python FastAPI)
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --port 8000

# Run with Docker
docker-compose up

# Access API documentation
# http://localhost:8000/docs (Swagger UI)
```

## Architecture Overview

### Backend Architecture

The backend follows Clean Architecture principles with Domain-Driven Design:

1. **Domain Layer** (`/domain/`): Core business entities and validation rules
   - Each entity has a `to_json()` method for serialization
   - Comprehensive validation layer with business rule validators

2. **Repository Layer** (`/repository/`): Database access using SQLAlchemy ORM
   - CRUD operations for each entity
   - Firebase authentication integration
   - Proper relationship management

3. **Use Case Layer** (`/usecase/`): Business logic orchestration
   - Coordinates between domain entities and repositories
   - Implements complex business workflows

4. **Service Layer** (`/service/`): External service integrations
   - AI agent implementation for shift creation
   - Token and authentication services

5. **Routes Layer** (`/routes/`): FastAPI route definitions
   - Modular router system with role-based endpoints
   - Clear separation between owner and crew endpoints

### AI Agent System

The shift creation AI agent (`/service/agent/shift_creator.py`) implements a sophisticated workflow:

1. **create_shift_draft_tool**: Generates initial shift based on constraints
2. **eval_shift_tool**: Evaluates shift quality (100-point deduction system)
3. **modify_shift_tool**: Iteratively improves shifts based on evaluation

The agent runs through a Create → Evaluate → Modify cycle (default: 3 iterations) to optimize shifts.

### Frontend Architecture

React TypeScript application with role-based UI:

1. **Authentication Flow**: 
   - Firebase Auth with cookie-based sessions
   - AuthContext for centralized state management
   - Auto-logout on 401 responses

2. **Service Layer Pattern**: 
   - Each backend domain has a corresponding frontend service
   - Axios client with auth interceptors at `/Services/apiClient.ts`

3. **Role-Based Routing**:
   - `/host/*`: Owner features (shift creation, crew management)
   - `/crew/*`: Crew features (shift preferences, schedule viewing)

## Key Development Patterns

1. **API Client Configuration**: The frontend API client (`/frontend/src/Services/apiClient.ts`) handles authentication automatically. No need to manually add auth headers in service methods.

2. **Error Handling**: The API client automatically redirects to login on 401 errors. Handle other errors appropriately in components.

3. **Type Safety**: Use TypeScript interfaces in `/frontend/src/Types/` for all API responses and domain objects.

4. **Firebase Integration**: Authentication tokens are managed via cookies. Use `AuthService` methods for login/logout operations.

5. **Environment Variables**:
   - Frontend: `REACT_APP_API_BASE_URL` (defaults to production backend)
   - Backend: Secrets managed via Google Secret Manager

## Database Schema

Key relationships:
- User → Company (many-to-one)
- User → UserProfile (one-to-one)
- User → SubmittedShift (one-to-many)
- Company → DecisionShift (one-to-many)
- DecisionShift → ShiftDetail (one-to-many)

## Testing Approach

- Frontend: Jest + React Testing Library (no specific test files found yet)
- Backend: Test structure not yet implemented

When adding tests, follow the existing project structure and naming conventions.

## Deployment

- Backend: Dockerized for Google Cloud Run deployment
- Frontend: Build and serve via Nginx
- Database: Cloud SQL with pgvector extension
- Current production backend: https://shift-agent-backend-562837022896.asia-northeast1.run.app