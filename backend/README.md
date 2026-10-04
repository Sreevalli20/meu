# PANI-PATH Backend

**Python FastAPI Backend for Food-to-Place Tracing**

This backend provides the API layer for PANI-PATH, handling multimodal AI food analysis, real-world business discovery via OpenStreetMap, and evidence-based ranking.

## Architecture

- **Runtime**: Python 3.14.6
- **Framework**: FastAPI
- **AI Provider**: Groq (multimodal vision)
- **Geospatial Data**: OpenStreetMap Overpass API + Nominatim
- **Deployment**: Render Free (512 MB RAM target)

## Environment Variables

```bash
# Required: Groq API key for multimodal vision
GROQ_API_KEY="your_groq_api_key"
```

## Running Locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns service status, AI provider configuration, and version info.

### Food Analysis
```
POST /api/analyze-food
Body: { imageBase64, mimeType, filenameHint }
```
Analyzes food image using multimodal AI.

### Business Search
```
POST /api/search-places
Body: { food, lat, lon, radiusKm, locationName }
```
Discovers real businesses via OpenStreetMap.

### Full Trace Pipeline
```
POST /api/trace
Body: { imageBase64, lat, lon, radiusKm, locationName }
```
Executes complete agent workflow from image to ranked businesses.

### Geocoding
```
POST /api/geocode
Body: { query }
```
Converts location string to coordinates via Nominatim.

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

## Zero Hallucination Policy

This backend enforces strict data integrity:
- Only returns businesses verified in OpenStreetMap
- Never fabricates restaurants, addresses, or prices
- Explicitly marks unavailable data as "unavailable"
- Returns clear error messages when APIs are unavailable

