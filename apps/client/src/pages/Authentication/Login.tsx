import type React from "react";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  ArrowRight,
  Bus,
  Shield,
  CheckCircle,
} from "lucide-react";

import { ZodError } from "zod";
import ROUTES from "@/Routes/routes";
import { loginSchema } from "@ebusewa/common";
import type { LoginInput } from "@ebusewa/common";

const Login = () => {
  const [formData, setFormData] = useState<LoginInput>({
    phoneNumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginInput, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof LoginInput, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginInput] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user starts typing
    if (errors[name as keyof LoginInput]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("Login successful:", formData);
        // Handle successful login (redirect, etc.)
      } catch (error) {
        console.error("Login failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const features = [
    { icon: Shield, text: "Secure & Safe Login" },
    { icon: CheckCircle, text: "Instant Booking Access" },
    { icon: Bus, text: "Track Your Journeys" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-8">
              <div className="bg-teal-600 p-2 rounded-xl">
                <Bus className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-800">eBusewa</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Welcome Back to Your
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent block">
                Journey Hub
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Access your bookings, track your trips, and discover new
              destinations across Nepal.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-white/60 rounded-xl backdrop-blur-sm"
              >
                <div className="bg-teal-100 p-2 rounded-lg">
                  <feature.icon className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-gray-700 font-medium">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-lg">
            <CardHeader className="text-center pb-8">
              <div className="lg:hidden flex items-center gap-2 justify-center mb-6">
                <div className="bg-teal-600 p-1 rounded-md">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  eBusewa
                </span>
              </div>
              <Badge className="bg-teal-100 text-teal-700 px-4 py-2 mb-4">
                Welcome Back
              </Badge>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
              <p className="text-gray-600">
                Enter your credentials to access your account
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Number Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"
                      size={18}
                    />
                    <Input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className={`pl-12 h-12 border-2 rounded-xl transition-all duration-200 ${
                        errors.phoneNumber
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200 focus:ring-teal-500 focus:border-teal-500"
                      }`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"
                      size={18}
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className={`pl-12 pr-12 h-12 border-2 rounded-xl transition-all duration-200 ${
                        errors.password
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200 focus:ring-teal-500 focus:border-teal-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    to={ROUTES.FORGET_PASSWORD}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white h-12 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign In
                      <ArrowRight size={18} />
                    </div>
                  )}
                </Button>
              </form>

              {/* Register Link */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to={ROUTES.REGISTER}
                    className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
