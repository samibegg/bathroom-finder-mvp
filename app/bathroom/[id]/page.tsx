import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";
import { Metadata } from "next";
import AdBanner from "@/components/AdBanner";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const bathroom = await prisma.bathroom.findUnique({ where: { id } });
  if (!bathroom) return {};
  return { title: `${bathroom.name} | GottaFlush` };
}

export default async function BathroomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bathroom = await prisma.bathroom.findUnique({
    where: { id },
    include: { reviews: { orderBy: { upvotes: "desc" } } },
  });

  if (!bathroom) notFound();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Link href="/" className="text-indigo-600 font-medium">← Back to Map</Link>
      </header>

      <div className="w-full max-w-xl p-4 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{bathroom.name}</h1>
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold text-gray-900">{bathroom.cleanlinessRating.toFixed(1)} <span className="text-yellow-400">★</span></span>
            </div>
          </div>
          <p className="text-gray-500 mt-1">{bathroom.address}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${bathroom.isPublic ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
              {bathroom.isPublic ? "Public" : "Customers Only"}
            </span>
            {bathroom.wheelchairAccessible && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">♿ Accessible</span>
            )}
            {bathroom.changingTable && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">👶 Changing Table</span>
            )}
            {!bathroom.isVerified && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">Unverified</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Crowdsourced Info</h2>
          
          <div className="space-y-4">
            {bathroom.doorCode ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                <p className="text-indigo-600 text-sm font-medium mb-1">Door Code</p>
                <p className="text-3xl font-mono font-bold text-indigo-900 tracking-wider">{bathroom.doorCode}</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-gray-500 text-sm">No door code reported yet.</p>
              </div>
            )}

            <div className="pt-2">
              <ReviewForm bathroomId={bathroom.id} />
            </div>
          </div>
        </div>

        {bathroom.reviews.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Reviews</h2>
            <div className="space-y-4 divide-y divide-gray-100">
              {bathroom.reviews.map((r: any) => (
                <div key={r.id} className="pt-4 first:pt-0">
                  <p className="text-gray-700 text-sm">{r.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">{r.createdAt.toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <button className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200">👍 {r.upvotes}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <AdBanner dataAdSlot="auto" dataAdFormat="auto" dataFullWidthResponsive={true} />
    </main>
  );
}
