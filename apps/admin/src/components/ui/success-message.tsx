import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function SuccessMessage({
  message,
  onDismiss,
  className = "",
}: SuccessMessageProps) {
  return (
    <div
      className={`p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>{message}</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-800 hover:text-green-900 text-sm"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
