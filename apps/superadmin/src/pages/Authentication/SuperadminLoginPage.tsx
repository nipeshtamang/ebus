import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bus,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Shield,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ROUTES from "@/Routes/routes";
import { useSuperadminAuth } from "@/hooks/useSuperadminAuth";
import { useAuth } from "@/context/AuthContext";
import { throttle } from "@/lib/utils";

export function SuperadminLoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<
    "login" | "forgot" | "otp" | "reset"
  >("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    resetEmail: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetSent, setResetSent] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { loading, error, login, forgotPassword, verifyOTP, resetPassword } =
    useSuperadminAuth();

  // Navigate to dashboard when login is successful
  useEffect(() => {
    if (loginSuccess && user) {
      navigate(ROUTES.AdminDashboard);
    }
  }, [loginSuccess, user, navigate]);

  // Throttled login function to prevent rapid submissions
  const throttledLogin = useCallback(
    throttle((...args: unknown[]) => {
      const email = args[0] as string;
      const password = args[1] as string;

      setClientError(null);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        setClientError("Please enter a valid email address.");
        return;
      }
      login(email, password).then((success) => {
        if (success) {
          setLoginSuccess(true);
        }
      });
    }, 1000), // 1 second throttle
    [login]
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent submission if already loading
    throttledLogin(formData.email, formData.password);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    const success = await forgotPassword(formData.resetEmail);
    if (success) {
      setResetSent(true);
      setCurrentView("otp");
    }
  };

  const handleViewChange = (view: typeof currentView) => {
    setClientError(null);
    setCurrentView(view);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyOTP(formData.resetEmail, formData.otp);
    if (success) {
      setCurrentView("reset");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    if (formData.newPassword !== formData.confirmPassword) {
      setClientError("Passwords do not match");
      return;
    }
    const success = await resetPassword(
      formData.resetEmail,
      formData.otp,
      formData.newPassword
    );
    if (success) {
      setCurrentView("login");
      setResetSent(false);
      setFormData({
        ...formData,
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if ((field === "newPassword" || field === "confirmPassword") && clientError)
      setClientError(null);
    if (field === "email" && clientError) setClientError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Bus className="h-10 w-10" />
              <span className="text-3xl font-bold">BusBooking Pro</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Welcome to the Future of Bus Travel
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Connect with millions of travelers and manage bookings with our
              comprehensive platform.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure & Trusted</h3>
                <p className="text-primary-foreground/80">
                  Bank-level security for all transactions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">24/7 Support</h3>
                <p className="text-primary-foreground/80">
                  Round-the-clock customer assistance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Trusted by Millions</h3>
                <p className="text-primary-foreground/80">
                  Over 2M+ happy customers worldwide
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-4">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30"
            >
              ⭐ 4.8/5 Rating
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30"
            >
              🏆 Best Travel App 2024
            </Badge>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 right-32 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/10 rounded-full"></div>
      </div>

      {/* Right Side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Bus className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">BusBooking Pro</span>
            </div>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          {/* Login Form */}
          {currentView === "login" && (
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">
                  Superadmin Login
                </CardTitle>
                <CardDescription>
                  Sign in to your superadmin account to continue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {clientError && (
                  <Alert>
                    <AlertDescription>{clientError}</AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) =>
                          updateFormData("email", e.target.value)
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        updateFormData("password", e.target.value)
                      }
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Forgot Password Form */}
          {currentView === "forgot" && (
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-4"
                  onClick={() => handleViewChange("login")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <CardTitle className="text-2xl font-bold">
                  Forgot Password?
                </CardTitle>
                <CardDescription>
                  No worries! Enter your email and we'll send you a reset link.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {!resetSent ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="resetEmail"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.resetEmail}
                          onChange={(e) =>
                            updateFormData("resetEmail", e.target.value)
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Check your email
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        We've sent a password reset link to{" "}
                        {formData.resetEmail}
                      </p>
                      <Alert>
                        <AlertDescription>
                          Didn't receive the email? Check your spam folder or{" "}
                          <Button
                            variant="link"
                            className="px-0 h-auto text-primary"
                            onClick={() => setResetSent(false)}
                          >
                            try again
                          </Button>
                        </AlertDescription>
                      </Alert>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewChange("otp")}
                    >
                      I have the reset code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* OTP Verification Form */}
          {currentView === "otp" && (
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-4"
                  onClick={() => handleViewChange("forgot")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <CardTitle className="text-2xl font-bold">Enter OTP</CardTitle>
                <CardDescription>
                  Check your email for the OTP code.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP Code</Label>
                    <div className="relative">
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter OTP code"
                        value={formData.otp}
                        onChange={(e) => updateFormData("otp", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Reset Password Form */}
          {currentView === "reset" && (
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-4"
                  onClick={() => handleViewChange("otp")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <CardTitle className="text-2xl font-bold">
                  Reset Password
                </CardTitle>
                <CardDescription>Enter your new password below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {clientError && (
                  <Alert>
                    <AlertDescription>{clientError}</AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        updateFormData("newPassword", e.target.value)
                      }
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        updateFormData("confirmPassword", e.target.value)
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">Password must contain:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• At least 8 characters</li>
                      <li>• One uppercase letter</li>
                      <li>• One lowercase letter</li>
                      <li>• One number</li>
                    </ul>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
