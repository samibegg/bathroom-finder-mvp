import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GottaFlush | Find Clean Public Bathrooms Fast",
  description:
    "GottaFlush helps you instantly find the nearest clean public bathrooms, restrooms, and toilets near you. Free, no sign-up required.",
  keywords: ["public bathroom", "restroom finder", "toilet near me", "public restroom"],
  other: {
    "google-adsense-account": "ca-pub-7052226382174065"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7052226382174065"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white">{children}

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2026 GottaFlush. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
            <a href="/terms" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>
          </div>
        </div>
      </footer>
</body>
    </html>
  );
}
