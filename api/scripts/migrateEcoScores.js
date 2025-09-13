/**
 * Migration Script: Update Eco Scores for Existing Accommodations
 *
 * This script migrates existing accommodations to use the new automatic
 * eco scoring system based on Google Places reviews.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Accommodation from "../models/Accommodation.js";
import {
  getPlaceDetails,
  getDefaultEcoScores,
} from "../services/ecoScoreFromGoogle.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// Helper function to add delay for API rate limiting
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Migrate a single accommodation to use auto-calculated eco scores
 * @param {Object} accommodation - The accommodation document
 * @param {Object} options - Migration options
 */
async function migrateAccommodation(accommodation, options = {}) {
  const { dryRun = false, forceUpdate = false } = options;

  console.log(`\n📍 Processing: ${accommodation.name} (${accommodation._id})`);

  // Skip if already has recent scores and not forcing update
  if (!forceUpdate && accommodation.ecoScoreMetadata?.lastCalculated) {
    const lastCalc = new Date(accommodation.ecoScoreMetadata.lastCalculated);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (
      lastCalc > oneWeekAgo &&
      accommodation.ecoScoreMetadata.confidenceLevel >= 3
    ) {
      console.log(
        `   ⏭️  Skipping - already has recent high-confidence scores`
      );
      return { status: "skipped", reason: "recent_scores" };
    }
  }

  let ecoData;
  let dataSource = "default";

  try {
    // Try to get Google Place ID from existing data or search
    let googlePlaceId = accommodation.ecoScoreMetadata?.googlePlaceId;

    if (!googlePlaceId) {
      console.log(`   🔍 No Google Place ID found, using default scores`);
      ecoData = getDefaultEcoScores(accommodation.type || "hotel");
      dataSource = "default";
    } else {
      console.log(`   📱 Fetching Google Places data...`);
      try {
        const placeDetails = await getPlaceDetails(googlePlaceId);
        ecoData = {
          scores: placeDetails.ecoScores,
          metadata: {
            ...placeDetails.ecoScoreMetadata,
            googlePlaceId: googlePlaceId,
          },
        };
        dataSource = "google_places";
        console.log(
          `   ✅ Google Places data retrieved (${ecoData.metadata.reviewsAnalyzed} reviews)`
        );
      } catch (error) {
        console.log(`   ⚠️  Google Places error: ${error.message}`);
        ecoData = getDefaultEcoScores(accommodation.type || "hotel");
        ecoData.metadata.googlePlaceId = googlePlaceId;
        dataSource = "default_fallback";
      }
    }

    // Store original scores for comparison
    const originalScores = {
      energyEfficiencyScore: accommodation.energyEfficiencyScore,
      wasteManagementScore: accommodation.wasteManagementScore,
      waterConservationScore: accommodation.waterConservationScore,
      localSourcingScore: accommodation.localSourcingScore,
      carbonFootprintScore: accommodation.carbonFootprintScore,
    };

    // Calculate original eco rating
    const originalEcoRating = accommodation.ecoRating;

    // Calculate new eco rating
    const newScores = Object.values(ecoData.scores).filter(
      (score) => score !== null
    );
    const newEcoRating = newScores.length
      ? newScores.reduce((a, b) => a + b) / newScores.length
      : null;

    console.log(`   📊 Scores comparison:`);
    console.log(
      `      Original eco rating: ${originalEcoRating?.toFixed(2) || "N/A"}`
    );
    console.log(`      New eco rating: ${newEcoRating?.toFixed(2) || "N/A"}`);
    console.log(`      Data source: ${dataSource}`);
    console.log(`      Confidence: ${ecoData.metadata.confidenceLevel}/5`);

    if (!dryRun) {
      // Update the accommodation
      await Accommodation.findByIdAndUpdate(
        accommodation._id,
        {
          ...ecoData.scores,
          ecoScoreMetadata: ecoData.metadata,
        },
        { runValidators: true }
      );
      console.log(`   💾 Updated successfully`);
    } else {
      console.log(`   🔍 DRY RUN - would update with above scores`);
    }

    return {
      status: "success",
      dataSource,
      originalEcoRating,
      newEcoRating,
      confidenceLevel: ecoData.metadata.confidenceLevel,
      reviewsAnalyzed: ecoData.metadata.reviewsAnalyzed,
    };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      status: "error",
      error: error.message,
    };
  }
}

/**
 * Main migration function
 */
