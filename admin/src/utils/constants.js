export const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
  { id: "accommodations", label: "Accommodations", icon: "fas fa-hotel" },
  { id: "restaurants", label: "Restaurants", icon: "fas fa-utensils" },
  { id: "events", label: "Events", icon: "fas fa-calendar-alt" },
  { id: "users", label: "Users", icon: "fas fa-users" },
  { id: "rsvps", label: "RSVPs", icon: "fas fa-ticket-alt" },
  { id: "itineraries", label: "Itineraries", icon: "fas fa-route" },
  { id: "badges", label: "Badges", icon: "fas fa-award" },
  { id: "reviews", label: "Reviews", icon: "fas fa-star" },
  { id: "settings", label: "Settings", icon: "fas fa-cog" },
  { id: "logout", label: "Logout", icon: "fas fa-sign-out-alt" },
];

export const ACCOMMODATION_TYPES = [
  { value: "hotel", label: "Hotel" },
  { value: "lodge", label: "Lodge" },
  { value: "cabin", label: "Cabin" },
  { value: "resort", label: "Resort" },
  { value: "hostel", label: "Hostel" },
];

export const EVENT_TYPES = [
  { value: "cleanup", label: "Beach/Forest Cleanup" },
  { value: "restoration", label: "Habitat Restoration" },
  { value: "education", label: "Environmental Education" },
  { value: "research", label: "Conservation Research" },
];

export const BADGE_CATEGORIES = [
  { value: "travel", label: "Travel" },
  { value: "conservation", label: "Conservation" },
  { value: "eco-rating", label: "Eco Rating" },
  { value: "community", label: "Community" },
];

export const CUISINE_TYPES = [
  { value: "organic", label: "Organic" },
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "local", label: "Local" },
];

export const PRICE_RANGES = [
  { value: "$", label: "$ (Budget)" },
  { value: "$$", label: "$$ (Moderate)" },
  { value: "$$$", label: "$$$ (Upscale)" },
];
