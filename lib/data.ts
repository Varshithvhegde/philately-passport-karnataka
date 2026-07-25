import rawData from "@/data/places_with_locations.json";

export type Category =
  | "Monument"
  | "Flora and Fauna"
  | "Personality"
  | "Natural Heritage"
  | "Heritage Celebration"
  | "Heritage & Celebration"
  | "Science & Technology"
  | "Industry"
  | "Weapons"
  | "Weapon and Attire"
  | "Natural Stream";

export interface Location {
  sno: number;
  district: string;
  place: string;
  category: Category;
  post_office: string;
  pincode: string;
  office_type: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  state: string | null;
  status: string;
  description?: string;
}

export const locations: Location[] = rawData as Location[];

export const CATEGORY_COLORS: Record<string, string> = {
  "Monument":              "#C4A35A",
  "Flora and Fauna":       "#4A7C59",
  "Personality":           "#6D4C9C",
  "Natural Heritage":      "#2A6B8A",
  "Heritage Celebration":  "#C05C1A",
  "Heritage & Celebration":"#C05C1A",
  "Science & Technology":  "#1A5276",
  "Industry":              "#7D6608",
  "Weapons":               "#922B21",
  "Weapon and Attire":     "#922B21",
  "Natural Stream":        "#1F618D",
};

export const CATEGORY_BG: Record<string, string> = {
  "Monument":              "bg-amber-100 text-amber-800",
  "Flora and Fauna":       "bg-emerald-100 text-emerald-800",
  "Personality":           "bg-purple-100 text-purple-800",
  "Natural Heritage":      "bg-sky-100 text-sky-800",
  "Heritage Celebration":  "bg-orange-100 text-orange-800",
  "Heritage & Celebration":"bg-orange-100 text-orange-800",
  "Science & Technology":  "bg-blue-100 text-blue-800",
  "Industry":              "bg-yellow-100 text-yellow-800",
  "Weapons":               "bg-red-100 text-red-800",
  "Weapon and Attire":     "bg-red-100 text-red-800",
  "Natural Stream":        "bg-cyan-100 text-cyan-800",
};

export const CATEGORY_ICONS: Record<string, string> = {
  "Monument":              "🏛️",
  "Flora and Fauna":       "🌿",
  "Personality":           "👤",
  "Natural Heritage":      "🌄",
  "Heritage Celebration":  "🎉",
  "Heritage & Celebration":"🎉",
  "Science & Technology":  "🔬",
  "Industry":              "⚙️",
  "Weapons":               "⚔️",
  "Weapon and Attire":     "⚔️",
  "Natural Stream":        "💧",
};

export const ALL_CATEGORIES = [
  "Monument",
  "Flora and Fauna",
  "Personality",
  "Natural Heritage",
  "Heritage Celebration",
  "Heritage & Celebration",
  "Science & Technology",
  "Industry",
  "Weapons",
  "Weapon and Attire",
  "Natural Stream",
];

export const ALL_DISTRICTS = Array.from(
  new Set(locations.map((l) => l.district))
).sort();

export function getLocation(sno: number): Location | undefined {
  return locations.find((l) => l.sno === sno);
}
