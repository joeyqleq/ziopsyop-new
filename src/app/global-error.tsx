"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#060608",
          color: "#e8eae9",
          fontFamily: "monospace",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420, padding: 24 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8a8f98", marginBottom: 16 }}>
            ZIOPSYOP // CONNECTION INTERRUPTED
          </p>
          <p style={{ fontSize: 14, marginBottom: 24 }}>
            A new version was deployed while you were browsing. Reload to continue.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "transparent",
              border: "1px solid #b6ff7c",
              color: "#b6ff7c",
              padding: "10px 28px",
              fontFamily: "monospace",
              fontSize: 11,
              letterSpacing: "0.15em",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            RELOAD
          </button>
        </div>
      </body>
    </html>
  );
}
