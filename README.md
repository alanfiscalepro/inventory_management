# Warehouse Management System

A full-stack industrial warehouse management application with real-time inventory tracking, transactions, and reservations.

## Tech Stack

### Backend
- **Spring Boot 3.2.1** - Java 17
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **JPA/Hibernate** - ORM
- **Maven** - Build tool
- **JUnit 5** & **Testcontainers** - Testing

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling with custom dark industrial theme
- **React Query (@tanstack/react-query)** - Data fetching & caching
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **IBM Plex & Syne fonts** - Unique typography

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **Coolify** - Deployment platform

## Features

### Core Functionality
- ✅ Warehouse management (CRUD operations)
- ✅ Product inventory tracking with SKU management
- ✅ Stock transactions (IN/OUT/ADJUSTMENT)
- ✅ Reservation system with status tracking
- ✅ Real-time stock availability calculation
- ✅ Low stock alerts
- ✅ Redis caching for improved performance

### Design Highlights
- 🎨 **Industrial dark theme** with cyan and amber accents
- 🔤 **Distinctive typography** using IBM Plex Sans, IBM Plex Mono, and Syne
- ✨ **Smooth animations** with staggered reveals and micro-interactions
- 📊 **Real-time dashboard** with key metrics
- 🎭 **Gradient glows** and depth effects
- 📱 **Fully responsive** design

## Project Structure

```
inventoryManager/
├── backend/
│   ├── src/
│   │   ├── main/java/com/warehouse/inventory/
│   │   │   ├── controller/       # REST controllers
│   │   │   ├── service/          # Business logic
│   │   │   ├── repository/       # Data access
│   │   │   ├── entity/           # JPA entities
│   │   │   ├── dto/              # Request/Response DTOs
│   │   │   └── exception/        # Exception handling
│   │   └── test/                 # Unit & integration tests
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── app/                      # Next.js App Router
│   ├── components/               # React components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # API client & utilities
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Getting Started

### Prerequisites
- Docker & Docker Compose
- (Optional) Java 17+ and Node.js 20+ for local development

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   cd inventoryManager
   ```

2. **Configure environment variables**
   ```bash
   # Backend (optional - defaults provided)
   cp .env.example .env

   # Frontend
   cd frontend
   cp .env.example .env.local
   ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - API Health: http://localhost:8080/actuator/health

### Local Development

#### Backend
```bash
cd backend

# Run tests
./mvnw test

# Run application
./mvnw spring-boot:run
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Testing

### Backend Tests
- **Unit Tests**: Service layer with Mockito
- **Integration Tests**: Full API endpoint testing with H2/Testcontainers
- **Repository Tests**: JPA repository validation

Run all tests:
```bash
cd backend
./mvnw test
```

### Frontend Tests
- **Component Tests**: React Testing Library
- **Hook Tests**: Custom hook validation
- **Integration Tests**: API integration

Run tests:
```bash
cd frontend
npm test
```

## API Endpoints

### Warehouses
- `GET /api/warehouses` - List all warehouses
- `GET /api/warehouses/{id}` - Get warehouse by ID
- `POST /api/warehouses` - Create warehouse
- `PUT /api/warehouses/{id}` - Update warehouse
- `DELETE /api/warehouses/{id}` - Delete warehouse

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/warehouse/{warehouseId}` - Get products by warehouse
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Transactions
- `GET /api/transactions` - List all transactions
- `GET /api/transactions/{id}` - Get transaction by ID
- `GET /api/transactions/product/{productId}` - Get transactions by product
- `POST /api/transactions` - Create transaction

### Reservations
- `GET /api/reservations` - List all reservations
- `GET /api/reservations/{id}` - Get reservation by ID
- `GET /api/reservations/product/{productId}` - Get reservations by product
- `POST /api/reservations` - Create reservation
- `POST /api/reservations/{id}/confirm` - Confirm reservation
- `POST /api/reservations/{id}/cancel` - Cancel reservation
- `POST /api/reservations/{id}/fulfill` - Fulfill reservation

## Deployment to Coolify

### Prerequisites
- Coolify instance running
- Git repository connected to Coolify

### Deployment Steps

1. **Connect Repository**
   - In Coolify, create a new application
   - Connect your Git repository

2. **Configure Build Settings**
   - Set build pack to `Docker Compose`
   - Use the provided `docker-compose.yml`

3. **Environment Variables**
   Set these in Coolify:
   ```
   # Database
   POSTGRES_DB=warehouse_db
   POSTGRES_USER=warehouse_user
   POSTGRES_PASSWORD=<secure-password>

   # Frontend
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   ```

4. **Deploy**
   - Coolify will automatically build and deploy using Docker Compose
   - The application will be available at your configured domain

### Production Considerations
- Use strong passwords for PostgreSQL
- Enable SSL/TLS for API endpoints
- Configure Redis persistence if needed
- Set up monitoring and logging
- Configure backup strategy for PostgreSQL

## Design System

### Color Palette
- **Primary Background**: `#0d0d12`
- **Secondary Background**: `#16161d`
- **Accent Cyan**: `#00d4ff`
- **Accent Amber**: `#ffb020`
- **Success**: `#00e599`
- **Error**: `#ff5c7c`

### Typography
- **Display**: Syne (600-800)
- **Body**: IBM Plex Sans (300-700)
- **Monospace**: IBM Plex Mono (400-700)

## Development Approach

This project follows **Test-Driven Development (TDD)**:
1. Tests written first
2. Implementation follows to pass tests
3. Comprehensive coverage across unit, integration, and E2E tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests first (TDD)
4. Implement features
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Acknowledgments

- Built with modern best practices
- Industrial design inspired by warehouse management UX
- Performance-optimized with caching and lazy loading
