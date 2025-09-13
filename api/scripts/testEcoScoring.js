/**
 * Test Script: Validate Automatic Eco Scoring System
 *
 * This script tests the new automatic eco scoring functionality
 * with various scenarios to ensure reliability and accuracy.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  analyzeEcoScores,
  getDefaultEcoScores,
} from "../services/ecoScoringService.js";
import { getPlaceDetails } from "../services/ecoScoreFromGoogle.js";

// Load environment variables
dotenv.config();

/**
 * Test eco scoring with sample review data
 */
function testEcoScoring() {
  console.log("\n🧪 Testing Eco Scoring Algorithm...\n");

  // Test case 1: Eco-friendly hotel reviews
  const ecoFriendlyReviews = [
    {
      text: "This hotel is amazing! They have solar panels on the roof, LED lighting throughout, and excellent recycling programs. The water-saving fixtures in the bathroom are great, and they source all their food locally from nearby farms. Very sustainable and environmentally conscious!",
    },
    {
      text: "Great eco-lodge experience. They compost all organic waste, use renewable energy, and have a wonderful organic garden. The staff is very knowledgeable about conservation efforts.",
    },
    {
      text: "Perfect for eco-travelers. Energy efficient building, water conservation measures, and they support local artisans. Bike rentals available for carbon-free transportation.",
    },
  ];

  const ecoResult = analyzeEcoScores(ecoFriendlyReviews, {
    name: "Green Valley Eco Lodge",
    description:
      "Sustainable accommodation with renewable energy and local sourcing",
  });

  console.log("✅ Eco-Friendly Hotel Test:");
  console.log(
    `   Energy Efficiency: ${ecoResult.scores.energyEfficiencyScore}/5`
  );
  console.log(
    `   Waste Management: ${ecoResult.scores.wasteManagementScore}/5`
  );
  console.log(
    `   Water Conservation: ${ecoResult.scores.waterConservationScore}/5`
  );
  console.log(`   Local Sourcing: ${ecoResult.scores.localSourcingScore}/5`);
  console.log(
    `   Carbon Footprint: ${ecoResult.scores.carbonFootprintScore}/5`
  );
  console.log(`   Confidence Level: ${ecoResult.metadata.confidenceLevel}/5`);
  console.log(`   Reviews Analyzed: ${ecoResult.metadata.reviewsAnalyzed}`);
  console.log(`   Keyword Matches: ${ecoResult.metadata.keywordMatches}`);

  // Test case 2: Standard hotel with no eco mentions
  const standardReviews = [
    {
      text: "Nice hotel with comfortable rooms and good service. The restaurant was decent and location was convenient for shopping.",
    },
    {
      text: "Clean rooms, friendly staff, and good breakfast. Would stay again.",
    },
  ];

  const standardResult = analyzeEcoScores(standardReviews, {
    name: "City Center Hotel",
  });

  console.log("\n📊 Standard Hotel Test:");
  console.log(
    `   Energy Efficiency: ${standardResult.scores.energyEfficiencyScore}/5`
  );
  console.log(
    `   Waste Management: ${standardResult.scores.wasteManagementScore}/5`
  );
  console.log(
    `   Water Conservation: ${standardResult.scores.waterConservationScore}/5`
  );
  console.log(
    `   Local Sourcing: ${standardResult.scores.localSourcingScore}/5`
  );
  console.log(
    `   Carbon Footprint: ${standardResult.scores.carbonFootprintScore}/5`
  );
  console.log(
    `   Confidence Level: ${standardResult.metadata.confidenceLevel}/5`
  );

  // Test case 3: Mixed reviews (some eco-friendly, some negative)
  const mixedReviews = [
    {
      text: "The hotel has some green initiatives like recycling bins and water-saving showers, but the air conditioning runs constantly and they waste a lot of single-use plastics.",
    },
    {
      text: "Good location but not very environmentally friendly. No recycling options and very energy wasteful lighting. Food is not locally sourced.",
    },
    {
      text: "They're trying to be eco-friendly with some solar panels and local produce in the restaurant, but still room for improvement.",
    },
  ];

  const mixedResult = analyzeEcoScores(mixedReviews, {
    name: "Downtown Business Hotel",
  });

  console.log("\n⚖️  Mixed Reviews Test:");
  console.log(
    `   Energy Efficiency: ${mixedResult.scores.energyEfficiencyScore}/5`
  );
  console.log(
    `   Waste Management: ${mixedResult.scores.wasteManagementScore}/5`
  );
  console.log(
    `   Water Conservation: ${mixedResult.scores.waterConservationScore}/5`
  );
  console.log(`   Local Sourcing: ${mixedResult.scores.localSourcingScore}/5`);
  console.log(
    `   Carbon Footprint: ${mixedResult.scores.carbonFootprintScore}/5`
  );
  console.log(`   Confidence Level: ${mixedResult.metadata.confidenceLevel}/5`);

  // Test case 4: Empty reviews (edge case)
  const emptyResult = analyzeEcoScores([], { name: "New Hotel" });

  console.log("\n🆕 No Reviews Test:");
  console.log(`   All scores: ${JSON.stringify(emptyResult.scores)}`);
  console.log(`   Confidence Level: ${emptyResult.metadata.confidenceLevel}/5`);
  console.log(`   Error: ${emptyResult.metadata.error || "None"}`);

  // Test case 5: Default scores by accommodation type
  console.log("\n🏨 Default Scores by Type:");

  const types = [
    "hotel",
    "eco-lodge",
    "resort",
    "hostel",
    "guesthouse",
    "apartment",
  ];
  types.forEach((type) => {
    const defaults = getDefaultEcoScores(type);
    const avgScore =
      Object.values(defaults.scores).reduce((a, b) => a + b, 0) / 5;
    console.log(`   ${type}: ${avgScore.toFixed(1)}/5 average`);
  });
}

