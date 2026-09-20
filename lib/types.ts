export type Classification =
  | "industrial_fire"
  | "gas_flare"
  | "wildfire"
  | "agricultural_burning"
  | "unclassified";

export type Priority = "high" | "low";

export interface Hotspot {
  id: number;
  lat: number;
  lon: number;
  classification: Classification;
  confidence: number;
  priority: Priority;
  nearest_facility: string | null;
  distance_m: number | null;
  is_demo: boolean;
  created_at: string;
}

export interface FilterState {
  classification: Classification | "all";
  priority: Priority | "all";
  showDemo: boolean;
}
