 
# Notification System Design

## Architecture Overview
A full-stack notification system built with Next.js (Frontend) and Express.js (Backend), with a reusable logging middleware.

## Components

### 1. Logging Middleware
- Reusable package that sends logs to the test server
- Supports stack: backend, frontend
- Supports levels: debug, info, warn, error, fatal
- Integrated throughout the application

### 2. Backend (notification_app_be)
- Framework: Express.js with TypeScript
- Port: 5000
- Endpoints:
  - POST /api/notifications - Create a notification
  - GET /api/notifications - Get all notifications
- Layers: Routes → Controllers → Services

### 3. Frontend (notification_app_fe)
- Framework: Next.js with TypeScript
- Port: 3000
- UI Library: Material UI
- Features:
  - Create notifications via form
  - View all notifications in real time

## Data Flow
1. User submits notification on Frontend
2. Frontend calls Backend API
3. Backend stores notification and returns response
4. Frontend displays updated notifications list
5. Logs are sent at every step via Logging Middleware