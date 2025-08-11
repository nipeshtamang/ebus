import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

interface UseAdminAuthReturn {
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

export function useAdminAuth(): UseAdminAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin } = useAuth();

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post("/auth/login", {
          email,
          password,
        });

        // Store token and user in AuthContext
        if (res.data.token && res.data.user) {
          authLogin(res.data.token, res.data.user);
          return true;
        }
        return false;
      } catch (err: unknown) {
        console.log("Login error:", err, (err as AxiosError)?.response?.data);
        let message = "Login failed. Please try again.";
        if (err instanceof AxiosError && err.response?.data?.message) {
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
      await api.post("/auth/send-otp", { email });
      return true;
    } catch (err: unknown) {
      let message = "Failed to send reset link";
      if (err instanceof AxiosError && err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/verify-otp", { email, otp });
      return true;
    } catch (err: unknown) {
      let message = "Invalid OTP";
      if (err instanceof AxiosError && err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
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
        await api.post("/auth/reset-password", {
          email,
          otp,
          newPassword,
        });
        return true;
      } catch (err: unknown) {
        let message = "Failed to reset password";
        if (err instanceof AxiosError && err.response?.data?.message) {
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
    []
  );

  return { loading, error, login, forgotPassword, verifyOTP, resetPassword };
}
