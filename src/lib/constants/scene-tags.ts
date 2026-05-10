export const SCENE_TAGS = [
  // Exterior
  { value: "exterior_facade", label: "Exterior — Main Facade", group: "Exterior" },
  { value: "exterior_entrance", label: "Exterior — Entrance / Porch", group: "Exterior" },
  { value: "exterior_garden", label: "Exterior — Garden / Landscape", group: "Exterior" },
  { value: "exterior_aerial", label: "Exterior — Aerial / Drone", group: "Exterior" },
  { value: "exterior_pool", label: "Exterior — Pool Area", group: "Exterior" },
  // Interior — Living
  { value: "living_room", label: "Living Room", group: "Interior" },
  { value: "dining_room", label: "Dining Room", group: "Interior" },
  { value: "kitchen", label: "Kitchen", group: "Interior" },
  { value: "dry_kitchen", label: "Dry Kitchen / Pantry", group: "Interior" },
  // Interior — Bedrooms
  { value: "master_bedroom", label: "Master Bedroom", group: "Interior" },
  { value: "master_bathroom", label: "Master Bathroom / Ensuite", group: "Interior" },
  { value: "bedroom_2", label: "Bedroom 2", group: "Interior" },
  { value: "bedroom_3", label: "Bedroom 3", group: "Interior" },
  { value: "bedroom_4", label: "Bedroom 4+", group: "Interior" },
  { value: "bathroom", label: "Bathroom / Toilet", group: "Interior" },
  // Interior — Other
  { value: "study_room", label: "Study Room / Home Office", group: "Interior" },
  { value: "utility_room", label: "Utility / Laundry Room", group: "Interior" },
  { value: "balcony", label: "Balcony / Terrace", group: "Interior" },
  { value: "hallway", label: "Hallway / Foyer", group: "Interior" },
  // Amenities
  { value: "amenity_gym", label: "Amenity — Gym / Fitness", group: "Amenity" },
  { value: "amenity_pool", label: "Amenity — Swimming Pool", group: "Amenity" },
  { value: "amenity_playground", label: "Amenity — Playground", group: "Amenity" },
  { value: "amenity_clubhouse", label: "Amenity — Clubhouse / BBQ", group: "Amenity" },
  { value: "amenity_lobby", label: "Amenity — Lobby / Reception", group: "Amenity" },
  { value: "amenity_rooftop", label: "Amenity — Rooftop / Sky Deck", group: "Amenity" },
  // Floor Plan
  { value: "floor_plan", label: "Floor Plan", group: "Floor Plan" },
  // Branding
  { value: "branding_card", label: "Branding Card", group: "Branding" },
] as const;

export type SceneTagValue = (typeof SCENE_TAGS)[number]["value"];

export const SCENE_TAG_GROUPS = ["Exterior", "Interior", "Amenity", "Floor Plan", "Branding"] as const;

export const FLOOR_PLAN_LABELS = [
  { value: "ground", label: "Ground Floor" },
  { value: "first", label: "First Floor" },
  { value: "second", label: "Second Floor" },
  { value: "third", label: "Third Floor" },
  { value: "basement", label: "Basement" },
  { value: "rooftop", label: "Rooftop" },
] as const;
