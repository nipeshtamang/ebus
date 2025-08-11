import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqList = [
  {
    question: "How do I book a bus ticket?",
    answer:
      "Simply select your departure and destination cities, choose your travel date, pick your preferred bus and seat, then proceed to payment. Our user-friendly booking system makes it easy to reserve your seat in just a few clicks.",
    category: "Booking Process",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major payment methods including credit/debit cards (Visa, MasterCard), mobile wallets (eSewa, Khalti, IME Pay), and bank transfers. All transactions are secured with bank-level encryption for your safety.",
    category: "Payment",
  },
  {
    question: "Can I cancel or modify my booking?",
    answer:
      "Yes, you can cancel or modify your booking up to 2 hours before departure time. Cancellation charges may apply based on our policy. You can manage your bookings easily through your account dashboard or by contacting our support team.",
    category: "Booking Management",
  },
  {
    question: "How do I check my ticket status?",
    answer:
      "Navigate to the 'My Tickets' section in your account or use the 'Track Booking' feature with your booking reference number. You'll see real-time updates about your journey, including bus location and estimated arrival times.",
    category: "Ticket Management",
  },
  {
    question: "Is my personal and payment information secure?",
    answer:
      "Absolutely. We use industry-standard SSL encryption (256-bit) to protect all your personal and financial data. We never store your complete card details, and all transactions are processed through secure payment gateways certified by banks.",
    category: "Security",
  },
  {
    question: "What if my bus is delayed or cancelled?",
    answer:
      "In case of delays or cancellations due to weather, road conditions, or technical issues, we'll notify you immediately via SMS and email. You can reschedule to the next available bus at no extra cost or get a full refund.",
    category: "Travel Issues",
  },
  {
    question: "Can I choose my seat?",
    answer:
      "Yes! Our interactive seat map allows you to select your preferred seat during booking. You can choose from window, aisle, or middle seats based on availability. Premium buses also offer reclining seats and extra legroom options.",
    category: "Seat Selection",
  },
  {
    question: "Do you offer group bookings and discounts?",
    answer:
      "Yes, we offer special rates for group bookings (10+ passengers), student discounts, senior citizen discounts, and seasonal promotional offers. Contact our customer service team for customized group booking packages and corporate rates.",
    category: "Discounts & Offers",
  },
];

const Faq = () => {
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <Badge className="bg-teal-100 text-teal-700 border-teal-200 px-4 py-2">
            💬 Support
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-600 bg-clip-text text-transparent">
              Frequently asked
            </span>
            <br />
            <span className="text-gray-800">questions</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Everything you need to know about ebusewa
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white border-0 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <Accordion type="multiple" className="w-full">
                {faqList.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <AccordionTrigger className="px-8 py-6 text-left hover:bg-teal-50 transition-colors group">
                      <div className="flex items-start gap-4 w-full">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <HelpCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-teal-600 font-medium mb-1">
                            {faq.category}
                          </div>
                          <div className="text-lg font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                            {faq.question}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-6">
                      <div className="ml-12 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Faq;
