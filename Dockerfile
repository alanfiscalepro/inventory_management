# Multi-stage Dockerfile for both Backend and Frontend

# Stage 1: Build Backend
FROM maven:3.9-eclipse-temurin-17-alpine AS backend-build
WORKDIR /backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 3: Runtime - Backend
FROM eclipse-temurin:17-jre-alpine AS backend-runtime
WORKDIR /app
COPY --from=backend-build /backend/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
