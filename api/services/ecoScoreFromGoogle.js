import axios from "axios";
import { analyzeEcoScores, getDefaultEcoScores } from "./ecoScoringService.js";

// Legacy function - kept for backward compatibility
function calculateEcoScore(placeDetails) {
  const result = analyzeEcoScores(placeDetails.reviews || [], placeDetails);
  const scores = Object.values(result.scores).filter((score) => score !== null);
  return scores.length ? scores.reduce((a, b) => a + b) / scores.length : 3;
}

async function getPlaceDetails(placeId) {
  try {
    // Validate input
    if (!placeId || typeof placeId !== "string") {
      throw new Error("Invalid place ID provided");
    }

    if (!process.env.GOOGLE_PLACES_KEY) {
      throw new Error("Google Places API key not configured");
    }

    console.log(`Fetching details for place: ${placeId}`);

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          fields:
            "name,formatted_address,formatted_phone_number,rating,photos,reviews,price_level,website,opening_hours,geometry",
          key: process.env.GOOGLE_PLACES_KEY,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    // Check API response status
    if (response.data.status === "INVALID_REQUEST") {
      throw new Error("Invalid request to Google Places API");
    }

    if (response.data.status === "NOT_FOUND") {
      throw new Error("Place not found in Google Places");
    }

    if (response.data.status === "OVER_QUERY_LIMIT") {
      throw new Error("Google Places API quota exceeded");
    }

    if (response.data.status === "REQUEST_DENIED") {
      throw new Error("Google Places API request denied");
    }

    if (response.data.status !== "OK") {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    const place = response.data.result;

    if (!place) {
      throw new Error("No place data returned from Google Places API");
    }

    // Safely extract reviews
    const reviews = place.reviews || [];
    console.log(`Found ${reviews.length} reviews for analysis`);

    // Calculate detailed eco scores using new algorithm with error handling
    let ecoAnalysis;
    try {
      ecoAnalysis = analyzeEcoScores(reviews, place);
    } catch (analysisError) {
      console.error("Eco analysis failed:", analysisError);
      // Use default scores if analysis fails
      ecoAnalysis = {
        scores: {
          energyEfficiencyScore: 3,
          wasteManagementScore: 3,
          waterConservationScore: 3,
          localSourcingScore: 3,
          carbonFootprintScore: 3,
        },
        metadata: {
          reviewsAnalyzed: reviews.length,
          confidenceLevel: 1,
          lastCalculated: new Date(),
          keywordMatches: 0,
          error: `Analysis failed: ${analysisError.message}`,
        },
      };
    }

    // Legacy eco score for backward compatibility
    const legacyEcoScore = calculateEcoScore(place);

    // Safely extract photos
    let photos = [];
    try {
      photos = place.photos
        ? place.photos
            .slice(0, 5)
            .map(
              (photo) =>
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_PLACES_KEY}`
            )
        : [];
    } catch (photoError) {
      console.warn("Error processing photos:", photoError);
      photos = [];
    }

    // Extract coordinates from geometry
    let coordinates = null;
    try {
      if (place.geometry && place.geometry.location) {
        coordinates = {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        };
        console.log(
          `Extracted coordinates: ${coordinates.latitude}, ${coordinates.longitude}`
        );
      } else {
        console.warn("No geometry data available for coordinates");
      }
    } catch (coordError) {
      console.warn("Error extracting coordinates:", coordError);
    }

    return {
      name: place.name || "",
      address: place.formatted_address || "",
      phone: place.formatted_phone_number || "",
      website: place.website || "",
      rating: place.rating || 0,
      priceLevel: place.price_level || 2,
      ecoScore: legacyEcoScore, // Legacy field
      ecoScores: ecoAnalysis.scores, // New detailed scores
      ecoScoreMetadata: ecoAnalysis.metadata, // Calculation metadata
      photos: photos,
      openingHours: place.opening_hours?.weekday_text || [],
      placeId: placeId, // Store for future reference
      coordinates: coordinates, // Add coordinates from Google Places
    };
  } catch (error) {
    console.error("Error fetching place details:", error);

    // Categorize error types for better handling
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      throw new Error("Network error: Unable to connect to Google Places API");
    }

    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      throw new Error("Request timeout: Google Places API is not responding");
    }

    if (error.response?.status === 429) {
      throw new Error(
        "Rate limit exceeded: Too many requests to Google Places API"
      );
    }

    if (error.response?.status >= 500) {
      throw new Error("Google Places API server error");
    }

    if (error.message.includes("API key")) {
      throw new Error("Invalid API key for Google Places API");
    }

    // Re-throw with original message if it's already descriptive
    if (
      error.message.includes("Google Places") ||
      error.message.includes("quota") ||
      error.message.includes("denied")
    ) {
      throw error;
    }

    throw new Error(`Failed to fetch place details: ${error.message}`);
  }
}

async function searchPlaces(input) {
  try {
    // Validate input
    if (!input || typeof input !== "string" || input.trim().length === 0) {
      throw new Error("Search input is required");
    }

    if (!process.env.GOOGLE_PLACES_KEY) {
      throw new Error("Google Places API key not configured");
    }

    console.log(`Searching places for: ${input}`);

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json",
      {
        params: {
          input: input.trim(),
          types: "establishment",
          key: process.env.GOOGLE_PLACES_KEY,
        },
        timeout: 8000, // 8 second timeout
      }
    );

    console.log("Autocomplete response status:", response.data.status);

    // Check API response status
    if (response.data.status === "INVALID_REQUEST") {
      throw new Error("Invalid search request to Google Places API");
    }

    if (response.data.status === "OVER_QUERY_LIMIT") {
      throw new Error("Google Places API quota exceeded");
    }

    if (response.data.status === "REQUEST_DENIED") {
      throw new Error("Google Places API request denied");
    }

    if (response.data.status === "ZERO_RESULTS") {
      console.log("No results found for search query");
      return [];
    }

    if (response.data.status !== "OK") {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    const predictions = response.data.predictions || [];
    console.log(`Found ${predictions.length} search results`);

    return predictions.map((prediction) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting?.main_text || "",
      secondaryText: prediction.structured_formatting?.secondary_text || "",
      types: prediction.types || [],
    }));
  } catch (error) {
    console.error("Error searching places:", error);

    // Categorize error types for better handling
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      throw new Error("Network error: Unable to connect to Google Places API");
    }

    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      throw new Error("Request timeout: Google Places API is not responding");
    }

    if (error.response?.status === 429) {
      throw new Error(
        "Rate limit exceeded: Too many requests to Google Places API"
      );
    }

    if (error.response?.status >= 500) {
      throw new Error("Google Places API server error");
    }

    // Re-throw with original message if it's already descriptive
    if (
      error.message.includes("Google Places") ||
      error.message.includes("quota") ||
      error.message.includes("denied")
    ) {
      throw error;
    }

    throw new Error(`Failed to search places: ${error.message}`);
  }
}

export {
  getPlaceDetails,
  searchPlaces,
  calculateEcoScore,
  analyzeEcoScores,
  getDefaultEcoScores,
};
