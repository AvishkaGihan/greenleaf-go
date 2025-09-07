import { EcoPlace, Event, Itinerary, Badge } from "../types";

export const ecoPlaces: EcoPlace[] = [
  {
    id: "1",
    name: "Green Haven Hotel",
    type: "hotel",
    rating: 5,
    address: "123 Eco Street, Portland",
    price: "$120-180/night",
    description:
      "A LEED-certified hotel committed to environmental sustainability. Features solar panels, rainwater harvesting, and organic gardens.",
    sustainability: {
      energy: 90,
      waste: 85,
      water: 95,
    },
    reviews: [
      {
        author: "Sarah M.",
        rating: 5,
        comment:
          "Amazing eco-friendly hotel! Solar-powered rooms and fantastic recycling program.",
      },
      {
        author: "Mike T.",
        rating: 5,
        comment:
          "Great location and really impressed by their sustainability efforts. Will stay again!",
      },
    ],
  },
  {
    id: "2",
    name: "Organic Bites Cafe",
    type: "restaurant",
    rating: 4,
    address: "456 Green Ave, Portland",
    price: "$$",
    description:
      "A farm-to-table restaurant focusing on organic, locally sourced ingredients with zero-waste practices.",
    sustainability: {
      energy: 80,
      waste: 95,
      water: 75,
    },
    reviews: [
      {
        author: "Jessica L.",
        rating: 4,
        comment:
          "Delicious food and great sustainability practices. Love their composting program!",
      },
    ],
  },
  {
    id: "3",
    name: "EcoLodge Retreat",
    type: "hotel",
    rating: 3,
    address: "789 Nature Rd, Portland",
    price: "$80-120/night",
    description:
      "A rustic eco-lodge focused on minimal environmental impact and nature immersion.",
    sustainability: {
      energy: 70,
      waste: 80,
      water: 85,
    },
    reviews: [
      {
        author: "David K.",
        rating: 4,
        comment:
          "Perfect for nature lovers. Basic amenities but excellent eco-credentials.",
      },
    ],
  },
];

export const events: Event[] = [
  {
    id: "forest-cleanup",
    title: "Forest Cleanup Day",
    type: "Cleanup",
    date: "Saturday, June 12 · 9:00 AM - 1:00 PM",
    location: "Forest Park, Portland",
    description:
      "Join us for a morning of cleaning up trails and removing invasive species. All equipment provided.",
    organizer: "Portland Parks & Recreation",
    difficulty: "Easy",
    volunteersNeeded: 20,
    volunteersRegistered: 5,
  },
  {
    id: "beach-restoration",
    title: "Beach Restoration",
    type: "Restoration",
    date: "Sunday, June 20 · 10:00 AM - 2:00 PM",
    location: "Cannon Beach, OR",
    description:
      "Help restore native dune vegetation and protect coastal habitats. Lunch provided.",
    organizer: "Oregon Coastal Conservancy",
    difficulty: "Moderate",
    volunteersNeeded: 30,
    volunteersRegistered: 8,
  },
  {
    id: "urban-garden",
    title: "Urban Garden Planting",
    type: "Planting",
    date: "Saturday, June 26 · 11:00 AM - 3:00 PM",
    location: "SE Portland Community Center",
    description:
      "Help plant a new community garden to provide fresh produce for local residents.",
    organizer: "Urban Growth Initiative",
    difficulty: "Easy",
    volunteersNeeded: 15,
    volunteersRegistered: 7,
  },
];

export const sampleItinerary: Itinerary = {
  id: "1",
  destination: "Portland, OR",
  dates: "June 15-18, 2025",
  budget: "$150",
  interests: ["hiking", "local culture", "sustainable dining"],
  days: [
    {
      title: "Day 1 - Arrival & City Exploration",
      activities: [
        {
          time: "Check-in",
          description: "Green Haven Hotel (5🌿)",
          place: "Green Haven Hotel",
          rating: 5,
        },
        {
          time: "Lunch",
          description: "Organic Bites Cafe (4🌿)",
          place: "Organic Bites Cafe",
          rating: 4,
        },
        { time: "Afternoon", description: "Downtown eco-walking tour" },
      ],
    },
    {
      title: "Day 2 - Nature & Conservation",
      activities: [
        { time: "Morning", description: "Forest Park hiking" },
        { time: "Afternoon", description: "Forest cleanup volunteering" },
        { time: "Evening", description: "Sustainable brewery visit" },
      ],
    },
    {
      title: "Day 3 - Local Culture",
      activities: [
        { time: "Morning", description: "Bike tour (eco-friendly transport)" },
        { time: "Afternoon", description: "Farmers market & local artisans" },
        {
          time: "Evening",
          description: "EcoLodge Retreat (3🌿)",
          place: "EcoLodge Retreat",
          rating: 3,
        },
      ],
    },
  ],
  carbonFootprint: "2.3 kg CO₂ (65% lower than average)",
};

export const badges: Badge[] = [
  {
    id: "1",
    name: "First Trip",
    icon: "leaf",
    earned: true,
    color: "#4caf50",
  },
  {
    id: "2",
    name: "Volunteer",
    icon: "hands-helping",
    earned: true,
    color: "#2196f3",
  },
  {
    id: "3",
    name: "Planner",
    icon: "route",
    earned: true,
    color: "#ff9800",
  },
  {
    id: "4",
    name: "Eco-Warrior",
    icon: "recycle",
    earned: true,
    color: "#9c27b0",
  },
  {
    id: "5",
    name: "Explorer",
    icon: "compass",
    earned: false,
    color: "#f5f5f5",
  },
  {
    id: "6",
    name: "Green Guru",
    icon: "graduation-cap",
    earned: false,
    color: "#f5f5f5",
  },
];
