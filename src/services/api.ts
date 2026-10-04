import {
  TraceResponse,
  FoodIdentification,
  UserProfile,
  UserReview,
  SavedPlaceItem,
  VerifiedCandidate,
} from '../types/trace';

export async function fetchHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  } catch (err) {
    console.warn('Health check failed, assuming backend is starting:', err);
    return { status: 'checking' };
  }
}

export async function geocodeLocation(query: string) {
  const res = await fetch('/api/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Geocoding request failed');
  const data = await res.json();
  return data.results || [];
}

export async function analyzeFoodOnly(
  imageBase64: string,
  mimeType = 'image/jpeg',
  filenameHint?: string
): Promise<FoodIdentification> {
  const res = await fetch('/api/analyze-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, filenameHint }),
  });
  if (!res.ok) throw new Error('Food analysis failed');
  const data = await res.json();
  return data.food;
}

export async function traceFoodPipeline(params: {
  imageBase64?: string;
  mimeType?: string;
  filenameHint?: string;
  userCorrectedDish?: string;
  lat?: number;
  lon?: number;
  radiusKm?: number;
  locationName?: string;
  locationSource?: string;
}): Promise<TraceResponse> {
  const res = await fetch('/api/trace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Trace pipeline failed with status ${res.status}`);
  }
  return res.json();
}

// ---------------- USER AUTHENTICATION API ----------------

export async function fetchCurrentUser(): Promise<UserProfile> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Failed to fetch user session');
  const data = await res.json();
  return data.user;
}

export async function loginUser(payload: {
  email: string;
  name?: string;
  provider?: 'google' | 'email';
  dietaryPreferences?: string[];
  favoriteRadiusKm?: number;
}): Promise<UserProfile> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  return data.user;
}

export async function logoutUser(): Promise<UserProfile> {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Logout failed');
  const data = await res.json();
  return data.user;
}

// ---------------- REVIEWS & RATINGS API ----------------

export async function fetchReviews(candidateId: string): Promise<UserReview[]> {
  const res = await fetch(`/api/reviews/${encodeURIComponent(candidateId)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.reviews || [];
}

export async function submitReview(payload: {
  candidateId?: string;
  candidateName: string;
  rating: number;
  reviewText: string;
  exactDishFound?: 'yes' | 'no' | 'seasonal';
  pricePaid?: string;
  visitDate?: string;
}): Promise<UserReview> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit review');
  }
  const data = await res.json();
  return data.review;
}

// ---------------- SAVED PLACES API ----------------

export async function fetchSavedPlaces(): Promise<SavedPlaceItem[]> {
  const res = await fetch('/api/saved');
  if (!res.ok) return [];
  const data = await res.json();
  return data.savedPlaces || [];
}

export async function savePlace(payload: {
  candidate: VerifiedCandidate;
  dishName?: string;
  userNotes?: string;
}): Promise<SavedPlaceItem> {
  const res = await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save place');
  const data = await res.json();
  return data.savedPlace;
}

export async function removeSavedPlace(saveId: string): Promise<boolean> {
  const res = await fetch(`/api/saved/${encodeURIComponent(saveId)}`, {
    method: 'DELETE',
  });
  return res.ok;
}
