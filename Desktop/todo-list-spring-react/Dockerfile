# Stage 1: Build frontend
FROM node:20-slim AS frontend-build
WORKDIR /app
COPY Desktop/todo-list-spring-react/ ./project/
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN cd project && pnpm install --frozen-lockfile
RUN cd project && pnpm build

# Stage 2: Build backend
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY Desktop/todo-list-spring-react/backend/ ./project/backend/
RUN cd project/backend && mvn dependency:go-offline -B
RUN cd project/backend && mvn clean package -DskipTests

# Stage 3: Final image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=backend-build /app/project/backend/target/*.jar app.jar
COPY --from=frontend-build /app/project/dist/public/ ./dist/public/

ENV FRONTEND_PATH=/app/dist/public
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
