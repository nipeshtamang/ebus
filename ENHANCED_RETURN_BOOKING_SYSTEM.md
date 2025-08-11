# Enhanced Return Booking System Documentation

## Overview

The Enhanced Return Booking System has been improved to properly handle flexible return dates for round-trip bookings. Users can now select any return date and the system will show available buses for that specific date.

## Key Improvements Made

### 1. **Database Schema Understanding**
- **Schedule Table**: Contains `isReturn` boolean field to distinguish between onward and return trips
- **Route Table**: Defines origin and destination pairs
- **Booking Table**: Links to schedules and handles individual seat bookings
- **Seat Table**: Manages seat availability per schedule

### 2. **Enhanced Backend API**

#### New Service Functions (`schedule.service.ts`)

```typescript
// New function for round-trip schedule search
export async function findRoundTripSchedules(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string
)

// Enhanced search function that handles both one-way and round-trip
export async function searchSchedulesEnhanced(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string,
  tripType: 'oneway' | 'roundtrip' = 'oneway'
)
```

#### Updated Controller (`schedule.controller.ts`)

The search controller now properly handles:
- **Round-trip searches**: When `tripType=roundtrip` and `returnDate` is provided
- **Flexible return dates**: Any return date can be selected
- **Separate results**: Returns both outbound and return schedules

### 3. **Enhanced Frontend Interface**

#### Updated BusSearchPage (`BusSearchPage.tsx`)

**New Features:**
- **Dual Schedule Display**: Shows both outbound and return schedules separately
- **Return Date Validation**: Ensures return date is selected for round trips
- **Enhanced Search Logic**: Handles different response structures for one-way vs round-trip
- **Visual Distinction**: Return schedules have different styling (blue theme)

**Key Changes:**
```typescript
// New state for return schedules
const [returnSchedules, setReturnSchedules] = useState<Schedule[]>([]);

// Enhanced search handling
if (searchForm.tripType === "roundtrip") {
  setSchedules(response.data.outbound || []);
  setReturnSchedules(response.data.return || []);
} else {
  setSchedules(response.data);
  setReturnSchedules([]);
}
```

## How It Works Now

### 1. **Round-Trip Search Process**

1. **User Input**: 
   - Selects "Round Trip"
   - Chooses origin and destination
   - Selects departure date
   - **Selects any return date** (this was the main issue fixed)

2. **API Request**:
   ```javascript
   {
     origin: "Kathmandu",
     destination: "Pokhara", 
     departureDate: "2024-01-15",
     returnDate: "2024-01-20",  // Can be any date
     tripType: "roundtrip"
   }
   ```

3. **Backend Processing**:
   - Searches for outbound schedules: Kathmandu → Pokhara on 2024-01-15
   - Searches for return schedules: Pokhara → Kathmandu on 2024-01-20
   - Returns both sets of results

4. **Frontend Display**:
   - Shows outbound buses in standard styling
   - Shows return buses in blue-themed styling
   - Each section shows available seats and pricing

### 2. **Database Query Logic**

#### Outbound Search:
```sql
SELECT * FROM Schedule s
JOIN Route r ON s.routeId = r.id
WHERE r.origin = 'Kathmandu' 
  AND r.destination = 'Pokhara'
  AND DATE(s.departure) = '2024-01-15'
  AND s.isReturn = false
```

#### Return Search:
```sql
SELECT * FROM Schedule s  
JOIN Route r ON s.routeId = r.id
WHERE r.origin = 'Pokhara'     -- Swapped
  AND r.destination = 'Kathmandu'  -- Swapped
  AND DATE(s.departure) = '2024-01-20'  -- Return date
  AND s.isReturn = true
```

## Superadmin Schedule Creation

### Creating Return Schedules

Superadmins can create return schedules through FleetManagement:

1. **Create Route**: Define both directions (A→B and B→A)
2. **Create Outbound Schedule**: 
   - Route: Kathmandu → Pokhara
   - `isReturn: false`
   - Date/time: Departure schedule

3. **Create Return Schedule**:
   - Route: Pokhara → Kathmandu  
   - `isReturn: true`
   - Date/time: Return schedule

