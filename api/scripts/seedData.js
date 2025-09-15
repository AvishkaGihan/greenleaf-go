import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/database.js";

// Import models
import User from "../models/User.js";
import Accommodation from "../models/Accommodation.js";
import Restaurant from "../models/Restaurant.js";
import ConservationEvent from "../models/ConservationEvent.js";
import EcoBadge from "../models/EcoBadge.js";
import UserBadge from "../models/UserBadge.js";
import Review from "../models/Review.js";
import Itinerary from "../models/Itinerary.js";
import ItineraryItem from "../models/ItineraryItem.js";
import SystemSettings from "../models/SystemSettings.js";

// Connect to database
connectDB();

const resetDatabase = async () => {
  try {
    console.log("🔄 Starting database reset...");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Accommodation.deleteMany({});
    await Restaurant.deleteMany({});
    await ConservationEvent.deleteMany({});
    await EcoBadge.deleteMany({});
    await UserBadge.deleteMany({});
    await Review.deleteMany({});
    await Itinerary.deleteMany({});
    await ItineraryItem.deleteMany({});
    await SystemSettings.deleteMany({});

    console.log("✅ Database reset successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Accommodation.deleteMany({});
    await Restaurant.deleteMany({});
    await ConservationEvent.deleteMany({});
    await EcoBadge.deleteMany({});
    await UserBadge.deleteMany({});
    await Review.deleteMany({});
    await Itinerary.deleteMany({});
    await ItineraryItem.deleteMany({});
    await SystemSettings.deleteMany({});

    console.log("✅ Database cleared successfully");

    // Create system settings
    console.log("⚙️  Creating system settings...");
    const systemSettings = [
      {
        settingKey: "app_version",
        settingValue: "1.0.0",
        description: "Current app version",
        dataType: "string",
      },
      {
        settingKey: "max_itinerary_days",
        settingValue: "30",
        description: "Maximum days allowed in an itinerary",
        dataType: "integer",
      },
      {
        settingKey: "default_eco_points_per_event",
        settingValue: "100",
        description: "Default eco points awarded for event participation",
        dataType: "integer",
      },
      {
        settingKey: "review_moderation_enabled",
        settingValue: "true",
        description: "Whether reviews require admin approval",
        dataType: "boolean",
      },
      {
        settingKey: "push_notifications_enabled",
        settingValue: "true",
        description: "Global push notification setting",
        dataType: "boolean",
      },
    ];

    await SystemSettings.insertMany(systemSettings);
    console.log("✅ System settings created");

    // Create users
    console.log("👥 Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 12);

    const users = [
      {
        email: "admin@greenleafgo.com",
        passwordHash: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        phone: "+1-555-0100",
        isAdmin: true,
        emailVerified: true,
        totalEcoPoints: 1000,
        ecoLevel: 5,
      },
      {
        email: "john.doe@example.com",
        passwordHash: hashedPassword,
        firstName: "John",
        lastName: "Doe",
        phone: "+1-555-0101",
        budgetRange: "mid-range",
        ecoInterests: ["nature", "culture", "food"],
        emailVerified: true,
        totalEcoPoints: 450,
        ecoLevel: 2,
      },
      {
        email: "jane.smith@example.com",
        passwordHash: hashedPassword,
        firstName: "Jane",
        lastName: "Smith",
        phone: "+1-555-0102",
        budgetRange: "luxury",
        ecoInterests: ["wildlife", "renewable-energy"],
        emailVerified: true,
        totalEcoPoints: 750,
        ecoLevel: 3,
      },
      {
        email: "bob.wilson@example.com",
        passwordHash: hashedPassword,
        firstName: "Bob",
        lastName: "Wilson",
        phone: "+1-555-0103",
        budgetRange: "budget",
        ecoInterests: ["nature", "food"],
        emailVerified: true,
        totalEcoPoints: 200,
        ecoLevel: 1,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log("✅ Users created");

    // Create eco badges
    console.log("🏆 Creating eco badges...");
    const ecoBadges = [
      {
        name: "First Steps",
        description:
          "Welcome to GreenLeaf Go! You've taken your first step towards sustainable travel.",
        emoji: "🌱",
        category: "achievement",
        requirementsType: "eco_points",
        requirementsThreshold: 0,
        pointsReward: 50,
        rarity: "common",
      },
      {
        name: "Tree Hugger",
        description: "Participated in 3 tree planting events",
        emoji: "🌳",
        category: "volunteering",
        requirementsType: "events_attended",
        requirementsThreshold: 3,
        pointsReward: 200,
        rarity: "uncommon",
      },
      {
        name: "Ocean Guardian",
        description: "Participated in 5 beach cleanup events",
        emoji: "🌊",
        category: "volunteering",
        requirementsType: "events_attended",
        requirementsThreshold: 5,
        pointsReward: 300,
        rarity: "rare",
      },
      {
        name: "Eco Warrior",
        description: "Earned 1000 eco points through sustainable actions",
        emoji: "⚡",
        category: "achievement",
        requirementsType: "eco_points",
        requirementsThreshold: 1000,
        pointsReward: 500,
        rarity: "epic",
      },
      {
        name: "Green Globe Trotter",
        description: "Stayed at 10 eco-certified accommodations",
        emoji: "🏨",
        category: "travel",
        requirementsType: "accommodations_booked",
        requirementsThreshold: 10,
        pointsReward: 400,
        rarity: "rare",
      },
      {
        name: "Sustainable Foodie",
        description: "Dined at 15 eco-friendly restaurants",
        emoji: "🍃",
        category: "travel",
        requirementsType: "reviews_written",
        requirementsThreshold: 15,
        pointsReward: 350,
        rarity: "uncommon",
      },
    ];

    const createdBadges = await EcoBadge.insertMany(ecoBadges);
    console.log("✅ Eco badges created");

    // Assign badges to users
    console.log("🎯 Assigning badges to users...");
    const userBadges = [
      {
        userId: createdUsers[1]._id, // John Doe
        badgeId: createdBadges[0]._id, // First Steps
        earnedAt: new Date(),
      },
      {
        userId: createdUsers[1]._id,
        badgeId: createdBadges[1]._id, // Tree Hugger
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: createdUsers[2]._id, // Jane Smith
        badgeId: createdBadges[0]._id, // First Steps
        earnedAt: new Date(),
      },
      {
        userId: createdUsers[2]._id,
        badgeId: createdBadges[3]._id, // Eco Warrior
        earnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    ];

    await UserBadge.insertMany(userBadges);
    console.log("✅ User badges assigned");

    // Create accommodations
    console.log("🏨 Creating accommodations...");
    const accommodations = [
      {
        name: "Green Haven Hotel",
        description:
          "A luxurious eco-friendly hotel with solar panels, rainwater harvesting, and organic gardens. Committed to sustainability and environmental conservation.",
        address: "123 Green Street, San Francisco, CA 94102",
        city: "San Francisco",
        stateProvince: "California",
        country: "USA",
        postalCode: "94102",
        location: {
          type: "Point",
          coordinates: [-122.4194, 37.7749],
        },
        phone: "+1-415-555-0100",
        email: "info@greenhaven.com",
        websiteUrl: "https://greenhaven.com",
        bookingUrl: "https://booking.com/greenhaven",
        type: "hotel",
        starRating: 4,
        priceRange: "$$$",
        checkInTime: "15:00",
        checkOutTime: "11:00",
        energyEfficiencyScore: 4,
        wasteManagementScore: 5,
        waterConservationScore: 4,
        localSourcingScore: 4,
        carbonFootprintScore: 4,
        amenities: [
          "wifi",
          "pool",
          "spa",
          "solar-power",
          "ev-charging",
          "organic-garden",
        ],
        certifications: ["leed", "green-key"],
        imageUrls: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        ],
        isVerified: true,
        isActive: true,
        createdBy: createdUsers[0]._id,
      },
      {
        name: "Eco Lodge Paradise",
        description:
          "A sustainable mountain retreat with breathtaking views. Features renewable energy, local materials, and conservation programs.",
        address: "456 Mountain View Road, Aspen, CO 81611",
        city: "Aspen",
        stateProvince: "Colorado",
        country: "USA",
        postalCode: "81611",
        location: {
          type: "Point",
          coordinates: [-106.8175, 39.1911],
        },
        phone: "+1-970-555-0101",
        email: "stay@ecolodge.com",
        websiteUrl: "https://ecolodge.com",
        type: "eco-lodge",
        starRating: 4,
        priceRange: "$$$$",
        energyEfficiencyScore: 5,
        wasteManagementScore: 5,
        waterConservationScore: 4,
        localSourcingScore: 5,
        carbonFootprintScore: 5,
        amenities: [
          "wifi",
          "spa",
          "solar-power",
          "hiking-trails",
          "wildlife-sanctuary",
        ],
        certifications: ["leed", "green-key", "earth-check"],
        imageUrls: [
          "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        ],
        isVerified: true,
        isActive: true,
        createdBy: createdUsers[0]._id,
      },
      {
        name: "Urban Eco Hostel",
        description:
          "Budget-friendly sustainable accommodation in the heart of the city. Perfect for eco-conscious travelers.",
        address: "789 Sustainable Avenue, Portland, OR 97205",
        city: "Portland",
        stateProvince: "Oregon",
        country: "USA",
        postalCode: "97205",
        location: {
          type: "Point",
          coordinates: [-122.6765, 45.5231],
        },
        phone: "+1-503-555-0102",
        email: "hello@urbanecohostel.com",
        type: "hostel",
        starRating: 3,
        priceRange: "$",
        energyEfficiencyScore: 4,
        wasteManagementScore: 4,
        waterConservationScore: 3,
        localSourcingScore: 5,
        carbonFootprintScore: 4,
        amenities: [
          "wifi",
          "community-kitchen",
          "bike-rental",
          "recycling-program",
        ],
        certifications: ["green-key"],
        imageUrls: [
          "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        ],
        isVerified: true,
        isActive: true,
        createdBy: createdUsers[0]._id,
      },
    ];

    const createdAccommodations = await Accommodation.insertMany(
      accommodations
    );
    console.log("✅ Accommodations created");

    // Create restaurants
    console.log("🍽️  Creating restaurants...");
    const restaurants = [
      {
        name: "Farm Fresh Bistro",
        description:
          "Farm-to-table restaurant serving organic, locally sourced ingredients. Committed to zero waste and sustainable practices.",
        address: "101 Organic Lane, San Francisco, CA 94103",
        city: "San Francisco",
        stateProvince: "California",
        country: "USA",
        postalCode: "94103",
        location: {
          type: "Point",
          coordinates: [-122.4094, 37.7849],
        },
        phone: "+1-415-555-0200",
        email: "info@farmfreshbistro.com",
        websiteUrl: "https://farmfreshbistro.com",
        cuisineType: "farm-to-table",
        priceRange: "$$",
        openingHours: {
          monday: "11:00-22:00",
          tuesday: "11:00-22:00",
          wednesday: "11:00-22:00",
          thursday: "11:00-22:00",
          friday: "11:00-23:00",
          saturday: "10:00-23:00",
          sunday: "10:00-21:00",
        },
        localSourcingScore: 5,
        organicIngredientsScore: 5,
        wasteReductionScore: 4,
        energyEfficiencyScore: 4,
        packagingSustainabilityScore: 5,
        dietaryOptions: ["vegan", "vegetarian", "gluten-free", "organic"],
        certifications: ["organic", "fair-trade"],
        imageUrls: [
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
          "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800",
        ],
        isVerified: true,
        isActive: true,
        createdBy: createdUsers[0]._id,
      },
      {
        name: "Ocean Blue Sustainable Seafood",
        description:
          "Sustainable seafood restaurant with ocean conservation initiatives. Only serves responsibly sourced seafood.",
        address: "202 Coastal Drive, San Francisco, CA 94111",
        city: "San Francisco",
        stateProvince: "California",
        country: "USA",
        postalCode: "94111",
        location: {
          type: "Point",
          coordinates: [-122.4089, 37.7955],
        },
        phone: "+1-415-555-0201",
        email: "dine@oceanblue.com",
        cuisineType: "seafood",
        priceRange: "$$$",
        localSourcingScore: 4,
        organicIngredientsScore: 3,
        wasteReductionScore: 5,
        energyEfficiencyScore: 4,
        packagingSustainabilityScore: 4,
        dietaryOptions: ["pescatarian", "gluten-free"],
        certifications: ["marine-stewardship"],
        imageUrls: [
          "https://images.unsplash.com/photo-1551504734-b464e32a163a?w=800",
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        ],
        isVerified: true,
        isActive: true,
        createdBy: createdUsers[0]._id,
      },
    ];

    const createdRestaurants = await Restaurant.insertMany(restaurants);
    console.log("✅ Restaurants created");

    // Create conservation events
    console.log("🌿 Creating conservation events...");
    const events = [
      {
        title: "Ocean Beach Cleanup",
        description:
          "Join us for a community beach cleanup to protect marine life and keep our oceans clean. We'll provide gloves, bags, and refreshments. All ages welcome!",
        shortDescription: "Help clean Ocean Beach and protect marine life",
        eventType: "beach-cleanup",
        difficultyLevel: "easy",
        ageRequirement: 8,
        physicalRequirements: "Ability to walk on sand and bend down",
        address: "Ocean Beach, San Francisco, CA 94121",
        city: "San Francisco",
        stateProvince: "California",
        country: "USA",
        location: {
          type: "Point",
          coordinates: [-122.5107, 37.7594],
        },
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        startTime: "09:00",
        endTime: "12:00",
        durationHours: 3,
        maxParticipants: 50,
        currentParticipants: 25,
        minParticipants: 10,
        equipmentProvided: ["gloves", "trash-bags", "safety-vests", "water"],
        whatToBring: [
          "sunscreen",
          "sturdy-shoes",
          "hat",
          "reusable-water-bottle",
        ],
        organizerName: "SF Environmental Group",
        organizerContact: "volunteer@sfenv.org",
        organizerWebsite: "https://sfenv.org",
        ecoPointsReward: 150,
        imageUrls: [
          "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        ],
        isApproved: true,
        status: "approved",
        isActive: true,
        createdBy: createdUsers[0]._id,
      },
      {
        title: "Golden Gate Park Tree Planting",
        description:
          "Help us plant native trees in Golden Gate Park to support local biodiversity and combat climate change. No experience necessary - training provided!",
        shortDescription: "Plant native trees in Golden Gate Park",
        eventType: "tree-planting",
        difficultyLevel: "moderate",
        ageRequirement: 12,
        physicalRequirements: "Ability to dig and carry light loads",
        address: "Golden Gate Park, San Francisco, CA 94117",
        city: "San Francisco",
        stateProvince: "California",
        country: "USA",
        location: {
          type: "Point",
          coordinates: [-122.4555, 37.7694],
        },
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        startTime: "10:00",
        endTime: "14:00",
        durationHours: 4,
        maxParticipants: 30,
        currentParticipants: 15,
        minParticipants: 5,
        equipmentProvided: ["shovels", "saplings", "gloves", "training"],
        whatToBring: ["lunch", "water", "work-clothes", "rain-gear"],
        organizerName: "Parks Department",
        organizerContact: "parks@sf.gov",
        organizerWebsite: "https://sfgov.org/parks",
        ecoPointsReward: 200,
        imageUrls: [
          "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
          "https://images.unsplash.com/photo-1519834064978-9b52bbbed6af?w=800",
        ],
        isApproved: true,
        status: "approved",
        isActive: true,
        createdBy: createdUsers[0]._id,
      },
    ];

    const createdEvents = await ConservationEvent.insertMany(events);
    console.log("✅ Conservation events created");

    // Create reviews
    console.log("⭐ Creating reviews...");
    const reviews = [
      {
        userId: createdUsers[1]._id, // John Doe
        reviewType: "accommodation",
        accommodationId: createdAccommodations[0]._id, // Green Haven Hotel
        rating: 5,
        ecoFriendlinessRating: 5,
        title: "Amazing eco-friendly experience!",
        comment:
          "This hotel exceeded my expectations. The sustainability initiatives are impressive - solar panels, rainwater harvesting, and they even have an organic garden. The staff was knowledgeable about their environmental efforts.",
        stayDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        ecoInitiativesObserved: [
          "solar-panels",
          "rainwater-harvesting",
          "organic-garden",
          "recycling-program",
        ],
        photos: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        ],
        isVerified: true,
        isApproved: true,
        helpfulVotes: 12,
        totalVotes: 15,
      },
      {
        userId: createdUsers[2]._id, // Jane Smith
        reviewType: "restaurant",
        restaurantId: createdRestaurants[0]._id, // Farm Fresh Bistro
        rating: 4,
        ecoFriendlinessRating: 5,
        title: "Delicious and sustainable",
        comment:
          "The food was fantastic and I loved knowing everything was locally sourced. Their zero-waste approach is commendable. Will definitely be back!",
        visitDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        ecoInitiativesObserved: ["local-sourcing", "zero-waste", "composting"],
        isVerified: true,
        isApproved: true,
        helpfulVotes: 8,
        totalVotes: 10,
      },
    ];

    await Review.insertMany(reviews);
    console.log("✅ Reviews created");

    // Create itineraries
    console.log("🗺️  Creating itineraries...");
    const itineraries = [
      {
        userId: createdUsers[1]._id, // John Doe
        title: "Eco-Friendly San Francisco Trip",
        description:
          "3-day sustainable travel itinerary exploring green accommodations, eco-friendly dining, and conservation activities in San Francisco.",
        destinationCity: "San Francisco",
        destinationCountry: "USA",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        budgetTotal: 1200,
        budgetCurrency: "USD",
        travelStyle: "mid-range",
        interests: ["nature", "culture", "food"],
        ecoScore: 4.2,
        estimatedCarbonFootprint: 25.5,
        isAiGenerated: true,
        isPublic: true,
        isFavorite: false,
        isActive: true,
      },
      {
        userId: createdUsers[2]._id, // Jane Smith
        title: "Sustainable Food Tour",
        description:
          "Weekend food tour focusing on farm-to-table restaurants and sustainable dining experiences.",
        destinationCity: "San Francisco",
        destinationCountry: "USA",
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        budgetTotal: 800,
        budgetCurrency: "USD",
        travelStyle: "luxury",
        interests: ["food", "culture"],
        ecoScore: 4.5,
        estimatedCarbonFootprint: 18.2,
        isAiGenerated: false,
        isPublic: false,
        isFavorite: true,
        isActive: true,
      },
    ];

    const createdItineraries = await Itinerary.insertMany(itineraries);
    console.log("✅ Itineraries created");

    // Create itinerary items
    console.log("📋 Creating itinerary items...");
    const itineraryItems = [
      // John Doe's itinerary items
      {
        itineraryId: createdItineraries[0]._id,
        dayNumber: 1,
        startTime: "14:00",
        endTime: null,
        title: "Check-in at Green Haven Hotel",
        description:
          "Eco-friendly accommodation with solar power and organic garden",
        itemType: "accommodation",
        accommodationId: createdAccommodations[0]._id,
        estimatedCost: 200,
        currency: "USD",
        sortOrder: 1,
      },
      {
        itineraryId: createdItineraries[0]._id,
        dayNumber: 1,
        startTime: "19:00",
        endTime: "21:00",
        title: "Dinner at Farm Fresh Bistro",
        description:
          "Farm-to-table dining experience with locally sourced ingredients",
        itemType: "restaurant",
        restaurantId: createdRestaurants[0]._id,
        estimatedCost: 75,
        currency: "USD",
        sortOrder: 2,
      },
      {
        itineraryId: createdItineraries[0]._id,
        dayNumber: 2,
        startTime: "09:00",
        endTime: "12:00",
        title: "Ocean Beach Cleanup",
        description:
          "Volunteer event to help clean the beach and protect marine life",
        itemType: "event",
        conservationEventId: createdEvents[0]._id,
        estimatedCost: 0,
        currency: "USD",
        sortOrder: 1,
      },
      // Jane Smith's itinerary items
      {
        itineraryId: createdItineraries[1]._id,
        dayNumber: 1,
        startTime: "12:00",
        endTime: "13:30",
        title: "Lunch at Farm Fresh Bistro",
        description: "Organic farm-to-table lunch",
        itemType: "restaurant",
        restaurantId: createdRestaurants[0]._id,
        estimatedCost: 45,
        currency: "USD",
        sortOrder: 1,
      },
      {
        itineraryId: createdItineraries[1]._id,
        dayNumber: 1,
        startTime: "19:00",
        endTime: "21:00",
        title: "Dinner at Ocean Blue",
        description: "Sustainable seafood dining experience",
        itemType: "restaurant",
        restaurantId: createdRestaurants[1]._id,
        estimatedCost: 95,
        currency: "USD",
        sortOrder: 2,
      },
    ];

    await ItineraryItem.insertMany(itineraryItems);
    console.log("✅ Itinerary items created");

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary of created data:");
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Accommodations: ${createdAccommodations.length}`);
    console.log(`- Restaurants: ${createdRestaurants.length}`);
    console.log(`- Events: ${createdEvents.length}`);
    console.log(`- Badges: ${createdBadges.length}`);
    console.log(`- Itineraries: ${createdItineraries.length}`);
    console.log(`- Reviews: ${reviews.length}`);

    console.log("\n🔑 Test User Credentials:");
    console.log("Admin: admin@greenleafgo.com / password123");
    console.log("Regular User: john.doe@example.com / password123");
    console.log("Regular User: jane.smith@example.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the appropriate function based on command line arguments
const args = process.argv.slice(2);
const isReset = args.includes("--reset");

if (isReset) {
  resetDatabase();
} else {
  seedData();
}

export default seedData;
