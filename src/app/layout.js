import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "aNEETme - Premium Anime Streaming Client",
  description: "Nonton Anime Online Subtitle Indonesia gratis, kualitas HD, cepat dan tanpa iklan pop-up mengganggu.",
  keywords: ["anime", "nonton anime", "streaming anime", "sub indo", "anime sub indo", "ad-free anime"],
  referrer: "no-referrer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        {/* Premium Header */}
        <header className="glass" style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid var(--glass-border)",
          padding: "15px 0"
        }}>
          <div className="container" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="gradient-text" style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                textTransform: "uppercase"
              }}>
                aNEETme
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "40px 0" }}>
          {children}
        </main>

        {/* Premium Footer */}
        <footer style={{
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--glass-border)",
          padding: "30px 0",
          textAlign: "center",
          fontSize: "0.9rem",
          color: "var(--foreground-muted)"
        }}>
          <div className="container">
            <p style={{ marginBottom: "10px" }}>
              <strong className="gradient-text" style={{ fontSize: "1.1rem" }}>aNEETme</strong> - Anime Streaming Client
            </p>
            <p style={{ fontSize: "0.85rem", maxWidth: "600px", margin: "0 auto 15px auto", lineHeight: 1.5 }}>
              Web ini adalah client pihak ketiga yang mengambil konten dari penyedia eksternal. Kami tidak menyimpan file video apapun di server kami.
            </p>
            <p style={{ fontSize: "0.8rem" }}>
              &copy; {new Date().getFullYear()} aNEETme. Built with passion for anime lovers.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
