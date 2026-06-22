import { MetadataRoute } from 'next'
import { prisma } from "@/lib/prisma"

// Trigger sitemap fix
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const bathrooms = await prisma.bathroom.findMany({
    select: {
      city: true,
      state: true,
      updatedAt: true,
    },
  });

  // Group by city/state to find latest updated
  const locationsMap = new Map<string, Date>();
  for (const b of bathrooms) {
    const slugState = encodeURIComponent(b.state.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    const slugCity = encodeURIComponent(b.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    const key = `${slugState}/${slugCity}`;
    const existing = locationsMap.get(key);
    if (!existing || b.updatedAt > existing) {
      locationsMap.set(key, b.updatedAt);
    }
  }

  const locationUrls: MetadataRoute.Sitemap = Array.from(locationsMap.entries()).map(([path, date]) => ({
    url: `https://gottaflush.com/locations/${path}`,
    lastModified: date,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://gottaflush.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://gottaflush.com/locations',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...locationUrls,
  ]
}
