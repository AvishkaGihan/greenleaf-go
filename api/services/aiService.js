export const generateAISuggestions = async (params) => {
  // Dummy implementation for AI suggestions
  const {
    destination_city = "Sample City",
    destination_country = "Sample Country",
    budget_total = 1000,
    travel_style = "eco-friendly",
    interests = ["nature", "culture"],
    group_size = 2,
    accommodation_preference = "eco-lodge",
    include_volunteer_activities = true,
  } = params;

  // Simulate some processing time
  await new Promise((resolve) => setTimeout(resolve, 100));

  return [
    {
      title: "Eco-Friendly Beach Getaway",
      destination_city,
      destination_country,
      eco_score: 4.5,
      estimated_carbon_footprint: 20.0,
      total_cost: budget_total,
      highlights: [
        "Sustainable beachfront accommodations",
        "Local eco-tours and conservation activities",
        "Plant-based dining options",
        "Carbon offset initiatives",
      ],
      travel_style,
      interests,
      group_size,
      accommodation_preference,
      include_volunteer_activities,
    },
    {
      title: "Mountain Conservation Adventure",
      destination_city,
      destination_country,
      eco_score: 4.8,
      estimated_carbon_footprint: 15.0,
      total_cost: budget_total * 0.9,
      highlights: [
        "Hiking in protected areas",
        "Volunteer trail maintenance",
        "Eco-lodges with renewable energy",
        "Local artisan experiences",
      ],
      travel_style,
      interests,
      group_size,
      accommodation_preference,
      include_volunteer_activities,
    },
    {
      title: "Cultural Heritage Exploration",
      destination_city,
      destination_country,
      eco_score: 4.2,
      estimated_carbon_footprint: 25.0,
      total_cost: budget_total * 1.1,
      highlights: [
        "Historic site visits with conservation focus",
        "Traditional sustainable crafts",
        "Community-led cultural experiences",
        "Green transportation options",
      ],
      travel_style,
      interests,
      group_size,
      accommodation_preference,
      include_volunteer_activities,
    },
  ];
};
