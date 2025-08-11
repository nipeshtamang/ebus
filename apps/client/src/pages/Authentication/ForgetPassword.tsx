"use client";

import type React from "react";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  ArrowRight,
  ArrowLeft,
  Bus,
  Shield,
  MessageCircle,
  CheckCircle,
  Lock,
} from "lucide-react";
import { z } from "zod";
import { ZodError } from "zod";
import ROUTES from "@/Routes/routes";

// Create schemas for forgot password flow since they're not in your auth schema
const forgotPasswordPhoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
});

const forgotPasswordOTPSchema = z.object({
  otp: z
    .string()
    .min(1, "OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^[0-9]+$/, "OTP must contain only numbers"),
});

const forgotPasswordNewPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Step = "phone" | "otp" | "newPassword";
type ForgotPasswordPhoneData = z.infer<typeof forgotPasswordPhoneSchema>;
type ForgotPasswordOTPData = z.infer<typeof forgotPasswordOTPSchema>;
type ForgotPasswordNewPasswordData = z.infer<
  typeof forgotPasswordNewPasswordSchema
>;

const ForgetPassword = () => {
  const [step, setStep] = useState<Step>("phone");
  const [phoneData, setPhoneData] = useState<ForgotPasswordPhoneData>({
    phoneNumber: "",
  });
  const [otpData, setOtpData] = useState<ForgotPasswordOTPData>({ otp: "" });
  const [passwordData, setPasswordData] =
    useState<ForgotPasswordNewPasswordData>({
      newPassword: "",
      confirmPassword: "",
    });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateStep = (): boolean => {
    try {
      setErrors({});

      if (step === "phone") {
        forgotPasswordPhoneSchema.parse(phoneData);
      } else if (step === "otp") {
        forgotPasswordOTPSchema.parse(otpData);
      } else if (step === "newPassword") {
        forgotPasswordNewPasswordSchema.parse(passwordData);
      }

      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPhoneData({ phoneNumber: value });
    if (errors.phoneNumber) {
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setOtpData({ otp: value });
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateStep()) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (step === "phone") {
          setStep("otp");
        } else if (step === "otp") {
          setStep("newPassword");
        } else {
          console.log("Password reset successful");
          // Redirect to login
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "phone":
        return (
          <>
            <CardHeader className="text-center pb-8">
              <Badge className="bg-orange-100 text-orange-700 px-4 py-2 mb-4">
                Password Recovery
              </Badge>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600">
                Enter your phone number to receive a reset code
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      value={phoneData.phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="Enter your registered phone number"
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white h-12 rounded-xl font-semibold transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Sending Code...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Send Reset Code
                      <MessageCircle size={18} />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        );

      case "otp":
        return (
          <>
            <CardHeader className="text-center pb-8">
              <Badge className="bg-blue-100 text-blue-700 px-4 py-2 mb-4">
                Verification
              </Badge>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Enter OTP
              </h2>
              <p className="text-gray-600">
                We've sent a 6-digit code to {phoneData.phoneNumber}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="otp"
                    value={otpData.otp}
                    onChange={handleOtpChange}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className={`text-center text-2xl font-bold h-16 border-2 rounded-xl transition-all duration-200 ${
                      errors.otp
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-200 focus:ring-teal-500 focus:border-teal-500"
                    }`}
                  />
                  {errors.otp && (
                    <p className="mt-2 text-sm text-red-600">{errors.otp}</p>
                  )}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white h-12 rounded-xl font-semibold transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Verify Code
                      <ArrowRight size={18} />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        );

      case "newPassword":
        return (
          <>
            <CardHeader className="text-center pb-8">
              <Badge className="bg-green-100 text-green-700 px-4 py-2 mb-4">
                <CheckCircle className="w-4 h-4 mr-1" />
                Almost Done
              </Badge>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Create New Password
              </h2>
              <p className="text-gray-600">
                Enter your new password to complete the reset
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"
                      size={18}
                    />
                    <Input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className={`pl-12 h-12 border-2 rounded-xl transition-all duration-200 ${
                        errors.newPassword
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200 focus:ring-teal-500 focus:border-teal-500"
                      }`}
                    />
                  </div>
                  {errors.newPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-600"
                      size={18}
                    />
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className={`pl-12 h-12 border-2 rounded-xl transition-all duration-200 ${
                        errors.confirmPassword
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-200 focus:ring-teal-500 focus:border-teal-500"
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white h-12 rounded-xl font-semibold transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Updating Password...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Reset Password
                      <CheckCircle size={18} />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="bg-teal-600 p-2 rounded-xl">
              <Bus className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-800">eBusewa</span>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-lg">
          {renderStepContent()}

          {/* Back to Login */}
          <div className="px-6 pb-6">
            <div className="text-center pt-6 border-t border-gray-200">
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </div>
        </Card>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield size={16} />
            <span>Your account security is our priority</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
