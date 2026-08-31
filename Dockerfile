# Stage 1: Build frontend
FROM node:20-slim AS frontend-build
WORKDIR /app
COPY Desktop/todo-list-spring-react/package.json Desktop/todo-list-spring-react/pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN cd Desktop/todo-list-spring-react && pnpm install --frozen-lockfile
COPY Desktop/todo-list-spring-react/client/ ./Desktop/todo-list-spring-react/client/
COPY Desktop/todo-list-spring-react/vite.config.ts Desktop/todo-list-spring-react/tsconfig.json Desktop/todo-list-spring-react/tsconfig.node.json ./Desktop/todo-list-spring-react/
RUN cd Desktop/todo-list-spring-react && pnpm build

# Stage 2: Build backend
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY Desktop/todo-list-spring-react/backend/pom.xml ./Desktop/todo-list-spring-react/backend/pom.xml
RUN cd Desktop/todo-list-spring-react/backend && mvn dependency:go-offline -B
COPY Desktop/todo-list-spring-react/backend/src ./Desktop/todo-list-spring-react/backend/src
RUN cd Desktop/todo-list-spring-react/backend && mvn clean package -DskipTests

# Stage 3: Final image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=backend-build /app/Desktop/todo-list-spring-react/backend/target/*.jar app.jar
COPY --from=frontend-build /app/Desktop/todo-list-spring-react/dist/public/ ./dist/public/

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
