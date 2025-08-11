import React from "react";

export function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span className="block sm:inline">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-4 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-2 rounded"
        >
          Retry
        </button>
      )}
    </div>
  );
}
