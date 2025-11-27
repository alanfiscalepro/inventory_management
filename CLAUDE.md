# CLAUDE.md - Project Context for Claude Code

## Project Overview

**Warehouse Management System** - A full-stack industrial inventory management application with real-time tracking, transactions, and reservations.

### Tech Stack
- **Backend**: Spring Boot 3.2.1, Java 17, PostgreSQL 15, Redis 7
- **Frontend**: Next.js 16 (App Router), TypeScript 5, TailwindCSS 4, React Query
- **Infrastructure**: Docker, Docker Compose

## Quick Start Commands

```bash
# Full stack with Docker
docker-compose up --build

# Backend only (requires PostgreSQL and Redis running)
cd backend && ./mvnw spring-boot:run

# Frontend only
cd frontend && npm install && npm run dev

# Run all tests
cd backend && ./mvnw test
cd frontend && npm test
```

## Project Structure

```
inventory_management/
├── backend/                          # Spring Boot API (port 8080)
│   └── src/main/java/com/warehouse/inventory/
│       ├── controller/               # REST controllers
│       ├── service/                  # Business logic interfaces
│       │   └── impl/                 # Service implementations
│       ├── repository/               # JPA repositories
│       ├── entity/                   # Domain entities & enums
│       ├── dto/                      # Request/response DTOs
│       │   ├── request/
│       │   └── response/
│       └── exception/                # Exception handling
├── frontend/                         # Next.js app (port 3000)
│   ├── app/                          # App Router pages
│   ├── lib/                          # API client & utilities
│   └── hooks/                        # Custom React hooks
└── docker-compose.yml                # Container orchestration
```

## API Endpoints

Base URL: `http://localhost:8080/api`

| Resource      | Endpoints                                      |
|---------------|------------------------------------------------|
| Warehouses    | `GET/POST /warehouses`, `GET/PUT/DELETE /warehouses/{id}` |
| Products      | `GET/POST /products`, `GET/PUT/DELETE /products/{id}`, `GET /products/warehouse/{id}` |
| Transactions  | `GET/POST /transactions`, `GET /transactions/{id}`, `GET /transactions/product/{id}` |
| Reservations  | `GET/POST /reservations`, `GET /reservations/{id}`, `POST /reservations/{id}/confirm\|cancel\|fulfill` |

Health check: `GET http://localhost:8080/actuator/health`

## Architecture Patterns

### Backend (Java/Spring Boot)

**Layered Architecture**: Controller → Service → Repository → Entity

- **Controllers**: Thin, handle HTTP mapping and validation only
- **Services**: All business logic, transaction management
- **Repositories**: JPA interfaces, custom queries with `@Query`
- **DTOs**: Separate request/response objects, use `fromEntity()` pattern

**Key Conventions**:
- Use `@RequiredArgsConstructor` for constructor injection
- Use `@Transactional(readOnly = true)` for read operations
- Use `@Slf4j` for logging
- Throw custom exceptions: `ResourceNotFoundException`, `DuplicateResourceException`, `InsufficientStockException`

### Frontend (TypeScript/Next.js)

**Data Flow**: Page → Custom Hook → React Query → API Client → Backend

- **API Client** (`lib/api.ts`): Axios with interceptors, typed API functions
- **Custom Hooks** (`hooks/`): CRUD operations with React Query mutations
- **Pages** (`app/`): Use client components with `'use client'` directive

**Key Conventions**:
- Use React Query for server state management
- Use Framer Motion for animations
- Follow CSS variable design system in `globals.css`

## Database Schema

```
Warehouse (1) ──→ (Many) Product
                         ↓
                   ├──→ Transaction (audit trail)
                   └──→ Reservation (stock holds)
```

**Key Entities**:
- `Warehouse`: name (unique), location, description, active
- `Product`: sku (unique), name, quantity, reservedQuantity, price, warehouseId
- `Transaction`: type (INBOUND/OUTBOUND/ADJUSTMENT/etc), quantity, productId
- `Reservation`: status (ACTIVE/FULFILLED/CANCELLED/EXPIRED), quantity, productId

## Testing

### Backend Tests
```bash
cd backend
./mvnw test                    # All tests
./mvnw test -Dtest=*Controller*  # Controller tests only
./mvnw test -Dtest=*Service*     # Service tests only
```

- Unit tests with Mockito and MockMvc
- Integration tests with Testcontainers (PostgreSQL)
- Test config: `application-test.yml` uses H2

### Frontend Tests
```bash
cd frontend
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

- Jest with React Testing Library
- Mock API calls with axios-mock-adapter

## Code Style Guidelines

### Java
- Follow standard Java naming conventions
- Use Lombok annotations to reduce boilerplate
- DTOs should have static `fromEntity()` factory methods
- Keep controllers thin - delegate to services
- Use `Optional` for nullable returns from repositories

### TypeScript
- Use strict TypeScript (`strict: true`)
- Define interfaces for all API types in `lib/api.ts`
- Use path aliases (`@/`) for imports
- Prefer functional components with hooks

## Environment Variables

### Backend (`application.yml`)
```yaml
SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/inventory_db
SPRING_DATASOURCE_USERNAME: postgres
SPRING_DATASOURCE_PASSWORD: postgres
SPRING_REDIS_HOST: localhost
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Common Tasks

### Add a new entity
1. Create entity in `backend/entity/`
2. Create repository in `backend/repository/`
3. Create request/response DTOs in `backend/dto/`
4. Create service interface and implementation
5. Create controller with REST endpoints
6. Add TypeScript types in `frontend/lib/api.ts`
7. Create custom hook in `frontend/hooks/`
8. Write tests for service and controller

### Add a new API endpoint
1. Add method to service interface
2. Implement in service implementation with logging
3. Add REST mapping in controller
4. Update frontend API client
5. Write unit tests

### Fix a bug
1. Write a failing test that reproduces the bug
2. Fix the code
3. Verify test passes
4. Run full test suite

## Important Files

| File | Purpose |
|------|---------|
| `backend/pom.xml` | Maven dependencies |
| `backend/src/main/resources/application.yml` | Spring Boot config |
| `frontend/package.json` | npm dependencies |
| `frontend/lib/api.ts` | API client and types |
| `frontend/app/globals.css` | Design system CSS |
| `docker-compose.yml` | Container orchestration |

## Debugging Tips

- Backend logs: Check console output, configured at DEBUG level
- API issues: Use `/actuator/health` endpoint
- Database: Connect to PostgreSQL on port 5432
- Redis: Connect to Redis on port 6379
- Frontend: Check browser DevTools Network tab

## Deployment

See `DEPLOYMENT.md` for Coolify deployment instructions.

Docker images are multi-stage builds optimized for production.
