// app/_not-found.jsx
import React from "react";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: "1rem" }}>
      <h1 style={{ fontSize: "6rem", fontWeight: "bold", marginBottom: "1rem" }}>404</h1>
      <h2 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "1rem" }}>Page Not Found</h2>
      <p style={{ color: "#666" }}>
        Oops! The page you&apos;re looking for doesn&apos;t exist.
      </p>
    </div>
  );
}
