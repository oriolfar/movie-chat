import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "CineAI",
  description: "A cinema-inspired AI chat assistant that recommends movies. Step into your private screening room.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased cinema-bg h-screen overflow-hidden`}
      >
        {/* Cinema atmospheric effects */}
        <div className="projector-beam" />
        <div className="dust-particles" />
        
        {/* Main content */}
        <div className="relative z-10 h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
