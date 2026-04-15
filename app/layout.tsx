import "./globals.css";

export const metadata = {
  title: "before we... — The Conversation Before the Commitment",
  description:
    "A private alignment tool for couples navigating major life decisions. Get on the same page before the paperwork starts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