### Best Practices for Superadmins

1. **Route Management**:
   - Create separate routes for each direction
   - Use consistent naming: "City A to City B" and "City B to City A"

2. **Schedule Planning**:
   - Create return schedules for popular routes
   - Consider different return dates (not just same day)
   - Plan for various time slots

3. **Pricing Strategy**:
   - Return schedules can have different pricing
   - Consider round-trip discounts in business logic

## API Endpoints

### Search Schedules
```
GET /api/schedules/search
```

**Parameters:**
- `origin` (string): Departure city
- `destination` (string): Arrival city  
- `departureDate` (string): Departure date (YYYY-MM-DD)
- `returnDate` (string, optional): Return date (YYYY-MM-DD)
- `tripType` (string): "oneway" or "roundtrip"

**Response for Round-trip:**
```json
{
  "outbound": [
    {
      "id": 1,
      "departure": "2024-01-15T08:00:00Z",
      "fare": 1500,
      "isReturn": false,
      "route": {
        "origin": "Kathmandu",
        "destination": "Pokhara"
      },
      "bus": { ... },
      "seats": [ ... ]
    }
  ],
  "return": [
    {
      "id": 2, 
      "departure": "2024-01-20T10:00:00Z",
      "fare": 1500,
      "isReturn": true,
      "route": {
        "origin": "Pokhara", 
        "destination": "Kathmandu"
      },
      "bus": { ... },
      "seats": [ ... ]
    }
  ],
  "totalOutbound": 1,
  "totalReturn": 1
}
```

## User Experience Improvements

### 1. **Flexible Return Dates**
- Users can select any return date (not restricted to same day)
- System shows available buses for the selected return date
- Clear validation messages for missing return dates

### 2. **Visual Clarity**
- **Outbound section**: Standard teal/cyan theme
- **Return section**: Blue theme with distinct styling
- Clear section headers: "Outbound:" and "Return:"
- Date information prominently displayed

### 3. **Error Handling**
- Validation for missing return dates in round-trip searches
- Clear error messages for API failures
- Graceful handling of empty search results

## Technical Implementation Details

### 1. **Database Queries**

The system now performs two separate queries for round-trip searches:

**Outbound Query:**
```sql
SELECT s.*, r.*, b.*, seats.*
FROM Schedule s
JOIN Route r ON s.routeId = r.id  
JOIN Bus b ON s.busId = b.id
LEFT JOIN Seat seats ON s.id = seats.scheduleId
WHERE r.origin = ? 
  AND r.destination = ?
  AND DATE(s.departure) = ?
  AND s.isReturn = false
```

**Return Query:**
```sql
SELECT s.*, r.*, b.*, seats.*
FROM Schedule s
JOIN Route r ON s.routeId = r.id
JOIN Bus b ON s.busId = b.id  
LEFT JOIN Seat seats ON s.id = seats.scheduleId
WHERE r.origin = ?     -- Swapped with destination
  AND r.destination = ? -- Swapped with origin
  AND DATE(s.departure) = ? -- Return date
  AND s.isReturn = true
```

### 2. **API Response Structure**

**One-way Response:**
```json
[
  {
    "id": 1,
    "departure": "2024-01-15T08:00:00Z",
    "fare": 1500,
    "isReturn": false,
    "route": { "origin": "Kathmandu", "destination": "Pokhara" },
    "bus": { "name": "Express Bus", "seatCount": 40 },
    "seats": [...]
  }
]
```

**Round-trip Response:**
```json
{
  "outbound": [...],
  "return": [...],
  "totalOutbound": 2,
  "totalReturn": 3
}
```

### 3. **Frontend State Management**

