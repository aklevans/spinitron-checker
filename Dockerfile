# Stage 1: Build React frontend
FROM node:20-alpine as frontend
WORKDIR /app
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# Stage 2: Build backend and serve frontend
FROM node:20-alpine
WORKDIR /app

# Copy backend code
COPY backend/package*.json ./
RUN npm install
COPY backend .

# Copy React build files from frontend
COPY --from=frontend /app/frontend/build ./frontend/build

# Serve static files in Express (should use express.static to serve ./frontend/build)
CMD ["node", "./bin/www"]
EXPOSE 8080
