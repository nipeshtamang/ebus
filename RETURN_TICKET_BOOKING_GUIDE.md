# Complete Guide: How to Book Return Tickets

## Overview

This guide explains the complete process for booking return tickets in the Ebusewa bus booking system. The system now supports flexible return dates, allowing customers to select any return date and see available buses for that specific date.

## Prerequisites

### For Superadmins:

- Return schedules must be created in the system
- Routes must exist in both directions (A→B and B→A)
- Buses must be assigned to return schedules

### For Admins:

- Access to the admin panel
- Customer information ready
- Understanding of the booking workflow

## Step-by-Step Booking Process

### **Phase 1: Search for Round-Trip Buses**

#### 1. **Access Bus Search**

- Login to admin panel
- Navigate to "Bus Search" page
- URL: `/bus-search`

#### 2. **Select Trip Type**

- Choose **"Round Trip"** radio button
- This enables return date selection

#### 3. **Enter Trip Details**

```
From: [Origin City] (e.g., Kathmandu)
To: [Destination City] (e.g., Pokhara)
Departure Date: [Select departure date]
Return Date: [Select ANY future return date]
```

**Key Points:**

- Return date can be any date after departure date
- System will search for available buses on that specific return date
- No restriction to same-day returns

#### 4. **Search for Buses**

- Click "Search Buses" button
- System performs two separate searches:
  - **Outbound**: Origin → Destination on departure date
  - **Return**: Destination → Origin on return date

#### 5. **Review Search Results**

The system displays results in two sections:

**Outbound Section (Teal Theme):**

- Shows buses from origin to destination
- Departure date and available seats
- Standard pricing and amenities

**Return Section (Blue Theme):**

- Shows buses from destination back to origin
- Return date and available seats
- May have different buses and pricing

### **Phase 2: Select Outbound Bus**

#### 1. **Choose Outbound Bus**

- Review available outbound buses
- Check departure times, prices, and seat availability
- Click "Select Seats" on preferred bus

#### 2. **Complete Outbound Booking**

Follow the standard booking process:

**Step 1: Seat Selection**

- Visual seat layout displayed
- Green seats = Available
- Red seats = Already booked
- Click seats to select (they turn teal)
- Can select multiple seats for group bookings

**Step 2: Customer Details**

```
Full Name: [Customer's full name] *
Phone Number: [Customer's phone] *
Email: [Customer's email] (Optional but recommended)
```

**Step 3: Payment & Confirmation**

- Choose payment method:
  - Cash Payment (immediate confirmation)
  - ESEWA (digital wallet)
  - KHALTI (digital wallet)
  - IPS Connect (bank transfer)
  - Bank Transfer
- Review booking summary
- Click "Confirm Booking"

#### 3. **Outbound Booking Confirmation**

- System creates booking for outbound journey
- Generates ticket with QR code
- Sends email confirmation (if email provided)
- Booking appears in admin's booking list

### **Phase 3: Select Return Bus**

#### 1. **Return to Bus Search**

- Navigate back to bus search results
- The return section shows available return buses

#### 2. **Choose Return Bus**

- Review return buses (blue-themed section)
- Check return date, times, and availability
- Click "Select Seats" on preferred return bus

#### 3. **Complete Return Booking**

Repeat the booking process for return journey:

**Step 1: Seat Selection**

- Select seats for return journey
- Seats are independent of outbound selection
- Can choose different bus type/operator

**Step 2: Customer Details**

- Enter same customer information
- Or different passenger details if needed

**Step 3: Payment & Confirmation**

- Choose payment method for return journey
- Review return booking summary
- Click "Confirm Booking"

#### 4. **Return Booking Confirmation**

- System creates separate booking for return journey
- Generates separate ticket with unique QR code
- Sends separate email confirmation
- Both bookings appear in booking list

## Important Notes

### **Booking Structure**

- **Two Separate Bookings**: Outbound and return are separate bookings
- **Individual Tickets**: Each direction gets its own ticket and QR code
- **Independent Pricing**: Outbound and return may have different prices
- **Flexible Buses**: Can choose different bus operators for each direction

### **Customer Experience**

- Customer receives **two separate tickets**:
  - Outbound ticket: Origin → Destination
  - Return ticket: Destination → Origin
