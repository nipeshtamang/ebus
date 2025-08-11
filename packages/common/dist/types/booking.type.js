export var BookingStatus;
(function (BookingStatus) {
    BookingStatus["BOOKED"] = "BOOKED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["COMPLETED"] = "COMPLETED";
})(BookingStatus || (BookingStatus = {}));
export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
})(PaymentStatus || (PaymentStatus = {}));
export var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["ESEWA"] = "ESEWA";
    PaymentMethod["KHALTI"] = "KHALTI";
    PaymentMethod["IPS_CONNECT"] = "IPS_CONNECT";
    PaymentMethod["BANK"] = "BANK";
    PaymentMethod["CASH"] = "CASH";
})(PaymentMethod || (PaymentMethod = {}));
