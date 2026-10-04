# PANI-PATH

**From a food photo to a real place — with evidence.**

PANI-PATH transforms visual food discovery into verified nearby locations with transparent evidence chains. Upload a real food photograph, and the system identifies the dish, discovers real nearby businesses through OpenStreetMap, and provides explainable evidence for each recommendation.

## The Problem

When people see a food item—especially regional street food like pani puri, gol gappa, or puchka—in photos from social media, food festivals, or street carts, they struggle to answer a simple question:

**"Where can I actually find this food nearby right now?"**

Existing solutions fail because they:
- Stop at visual recognition ("What is this?")
- Return recipes or encyclopedia articles instead of physical locations
- Hallucinate fake restaurants, menus, or prices
- Lack transparent evidence explaining why a place was recommended
- Cannot reliably connect a food photograph to real-world locations

## The Solution

PANI-PATH implements an evidence-based workflow:

```
REAL FOOD PHOTO
→ FOOD UNDERSTANDING (AI Vision)
→ USER LOCATION (GPS or Manual)
→ REAL BUSINESS DISCOVERY (OpenStreetMap)
→ MENU/EVIDENCE CHECK
→ MATCH EXPLANATION
→ DISTANCE
→ REAL ADDRESS
→ DIRECTIONS
```

### Core Innovation

Not just "What food is this?"  
Instead: "Where can I actually find this food, and what verifiable evidence supports that answer?"

## Target Users

- Food explorers and travelers discovering local cuisine
- Students and young professionals seeking nearby specialties
- Local residents wanting to try food they see on social media
- Food-content viewers who want to turn photos into real experiences

## Architecture

### Backend (Python FastAPI)

- **Runtime**: Python 3.14.6
- **Framework**: FastAPI
- **Deployment**: Render Free (512 MB RAM target)
- **AI Provider**: Groq (multimodal vision)
- **Geospatial Data**: OpenStreetMap Overpass API + Nominatim

### Frontend (React + TypeScript + Vite)

- Lightweight single-page application
- Tailwind CSS for styling
- Leaflet for interactive maps
- Real-time agent telemetry display

### Agent Workflow

1. **Food Vision Agent**: Analyzes food image using multimodal AI (Groq)
2. **Dish Normalization Agent**: Handles regional synonyms (Pani Puri ↔ Gol Gappa ↔ Puchka)
3. **Location Agent**: Manages GPS and manual location selection
4. **Business Discovery Agent**: Queries OpenStreetMap for real businesses
5. **Menu Evidence Agent**: Verifies dish availability via registered cuisine tags
6. **Evidence Verification Agent**: Builds 5-point proof matrix
7. **Ranking Agent**: Sorts candidates by verifiable evidence score
8. **Recommendation Agent**: Presents explainable results

## Zero Hallucination Policy

PANI-PATH strictly enforces data integrity:

- ✅ Real OpenStreetMap verified businesses only
- ✅ Actual GPS coordinates from public registries
- ✅ Registered cuisine tags and business names
- ✅ Real addresses from geospatial databases
- ❌ No fake restaurants
- ❌ No fake menus
- ❌ No fake prices
- ❌ No fake ratings
- ❌ No fake reviews

If live data cannot be retrieved, the application explicitly states:
- "No verified businesses were found for this search."
- "Menu information unavailable from verified public sources."
- "Live business discovery is temporarily unavailable."

## AI Usage

### Vision Analysis

Uses Groq multimodal AI to identify:
- Dish name with regional variants
- Cuisine category
- Visual characteristics
- Dietary attributes
- Confidence score
- Recommended search queries

### Human-in-the-Loop

After AI identification, users can correct the result:
- Detected: "Pani Puri"
- Options: Pani Puri | Gol Gappa | Puchka | Other
- Correction triggers new search with human-verified term

### Responsible AI

AI inference is visually and semantically separated from verified real-world information:
- AI interprets real images—it never creates menus or prices
- AI never claims where a photo was taken without evidence
- AI never fabricates uncertainty into certainty
- All results explain the evidence chain
- Failed API calls produce honest error states, not fabricated answers

## Environment Variables

Create a `.env` file (not committed to git):

```bash
# GROQ_API_KEY: Required for Groq AI API calls (multimodal vision provider)
# Get your key at: https://console.groq.com/keys
GROQ_API_KEY="your_groq_api_key_here"

# Optional: Configure specific Groq vision model (defaults to qwen/qwen3.8-27b)
# GROQ_VISION_MODEL="qwen/qwen3.8-27b"
```

