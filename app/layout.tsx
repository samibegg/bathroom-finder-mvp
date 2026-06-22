import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GottaFlush | Find Clean Public Bathrooms Fast",
  description:
    "GottaFlush helps you instantly find the nearest clean public bathrooms, restrooms, and toilets near you. Free, no sign-up required.",
  keywords: ["public bathroom", "restroom finder", "toilet near me", "public restroom"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
