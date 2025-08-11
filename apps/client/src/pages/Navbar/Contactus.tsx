"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const ContactUs = () => {
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formState.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formState.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formState.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\s()-]{7,15}$/.test(formState.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formState.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formState.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setFormStatus("submitting");

      // Simulate API call
      setTimeout(() => {
        setFormStatus("success");
        setFormState({
          fullName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });

        // Reset success message after 5 seconds
        setTimeout(() => {
          setFormStatus("idle");
        }, 5000);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-white/20 text-white border-white/10 backdrop-blur-sm px-4 py-2 mb-6">
            Get In Touch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            Have questions about our services? Need help with your booking?
            We're here to help you.
          </p>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="border-0 shadow-xl overflow-hidden transform md:-translate-y-12 bg-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Send Us a Message
                </h2>

                {formStatus === "success" && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>
                      Your message has been sent successfully! We'll get back to
                      you soon.
                    </span>
                  </div>
                )}

                {formStatus === "error" && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span>
                      There was an error sending your message. Please try again.
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formState.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`border ${
                        errors.fullName
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-teal-500"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={`border ${
                          errors.email
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-teal-500"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formState.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className={`border ${
                          errors.phone
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-teal-500"
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formState.subject}
                      onChange={handleChange}
                      placeholder="Enter message subject"
                      className={`border ${
                        errors.subject
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-teal-500"
                      }`}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      placeholder="Type your message here..."
                      rows={5}
                      className={`resize-none border ${
                        errors.message
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-teal-500"
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 flex items-center justify-center gap-2"
                    disabled={formStatus === "submitting"}
                  >
                    {formStatus === "submitting" ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message <Send size={16} />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8 md:pt-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Contact Information
                </h2>
                <p className="text-gray-600 mb-8">
                  We're here to help! Reach out to us through any of the
                  channels below, and we'll get back to you as soon as possible.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-teal-100 p-3 rounded-full">
                      <MapPin className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Our Location
                      </h3>
                      <p className="text-gray-600">
                        Thamel, Kathmandu, Nepal
                        <br />
                        Opposite to Himalayan Java Coffee
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-teal-100 p-3 rounded-full">
                      <Phone className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Phone Number
                      </h3>
                      <p className="text-gray-600">
                        <a
                          href="tel:+9779800000000"
                          className="hover:text-teal-600 transition-colors"
                        >
                          +977 9800000000
                        </a>
                        <br />
                        <a
                          href="tel:+97714123456"
                          className="hover:text-teal-600 transition-colors"
                        >
                          +977 1-4123456
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-teal-100 p-3 rounded-full">
                      <Mail className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Email Address
                      </h3>
                      <p className="text-gray-600">
                        <a
                          href="mailto:support@ebusewa.com"
                          className="hover:text-teal-600 transition-colors"
                        >
                          support@ebusewa.com
                        </a>
                        <br />
                        <a
                          href="mailto:info@ebusewa.com"
                          className="hover:text-teal-600 transition-colors"
                        >
                          info@ebusewa.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-teal-100 p-3 rounded-full">
                      <Clock className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Business Hours
                      </h3>
                      <p className="text-gray-600">
                        Monday - Friday: 9:00 AM - 6:00 PM
                        <br />
                        Saturday: 10:00 AM - 4:00 PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
