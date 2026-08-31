# Stage 1: Build frontend
FROM node:20-slim AS frontend-build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN pnpm install --frozen-lockfile
COPY client/ ./client/
COPY vite.config.ts tsconfig.json tsconfig.node.json ./
RUN pnpm build

# Stage 2: Build backend
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY backend/pom.xml ./backend/pom.xml
RUN cd backend && mvn dependency:go-offline -B
COPY backend/src ./backend/src
RUN cd backend && mvn clean package -DskipTests

# Stage 3: Final image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
COPY --from=frontend-build /app/dist/public/ ./dist/public/

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
