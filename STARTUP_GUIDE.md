# eBus Startup Guide

This guide explains how to start and manage the eBus application services.

## Quick Start

### First Time Setup
If you're setting up the project for the first time or after pulling changes:

```bash
# Install dependencies and set up common package
npm install
npm run setup

# Or use the combined command
npm run build:setup
```

### Start All Services
```bash
npm start
```

This will start all services:
- API Service (Port 3001)
- Client App (Port 3000)
- Admin App (Port 3006)
- Superadmin App (Port 3002)

### Check Service Status
```bash
npm run status
```

This will show the status of all services and provide access URLs.

## Service Details

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| API Service | 3001 | http://localhost:3001 | Backend API with health endpoint |
| Client App | 3000 | http://localhost:3000 | Main client application |
| Admin App | 3006 | http://localhost:3006 | Admin dashboard |
| Superadmin App | 3002 | http://localhost:3002 | Superadmin dashboard |

## Development Commands

### Start Individual Services
```bash
# Start API in development mode
npm run dev:api

# Start client app in development mode
npm run dev:client

# Start admin app in development mode
npm run dev:admin

# Start superadmin app in development mode
npm run dev:superadmin

# Start all services in development mode
npm run dev
```

### Build Commands
```bash
# Build all applications (after setup)
npm run build

# Build with automatic setup (recommended for first time)
npm run build:setup

# Build specific workspace
npm run build --workspace=@ebusewa/client
```

## Troubleshooting

### Build Issues
If you encounter build errors related to `@ebusewa/common` package:

```bash
# Run the setup script to fix common package dependencies
npm run setup

# Then try building again
npm run build
```

### Services Not Starting
1. Check if dependencies are installed:
   ```bash
   npm install
   npm run setup
   ```

2. Check if ports are available:
   ```bash
   lsof -i :3000
   lsof -i :3001
   lsof -i :3002
   lsof -i :3006
   ```

3. Kill existing processes:
   ```bash
   pkill -f "node.*ebus"
   pkill -f "vite"
   ```

### Database Connection Issues
Make sure the database is running and the connection string is correct in the environment variables.

### Port Conflicts
If a port is already in use, the service will fail to start. Check the port usage and kill conflicting processes.

## Production Deployment

For production deployment, use PM2:

```bash
# Start with PM2
npm run pm2:start

# Stop PM2 processes
npm run pm2:stop

# Restart PM2 processes
npm run pm2:restart

# View logs
npm run pm2:logs

# Monitor processes
npm run pm2:monit
```

## Environment Variables

Make sure to set up the following environment variables in the API service:

- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Secret for JWT tokens
- `PORT`: API port (default: 3001)
- `SMTP_USER`: Email service username
- `SMTP_PASS`: Email service password

## File Structure

```
ebus/
├── startup.js          # Main startup script
├── status.js           # Service status checker
├── package.json        # Root package.json with scripts
├── apps/               # Frontend applications
│   ├── client/         # Main client app (Port 3000)
│   ├── admin/          # Admin dashboard (Port 3006)
│   └── superadmin/     # Superadmin dashboard (Port 3002)
└── services/           # Backend services
    └── api/            # API service (Port 3001)
```

## Stopping Services

To stop all services, press `Ctrl+C` in the terminal where `npm start` is running, or use:

```bash
pkill -f "node.*ebus"
pkill -f "vite"
``` 