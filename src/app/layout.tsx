import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Detector Dashboard",
  description: "AI vs Human text detection dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[var(--bg)] text-[var(--text)] antialiased`}
      >
        <div className="min-h-screen bg-[var(--bg)]">
          {/* Navbar renders only when a user token exists (client-side check). */}
          <Navbar />
          <main className="mx-auto max-w-6xl px-5 py-8 md:py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
