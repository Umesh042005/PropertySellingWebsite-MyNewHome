// Must stay in sync with PropertyService.CATEGORIES on the backend
export const CATEGORIES = [
  { label: "Apartments", slug: "apartments", icon: "🏢" },
  { label: "Houses", slug: "houses", icon: "🏡" },
  { label: "Land", slug: "land", icon: "🌳" },
  { label: "Commercial", slug: "commercial", icon: "🏬" },
  { label: "PG & Hostels", slug: "pg-hostels", icon: "🛏️" },
  { label: "Office", slug: "office", icon: "💼" },
  { label: "Shops", slug: "shops", icon: "🛍️" },
];

export const categoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);

// Suggested localities per city; users can still type any locality
export const CITIES = {
  Bangalore: ["Electronic City", "Whitefield", "MG Road", "Koramangala", "Indiranagar"],
  Bhopal: ["Hoshangabad Road", "Indrapuri", "Arera Colony", "Kolar Road"],
  Delhi: ["Laxmi Nagar", "Dwarka", "Rohini", "Saket"],
  Hyderabad: ["Gachibowli", "HITEC City", "Banjara Hills", "Kondapur"],
  Indore: ["Vijay Nagar", "MG Road", "Palasia", "Bhawarkua"],
  Mumbai: ["Bandra", "Andheri", "Juhu", "Powai"],
  Pune: ["Baner", "Kothrud", "Viman Nagar", "Hinjewadi"],
};
