import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "the money confessional — by before we...",
  description:
    "Everyone has a money type. Most people never find out what theirs is. Nine sections. Fully anonymous. The most intimate financial quiz you’ll ever take.",
};

export default function MoneyConfessionalPage() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#071F14" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 24px",
          background: "#071F14",
          borderBottom: "1px solid rgba(18,184,122,0.15)",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "13px",
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
        >
          ← back to before we...
        </Link>
      </nav>
      <iframe
        src="/survey.html"
        style={{
          width: "100%",
          height: "calc(100vh - 49px)",
          border: "none",
        }}
        title="the money confessional — by before we..."
      />
    </div>
  );
}
