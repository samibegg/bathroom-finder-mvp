import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY in environment");
  process.exit(1);
}

const queries = [
  "public restroom Chicago",
  "public bathroom downtown Chicago",
  "clean bathroom in Manhattan New York",
  "public restroom Central Park NYC"
];

function parseAddress(formattedAddress: string) {
  // Rough parse of "108 N State St, Chicago, IL 60602, USA" or "Chicago, IL 60657, USA"
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
    address = parts[0]; // Might just be city
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
  console.log("Fetching real data from Google Places API...");
  await prisma.bathroom.deleteMany({});
  
  let totalInserted = 0;

  for (const query of queries) {
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
        const { address, city, state, zip } = parseAddress(place.formattedAddress || "");
        const bathroomType = getType(place.types || []);
        const isPublic = bathroomType === "Public" || bathroomType === "Park" || bathroomType === "Library" || bathroomType === "Transit";
        
        const accessibility = place.accessibilityOptions || {};
        const isWheelchairAccessible = accessibility.wheelchairAccessibleRestroom || accessibility.wheelchairAccessibleEntrance || false;

        await prisma.bathroom.create({
          data: {
            name: place.displayName?.text || "Public Restroom",
            latitude: place.location?.latitude || 0,
            longitude: place.location?.longitude || 0,
            address,
            city,
            state,
            zip,
            type: bathroomType,
            isPublic,
            requiresPurchase: bathroomType === "Cafe/Restaurant" || bathroomType === "Retail",
            wheelchairAccessible: isWheelchairAccessible,
            cleanlinessRating: 3.5 + (Math.random() * 1.5) // Fake initial ratings between 3.5 - 5.0
          }
        });
        totalInserted++;
      }
      console.log(`✅ Seeded batch for query: "${query}"`);
    } catch (e) {
      console.error(`Error querying ${query}`, e);
    }
  }
  
  console.log(`🎉 Finished! Successfully fetched and inserted ${totalInserted} real bathrooms into MongoDB.`);
}

fetchAndSeed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
