import { Loader2 } from "lucide-react";
import { Skeleton } from "./skeleton";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "spinner" | "skeleton";
}

export function LoadingSpinner({
  message = "Loading...",
  size = "md",
  className = "",
  variant = "spinner",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  if (variant === "skeleton") {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center min-h-[200px] ${className}`}
    >
      <div className="text-center">
        <Loader2
          className={`${sizeClasses[size]} animate-spin mx-auto mb-4 text-teal-600`}
        />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