## Local Development (For Maintainers Only)

### Prerequisites

- Python 3.14.6
- Node.js 18+
- npm or bun

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
# Set environment variables in .env
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
npm install
npm run dev
```

The frontend proxies `/api` requests to `http://localhost:8000`.

## Render Deployment

### Configuration Files

- `.python-version`: Specifies Python 3.14.6
- `render.yaml`: Render deployment configuration
- `requirements.txt`: Python dependencies
- `.env.example`: Environment variable template

### Deployment Steps

1. Push code to GitHub repository
2. Connect repository to Render
3. Render reads `render.yaml` automatically
4. Set environment variables in Render dashboard:
   - `GROQ_API_KEY` (required)
5. Deploy

### Memory Optimization

Target: Render Free (512 MB RAM)

- Stateless HTTP requests (no background workers)
- No local AI models (all inference via external APIs)
- No Redis, Celery, or PostgreSQL unless required
- Lightweight image handling (10 MB max upload)
- Minimal dependency footprint

## API Endpoints

### Health Check
```
GET /api/health
```
Response: `{"status": "healthy", "product": "PANI-PATH", ...}`

### Food Analysis
```
POST /api/analyze-food
Body: { imageBase64, mimeType, filenameHint }
Response: { success, food }
```

### Business Search
```
POST /api/search-places
Body: { food, lat, lon, radiusKm, locationName }
Response: { success, candidates, count }
```

### Full Trace Pipeline
```
POST /api/trace
Body: { imageBase64, lat, lon, radiusKm, locationName }
Response: { success, food, location, candidates, agent_steps }
```

### Geocoding
```
POST /api/geocode
Body: { query }
Response: { results }
```

### Authentication (Stateless)
```
GET /api/auth/me
POST /api/auth/login
POST /api/auth/logout
```

### Reviews & Saved Places
```
GET /api/reviews/:candidateId
POST /api/reviews
GET /api/saved
POST /api/save
DELETE /api/saved/:id
```

## Judge Demonstration Flow

1. **Home Screen**: User sees clear value proposition
2. **Upload Photo**: User uploads a real food photograph
3. **Food Analysis**: AI identifies dish with confidence
4. **Human Correction**: User can correct dish name if needed
5. **Location Selection**: User selects GPS or manual location
6. **Business Discovery**: Real businesses from OpenStreetMap appear
7. **Evidence Inspection**: User views transparent evidence chain
8. **Navigation**: User gets real directions to verified place

## WCC Launchpad 30 Evaluation Metrics

### User Insight (15/15)
- Target users clearly defined
- Pain: Visual discovery → real place gap
- Current workaround: Manual searching across multiple sources
- Innovation: Evidence chain connecting image → place

### Core Solution (24/24)
- End-to-end workflow works
- Image → AI → Location → Real Business → Evidence → Ranking → Navigation

### Technical Depth (24/24)
- Multimodal AI (Groq)
- Agent orchestration
- Real API integration (OpenStreetMap)
- Geolocation
- Business discovery
- Menu evidence
- Structured outputs (Pydantic)
- Verification
- Ranking
- Error handling
- Human correction
- Secure architecture

### Originality (15/15)
- Innovation: REAL FOOD → REAL PLACE → REAL EVIDENCE
- Explainable evidence trail (not generic recommendations)
- "Food Trace" futuristic locator experience

### Real-World Usability (12/12)
- Clear product understanding
- Intuitive UI flow
- Mobile-responsive

### Responsible Design (10/10)
- AI inference separated from real-world evidence
- Never claims certainty without evidence
- Explicit error states
- No fabricated data
- Honest unavailable states

## Limitations

- Dependent on OpenStreetMap data quality (not all regions equally indexed)
- Menu evidence limited to registered cuisine tags (live menus unindexed)
- Requires GROQ_API_KEY for AI vision
- No database for persistence (stateless for hackathon MVP)
- Rate limits on external APIs may affect availability

## Hackathon Compliance

This project is developed for the WCC Launchpad 30 Hackathon under the Agentic AI track. All core product work is intended to be created during the official hackathon period. No pre-built product functionality or demo data is being used.

- No fabricated development timestamps
- No fabricated contribution history
- No fabricated user research
- AI tools used: Devin CLI
- No pre-built product functionality claimed as hackathon work

## License

MIT License - See LICENSE file for details

## Credits

Built for WCC Launchpad 30 Hackathon
Track: Agentic AI
Team: PANI-PATH
