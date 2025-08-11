# Ebusewa - Bus Ticket Booking Platform

![Ebusewa](https://img.shields.io/badge/platform-Ebusewa-blue)
![Status](https://img.shields.io/badge/status-in--development-yellow)
![Tech](https://img.shields.io/badge/tech-TypeScript%2C%20React%2C%20Node.js-brightgreen)

## 1. Overview

Ebusewa is a comprehensive, modern bus ticket booking platform designed to streamline the process of purchasing and managing bus tickets for both customers and administrators. The project is built as a monorepo, containing multiple frontend applications and a centralized backend API, ensuring a scalable and maintainable codebase.

The platform provides distinct interfaces for different user roles:
-   **Clients:** A public-facing website for searching routes, booking tickets, and making payments.
-   **Admins:** A dedicated dashboard for bus operators to manage their fleet, schedules, bookings, and view operational analytics.
-   **Super Admins:** A top-level administrative interface for platform owners to oversee all operations and manage administrator accounts.

---

## 2. Architecture

The project is structured as a monorepo managed with npm workspaces. This architecture promotes code sharing, consistency, and efficient development across the entire platform.

### Core Components:

| Path                  | Component      | Description                                                                                             |
| --------------------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| `apps/client`         | **Client App** | The main customer-facing React application for booking and managing bus tickets.                        |
| `apps/admin`          | **Admin App**  | A feature-rich dashboard for bus operators to manage their services.                                    |
| `apps/superadmin`     | **Super Admin**| A high-level dashboard for platform oversight and administration.                                       |
| `services/api`        | **Backend API**| A central Node.js/Express API that powers all frontend applications, handling business logic and data.    |
| `packages/common`     | **Shared Lib** | A shared TypeScript package containing common types, validation schemas, and utilities used across the repo. |

### Technology Stack:

-   **Frontend:** React, Vite, TypeScript, Tailwind CSS
-   **Backend:** Node.js, Express.js, TypeScript
-   **Database:** PostgreSQL with Prisma ORM
-   **Authentication:** JWT (JSON Web Tokens)
-   **Code Quality:** ESLint, Prettier

---

## 3. Features

### Client Application (`apps/client`)
-   **Route Search:** Find available bus routes based on origin, destination, and date.
-   **Seat Selection:** Interactive seat map for choosing preferred seats.
-   **Booking:** Secure and straightforward booking process.
-   **Payment Integration:** Support for multiple payment methods.
-   **User Profiles:** Manage personal information and view booking history.

### Admin Dashboard (`apps/admin`)
-   **Dashboard:** At-a-glance overview of key metrics (bookings, revenue, etc.).
-   **Schedule Management:** Create, update, and delete bus schedules.
-   **Booking Management:** View and manage all customer bookings.
-   **Fleet Management:** Add and maintain details of the bus fleet.
-   **Payment Tracking:** Monitor and verify payments.

### Super Admin Dashboard (`apps/superadmin`)
-   **System-Wide Analytics:** Access to comprehensive data across all operators.
-   **Admin Account Management:** Onboard and manage bus operator accounts.
-   **Platform Configuration:** High-level settings and system management.

---

## 4. Backend API (`services/api`)

The backend is a robust Node.js application that serves as the backbone for the entire platform. It follows a standard service-oriented architecture.

-   **`/routes`**: Defines all API endpoints.
-   **`/controllers`**: Handles request and response logic.
-   **`/services`**: Contains the core business logic for each domain (e.g., `booking.service.ts`, `payment.service.ts`).
-   **`/middleware`**: Includes middleware for authentication (`authenticateJWT.ts`) and role-based access control (`authorizeRoles.ts`).
-   **`/prisma`**: Manages the database schema, migrations, and type-safe database access.

---

## 5. Shared Package (`packages/common`)

To ensure consistency and reduce code duplication, the `common` package shares critical code between the frontend and backend.

-   **`/schemas`**: Zod schemas for robust data validation on both the client and server.
-   **`/types`**: TypeScript interfaces and enums (e.g., `Booking`, `User`, `Role`) that define the data models for the entire application.
-   **`/utils`**: Common utility functions, such as loggers.
