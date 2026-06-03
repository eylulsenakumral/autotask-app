import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoTask - AI Browser Automation",
  description: "Zero-deployment browser automation powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0a0a0a] text-[#ededed]">{children}</body>
    </html>
  );
}
