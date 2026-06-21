import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const bathrooms = [
  {
    name: "Millennium Park Public Restrooms",
    description: "Clean, well-maintained public restrooms near the Bean. Open year-round during park hours.",
    latitude: 41.8826,
    longitude: -87.6233,
    address: "201 E Randolph St",
    city: "Chicago",
    state: "IL",
    zip: "60601",
    type: "Park",
    isPublic: true,
    cleanlinessRating: 4.2,
  },
  {
    name: "Chicago Cultural Center Restrooms",
    description: "Historic building with well-kept restrooms. Free entry. Open during business hours.",
    latitude: 41.8837,
    longitude: -87.6249,
    address: "78 E Washington St",
    city: "Chicago",
    state: "IL",
    zip: "60602",
    type: "Library",
    isPublic: true,
    cleanlinessRating: 4.5,
  },
  {
    name: "Block 37 Mall Restrooms",
    description: "Shopping mall restrooms on State Street. Clean and spacious. Customer access.",
    latitude: 41.8843,
    longitude: -87.6278,
    address: "108 N State St",
    city: "Chicago",
    state: "IL",
    zip: "60602",
    type: "Hotel",
    isPublic: false,
    cleanlinessRating: 3.8,
  },
  {
    name: "Chicago Union Station Restrooms",
    description: "Public transit restrooms in the Great Hall. Always open for travelers.",
    latitude: 41.8789,
    longitude: -87.6403,
    address: "225 S Canal St",
    city: "Chicago",
    state: "IL",
    zip: "60606",
    type: "Transit",
    isPublic: true,
    cleanlinessRating: 3.1,
  },
  {
    name: "Harold Washington Library Restrooms",
    description: "Public library restrooms, multiple floors. Free and open to all during library hours.",
    latitude: 41.8763,
    longitude: -87.6282,
    address: "400 S State St",
    city: "Chicago",
    state: "IL",
    zip: "60605",
    type: "Library",
    isPublic: true,
    cleanlinessRating: 4.0,
  },
];

async function main() {
  console.log("Seeding database with Chicago bathrooms...");
  // Drop all previous
  await prisma.bathroom.deleteMany({});
  for (const bathroom of bathrooms) {
    await prisma.bathroom.create({
      data: bathroom,
    });
  }
  console.log(`✅ Seeded ${bathrooms.length} bathrooms.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
