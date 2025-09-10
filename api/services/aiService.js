import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import Accommodation from "../models/Accommodation.js";
import ConservationEvent from "../models/ConservationEvent.js";
import Restaurant from "../models/Restaurant.js";

const ai = new GoogleGenAI({});

export async function generateAISuggestions(props) {
  const {
    destination_city,
    destination_country,
    start_date,
    end_date,
    budget_total,
    budgetCurrency,
    travel_style,
    interests,
    group_size,
    accommodation_preference,
    include_volunteer_activities,
  } = props;

  // Query database for relevant data
  const accommodations = await Accommodation.find({
    city: destination_city,
    country: destination_country,
    isActive: true,
  }).select("name description type priceRange ecoRating amenities");

  const events = await ConservationEvent.find({
    city: destination_city,
    country: destination_country,
    isActive: true,
    isApproved: true,
    startDate: { $gte: new Date(start_date), $lte: new Date(end_date) },
  }).select("title description eventType difficultyLevel ecoPointsReward");

  const restaurants = await Restaurant.find({
    city: destination_city,
    country: destination_country,
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
Build a 3-day eco-friendly itinerary for ${destination_city}, ${destination_country}.
Dates: ${start_date} to ${end_date}.
Budget: ${budget_total} ${budgetCurrency} total for ${group_size} person(s).
Style: ${travel_style}.
Interests: ${interests.join(", ")}.
Accommodation preference: ${accommodation_preference}.
Volunteer activities: ${include_volunteer_activities ? "yes" : "no"}.

Use the following data from our database for accommodations, events, and restaurants. Prioritize using these stored options:

ACCOMMODATIONS:
${accommodationsText || "No accommodations found in database."}

EVENTS/ACTIVITIES:
${eventsText || "No events found in database."}

RESTAURANTS:
${restaurantsText || "No restaurants found in database."}

For activities, use the stored events where possible. If there are not enough events or you need more variety, suggest additional eco-friendly activities that can be done in ${destination_city}, ${destination_country}, focusing on sustainable practices like walking tours, local markets, nature spots, or community initiatives. Keep suggestions realistic and tied to the location.

Return ONLY a JSON array with 3 itinerary objects.
Each object must have:
- title (string)
- description (string)
- ecoScore (number, 1-5 scale)
- estimatedCarbonFootprint (number, kg CO2)
- totalCost (number, in ${budgetCurrency})
- days (array of 3 day objects)

Each day object must have:
- dayNumber (number)
- activities (array of activity objects)

Each activity object must have:
- title (string)
- description (string)
- itemType (string: "accommodation", "restaurant", "activity", "transport", "event")
- estimatedCost (number)
- startTime (string, optional, format HH:MM)
- endTime (string, optional, format HH:MM)
- address (string, optional)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  const text = response.text; // Gemini returns markdown → raw text
  const jsonString = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  return JSON.parse(jsonString); // parse back to JS object
}
