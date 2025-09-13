import axios from "axios";

const ECO_KEYWORDS = {
  high: [
    "solar",
    "renewable",
    "organic",
    "sustainable",
    "eco-friendly",
    "green certified",
    "carbon neutral",
    "LEED",
    "recycling",
    "water conservation",
  ],
  medium: [
    "local",
    "natural",
    "efficient",
    "conservation",
    "environmental",
    "energy saving",
  ],
  low: ["traditional", "standard", "conventional"],
};

function calculateEcoScore(placeDetails) {
  let score = 2; // Base score
  const searchText = `${placeDetails.name || ""} ${
    placeDetails.description || ""
  } ${(placeDetails.reviews || []).map((r) => r.text).join(" ")}`.toLowerCase();

  // Count eco-friendly keywords
  const highMatches = ECO_KEYWORDS.high.filter((keyword) =>
    searchText.includes(keyword)
  ).length;
  const mediumMatches = ECO_KEYWORDS.medium.filter((keyword) =>
    searchText.includes(keyword)
  ).length;

  score += highMatches * 0.8;
  score += mediumMatches * 0.3;

  // Bonus for high ratings
  if (placeDetails.rating >= 4.5) score += 0.5;
  if (placeDetails.rating >= 4.0) score += 0.3;

  // Cap at 5 stars
  return Math.min(5, Math.round(score * 2) / 2);
}

async function getPlaceDetails(placeId) {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          fields:
            "name,formatted_address,formatted_phone_number,rating,photos,reviews,price_level,website,opening_hours",
          key: process.env.GOOGLE_PLACES_KEY,
        },
      }
    );

    const place = response.data.result;
    const ecoScore = calculateEcoScore(place);

    return {
      name: place.name || "",
      address: place.formatted_address || "",
      phone: place.formatted_phone_number || "",
      website: place.website || "",
      rating: place.rating || 0,
      priceLevel: place.price_level || 2,
      ecoScore: ecoScore,
      photos: place.photos
        ? place.photos
            .slice(0, 5)
            .map(
              (photo) =>
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_PLACES_KEY}`
            )
        : [],
      openingHours: place.opening_hours?.weekday_text || [],
    };
  } catch (error) {
    console.error("Error fetching place details:", error);
    throw new Error("Failed to fetch place details from Google");
  }
}

async function searchPlaces(input) {
  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json",
      {
        params: {
          input: input,
          types: "establishment",
          key: process.env.GOOGLE_PLACES_KEY,
        },
      }
    );

    console.log("Autocomplete response:", response.data);

    return response.data.predictions.map((prediction) => ({
      placeId: prediction.place_id,
      description: prediction.description,
    }));
  } catch (error) {
    console.error("Error searching places:", error);
    throw new Error("Failed to search places");
  }
}

export { getPlaceDetails, searchPlaces, calculateEcoScore };
