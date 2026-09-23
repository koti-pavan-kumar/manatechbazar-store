"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          background: "#fafafa",
        }}
      >
        <div style={{ textAlign: "center", padding: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              border: "none",
              background: "#111",
              color: "#fff",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          {error.digest && (
            <p style={{ fontSize: "11px", color: "#999", marginTop: "16px" }}>
              Ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
