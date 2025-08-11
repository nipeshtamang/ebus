import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import landingpagebg from "@/assets/images/landingpagebg.jpg";
import {
  Search,
  MapPin,
  Calendar,
  Shield,
  Clock,
  Star,
  ArrowRight,
  Bus,
  Route,
  Award,
  Users,
  Heart,
  ChevronDown,
  Navigation,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import About from "./About";
import Contactus from "./Contactus";
import Faq from "./Faq";
import Blogs from "./Blogs";

const stats = [
  { icon: Bus, number: "50K+", label: "Happy Customers" },
  { icon: Bus, number: "500+", label: "Partner Buses" },
  { icon: MapPin, number: "200+", label: "Routes Covered" },
  { icon: Award, number: "8+", label: "Years of Service" },
];

// Enhanced Searchable Dropdown Component
const SearchableDropdown = ({
  placeholder,
  value,
  onChange,
  options,
  icon: Icon,
  label,
  dotColor,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  icon: any;
  label: React.ReactNode;
  dotColor: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filtered);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 ${dotColor} rounded-full shadow-sm`}></div>
        {label}
      </label>
      <div className="relative">
        <Icon
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600 z-10"
          size={18}
        />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-12 pr-12 h-12 border-2 border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white rounded-xl shadow-sm transition-all duration-200 hover:border-teal-300"
        />
        <ChevronDown
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          size={18}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-teal-50 cursor-pointer transition-colors flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                onClick={() => handleOptionSelect(option)}
              >
                <MapPin size={16} className="text-teal-600" />
                <span className="text-gray-800 font-medium">{option}</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-gray-500 text-center">
              <MapPin size={20} className="mx-auto mb-2 text-gray-300" />
              <p>No cities found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Homepage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const cities = [
    "Kathmandu",
    "Pokhara",
    "Chitwan",
    "Lumbini",
    "Bhairahawa",
    "Sunauli",
    "Kakarvitta",
    "Ilam",
    "Dharan",
    "Biratnagar",
    "Janakpur",
    "Birgunj",
    "Butwal",
    "Nepalgunj",
    "Dhangadhi",
    "Mahendranagar",
    "Gorkha",
    "Bandipur",
    "Nagarkot",
    "Dhulikhel",
  ];

  // Ensure returnDate is not before departureDate
  useEffect(() => {
    if (departureDate && returnDate && returnDate < departureDate) {
      setReturnDate("");
    }
  }, [departureDate]);

  // Compute min for departure (today) and for return (departure or today)
  const todayStr = new Date().toISOString().split("T")[0];
  const minDeparture = todayStr;
  const minReturn = departureDate || todayStr;
  const [date, setDate] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (state?.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(state.scrollTo);
        if (el) {
          // Calculate the navbar height (approximately 120px for top bar + main nav)
          const navbarHeight = 120;
          const elementPosition = el.offsetTop - navbarHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [state]);

  const handleSearch = () => {
    if (!origin || !destination || !date) return;
    navigate(
      `/search?origin=${origin}&destination=${destination}&date=${date}`
    );
  };

  const popularRoutes = [
    {
      from: "Kathmandu",
      to: "Pokhara",
      price: "Rs. 800",
      duration: "6-7 hrs",
      image: "/placeholder.svg?height=200&width=300",
      popular: true,
    },
    {
      from: "Kathmandu",
      to: "Chitwan",
      price: "Rs. 600",
      duration: "4-5 hrs",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      from: "Kathmandu",
      to: "Lumbini",
      price: "Rs. 1200",
      duration: "8-9 hrs",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      from: "Kathmandu",
      to: "Bhairahawa",
      price: "Rs. 1000",
      duration: "7-8 hrs",
      image: "/placeholder.svg?height=200&width=300",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Verified operators and secure payment",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer assistance",
    },
    {
      icon: Star,
      title: "Best Prices",
      description: "Competitive rates with exclusive deals",
    },
    {
      icon: Route,
      title: "Wide Network",
      description: "200+ routes across Nepal",
    },
  ];
  return (
    <>
      <main>
        {/* Hero Section with Enhanced Background */}
        <section
          id="home"
          className="relative min-h-screen flex items-center justify-center overflow-hidden "
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://i.postimg.cc/43snd5yC/landingpagebg.png"
              alt="Beautiful mountain road with bus"
              className="w-[100%] h-[100%] object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-teal-900/60"></div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-teal-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Your Journey
                <span className="bg-gradient-to-r ml-3 from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                  Starts Here
                </span>
              </h1>
              <p className="text-white text-lg">
                Search and book bus tickets in seconds
              </p>
            </div>

            {/* Enhanced Booking Form */}
            <Card className="bg-transparent w-full max-w-6xl mx-auto border-0 shadow-2xl rounded-3xl overflow-hidden">
              <div>
                <div className="bg-transparent rounded-3xl">
                  <CardContent className="p-5">
                    <div className="text-center">
                      {/* <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                        Find Your Perfect Journey
                      </h2> */}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      {/* From Field */}
                      <div className="lg:col-span-1">
                        <SearchableDropdown
                          placeholder="Select origin city"
                          value={origin}
                          onChange={setOrigin}
                          options={cities}
                          icon={Navigation}
                          label={<span className="text-white">From</span>}
                          dotColor="bg-green-500"
                        />
                      </div>

                      {/* To Field */}
                      <div className="lg:col-span-1">
                        <SearchableDropdown
                          placeholder="Select destination city"
                          value={destination}
                          onChange={setDestination}
                          options={cities}
                          icon={MapPin}
                          label={<span className="text-white">To</span>}
                          dotColor="bg-red-500"
                        />
                      </div>

                      {/* Departure Date Field */}
                      <div className="lg:col-span-1">
                        <label className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
                          <Calendar size={16} className="text-teal-600" />
                          Departure Date
                        </label>
                        <Input
                          type="date"
                          value={departureDate}
                          onChange={(e) => setDepartureDate(e.target.value)}
                          className="h-12 border-2 border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white rounded-xl shadow-sm transition-all duration-200 hover:border-teal-300"
                          min={minDeparture}
                        />
                      </div>

                      {/* Return Date Field */}
                      <div className="lg:col-span-1">
                        <label className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
                          <Calendar size={16} className="text-teal-600" />
                          Return Date
                        </label>
                        <Input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="h-12 border-2 border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white rounded-xl shadow-sm transition-all duration-200 hover:border-teal-300"
                          min={minReturn}
                          // Optionally disable until a departure date is chosen:
                          disabled={!departureDate}
                        />
                      </div>
                    </div>

                    <div className="mt-10 flex justify-center">
                      <Button
                        onClick={handleSearch}
                        className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-16 py-6 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        disabled={!origin || !destination || !departureDate}
                      >
                        <Search size={24} className="mr-3" />
                        Search Buses
                        <Sparkles size={20} className="ml-3" />
                      </Button>
                    </div>

                    {/* Quick Route Suggestions */}
                    <div className="mt-8 text-center">
                      <p className="text-sm text-gray-500 mb-3">
                        Popular routes:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          "Kathmandu → Pokhara",
                          "Kathmandu → Chitwan",
                          "Kathmandu → Lumbini",
                        ].map((route) => (
                          <Button
                            key={route}
                            variant="outline"
                            size="sm"
                            className="text-xs border-teal-200 text-teal-600 hover:bg-teal-50 rounded-full"
                            onClick={() => {
                              const [from, to] = route.split(" → ");
                              setOrigin(from);
                              setDestination(to);
                            }}
                          >
                            {route}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>
        </section>
        {/* Other Sections */}
        <section id="about" className="scroll-mt-16">
          <About />
        </section>
        <section id="faq" className="scroll-mt-16">
          <Faq />
        </section>
        <section id="contact" className="scroll-mt-16">
          <Contactus />
        </section>
        <section id="blog" className="scroll-mt-16">
          <Blogs />
        </section>
      </main>
    </>
  );
}
