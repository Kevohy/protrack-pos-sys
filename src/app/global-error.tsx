"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0, background: "#f9fafb" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>Application Error</h1>
          <p style={{ marginTop: "0.5rem", color: "#6b7280", fontSize: "0.95rem" }}>
            A critical error occurred. Please try refreshing.
          </p>
          {error.digest && (
            <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#9ca3af", fontFamily: "monospace" }}>
              Ref: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{ marginTop: "1.5rem", padding: "0.5rem 1.25rem", background: "#6c5ce7", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.9rem" }}
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  );
}
