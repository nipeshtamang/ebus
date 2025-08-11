# Return Booking System Documentation

## Overview

The Ebusewa bus booking system has comprehensive support for return bookings (round-trip tickets). This document explains how the return booking system works, how to use it, and how it's implemented.

## System Architecture

### Database Schema
The return booking system is built around the `isReturn` field in the `Schedule` table:
- **One-way schedules**: `isReturn = false`
- **Return schedules**: `isReturn = true`

### Key Components

1. **Schedule Management** (Superadmin)
   - Create schedules with `isReturn` flag
   - Manage both onward and return schedules separately
   - Each return trip is a separate schedule entity

2. **Booking Creation** (Admin)
   - Support for booking both onward and return trips in a single transaction
   - Separate tickets generated for each direction
   - Individual passenger details for each trip

3. **Search & Discovery** (Admin)
   - Search for schedules with return trip support
   - Filter by trip type (one-way vs round-trip)

## How Return Bookings Work

### 1. Schedule Creation (Superadmin)

Superadmins create schedules through the Fleet Management interface:

```typescript
// Example schedule creation
{
  routeId: 1,
  busId: 2,
  departure: "2024-01-15T08:00:00Z",
  fare: 500,
  isReturn: false  // One-way trip
}

// Return schedule (separate entity)
{
  routeId: 2,  // Reverse route (destination → origin)
  busId: 2,
  departure: "2024-01-16T18:00:00Z",
  fare: 500,
  isReturn: true   // Return trip
}
```

### 2. Booking Process (Admin)

Admins can book return trips using the `AdminCreateBookingInput` schema:

```typescript
interface AdminCreateBookingInput {
  // Onward trip
  scheduleId: number;
  passengers: PassengerDetails[];
  
  // Return trip (optional)
  returnScheduleId?: number;
  returnPassengers?: PassengerDetails[];
  
  // Booker details
  bookerName: string;
  bookerPhone: string;
  bookerEmail?: string;
  paymentMethod?: string;
}
```

### 3. Search Functionality

The search system supports return trip discovery:

```typescript
// Search parameters
{
  origin: "Kathmandu",
  destination: "Pokhara", 
  departureDate: "2024-01-15",
  isReturn: true  // Include return schedules
}
```

## Current Implementation Status

### ✅ Completed Features

1. **Database Support**
   - `isReturn` field in Schedule table
   - Proper schema validation
   - Database relationships

2. **Backend API**
   - Schedule creation with return support
   - Booking service handles return bookings
   - Search API supports return filtering
   - Email notifications for both trips
   - QR code generation for each ticket

3. **Superadmin Interface**
   - Fleet Management supports return schedule creation
   - Schedule filtering by return type
   - Visual indicators for return schedules

4. **Admin Interface**
   - Bus search supports round-trip selection
   - Booking creation handles return trips
   - Separate tickets generated for each direction

### 🔄 Areas for Enhancement

1. **User Experience**
   - Better visual distinction between onward/return schedules
   - Improved return trip selection workflow
   - Clearer pricing display for round trips

2. **Schedule Management**
   - Bulk creation of return schedules
   - Template-based schedule creation
   - Better route management for return trips

## Usage Guide

### For Superadmins: Creating Return Schedules

1. **Navigate to Fleet Management**
2. **Go to Schedules tab**
3. **Click "Add Schedule"**
4. **Fill in schedule details:**
   - Select route (ensure return routes exist)
   - Select bus
   - Set departure time
   - Set fare
   - **Check "Return Trip" checkbox**
5. **Save the schedule**

### For Admins: Booking Return Trips

1. **Navigate to Bus Search**
2. **Select "Round Trip" option**
3. **Fill in search criteria:**
   - From/To cities
   - Departure date
   - Return date (if round trip)
4. **Search for available buses**
5. **Select seats for onward journey**
6. **Select return schedule and seats**
7. **Fill passenger details for both trips**
8. **Complete booking**

## Technical Implementation

### Key Files

1. **Backend Services**
   - `services/api/src/services/booking.service.ts` - Main booking logic
   - `services/api/src/services/schedule.service.ts` - Schedule management
   - `services/api/src/controllers/booking.controller.ts` - API endpoints

2. **Frontend Components**
   - `apps/admin/src/pages/BusSearchPage.tsx` - Search interface
   - `apps/admin/src/pages/BusBookingPage.tsx` - Booking interface
   - `apps/superadmin/src/pages/FleetManagement.tsx` - Schedule management

3. **Schemas & Types**
   - `packages/common/src/schemas/booking.schema.ts` - Validation schemas
   - `packages/common/src/types/booking.type.ts` - Type definitions

### API Endpoints

```typescript
// Search schedules (supports return filtering)
GET /api/schedules/search?origin=X&destination=Y&isReturn=true

// Create booking with return trip
POST /api/admin/bookings
{
  scheduleId: 1,
  passengers: [...],
  returnScheduleId: 2,
  returnPassengers: [...],
  bookerName: "John Doe",
  bookerPhone: "+977-1234567890"
}

// Create schedule with return flag
POST /api/superadmin/schedules
{
  routeId: 1,
  busId: 2,
  departure: "2024-01-15T08:00:00Z",
  fare: 500,
  isReturn: true
}
```

## Best Practices

### For Superadmins

1. **Route Planning**
   - Create both forward and reverse routes
   - Ensure consistent naming (e.g., "Kathmandu-Pokhara" and "Pokhara-Kathmandu")

2. **Schedule Creation**
   - Plan return schedules with appropriate timing
   - Consider passenger convenience for return times
   - Price return trips competitively

3. **Bus Assignment**
   - Ensure buses are available for return journeys
   - Consider turnaround time between trips

### For Admins

1. **Customer Service**
   - Clearly explain return trip options
   - Verify passenger details for both trips
   - Confirm return schedule timing with customers

2. **Booking Management**
   - Double-check return schedule selection
   - Ensure passenger details are accurate for both trips
   - Verify payment covers both directions

## Troubleshooting

### Common Issues

1. **Return Schedule Not Found**
   - Verify return schedules exist for the route
   - Check if return schedule is for correct date
   - Ensure return schedule has available seats

2. **Booking Creation Fails**
   - Validate all passenger details
   - Check seat availability on both trips
   - Verify payment method is supported

3. **Email Issues**
   - Ensure customer email is valid
   - Check if both tickets are generated
   - Verify QR codes are included

### Error Messages

- `"Return schedule not found"` - Return schedule ID is invalid
- `"Return seat X is already booked"` - Selected return seat unavailable
- `"Missing return passenger details"` - Passenger info incomplete for return trip

## Future Enhancements

1. **Advanced Features**
   - Package deals for round trips
   - Flexible return date options
   - Multi-city trip support

2. **User Experience**
   - Visual trip timeline
   - Better mobile experience
   - Real-time availability updates

3. **Business Logic**
   - Dynamic pricing for return trips
   - Loyalty program integration
   - Group booking discounts

## Support

For technical issues or questions about the return booking system:
1. Check this documentation first
2. Review the API logs for error details
3. Test with sample data in development environment
4. Contact the development team for complex issues

---

*Last updated: January 2024*
*Version: 1.0*