```typescript
// Separate state for outbound and return schedules
const [schedules, setSchedules] = useState<Schedule[]>([]);
const [returnSchedules, setReturnSchedules] = useState<Schedule[]>([]);

// Enhanced search handling
const handleSearch = async () => {
  const params = {
    origin: searchForm.from,
    destination: searchForm.to,
    departureDate: format(searchForm.departureDate, "yyyy-MM-dd"),
    tripType: searchForm.tripType,
    ...(searchForm.tripType === "roundtrip" && searchForm.returnDate && {
      returnDate: format(searchForm.returnDate, "yyyy-MM-dd")
    })
  };

  const response = await scheduleAPI.searchSchedules(params);
  
  if (searchForm.tripType === "roundtrip") {
    setSchedules(response.data.outbound || []);
    setReturnSchedules(response.data.return || []);
  } else {
    setSchedules(response.data);
    setReturnSchedules([]);
  }
};
```

## Booking Workflow

### 1. **Round-Trip Booking Process**

1. **Search Phase**:
   - User selects round-trip option
   - Chooses departure and return dates
   - System shows both outbound and return options

2. **Selection Phase**:
   - User selects outbound bus and seats
   - User selects return bus and seats
   - System validates both selections

3. **Booking Phase**:
   - Creates separate bookings for outbound and return
   - Links bookings through order system
   - Generates separate tickets with QR codes

### 2. **Seat Selection Logic**

Each schedule (outbound and return) maintains its own seat availability:
- Outbound seats are independent of return seats
- Different buses can be selected for each direction
- Pricing is calculated separately for each leg

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. **No Return Buses Found**
**Problem**: User selects return date but no buses appear
**Solution**: 
- Check if return schedules exist for that route and date
- Verify `isReturn=true` schedules are created in database
- Ensure route exists in both directions

#### 2. **Return Date Validation**
**Problem**: Return date before departure date
**Solution**: Frontend validation prevents this:
```typescript
disabled={(date) => date < searchForm.departureDate}
```

#### 3. **API Response Format Issues**
**Problem**: Frontend expects different response structure
**Solution**: Check `tripType` parameter and handle accordingly:
```typescript
if (searchForm.tripType === "roundtrip") {
  // Handle {outbound: [], return: []} structure
} else {
  // Handle direct array structure
}
```

## Performance Considerations

### 1. **Database Optimization**
- Indexes on `(routeId, departure)` for fast schedule lookups
- Separate queries prevent complex joins
- Seat data loaded with schedule to minimize queries

### 2. **Frontend Optimization**
- Separate state prevents unnecessary re-renders
- Filtered results cached until new search
- Loading states prevent multiple simultaneous requests

### 3. **Caching Strategy**
- Schedule data can be cached for short periods
- Seat availability requires real-time updates
- Route data rarely changes and can be cached longer

## Future Enhancements

### 1. **Multi-City Trips**
- Extend to support multiple stops
- Complex routing algorithms
- Dynamic pricing based on distance

### 2. **Smart Recommendations**
- Suggest optimal return times
- Price comparison across dates
- Popular route suggestions

### 3. **Advanced Filtering**
- Filter by bus type, amenities
- Price range filtering
- Departure time preferences

## Testing Scenarios

### 1. **Basic Round-Trip Search**
```
Origin: Kathmandu
Destination: Pokhara  
Departure: 2024-01-15
Return: 2024-01-20
Expected: Both outbound and return schedules displayed
```

### 2. **Same-Day Return**
```
Origin: Kathmandu
Destination: Pokhara
Departure: 2024-01-15 08:00
Return: 2024-01-15 18:00
Expected: Different buses for same route, same day
```

### 3. **No Return Schedules**
```
Origin: Kathmandu  
Destination: Remote Location
Return Date: Any
Expected: Graceful handling, clear message about no return options
```

### 4. **Edge Cases**
- Return date = departure date
- Very far future dates
- Past dates (should be disabled)
- Invalid route combinations

## Conclusion

The Enhanced Return Booking System now properly handles flexible return dates, providing users with the ability to select any return date and see available buses for that specific date. The system maintains backward compatibility while adding robust round-trip functionality.

Key benefits:
- **Flexible return dates**: Users can select any return date
- **Clear visual separation**: Outbound and return schedules are distinctly displayed  
- **Robust error handling**: Proper validation and error messages
- **Scalable architecture**: Easy to extend for future enhancements
- **Performance optimized**: Efficient database queries and frontend state management

The system is now ready for production use with comprehensive round-trip booking capabilities.