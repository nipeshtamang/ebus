# Multi-Seat Booking System Documentation

## Overview

The new multi-seat booking system allows users to book multiple seats in a single transaction while maintaining individual passenger details for each seat. This system creates one ticket per order that includes all passenger information.

## Key Features

- **Single Ticket per Transaction**: One QR code ticket contains all seat and passenger information
- **Individual Passenger Details**: Each seat can have different passenger information
- **Main Booker Contact**: Primary contact person for the entire booking
- **Admin Booking Support**: Admins can create bookings for users with full passenger details
- **Payment Integration**: Single payment record for the entire order

## Database Schema Changes

### Booking Model

The `Booking` model now includes passenger-specific fields:

```prisma
model Booking {
  // ... existing fields
  passengerName   String?
  passengerPhone  String?
  passengerEmail  String?
  passengerId     String?  // ID card/passport number
  // ... other fields
}
```

### Order Model

Orders now group multiple bookings together:

```prisma
model Order {
  id        Int       @id @default(autoincrement())
  userId    Int
  createdAt DateTime  @default(now())
  bookings  Booking[]
  ticket    Ticket?   // One ticket per order
  user      User      @relation(fields: [userId], references: [id])
}
```

### Ticket Model

Tickets are now linked to orders instead of individual bookings:

```prisma
model Ticket {
  id           Int      @id @default(autoincrement())
  qrCode       String   @db.Text
  issuedAt     DateTime @default(now())
  ticketNumber String   @unique
  orderId      Int      @unique  // Links to order, not booking
  order        Order    @relation(fields: [orderId], references: [id])
}
```

## API Endpoints

### 1. Create Multi-Seat Booking (Client)

**POST** `/api/bookings`

**Request Body:**

```json
{
  "scheduleId": 1,
  "passengers": [
    {
      "seatNumber": "A1",
      "passengerName": "John Doe",
      "passengerPhone": "+977-9841234567",
      "passengerEmail": "john.doe@example.com",
      "passengerIdNumber": "1234567890"
    },
    {
      "seatNumber": "A2",
      "passengerName": "Jane Smith",
      "passengerPhone": "+977-9841234568",
      "passengerEmail": "jane.smith@example.com"
    }
  ],
  "bookerName": "John Doe",
  "bookerPhone": "+977-9841234567",
  "bookerEmail": "john.doe@example.com"
}
```

**Response:**

```json
{
  "message": "Booking successful",
  "order": {
    "id": 123,
    "userId": 456,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "bookings": [
    {
      "id": 789,
      "seatId": 101,
      "passengerName": "John Doe",
      "passengerPhone": "+977-9841234567",
      "passengerEmail": "john.doe@example.com",
      "passengerId": "1234567890",
      "seat": {
        "seatNumber": "A1"
      }
    },
    {
      "id": 790,
      "seatId": 102,
      "passengerName": "Jane Smith",
      "passengerPhone": "+977-9841234568",
      "passengerEmail": "jane.smith@example.com",
      "seat": {
        "seatNumber": "A2"
      }
    }
  ],
  "ticket": {
    "id": 456,
    "ticketNumber": "TKT-2024-001234",
    "qrCode": "data:image/png;base64,..."
  },
  "ticketNumber": "TKT-2024-001234"
}
```

### 2. Create Multi-Seat Booking for User (Admin)

**POST** `/api/bookings/admin`

**Request Body:**

```json
{
  "userId": 123, // Optional: for registered users
  "scheduleId": 1,
  "passengers": [
    {
      "seatNumber": "B1",
      "passengerName": "Alice Brown",
      "passengerPhone": "+977-9841234570",
      "passengerEmail": "alice.brown@example.com",
      "passengerIdNumber": "1122334455"
    }
  ],
  "bookerName": "Alice Brown",
  "bookerPhone": "+977-9841234570",
  "bookerEmail": "alice.brown@example.com",
  "paymentMethod": "CASH"
}
```

