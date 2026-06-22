import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | GottaFlush",
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100 prose">
        <Link href="/" className="text-indigo-600 no-underline font-medium mb-6 block">← Back to Map</Link>
        <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
        <p>Last updated: June 21, 2026</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
        <p>By accessing and using GottaFlush, you accept and agree to be bound by the terms and provision of this agreement.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">2. Description of Service</h2>
        <p>GottaFlush provides a crowdsourced directory of public restrooms. We do not guarantee the accuracy, cleanliness, or availability of any restroom listed.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">3. User Contributions</h2>
        <p>Users may submit door codes and reviews. By submitting content, you grant us a non-exclusive, royalty-free license to use, reproduce, and distribute your content.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Disclaimer of Warranties</h2>
        <p>The service is provided "as is". We make no warranties, expressed or implied, and hereby disclaim all other warranties.</p>
      </div>
    </main>
  );
}