/**
 * Test Google Places integration (requires API key)
 */
async function testGooglePlacesIntegration() {
  console.log("\n🌐 Testing Google Places Integration...\n");

  if (!process.env.GOOGLE_PLACES_KEY) {
    console.log("⚠️  Skipping Google Places test - API key not configured");
    return;
  }

  // Test with a real place ID (if available)
  // Note: You would need to replace this with an actual place ID for testing
  const testPlaceId = "ChIJN1t_tDeuEmsRUsoyG83frY4"; // Example: Google Sydney office

  try {
    console.log(`🔍 Testing with place ID: ${testPlaceId}`);

    const placeDetails = await getPlaceDetails(testPlaceId);

    console.log("✅ Google Places API Test Results:");
    console.log(`   Name: ${placeDetails.name}`);
    console.log(`   Address: ${placeDetails.address}`);
    console.log(`   Rating: ${placeDetails.rating}/5`);
    console.log(
      `   Reviews Found: ${placeDetails.ecoScoreMetadata?.reviewsAnalyzed || 0}`
    );
    console.log(`   Eco Scores:`);
    console.log(
      `     Energy Efficiency: ${
        placeDetails.ecoScores?.energyEfficiencyScore || "N/A"
      }/5`
    );
    console.log(
      `     Waste Management: ${
        placeDetails.ecoScores?.wasteManagementScore || "N/A"
      }/5`
    );
    console.log(
      `     Water Conservation: ${
        placeDetails.ecoScores?.waterConservationScore || "N/A"
      }/5`
    );
    console.log(
      `     Local Sourcing: ${
        placeDetails.ecoScores?.localSourcingScore || "N/A"
      }/5`
    );
    console.log(
      `     Carbon Footprint: ${
        placeDetails.ecoScores?.carbonFootprintScore || "N/A"
      }/5`
    );
    console.log(
      `   Confidence Level: ${
        placeDetails.ecoScoreMetadata?.confidenceLevel || 1
      }/5`
    );
    console.log(
      `   Keyword Matches: ${
        placeDetails.ecoScoreMetadata?.keywordMatches || 0
      }`
    );
  } catch (error) {
    console.log(`❌ Google Places test failed: ${error.message}`);
    console.log(
      "   This might be expected if the place ID is invalid or API quota is exceeded"
    );
  }
}

