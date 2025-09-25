# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a parking management system that combines OpenCV-based parking detection algorithms with a Go backend and React frontend. The system processes CCTV images to detect parking occupancy using MOG2 background subtraction algorithms.

## Architecture

### Backend (Go)
- **Framework**: Echo v4 web framework
- **Architecture**: Clean architecture with handler/usecase/repository layers
- **Database**: MySQL with GORM ORM
- **Features**: Two main feature modules - `parking` and `roi`
- **Key Components**:
  - JWT authentication with session management
  - File upload handling for CCTV images
  - Real-time parking image processing
  - Batch image synchronization from remote servers
  - RESTful API with Swagger documentation

### Frontend (React + TypeScript)
- **Framework**: React 19.1.1 with TypeScript
- **UI**: Material-UI (MUI) components
- **Architecture**: MVVM pattern with separate viewmodels/services/views
- **Testing**: Jest and React Testing Library

### OpenCV Integration
- **Language**: C++ with OpenCV 4.x
- **Algorithm**: MOG2 background subtraction for parking detection
- **Build System**: Make with pkg-config for dependency management

## Development Commands

### Backend Development
```bash
# Run Go server (from backend/src/)
go run main.go

# Install Go dependencies
go mod tidy

# Build the server
go build -o main main.go
```

### Frontend Development
```bash
# Start development server (from frontend/)
npm start

# Build for production
npm run build

# Run tests
npm test
```

### OpenCV Algorithm
```bash
# Install dependencies (macOS)
cd backend/opencv
make install-deps

# Compile C++ algorithm
make all

# Run algorithm
make run

# Clean build files
make clean
```

### Docker Development
```bash
# Start all services
docker-compose up

# Start specific service
docker-compose up backend
docker-compose up frontend
docker-compose up mysql

# Build and start
docker-compose up --build
```

## Key Patterns and Conventions

### Go Backend Structure
```
backend/src/
├── features/
│   ├── parking/     # Parking detection features
│   │   ├── handler/     # HTTP handlers
│   │   ├── usecase/     # Business logic
│   │   ├── repository/  # Data access
│   │   └── model/       # Data models
│   └── roi/         # Region of Interest management
├── common/          # Shared utilities (JWT, DB, env)
├── middleware/      # Echo middleware
└── main.go         # Application entry point
```

### Frontend Structure
```
frontend/src/
├── components/      # Reusable UI components
├── views/          # Page components
├── viewmodels/     # Business logic layer
├── services/       # API communication
├── models/         # Type definitions
├── utils/          # Helper functions
└── config/         # Configuration
```

### API Patterns
- RESTful endpoints under `/api/` prefix
- JWT token authentication required for most endpoints
- Standardized response format with `success`, `message`, `data` fields
- File uploads handled through multipart form data
- Swagger documentation available at `/swagger/*` in development

### Database Patterns
- GORM models in `model/entity/` directories
- Repository pattern for data access abstraction
- MySQL connection pooling configured in `common/db/mysql/`
- Environment-based configuration (dev/prod databases)

## Environment Configuration

### Required Environment Variables
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - MySQL configuration
- `PORT` - Server port (default 8080)
- `UPLOAD_PATH` - File upload directory path
- `JWT_SECRET` - JWT signing key
- `DEBUG` - Enable debug logging
- `IS_LOCAL` - Local development flag

### File Paths
- Uploaded images: `shared/uploads/learningImages/` and `shared/uploads/testImages/`
- Processing results: `shared/results/`
- Current batch images: `shared/uploads/{projectID}/currentImages/`

## Testing

Currently no automated tests are configured. The codebase would benefit from:
- Go unit tests for usecase layers
- Integration tests for API endpoints
- Frontend component tests (Jest/RTL setup exists but no tests implemented)

## Common Development Tasks

### Adding New Parking Features
1. Create handler in `features/parking/handler/`
2. Implement usecase in `features/parking/usecase/`
3. Add repository in `features/parking/repository/`
4. Define models in `features/parking/model/`
5. Register routes in handler `index.go`

### Debugging OpenCV Issues
- Check pkg-config can find libraries: `pkg-config --cflags --libs opencv4`
- Verify dependencies: `brew list opencv nlohmann-json`
- Build with verbose output: `make VERBOSE=1`

### Database Schema Changes
- Update GORM models in entity files
- Run migrations (auto-migrate enabled in development)
- Update repository queries as needed