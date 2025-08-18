# TruePlace

TruePlace helps people decide where they'll feel at home by turning public/open data into clear, explainable location insights and ranked recommendations. It blends safety, affordability, diversity, health, and sustainability signals into a transparent score, with drill-downs and citations so users can verify the source of truth.

## 🌟 Core Features

### 📍 Personalized Recommendations
- Collects user preferences (budget, safety/affordability/diversity weights, etc.)
- Scores candidate places and returns ranked list with factor-by-factor "contribution" breakdowns
- Transparent scoring system with detailed explanations

### 📊 Analytics Dashboard
- **Overview tiles**: Safety, Population, Rent, Health and Sustainability scores
- **Detailed tabs**: Crime statistics, Demographics with diversity charts, Housing metrics, Health indicators, Sustainability measures
- **Data sources**: Every section shows sources and timestamps for verification

### 🔍 Explainability
- Each recommendation shows composite score plus individual contributions (safety, affordability, diversity, mobility, inclusion)
- API responses include `citations` array and "lastUpdated" timestamps
- Full transparency into data sources and calculation methods

## 📊 Data Sources & Integration

### 🏛️ U.S. Census Bureau (ACS 5-Year)
- Population, median age, income, poverty rates
- Housing metrics (median rent/value, vacancy, homeownership)
- Race (B02001) and Ethnicity (B03002) distributions
- **Diversity Index**: Simpson's Diversity Index from ACS race distribution
- **FIPS Resolution**: Census Geocoder by address → Place GEOID with ACS NAME lookup fallback

### 🚔 FBI Uniform Crime Reporting (UCR)
- State-level offense totals with graceful fallback for missing keys
- **Safety Score**: Weighted penalty model emphasizing violent crime over property crime
- Mock data integration for development environments

### 🏥 CDC PLACES (Local Data for Better Health)
- City/place-level health indicators (obesity, diabetes, smoking, mental distress, uninsured)
- **Health Score**: Simple scoring by penalizing high-prevalence indicators

### 🌍 Environmental Data
- **Air Quality**: OpenAQ API for PM2.5/PM10/O₃ measurements
- **Green Space**: OSM Overpass API for park features and density
- **Sustainability Score**: Blends air quality (60%) and greenspace (40%) with log-scaling

### 💾 Caching & Persistence
- TTL-based caching (~12h) with Prisma/SQLite backend
- Government data endpoint returns `citations` and `lastUpdated` timestamps
- Graceful fallbacks for API unavailability

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
# Clone or navigate to project directory
cd trueplace

# Install dependencies
npm install

# Set up database
npx prisma migrate dev --name init

# Copy environment file (optional)
cp .env.example .env
```

### Development
```bash
# Standard development (Turbopack)
npm run dev

# Production-first development (recommended for stability)
npm run dev-prod      # Build + start on port 3001
npm run dev-quick     # Build + start on default port

# Alternative development modes
npm run dev-safe      # Dev on port 3001
npm run dev-alt       # Dev without Turbopack
```

### Production
```bash
# Build for production
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:3000` (or the specified port).

## 📱 Usage

1. **Navigate to `/trueplace`** - Main application interface
2. **Set Preferences** - Enter budget and weight factors (safety, affordability, diversity, mobility, inclusion)
3. **Get Recommendations** - Receive ranked locations with compatibility scores
4. **View Details** - Click "View Details" on any recommendation for comprehensive analytics
5. **Explore Analytics** - Browse tabs for crime, demographics, housing, health, and sustainability data

## 🔧 Configuration

### Environment Variables (Optional)
```env
# API Keys
FBI_API_KEY=your_fbi_api_key_here
CENSUS_API_KEY=your_census_api_key_here
COHERE_API_KEY=your_cohere_api_key_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### Development Workflow Notes
- **Next.js 15.4.2 + Turbopack**: May have stability issues in development mode
- **Recommended**: Use `npm run dev-prod` for most reliable development experience
- **Production builds**: Provide environment parity and catch issues early
- **Build time**: ~3-5 seconds vs instant HMR tradeoff for stability

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with React 19
- **Styling**: Tailwind CSS for utility-first design
- **Charts**: Recharts and Chart.js for data visualization
- **Design**: Mobile-first responsive layout

