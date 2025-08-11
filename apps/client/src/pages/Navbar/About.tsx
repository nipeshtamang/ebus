"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  MapPin,
  Clock,
  Shield,
  Award,
  Heart,
  Target,
  Eye,
  Bus,
  Star,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const About = () => {
  const [counters, setCounters] = useState({
    customers: 0,
    routes: 0,
    years: 0,
    buses: 0,
  });

  // Animated counter effect
  useEffect(() => {
    const targets = {
      customers: 50000,
      routes: 200,
      years: 8,
      buses: 500,
    };

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounters({
        customers: Math.floor(targets.customers * progress),
        routes: Math.floor(targets.routes * progress),
        years: Math.floor(targets.years * progress),
        buses: Math.floor(targets.buses * progress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Safe & Secure",
      description:
        "Your safety is our priority with verified operators and secure payment systems.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description:
        "Round-the-clock customer support to assist you with any queries or concerns.",
    },
    {
      icon: MapPin,
      title: "Wide Network",
      description:
        "Extensive route coverage connecting major cities and towns across Nepal.",
    },
    {
      icon: Star,
      title: "Best Prices",
      description:
        "Competitive pricing with exclusive deals and discounts for our customers.",
    },
  ];

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To revolutionize bus travel in Nepal by providing a seamless, reliable, and affordable booking platform that connects people to their destinations safely and comfortably.",
    },
    {
      icon: Eye,
      title: "Our Vision",
      description:
        "To become Nepal's leading digital transportation platform, making bus travel accessible, convenient, and enjoyable for everyone while supporting local transport operators.",
    },
    {
      icon: Heart,
      title: "Our Values",
      description:
        "We believe in transparency, reliability, customer satisfaction, and supporting local communities. Every journey matters, and every customer deserves the best service.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-teal-50 via-white to-teal-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-teal-100 text-teal-700 border-teal-200 px-4 py-2 mb-6">
              🚌 About eBusewa
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                Connecting Nepal,
              </span>
              <br />
              <span className="text-gray-800">One Journey at a Time</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              eBusewa is Nepal's premier online bus booking platform, dedicated
              to making travel simple, safe, and affordable for everyone. Since
              2016, we've been transforming how people travel across the
              beautiful landscapes of Nepal.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="text-center">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Users className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {counters.customers.toLocaleString()}+
                </div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <MapPin className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {counters.routes}+
                </div>
                <div className="text-gray-600">Routes Covered</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Award className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {counters.years}+
                </div>
                <div className="text-gray-600">Years of Service</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Bus className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {counters.buses}+
                </div>
                <div className="text-gray-600">Partner Buses</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gray-800">What Drives</span>{" "}
              <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                Us
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our core principles guide everything we do, from product
              development to customer service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gray-800">Why Choose</span>{" "}
              <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                eBusewa?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best bus booking experience in
              Nepal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-600 transition-colors">
                  <feature.icon className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-gray-800">Ready to Start Your</span>{" "}
            <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
              Journey?
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust eBusewa for their
            travel needs across Nepal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg">
              Book Your Ticket Now <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-6 text-lg"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
