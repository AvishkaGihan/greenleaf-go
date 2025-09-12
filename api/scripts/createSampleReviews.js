// Simple test script to create sample review data
import mongoose from "mongoose";
import Review from "../models/Review.js";
import User from "../models/User.js";
import Accommodation from "../models/Accommodation.js";
import Restaurant from "../models/Restaurant.js";

const createSampleReviews = async () => {
  try {
    console.log("Creating sample reviews...");

    // Clear existing reviews
    await Review.deleteMany({});

    // Create sample users if they don't exist
    let sampleUser = await User.findOne({ email: "john@example.com" });
    if (!sampleUser) {
      sampleUser = new User({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        passwordHash: "hashedpassword123", // Fixed field name
        ecoLevel: 3,
        isActive: true,
      });
      await sampleUser.save();
    }

    let sampleUser2 = await User.findOne({ email: "jane@example.com" });
    if (!sampleUser2) {
      sampleUser2 = new User({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        passwordHash: "hashedpassword123", // Fixed field name
        ecoLevel: 4,
        isActive: true,
      });
      await sampleUser2.save();
    }

    // Create sample accommodation if it doesn't exist
    let sampleAccommodation = await Accommodation.findOne({
      name: "Green Hotel",
    });
    if (!sampleAccommodation) {
      sampleAccommodation = new Accommodation({
        name: "Green Hotel",
        description: "Eco-friendly hotel",
        address: "123 Green Street",
        city: "Green City",
        country: "Eco Country",
        type: "eco-lodge",
        priceRange: "$$",
        location: {
          type: "Point",
          coordinates: [-73.935242, 40.73061], // Example NYC coordinates
        },
        ecoRating: 4.5,
        amenities: ["Solar Power", "Recycling"],
      });
      await sampleAccommodation.save();
    }

    // Create sample restaurant if it doesn't exist
    let sampleRestaurant = await Restaurant.findOne({ name: "Organic Cafe" });
    if (!sampleRestaurant) {
      sampleRestaurant = new Restaurant({
        name: "Organic Cafe",
        description: "Organic restaurant",
        address: "456 Organic Avenue",
        city: "Green City",
        country: "Eco Country",
        cuisineType: "Organic",
        priceRange: "$$",
        location: {
          type: "Point",
          coordinates: [-73.935, 40.73], // Example NYC coordinates
        },
        ecoRating: 4.2,
        isApproved: true,
      });
      await sampleRestaurant.save();
    }

    // Create sample reviews
    const sampleReviews = [
      {
        userId: sampleUser._id,
        reviewType: "accommodation",
        accommodationId: sampleAccommodation._id,
        rating: 5,
        title: "Amazing eco-friendly experience!",
        comment:
          "This hotel is truly committed to sustainability. Solar panels, water conservation, and organic meals. Highly recommended!",
        ecoFriendlinessRating: 5,
        ecoInitiativesObserved: [
          "Solar Power",
          "Water Conservation",
          "Organic Food",
        ],
        isApproved: true,
        isFlagged: false,
        helpfulVotes: 12,
        totalVotes: 15,
      },
      {
        userId: sampleUser2._id,
        reviewType: "restaurant",
        restaurantId: sampleRestaurant._id,
        rating: 4,
        title: "Great organic food",
        comment:
          "Love the fresh, organic ingredients. The staff is knowledgeable about their eco-practices.",
        ecoFriendlinessRating: 4,
        ecoInitiativesObserved: ["Organic Ingredients", "Compost Program"],
        isApproved: false, // Pending approval
        isFlagged: false,
        helpfulVotes: 8,
        totalVotes: 10,
      },
      {
        userId: sampleUser._id,
        reviewType: "accommodation",
        accommodationId: sampleAccommodation._id,
        rating: 2,
        title: "Disappointing",
        comment:
          "Not as eco-friendly as advertised. Saw plastic waste and no recycling bins.",
        ecoFriendlinessRating: 2,
        isApproved: false,
        isFlagged: true, // Flagged for review
        moderationNotes:
          "Conflicting report about eco-practices - needs investigation",
        helpfulVotes: 3,
        totalVotes: 8,
      },
      {
        userId: sampleUser2._id,
        reviewType: "restaurant",
        restaurantId: sampleRestaurant._id,
        rating: 5,
        title: "Perfect sustainable dining",
        comment:
          "From farm-to-table ingredients to compostable packaging, this place does it right!",
        ecoFriendlinessRating: 5,
        ecoInitiativesObserved: [
          "Farm-to-Table",
          "Compostable Packaging",
          "Local Sourcing",
        ],
        isApproved: true,
        isFlagged: false,
        helpfulVotes: 20,
        totalVotes: 22,
      },
      {
        userId: sampleUser._id,
        reviewType: "accommodation",
        accommodationId: sampleAccommodation._id,
        rating: 3,
        title: "Good but could be better",
        comment:
          "Nice place with some eco features, but they could do more with renewable energy.",
        ecoFriendlinessRating: 3,
        ecoInitiativesObserved: ["Energy Efficient Lighting"],
        isApproved: false, // Pending
        isFlagged: false,
        helpfulVotes: 5,
        totalVotes: 7,
      },
    ];

    for (const reviewData of sampleReviews) {
      const review = new Review(reviewData);
      await review.save();
    }

    console.log(`✅ Created ${sampleReviews.length} sample reviews`);

    // Print summary
    const totalReviews = await Review.countDocuments();
    const pendingReviews = await Review.countDocuments({
      isApproved: false,
      isFlagged: false,
    });
    const approvedReviews = await Review.countDocuments({
      isApproved: true,
      isFlagged: false,
    });
    const flaggedReviews = await Review.countDocuments({ isFlagged: true });

    console.log("\n📊 Review Statistics:");
    console.log(`Total Reviews: ${totalReviews}`);
    console.log(`Pending Reviews: ${pendingReviews}`);
    console.log(`Approved Reviews: ${approvedReviews}`);
    console.log(`Flagged Reviews: ${flaggedReviews}`);
  } catch (error) {
    console.error("❌ Error creating sample reviews:", error);
  }
};

export default createSampleReviews;
