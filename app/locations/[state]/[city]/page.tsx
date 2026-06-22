import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface PageProps {
  params: Promise<{ state: string; city: string }>;
}

function toTitleCase(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state, city } = await params;
  const cityName = toTitleCase(city);
  const stateName = state.toUpperCase();

  return {
    title: `Public Bathrooms in ${cityName}, ${stateName} | GottaFlush`,
    description: `Find clean public restrooms in ${cityName}, ${stateName}. Browse ${cityName} public bathrooms by location, cleanliness rating, and type. No sign-up required.`,
    keywords: [
      `public bathrooms ${cityName}`,
      `restrooms in ${cityName}`,
      `${cityName} public toilets`,
      `clean bathrooms ${cityName} ${stateName}`,
      `where to find bathrooms in ${cityName}`,
    ],
    openGraph: {
      title: `Public Bathrooms in ${cityName}, ${stateName}`,
      description: `Find the cleanest public restrooms near you in ${cityName}, ${stateName}.`,
      type: "website",
    },
  };
}

export default async function CityBathroomsPage({ params }: PageProps) {
  const { state, city } = await params;
  const cityName = toTitleCase(city);
  const stateName = state.toUpperCase();

  const bathrooms = await prisma.bathroom.findMany({
    where: {
      city: { equals: cityName },
      state: { equals: stateName },
    },
    orderBy: { cleanlinessRating: "desc" },
  });

  const typeEmoji: Record<string, string> = {
    Park: "🌳",
    Hotel: "🏨",
    Cafe: "☕",
    Transit: "🚆",
    Library: "📚",
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Public Bathrooms in ${cityName}, ${stateName}`,
    numberOfItems: bathrooms.length,
    itemListElement: bathrooms.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LocalBusiness",
        name: b.name,
        description: b.description,
        address: {
          "@type": "PostalAddress",
          streetAddress: b.address,
          addressLocality: b.city,
          addressRegion: b.state,
          postalCode: b.zip,
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: b.latitude,
          longitude: b.longitude,
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Nav */}
        <nav className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 font-bold text-lg text-gray-900">
              <span>🚻</span>
              <span>Go<span className="text-indigo-600">Find</span></span>
            </Link>
            <span className="text-gray-400">/</span>
            <Link href={`/locations/${state}`} className="text-sm text-gray-500 hover:text-gray-800">
              {stateName}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-800 font-medium">{cityName}</span>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Hero */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Public Bathrooms in {cityName}, {stateName}
            </h1>
            <p className="text-gray-600">
              {bathrooms.length > 0
                ? `${bathrooms.length} public restrooms found. Sorted by cleanliness rating.`
                : `No bathrooms listed yet for ${cityName}. Check back soon or use the map to find nearby options.`}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow hover:bg-indigo-700 transition-colors"
            >
              📍 Use My Location Instead
            </Link>
          </div>

          {/* Bathroom list */}
          {bathrooms.length > 0 && (
            <div className="space-y-4">
              {bathrooms.map((b, i) => (
                <article
                  key={b.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{typeEmoji[b.type] ?? "🚻"}</span>
                      <div>
                        <h2 className="font-semibold text-gray-900 text-lg leading-tight">
                          {b.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">{b.address}</p>
                        {b.description && (
                          <p className="text-sm text-gray-700 mt-2">{b.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-center bg-gray-50 rounded-xl px-3 py-2 min-w-[52px]">
                      <span className="text-xl font-bold text-gray-900">
                        {b.cleanlinessRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">/ 5</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                      {b.type}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        b.isPublic
                          ? "bg-green-50 text-green-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {b.isPublic ? "✓ Public" : "Customers only"}
                    </span>
                    {b.doorCode && (
                      <span className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full font-medium">
                        🔑 Code: {b.doorCode}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* SEO content block */}
          <section className="mt-12 prose prose-sm max-w-none text-gray-600">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Finding Public Restrooms in {cityName}
            </h2>
            <p>
              Whether you&apos;re a visitor or a local, finding a clean public restroom in {cityName},{" "}
              {stateName} can be challenging. GoFind aggregates public bathrooms across parks,
              transit stations, libraries, hotels, and cafes to help you find the nearest option
              fast — with no app download or sign-up required.
            </p>
            <p className="mt-2">
              All listings include cleanliness ratings, access type (public vs. customers only),
              and door codes where available — all crowdsourced by the GoFind community.
            </p>
          </section>
        </main>
      </div>
    </>
  );
}
