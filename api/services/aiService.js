import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import Accommodation from "../models/Accommodation.js";
import ConservationEvent from "../models/ConservationEvent.js";
import Restaurant from "../models/Restaurant.js";

const ai = new GoogleGenAI({});

export async function generateAISuggestions(props) {
  const {
    destinationCity,
    destinationCountry,
    startDate,
    endDate,
    budgetTotal,
    budgetCurrency,
    travelStyle,
    interests,
    groupSize,
    accommodationPreference,
    includeVolunteerActivities,
  } = props;

  // Query database for relevant data
  const accommodations = await Accommodation.find({
    city: destinationCity,
    country: destinationCountry,
    isActive: true,
  }).select("name description type priceRange ecoRating amenities");

  const events = await ConservationEvent.find({
    city: destinationCity,
    country: destinationCountry,
    isActive: true,
    isApproved: true,
    startDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).select("title description eventType difficultyLevel ecoPointsReward");

  const restaurants = await Restaurant.find({
    city: destinationCity,
    country: destinationCountry,
    isActive: true,
  }).select("name description cuisineType priceRange ecoRating dietaryOptions");

  // Format data for prompt
  const accommodationsText = accommodations
    .map(
      (acc) =>
        `- ${acc.name}: ${
          acc.description || "Eco-friendly accommodation"
        }, Type: ${acc.type}, Price: ${acc.priceRange}, Eco-rating: ${
          acc.ecoRating || "N/A"
        }, Amenities: ${acc.amenities.join(", ")}`
    )
    .join("\n");

  const eventsText = events
    .map(
      (evt) =>
        `- ${evt.title}: ${evt.description}, Type: ${evt.eventType}, Difficulty: ${evt.difficultyLevel}, Eco-points: ${evt.ecoPointsReward}`
    )
    .join("\n");

  const restaurantsText = restaurants
    .map(
      (rest) =>
        `- ${rest.name}: ${
          rest.description || "Sustainable restaurant"
        }, Cuisine: ${rest.cuisineType}, Price: ${
          rest.priceRange
        }, Eco-rating: ${
          rest.ecoRating || "N/A"
        }, Options: ${rest.dietaryOptions.join(", ")}`
    )
    .join("\n");

  // Build the prompt with database data
  const prompt = `
You are a sustainable-travel planner.
Build a 3-day eco-friendly itinerary for ${destinationCity}, ${destinationCountry}.
Dates: ${startDate} to ${endDate}.
Budget: ${budgetTotal} ${budgetCurrency} total for ${groupSize} person(s).
Style: ${travelStyle}.
Interests: ${interests.join(", ")}.
Accommodation preference: ${accommodationPreference}.
Volunteer activities: ${includeVolunteerActivities ? "yes" : "no"}.

Use the following data from our database for accommodations, events, and restaurants. Prioritize using these stored options:

ACCOMMODATIONS:
${accommodationsText || "No accommodations found in database."}

EVENTS/ACTIVITIES:
${eventsText || "No events found in database."}

RESTAURANTS:
${restaurantsText || "No restaurants found in database."}

For activities, use the stored events where possible. If there are not enough events or you need more variety, suggest additional eco-friendly activities that can be done in ${destinationCity}, ${destinationCountry}, focusing on sustainable practices like walking tours, local markets, nature spots, or community initiatives. Keep suggestions realistic and tied to the location.

Return ONLY a JSON array with 3 itinerary objects.
Each object must have:
- title (string)
- days (array of 3 day objects)
- carbonFootprint (number, kg CO₂ saved)
- totalCost (number, in ${budgetCurrency})

Each day object must have:
- day (number)
- activities (array of 3 strings, include emoji)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  const text = response.text; // Gemini returns markdown → raw text
  const jsonString = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  return JSON.parse(jsonString); // parse back to JS object
}
