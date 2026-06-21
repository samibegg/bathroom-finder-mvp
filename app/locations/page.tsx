import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Public Bathroom Directory by City & State — GoFind",
  description:
    "Browse public restrooms and bathrooms across the US by city and state. Find clean, accessible bathrooms near you — no sign-up needed.",
  keywords: [
    "public bathrooms by city",
    "restrooms near me",
    "public toilet directory",
    "find bathroom",
    "US bathroom finder",
  ],
};

export default async function LocationsIndexPage() {
  const groups = await prisma.bathroom.groupBy({
    by: ["state", "city"],
    _count: { id: true },
    orderBy: [{ state: "asc" }, { city: "asc" }],
  });

  // Group by state for rendering
  const byState: Record<string, { city: string; count: number }[]> = {};
  for (const g of groups) {
    if (!byState[g.state]) byState[g.state] = [];
    byState[g.state].push({ city: g.city, count: g._count.id });
  }
  const states = Object.keys(byState).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1 font-bold text-lg text-gray-900">
            <span>🚻</span>
            <span>
              Go<span className="text-indigo-600">Find</span>
            </span>
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-sm text-gray-800 font-medium">Locations</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Public Bathroom Directory
        </h1>
        <p className="text-gray-600 mb-8">
          Browse public restrooms across the US by state and city.
        </p>

        {states.length === 0 ? (
          <p className="text-gray-500">No bathrooms listed yet. Check back soon.</p>
        ) : (
          <div className="space-y-8">
            {states.map((state) => (
              <section key={state}>
                <Link
                  href={`/locations/${state.toLowerCase()}`}
                  className="inline-block mb-3 text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  {state}
                </Link>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {byState[state].map(({ city, count }) => {
                    const citySlug = city.toLowerCase().replace(/\s+/g, "-");
                    const stateSlug = state.toLowerCase();
                    return (
                      <Link
                        key={city}
                        href={`/locations/${stateSlug}/${citySlug}`}
                        className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
                      >
                        <p className="font-semibold text-gray-900">{city}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {count} restroom{count !== 1 ? "s" : ""}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow hover:bg-indigo-700 transition-colors"
          >
            📍 Use My Location Instead
          </Link>
        </div>

        <section className="mt-12 text-gray-600 text-sm space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">About GoFind</h2>
          <p>
            GoFind helps you locate clean, accessible public restrooms wherever you are in the US.
            Our directory covers parks, transit stations, libraries, hotels, and cafes — all
            crowdsourced and rated by the community.
          </p>
          <p>
            Can&apos;t find your city? Use the map on our homepage to discover bathrooms near your
            current location.
          </p>
        </section>
      </main>
    </div>
  );
}
