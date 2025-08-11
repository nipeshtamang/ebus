import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  profileImage?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Single useEffect to handle initialization and token setup
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("superadminToken");
        const storedUser = localStorage.getItem("superadminUser");

        if (storedToken && storedUser) {
          // Check if token is expired
          if (isTokenExpired(storedToken)) {
            console.log("Stored token is expired, clearing auth data");
            localStorage.removeItem("superadminToken");
            localStorage.removeItem("superadminUser");
            setToken(null);
            setUser(null);
          } else {
            const parsedUser = JSON.parse(storedUser);
            // Ensure id is present and a number
            if (typeof parsedUser.id === "string")
              parsedUser.id = parseInt(parsedUser.id, 10);
            setToken(storedToken);
            setUser(parsedUser);
            // Set axios default header
            axios.defaults.headers.common["Authorization"] =
              `Bearer ${storedToken}`;
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear corrupted data
        localStorage.removeItem("superadminToken");
        localStorage.removeItem("superadminUser");
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = (token: string, user: AuthUser) => {
    setToken(token);
    // Ensure id is present and a number
    const userWithId = {
      ...user,
      id: typeof user.id === "string" ? parseInt(user.id, 10) : user.id,
    };
    setUser(userWithId);
    localStorage.setItem("superadminToken", token);
    localStorage.setItem("superadminUser", JSON.stringify(userWithId));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("superadminToken");
    localStorage.removeItem("superadminUser");
    delete axios.defaults.headers.common["Authorization"];

    // Redirect to login page
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  };

  const updateUser = (userData: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData } as AuthUser;
      setUser(updatedUser);
      localStorage.setItem("superadminUser", JSON.stringify(updatedUser));
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const currentToken = localStorage.getItem("superadminToken");
      if (!currentToken) {
        return false;
      }

      // Check if token is expired
      if (isTokenExpired(currentToken)) {
        logout();
        return false;
      }

      // For now, we'll just validate the current token
      // In a real app, you might want to call a refresh endpoint
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isInitialized,
        login,
        logout,
        updateUser,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
