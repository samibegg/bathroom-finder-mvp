import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY in environment");
  process.exit(1);
}

// Top 50 walkable US cities
const walkingCities = [
  "New York City, NY", "Boston, MA", "Philadelphia, PA", "San Francisco, CA", "Chicago, IL",
  "Washington, DC", "Seattle, WA", "Portland, OR", "Miami, FL", "Baltimore, MD",
  "Minneapolis, MN", "Denver, CO", "Los Angeles, CA", "Atlanta, GA", "New Orleans, LA",
  "Charleston, SC", "Savannah, GA", "Pittsburgh, PA", "Providence, RI", "Richmond, VA",
  "Alexandria, VA", "Madison, WI", "Cincinnati, OH", "Milwaukee, WI", "Saint Louis, MO",
  "Salt Lake City, UT", "San Diego, CA", "Austin, TX", "Jersey City, NJ", "Hoboken, NJ",
  "Oakland, CA", "Berkeley, CA", "Boulder, CO", "Cambridge, MA", "Somerville, MA",
  "Evanston, IL", "Ann Arbor, MI", "Santa Monica, CA", "Pasadena, CA", "Long Beach, CA",
  "Honolulu, HI", "Omaha, NE", "Des Moines, IA", "Burlington, VT", "Portland, ME",
  "Annapolis, MD", "Asheville, NC", "Charlottesville, VA", "Ithaca, NY", "Syracuse, NY"
];

function parseAddress(formattedAddress: string) {
  const parts = formattedAddress.split(", ").map(s => s.trim());
  let address = "";
  let city = "";
  let state = "";
  let zip = "";

  if (parts.length >= 4) {
    address = parts[0];
    city = parts[1];
    const stateZip = parts[2].split(" ");
    state = stateZip[0] || "";
    zip = stateZip[1] || "";
  } else if (parts.length === 3) {
    address = parts[0];
    city = parts[0];
    const stateZip = parts[1].split(" ");
    state = stateZip[0] || "";
    zip = stateZip[1] || "";
  } else {
    address = formattedAddress;
  }
  
  return { address, city, state, zip };
}

function getType(types: string[]) {
  if (types.includes("public_bathroom")) return "Public";
  if (types.includes("shopping_mall") || types.includes("department_store")) return "Retail";
  if (types.includes("cafe") || types.includes("restaurant")) return "Cafe/Restaurant";
  if (types.includes("transit_station")) return "Transit";
  if (types.includes("park")) return "Park";
  if (types.includes("library")) return "Library";
  if (types.includes("hotel")) return "Hotel";
  return "Other";
}

async function fetchAndSeed() {
  console.log("Fetching massive data for top 50 US walking cities...");
  
  let totalInserted = 0;
  let totalSkipped = 0;

  for (const city of walkingCities) {
    const query = `public restroom in ${city}`;
    try {
      const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY as string,
          "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.types,places.accessibilityOptions"
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: "en",
          maxResultCount: 20
        })
      });

      const data = await response.json();
      
      if (!data.places) {
        console.log(`No places found for query: ${query}`);
        continue;
      }

      for (const place of data.places) {
        const { address, city: parsedCity, state, zip } = parseAddress(place.formattedAddress || "");
        const finalCity = parsedCity || city.split(",")[0];
        const finalState = state || city.split(", ")[1];

        const bathroomType = getType(place.types || []);
        const isPublic = bathroomType === "Public" || bathroomType === "Park" || bathroomType === "Library" || bathroomType === "Transit";
        
        const accessibility = place.accessibilityOptions || {};
        const isWheelchairAccessible = accessibility.wheelchairAccessibleRestroom || accessibility.wheelchairAccessibleEntrance || false;

        // Check if already exists based on precise lat/lon
        const existing = await prisma.bathroom.findFirst({
          where: {
            latitude: place.location?.latitude || 0,
            longitude: place.location?.longitude || 0,
          }
        });

        if (existing) {
          totalSkipped++;
          continue;
        }

        await prisma.bathroom.create({
          data: {
            name: place.displayName?.text || "Public Restroom",
            latitude: place.location?.latitude || 0,
            longitude: place.location?.longitude || 0,
            address,
            city: finalCity,
            state: finalState,
            zip,
            type: bathroomType,
            isPublic,
            requiresPurchase: bathroomType === "Cafe/Restaurant" || bathroomType === "Retail",
            wheelchairAccessible: isWheelchairAccessible,
            cleanlinessRating: 3.5 + (Math.random() * 1.5),
            isVerified: true, 
            verificationCount: 1
          }
        });
        totalInserted++;
      }
      console.log(`✅ Processed ${city} | Added ${totalInserted} | Skipped ${totalSkipped}`);
      
      // Delay to respect Google API rate limits slightly
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error(`Error querying ${query}`, e);
    }
  }
  
  console.log(`🎉 Finished! Successfully inserted ${totalInserted} new bathrooms (skipped ${totalSkipped} duplicates).`);
}

fetchAndSeed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