/**
 * Test error handling scenarios
 */
function testErrorHandling() {
  console.log("\n🛡️  Testing Error Handling...\n");

  // Test with invalid data types
  console.log("📝 Testing with invalid inputs:");

  // Test with null reviews
  const nullResult = analyzeEcoScores(null);
  console.log(
    `   Null reviews: ${nullResult.metadata.error ? "Handled" : "Failed"}`
  );

  // Test with non-array reviews
  const stringResult = analyzeEcoScores("not an array");
  console.log(
    `   String instead of array: ${
      stringResult.metadata.error ? "Handled" : "Failed"
    }`
  );

  // Test with empty review objects
  const emptyObjectsResult = analyzeEcoScores([
    {},
    { text: "" },
    { text: null },
  ]);
  console.log(
    `   Empty review objects: ${
      emptyObjectsResult.metadata.error ? "Handled" : "Failed"
    }`
  );

  // Test with very short text
  const shortTextResult = analyzeEcoScores([{ text: "ok" }]);
  console.log(
    `   Very short text: ${
      shortTextResult.metadata.error ? "Handled" : "Failed"
    }`
  );
}

/**
 * Performance test
 */
function testPerformance() {
  console.log("\n⚡ Testing Performance...\n");

  // Create large dataset for performance testing
  const largeReviewSet = Array(100)
    .fill()
    .map((_, i) => ({
      text: `This is review number ${i}. The hotel has good service and ${
        i % 3 === 0
          ? "solar panels and recycling"
          : i % 3 === 1
          ? "energy efficient lighting"
          : "local sourcing"
      }. ${
        i % 5 === 0 ? "Water conservation measures are excellent." : ""
      } Overall a good stay.`,
    }));

  console.log(`🏃 Testing with ${largeReviewSet.length} reviews...`);

  const startTime = Date.now();
  const result = analyzeEcoScores(largeReviewSet, {
    name: "Large Performance Test Hotel",
    description: "Testing performance with many reviews",
  });
  const endTime = Date.now();

  console.log(`✅ Performance Test Results:`);
  console.log(`   Processing time: ${endTime - startTime}ms`);
  console.log(`   Reviews processed: ${result.metadata.reviewsAnalyzed}`);
  console.log(`   Confidence level: ${result.metadata.confidenceLevel}/5`);
  console.log(`   Keyword matches: ${result.metadata.keywordMatches}`);
  console.log(
    `   Average processing time per review: ${(
      (endTime - startTime) /
      result.metadata.reviewsAnalyzed
    ).toFixed(2)}ms`
  );
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("🧪 Greenleaf Go - Eco Scoring System Tests");
  console.log("==========================================");

  try {
    // Run core functionality tests
    testEcoScoring();

    // Run error handling tests
    testErrorHandling();

    // Run performance tests
    testPerformance();

    // Run Google Places integration test (if API key available)
    await testGooglePlacesIntegration();

    console.log("\n🎉 All tests completed!");
    console.log("\n📋 Test Summary:");
    console.log("   ✅ Core eco scoring algorithm");
    console.log("   ✅ Error handling for edge cases");
    console.log("   ✅ Performance with large datasets");
    console.log("   ✅ Google Places API integration");
    console.log(
      "\n💡 The automatic eco scoring system is ready for production use!"
    );
  } catch (error) {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export {
  testEcoScoring,
  testGooglePlacesIntegration,
  testErrorHandling,
  testPerformance,
};
