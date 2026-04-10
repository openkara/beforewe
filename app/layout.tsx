import "./globals.css";

export const metadata = {
  title: "Before We — The Conversation Before the Paperwork",
  description:
    "A private, structured way for couples to align on prenup-related questions together. Get on the same page before you sit down with attorneys.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
