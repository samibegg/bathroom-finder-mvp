import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface PageProps {
  params: Promise<{ state: string }>;
}

function toTitleCase(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params;
  const stateName = state.toUpperCase();
  return {
    title: `Public Bathrooms in ${stateName} — GoFind`,
    description: `Browse public restrooms and bathrooms across cities in ${stateName}. Find clean, accessible bathrooms near you — no sign-up needed.`,
  };
}

export default async function StatePage({ params }: PageProps) {
  const { state } = await params;
  const stateName = state.toUpperCase();

  // Get distinct cities with bathroom counts
  const cities = await prisma.bathroom.groupBy({
    by: ["city"],
    where: { state: stateName },
    _count: { id: true },
    orderBy: { city: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1 font-bold text-lg text-gray-900">
            <span>🚻</span>
            <span>Go<span className="text-indigo-600">Find</span></span>
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-sm text-gray-800 font-medium">{stateName}</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Public Bathrooms in {stateName}
        </h1>
        <p className="text-gray-600 mb-8">
          Select a city to browse public restrooms.
        </p>

        {cities.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cities.map((c) => (
              <Link
                key={c.city}
                href={`/locations/${state}/${c.city.toLowerCase().replace(/\s+/g, "-")}`}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <p className="font-semibold text-gray-900">{c.city}</p>
                <p className="text-sm text-gray-500 mt-0.5">{c._count.id} restroom{c._count.id !== 1 ? "s" : ""}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No bathrooms listed yet for {stateName}.</p>
        )}

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow hover:bg-indigo-700 transition-colors"
          >
            📍 Use My Location Instead
          </Link>
        </div>
      </main>
    </div>
  );
}
