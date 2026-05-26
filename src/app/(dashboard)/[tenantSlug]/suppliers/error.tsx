"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SuppliersError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[SuppliersError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Failed to load suppliers</h2>
        <p className="mt-1 text-sm text-gray-500 max-w-sm">
          {error.message?.includes("does not exist") || error.message?.includes("relation")
            ? "The suppliers table is missing. Run prisma db push on the server."
            : "An unexpected error occurred. Try refreshing the page."}
        </p>
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6c5ce7] text-white text-sm font-medium hover:bg-[#5a4dd1] transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
}