async function migrateEcoScores(options = {}) {
  const {
    dryRun = false,
    forceUpdate = false,
    limit = null,
    accommodationIds = null,
    type = null,
  } = options;

  console.log(`\n🚀 Starting eco scores migration...`);
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE UPDATE"}`);
  console.log(`   Force update: ${forceUpdate}`);

  try {
    // Build query
    let query = { isActive: true };

    if (accommodationIds) {
      query._id = { $in: accommodationIds };
    }

    if (type) {
      query.type = type;
    }

    // Get accommodations to process
    let accommodationsQuery = Accommodation.find(query);

    if (limit) {
      accommodationsQuery = accommodationsQuery.limit(limit);
    }

    const accommodations = await accommodationsQuery;

    console.log(
      `\n📋 Found ${accommodations.length} accommodations to process`
    );

    if (accommodations.length === 0) {
      console.log(`✅ No accommodations found matching criteria`);
      return;
    }

    // Process each accommodation
    const results = {
      total: accommodations.length,
      success: 0,
      error: 0,
      skipped: 0,
      byDataSource: {
        google_places: 0,
        default: 0,
        default_fallback: 0,
      },
    };

    for (let i = 0; i < accommodations.length; i++) {
      const accommodation = accommodations[i];

      console.log(
        `\n[${i + 1}/${accommodations.length}] Processing accommodation...`
      );

      const result = await migrateAccommodation(accommodation, options);

      // Update statistics
      results[result.status]++;
      if (result.dataSource) {
        results.byDataSource[result.dataSource]++;
      }

      // Add delay to respect API rate limits
      if (result.dataSource === "google_places") {
        await delay(200); // 200ms delay for Google Places API
      } else {
        await delay(50); // Shorter delay for other operations
      }
    }

    // Print summary
    console.log(`\n📈 Migration Summary:`);
    console.log(`   Total processed: ${results.total}`);
    console.log(`   Successful: ${results.success}`);
    console.log(`   Errors: ${results.error}`);
    console.log(`   Skipped: ${results.skipped}`);
    console.log(`\n📊 Data Sources:`);
    console.log(`   Google Places: ${results.byDataSource.google_places}`);
    console.log(`   Default scores: ${results.byDataSource.default}`);
    console.log(
      `   Default (fallback): ${results.byDataSource.default_fallback}`
    );

    if (dryRun) {
      console.log(`\n🔍 This was a DRY RUN - no data was actually updated`);
      console.log(`   Run with --live flag to perform actual updates`);
    } else {
      console.log(`\n✅ Migration completed successfully!`);
    }
  } catch (error) {
    console.error(`❌ Migration failed:`, error);
    throw error;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  const options = {
    dryRun: !args.includes("--live"),
    forceUpdate: args.includes("--force"),
    limit: null,
    accommodationIds: null,
    type: null,
  };

  // Parse limit
  const limitIndex = args.indexOf("--limit");
  if (limitIndex !== -1 && args[limitIndex + 1]) {
    options.limit = parseInt(args[limitIndex + 1]);
  }

  // Parse type filter
  const typeIndex = args.indexOf("--type");
  if (typeIndex !== -1 && args[typeIndex + 1]) {
    options.type = args[typeIndex + 1];
  }

  // Parse specific IDs
  const idsIndex = args.indexOf("--ids");
  if (idsIndex !== -1 && args[idsIndex + 1]) {
    options.accommodationIds = args[idsIndex + 1].split(",");
  }

  console.log(`🔧 Eco Scores Migration Script`);
  console.log(`================================`);

  if (args.includes("--help")) {
    console.log(`
Usage: node migrateEcoScores.js [options]

Options:
  --live           Perform actual updates (default is dry run)
  --force          Force update even if scores are recent
  --limit <n>      Limit number of accommodations to process
  --type <type>    Only process accommodations of specific type
  --ids <id1,id2>  Only process specific accommodation IDs
  --help           Show this help message

Examples:
  node migrateEcoScores.js                    # Dry run all accommodations
  node migrateEcoScores.js --live             # Update all accommodations
  node migrateEcoScores.js --limit 10         # Test with first 10
  node migrateEcoScores.js --type hotel       # Only hotels
  node migrateEcoScores.js --force --live     # Force update all
`);
    process.exit(0);
  }

  try {
    await connectDB();
    await migrateEcoScores(options);
  } catch (error) {
    console.error(`Fatal error:`, error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log(`\n🔌 Database connection closed`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrateEcoScores, migrateAccommodation };
