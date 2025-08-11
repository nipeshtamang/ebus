import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

interface UseSuperadminAuthReturn {
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (
    email: string,
    otp: string,
    newPassword: string
  ) => Promise<boolean>;
}

export function useSuperadminAuth(): UseSuperadminAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin } = useAuth();

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post("/api/auth/login", {
          email,
          password,
        });

        // Check if user is SUPERADMIN
        if (res.data.user && res.data.user.role !== "SUPERADMIN") {
          setError("Access denied. Only superadmins can access this portal.");
          return false;
        }

        // Store token and user in AuthContext
        if (res.data.token && res.data.user) {
          authLogin(res.data.token, res.data.user);
          return true;
        }
        return false;
      } catch (err: unknown) {
        console.log("Login error:", err);
        let message = "Login failed. Please try again.";
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          message = err.response.data.message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [authLogin]
  );

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post("/api/auth/send-otp", { email });
      return true;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to send reset link");
      } else {
        setError("An unknown error occurred");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post("/api/auth/verify-otp", { email, otp });
      return true;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid OTP");
      } else {
        setError("An unknown error occurred");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (email: string, otp: string, newPassword: string) => {
      setLoading(true);
      setError(null);
      try {
        await axios.post("/api/auth/reset-password", {
          email,
          otp,
          newPassword,
        });
        return true;
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to reset password");
        } else {
          setError("An unknown error occurred");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, login, forgotPassword, verifyOTP, resetPassword };
}