**Response:** Same as client booking response, plus:

```json
{
  "customerEmail": "alice.brown@example.com"
}
```

## QR Code Data Structure

The QR code contains comprehensive booking information:

```json
{
  "ticketNumber": "TKT-2024-001234",
  "orderId": 123,
  "user": {
    "id": 456,
    "name": "John Doe",
    "phoneNumber": "+977-9841234567"
  },
  "bus": {
    "id": 1,
    "name": "Express Bus 1",
    "layoutType": "2x2"
  },
  "schedule": {
    "id": 1,
    "departure": "2024-01-15T14:00:00Z",
    "isReturn": false,
    "fare": 1500,
    "route": {
      "origin": "Kathmandu",
      "destination": "Pokhara"
    }
  },
  "seatNumbers": ["A1", "A2"],
  "passengers": [
    {
      "name": "John Doe",
      "phone": "+977-9841234567",
      "email": "john.doe@example.com",
      "idNumber": "1234567890"
    },
    {
      "name": "Jane Smith",
      "phone": "+977-9841234568",
      "email": "jane.smith@example.com"
    }
  ],
  "paymentMethod": "PENDING",
  "totalAmount": 3000,
  "paidByAdmin": null
}
```

## Business Logic

### Booking Process

1. **Validation**: Check schedule exists and seats are available
2. **Transaction**: Create order, bookings, and ticket atomically
3. **Seat Marking**: Mark all seats as booked
4. **Ticket Generation**: Create single ticket with all passenger info
5. **QR Code**: Generate QR code containing complete booking data

### Seat Availability

- Seats are checked for existing bookings
- Seats are checked for active reservations
- Double-check within transaction to prevent race conditions

### Payment Handling

- **Client Bookings**: Payment status starts as "PENDING"
- **Admin Bookings**: Payment status is "COMPLETED" with specified method
- Single payment record per order

## Error Handling

### Common Error Scenarios

- **Seat Already Booked**: `Seat A1 is already booked`
- **Schedule Not Found**: `Schedule not found`
- **Invalid Seat Numbers**: `One or more seats not found`
- **Validation Errors**: Schema validation failures

### Error Response Format

```json
{
  "error": "Seat A1 is already booked"
}
```

## Testing

Use the provided test script to verify functionality:

```bash
cd services/api
node test-multi-seat-booking.js
```

**Prerequisites:**

- API server running on localhost:3001
- Valid user credentials in test script
- Existing schedule with available seats

## Frontend Integration

### Booking Form Structure

```typescript
interface BookingFormData {
  scheduleId: number;
  passengers: Array<{
    seatNumber: string;
    passengerName: string;
    passengerPhone: string;
    passengerEmail?: string;
    passengerIdNumber?: string;
  }>;
  bookerName: string;
  bookerPhone: string;
  bookerEmail?: string;
}
```

### Ticket Display

- Show all seat numbers in single ticket view
- Display individual passenger details
- Include main booker contact information
- QR code contains all booking data

## Migration Notes

### From Old System

- Old single-seat bookings remain compatible
- New bookings use enhanced schema
- QR codes now contain passenger details
- Tickets linked to orders instead of individual bookings

### Database Migration

The schema changes are backward compatible. Existing data will continue to work while new bookings use the enhanced structure.

## Security Considerations

- JWT authentication required for all booking endpoints
- Role-based authorization (CLIENT, ADMIN, SUPERADMIN)
- Input validation using Zod schemas
- SQL injection protection via Prisma ORM
- Audit logging for all booking operations

## Performance Considerations

- Database transactions ensure data consistency
- Indexes on frequently queried fields
- Efficient seat availability checking
- Optimized QR code generation
- Pagination for booking lists

## Future Enhancements

- Return journey booking support
- Seat preferences and special requirements
- Group booking discounts
- Advanced passenger information (age, gender, special needs)
- Integration with external payment gateways
- Real-time seat availability updates
