import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  message,
  onRetry,
  className = "",
}: ErrorMessageProps) {
  return (
    <div
      className={`p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-800 underline hover:no-underline text-sm"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
