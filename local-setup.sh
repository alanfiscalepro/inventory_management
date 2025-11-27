#!/bin/bash

# Inventory Manager - Local Development Setup Script
# This script sets up and runs the complete application stack locally

set -e

echo "========================================="
echo "Inventory Manager - Local Setup"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
echo "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed and running${NC}"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cp .env.local.example .env.local

    # Generate JWT secret
    echo "Generating JWT secret..."
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

    # Update JWT_SECRET in .env.local
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|JWT_SECRET=|JWT_SECRET=${JWT_SECRET}|g" .env.local
    else
        # Linux
        sed -i "s|JWT_SECRET=|JWT_SECRET=${JWT_SECRET}|g" .env.local
    fi

    echo -e "${GREEN}✓ Created .env.local with generated JWT secret${NC}"
else
    echo -e "${YELLOW}⚠ .env.local already exists, skipping creation${NC}"

    # Check if JWT_SECRET is empty
    if grep -q "JWT_SECRET=$" .env.local || grep -q "JWT_SECRET=\"\"$" .env.local; then
        echo "Generating JWT secret for existing .env.local..."
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" .env.local
        else
            sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" .env.local
        fi

        echo -e "${GREEN}✓ Updated JWT secret in .env.local${NC}"
    fi
fi
echo ""

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose -f docker-compose.local.yaml down 2>/dev/null || true
echo -e "${GREEN}✓ Cleaned up existing containers${NC}"
echo ""

# Pull/build images
echo "Building Docker images (this may take a few minutes)..."
docker-compose -f docker-compose.local.yaml build --pull
echo -e "${GREEN}✓ Docker images built successfully${NC}"
echo ""

# Start services
echo "Starting services..."
docker-compose -f docker-compose.local.yaml --env-file .env.local up -d
echo -e "${GREEN}✓ Services started${NC}"
echo ""

# Wait for services to be healthy
echo "Waiting for services to be ready..."
echo -n "- PostgreSQL: "
for i in {1..30}; do
    if docker-compose -f docker-compose.local.yaml exec -T postgres pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}✓ Ready${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Timeout${NC}"
    fi
done

echo -n "- Backend: "
for i in {1..60}; do
    if curl -f http://localhost:8080/actuator/health &> /dev/null; then
        echo -e "${GREEN}✓ Ready${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 60 ]; then
        echo -e "${YELLOW}⚠ Taking longer than expected (check logs with: docker-compose -f docker-compose.local.yaml logs backend)${NC}"
    fi
done

echo -n "- Frontend: "
for i in {1..60}; do
    if curl -f http://localhost:3000 &> /dev/null; then
        echo -e "${GREEN}✓ Ready${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 60 ]; then
        echo -e "${YELLOW}⚠ Taking longer than expected (check logs with: docker-compose -f docker-compose.local.yaml logs frontend)${NC}"
    fi
done

echo ""
echo "========================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "========================================="
echo ""
echo "Your application is now running:"
echo ""
echo -e "  📱 Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "  🔧 Backend:   ${GREEN}http://localhost:8080${NC}"
echo -e "  🗄️  Database:  ${GREEN}localhost:5432${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose -f docker-compose.local.yaml logs -f"
echo "  Stop services:    docker-compose -f docker-compose.local.yaml down"
echo "  Restart services: docker-compose -f docker-compose.local.yaml restart"
echo "  View status:      docker-compose -f docker-compose.local.yaml ps"
echo ""
echo "Database credentials:"
echo "  Database: inventory_db"
echo "  User:     postgres"
echo "  Password: postgres"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop watching logs, or run 'docker-compose -f docker-compose.local.yaml logs -f' to view them again${NC}"
echo ""

# Follow logs
docker-compose -f docker-compose.local.yaml logs -f
