import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ background: "#F1EEE8", color: "#23261C", fontFamily: "serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div>
            <p style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "#787E59" }}>LANTANA</p>
            <h1 style={{ fontSize: 40, fontWeight: 300, margin: "16px 0" }}>This page has evaporated.</h1>
            <Link href="/" style={{ color: "#565B3F", textDecoration: "underline" }}>Return to the maison</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