- Each ticket has its own QR code for verification
- Email confirmations sent for both bookings (if email provided)

### **Payment Options**

Each booking can use different payment methods:

- **Cash**: Pay at counter, immediate confirmation
- **Digital Wallets**: ESEWA, KHALTI for online payment
- **Bank Transfer**: IPS Connect or direct bank transfer

## Advanced Scenarios

### **Same-Day Return**

```
Departure: Kathmandu → Pokhara (8:00 AM)
Return: Pokhara → Kathmandu (6:00 PM)
Date: Same day
```

- System shows different buses for same route, same day
- Ensures sufficient time between arrival and departure

### **Multi-Day Return**

```
Departure: January 15, 2024
Return: January 20, 2024
```

- Full flexibility in return date selection
- System searches for available buses on specific return date
- Popular for vacation or business trips

### **Group Bookings**

- Select multiple seats on both outbound and return buses
- Enter passenger details for each seat
- All passengers get individual tickets
- Group discount may apply (business logic dependent)

## Troubleshooting Common Issues

### **No Return Buses Found**

**Problem**: Return section shows "No buses found"
**Solutions**:

1. Check if return schedules exist for that route and date
2. Try different return dates
3. Verify route exists in reverse direction
4. Contact superadmin to create return schedules

### **Different Prices for Return**

**Explanation**: This is normal behavior

- Return schedules can have different pricing
- Different bus operators may be used
- Peak/off-peak pricing may apply

### **Booking Confirmation Issues**

**Common Causes**:

1. Missing required customer information
2. Selected seats became unavailable
3. Payment processing issues
4. Network connectivity problems

**Solutions**:

1. Verify all required fields are filled
2. Refresh and reselect seats
3. Try different payment method
4. Check internet connection

## System Benefits

### **For Customers**

- **Flexibility**: Choose any return date
- **Transparency**: See all available options
- **Convenience**: Book both directions in one session
- **Choice**: Different buses for each direction

### **For Admins**

- **Efficiency**: Streamlined booking process
- **Visibility**: Clear separation of outbound/return
- **Control**: Individual booking management
- **Reporting**: Separate tracking for each direction

### **For Business**

- **Revenue**: Separate pricing strategies
- **Analytics**: Better trip pattern understanding
- **Inventory**: Optimized seat utilization
- **Customer Satisfaction**: Flexible travel options

## Best Practices

### **For Admins**

1. **Always verify customer details** before confirming bookings
2. **Check seat availability** in real-time
3. **Confirm email addresses** for ticket delivery
4. **Explain the two-ticket system** to customers
5. **Keep booking references** for customer service

### **For Customers**

1. **Book early** for popular routes and dates
2. **Provide email address** for digital tickets
3. **Save both tickets** (outbound and return)
4. **Arrive early** at departure points
5. **Keep QR codes accessible** for verification

## Technical Implementation

### **Database Structure**

```sql
-- Outbound Booking
Booking {
  scheduleId: 1 (Kathmandu → Pokhara, Jan 15)
  isReturn: false
}

-- Return Booking
Booking {
  scheduleId: 2 (Pokhara → Kathmandu, Jan 20)
  isReturn: true
}
```

### **API Calls**

```javascript
// Search for round-trip
GET /api/schedules/search?origin=Kathmandu&destination=Pokhara&departureDate=2024-01-15&returnDate=2024-01-20&tripType=roundtrip

// Create outbound booking
POST /api/bookings/create-for-user
{
  scheduleId: 1,
  passengers: [...],
  paymentMethod: "CASH"
}

// Create return booking
POST /api/bookings/create-for-user
{
  scheduleId: 2,
  passengers: [...],
  paymentMethod: "CASH"
}
```

## Conclusion

The enhanced return booking system provides complete flexibility for round-trip travel. Customers can select any return date and see available buses for that specific date. The system maintains separate bookings for each direction, ensuring proper tracking, pricing, and customer service.

Key advantages:

- **Flexible return dates** - not limited to same day
- **Independent bookings** - separate tickets and pricing
- **Real-time availability** - accurate seat information
- **Multiple payment options** - convenient for all customers
- **Professional workflow** - streamlined admin experience

This system is now ready for production use with comprehensive round-trip booking capabilities.