### API Routes (`src/app/api/*`)
- `government-data/route.ts`: Orchestrates fetch → compute → cache; returns data + citations
- `match/route.ts`: Accepts preferences, enriches locations, scores, returns ranked results
- Additional routes for profiles, locations, chat intake (LLM)

### Services (`src/lib/services/`)
- **governmentData.ts**: Encapsulates all external API integrations
- **Handles**: FIPS resolution, fallbacks, metrics computation, composite scoring
- **Features**: Caching, error handling, graceful degradation

### Hooks & Components
- `useGovernmentData(city,state,type)`: Fetches analytics data per tab
- `AdvancedAnalytics.tsx`: Overview tiles and tabbed interface
- **Demographics**: Pie charts with non-overlapping labels, legends, tooltips
- **Sources**: Displayed as badges/links for data audit trails

## 🔍 Scoring System

### Input Processing
- User weights and constraints (budgetMax, factor weights)
- Location enrichment with live government data

### Factor Calculation
- **Safety**: Normalized from Safety Score/100 to [0,1]
- **Diversity**: Simpson's index scaled to [0,1]
- **Affordability**: Inverted normalized rent with budget adjustments
- **Mobility & Inclusion**: Boolean mappings to [0,1]

### Final Scoring
- Weighted contributions summed and normalized by total weights
- Results include both final `score` and individual `contributions`
- Transparency through factor-by-factor breakdowns

## 📦 Tech Stack

- **Framework**: Next.js 15.4.6
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts, Chart.js
- **Authentication**: NextAuth.js (optional)
- **APIs**: Census, FBI UCR, CDC PLACES, OpenAQ, OpenStreetMap

## 🚀 Deployment

The application is designed for easy deployment to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Any Node.js hosting platform**

Build command: `npm run build`
Start command: `npm start`

## 📋 API Reference

### GET /api/government-data
Fetch comprehensive government data for a location.

**Parameters:**
- `city` (required): City name
- `state` (required): State abbreviation
- `type` (optional): Data type (`comprehensive`, `census`, `crime`, `health`, `sustainability`)

**Response:**
```json
{
  "census": { /* census data */ },
  "crime": { /* crime data */ },
  "health": { /* health data */ },
  "sustainability": { /* sustainability data */ },
  "citations": [
    {
      "source": "U.S. Census Bureau",
      "url": "https://www.census.gov/...",
      "description": "American Community Survey 5-Year Estimates",
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  ],
  "lastUpdated": "2025-01-01T00:00:00.000Z"
}
```

### POST /api/match
Get ranked location recommendations based on user preferences.

**Request Body:**
```json
{
  "budgetMax": 2000,
  "weights": {
    "safety": 3,
    "affordability": 4,
    "diversity": 3,
    "mobility": 2,
    "inclusion": 3
  }
}
```

**Response:**
```json
{
  "matches": [
    {
      "name": "Seattle",
      "state": "WA",
      "compatibilityScore": 85,
      "contributions": {
        "safety": 80,
        "affordability": 70,
        "diversity": 95,
        "mobility": 100,
        "inclusion": 100
      },
      "data": { /* location details */ }
    }
  ],
  "preferences": { /* user preferences */ },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## 🎯 Why TruePlace Matters

- **Trustworthy**: Audit-able recommendations with factor-by-factor clarity
- **Comprehensive**: Beyond cost/safety to include inclusion, health, environmental quality
- **Transparent**: Links to underlying sources with timestamps
- **User-Centric**: Reflects how people actually decide where they belong
- **Data-Driven**: Combines multiple authoritative government and open data sources

## 📄 License

This project is built for demonstration and educational purposes. Please ensure compliance with all data source terms of service when using in production.

---

*Built with ❤️ using Next.js, TypeScript, and public data APIs*