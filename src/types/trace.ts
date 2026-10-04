export interface FoodIdentification {
  dish_name: string;
  alternate_names: string[];
  cuisine_category: string;
  visual_attributes: string[];
  dietary_tags: string[];
  confidence: number;
  is_ambiguous: boolean;
  visual_description: string;
  recommended_search_queries: string[];
}

export interface MenuItemVerification {
  dish_name: string;
  price_status: 'verified' | 'unavailable';
  price?: string;
  listing_status: 'explicitly_listed' | 'inferred_cuisine_specialty' | 'unverified_menu';
  explanation: string;
}

export interface ScoreBreakdown {
  business_score: number;   // max 20
  address_score: number;    // max 20
  relevance_score: number;  // max 25
  menu_score: number;       // max 20
  proximity_score: number;  // max 15
}

export interface EvidenceAudit {
  business_found: boolean;
  address_verified: boolean;
  dish_cuisine_match: boolean;
  menu_verified: boolean;
  location_verified: boolean;
  score_breakdown: ScoreBreakdown;
  verification_notes: string[];
  unverified_warnings: string[];
}

export interface VerifiedCandidate {
  id: string;
  name: string;
  match_score: number; // 0 - 100
  match_tier: 'BEST MATCH' | 'GOOD MATCH' | 'POSSIBLE MATCH';
  verification_level: 'VERIFIED' | 'PARTIALLY VERIFIED' | 'UNVERIFIED';
  distance_km: number;
  address: string;
  lat: number;
  lon: number;
  osm_type?: string;
  osm_id?: number | string;
  amenity_type: string;
  cuisine_tags: string[];
  opening_hours?: string;
  phone?: string;
  website?: string;
  menu_item: MenuItemVerification;
  evidence: EvidenceAudit;
  explanation: string;
  navigation_url: string;
  community_rating?: number;
  review_count?: number;
}

export type LocationSource = 'browser_gps' | 'manual_search';

export type LocationState =
  | 'idle'
  | 'requesting_gps'
  | 'gps_success'
  | 'permission_denied'
  | 'gps_unavailable'
  | 'manual_search'
  | 'manual_success'
  | 'error';

export interface SearchLocation {
  lat: number;
  lon: number;
  displayName: string;
  source: LocationSource;
}

export interface AgentStep {
  id: string;
  agent: 'Vision Agent' | 'Dish Normalization Agent' | 'Discovery Agent' | 'Menu Evidence Agent' | 'Evidence Verification Agent' | 'Ranking Agent';
  title: string;
  status: 'pending' | 'running' | 'completed' | 'warning' | 'failed';
  timestamp: string;
  details: string;
  outputSummary?: string;
}

export interface TraceResponse {
  success: boolean;
  food: FoodIdentification;
  location: SearchLocation;
  radius_km: number;
  candidates: VerifiedCandidate[];
  agent_steps: AgentStep[];
  disclaimer: string;
  dataSource: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'email' | 'guest';
  dietaryPreferences: string[];
  favoriteRadiusKm: number;
  createdAt: string;
}

export interface UserReview {
  id: string;
  candidateId: string;
  candidateName: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  reviewText: string;
  exactDishFound: 'yes' | 'no' | 'seasonal';
  pricePaid?: string;
  visitDate: string;
  createdAt: string;
}

export interface SavedPlaceItem {
  id: string;
  candidate: VerifiedCandidate;
  dishName: string;
  savedAt: string;
  userNotes?: string;
}

export interface ImageAdjustment {
  brightness: number; // 50 to 150 (default 100)
  contrast: number;   // 50 to 150 (default 100)
  sharpness: number;  // 0 to 100 (default 0)
  saturation: number; // 50 to 150 (default 100)
}
