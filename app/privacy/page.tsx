import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | GottaFlush",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100 prose">
        <Link href="/" className="text-indigo-600 no-underline font-medium mb-6 block">← Back to Map</Link>
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <p>Last updated: June 21, 2026</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <p>GottaFlush ("we", "our", "us") collects location data solely to provide nearby bathroom recommendations. We do not store your exact personal location tied to your identity.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">2. Use of Information</h2>
        <p>We use your location temporarily to query our database for the closest restrooms. We also collect anonymous usage data to improve our service.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">3. Third-Party Ads</h2>
        <p>We use third-party advertising companies (such as Google AdSense) to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Cookies</h2>
        <p>We use cookies to personalize content and ads, to provide social media features, and to analyze our traffic.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at info@forgemission.com.</p>
      </div>
    </main>
  );
}
