// TruePlace Score v0 - Deterministic Algorithm
// Goal: Explainable, quick to compute, no ML needed.

export interface UserPreferences {
  budgetMax: number;
  weights: {
    safety: number;
    affordability: number;
    diversity: number;
    mobility: number;
    inclusion: number;
  };
}

export interface LocationData {
  name: string;
  state: string;
  census?: {
    medianRent?: number;
    diversityIndex?: number;
  };
  crime?: {
    safetyScore?: number;
    violentCrimesPer100k?: number;
    hateCrimesPer100k?: number;
  };
  health?: {
    healthScore?: number;
  };
  mobility?: boolean;
  inclusion?: boolean;
}

export interface ScoredLocation extends LocationData {
  score: number;
  contributions: {
    safety: number;
    affordability: number;
    diversity: number;
    mobility: number;
    inclusion: number;
  };
}

export interface TruePlaceScore {
  composite: number;  // 0..100
  dims: {
    safety: number;
    community: number;
    costQuality: number;
    climate?: number;
    politics?: number;
  };
  rationale: string[];
  citations: Array<{
    metric: string;
    source: string;
    url: string;
  }>;
}

/**
 * TruePlace Score v0 Computation
 * 
 * Weights (default; tweakable per profile):
 * - Safety 50% → hateCrimes (70% of Safety), violentCrimes (30%), confidence penalty
 * - Community 30% → diversityIndex (60%), representation proxy (40%)
 * - Cost & Quality 20% → medianRent (inverse normalized), healthIndex (CDC), unemployment (inverse)
 */
export class TruePlaceScorer {
  private static readonly NORMALIZERS = {
    // Normalization constants for metrics (based on US averages/ranges)
    medianRent: { min: 500, max: 5000 },
    violentCrimesPer100k: { min: 0, max: 2000 },
    hateCrimesPer100k: { min: 0, max: 50 },
    diversityIndex: { min: 0, max: 1 },
    healthScore: { min: 0, max: 100 },
  };

  computeScore(location: LocationData, preferences: UserPreferences): TruePlaceScore {
    const dims = this.calculateDimensions(location);
    const weightedDims = this.applyUserWeights(dims, preferences);
    const composite = this.calculateComposite(weightedDims);
    const rationale = this.generateRationale(location, dims, preferences);
    const citations = this.generateCitations(location);

    return {
      composite: Math.round(composite),
      dims: {
        safety: Math.round(dims.safety * 100),
        community: Math.round(dims.community * 100),
        costQuality: Math.round(dims.costQuality * 100),
      },
      rationale,
      citations,
    };
  }

  private calculateDimensions(location: LocationData) {
    return {
      safety: this.calculateSafetyScore(location),
      community: this.calculateCommunityScore(location),
      costQuality: this.calculateCostQualityScore(location),
    };
  }

  private calculateSafetyScore(location: LocationData): number {
    const { hateCrimesPer100k = 0, violentCrimesPer100k = 0 } = location.crime || {};
    
    // Normalize crimes (lower is better, so invert)
    const normalizedHateCrimes = 1 - this.normalize(hateCrimesPer100k, this.NORMALIZERS.hateCrimesPer100k);
    const normalizedViolentCrimes = 1 - this.normalize(violentCrimesPer100k, this.NORMALIZERS.violentCrimesPer100k);
    
    // Weighted combination: hate crimes 70%, violent crimes 30%
    return (normalizedHateCrimes * 0.7) + (normalizedViolentCrimes * 0.3);
  }

  private calculateCommunityScore(location: LocationData): number {
    const diversityIndex = location.census?.diversityIndex || 0;
    
    // For now, community score is primarily diversity
    // TODO: Add representation proxy (amenities count, ACS demographic alignment)
    return this.normalize(diversityIndex, this.NORMALIZERS.diversityIndex);
  }

  private calculateCostQualityScore(location: LocationData): number {
    const medianRent = location.census?.medianRent || 2000;
    const healthScore = location.health?.healthScore || 50;
    
    // Affordability: lower rent is better (invert)
    const affordability = 1 - this.normalize(medianRent, this.NORMALIZERS.medianRent);
    
    // Health quality: higher is better
    const quality = this.normalize(healthScore, this.NORMALIZERS.healthScore);
    
    // Combined: 60% affordability, 40% quality
    return (affordability * 0.6) + (quality * 0.4);
  }

  private applyUserWeights(dims: any, preferences: UserPreferences) {
    const { weights } = preferences;
    const totalWeight = weights.safety + weights.affordability + weights.diversity + weights.mobility + weights.inclusion;
    
    // Apply budget sensitivity to cost quality
    if (preferences.budgetMax && location.census?.medianRent) {
      const budgetPenalty = Math.max(0, (location.census.medianRent - preferences.budgetMax) / preferences.budgetMax);
      dims.costQuality *= (1 - Math.min(0.5, budgetPenalty * 0.3));
    }
    
    return {
      safety: dims.safety * (weights.safety / totalWeight),
      community: dims.community * (weights.diversity / totalWeight), 
      costQuality: dims.costQuality * (weights.affordability / totalWeight),
    };
  }

  private calculateComposite(weightedDims: any): number {
    return (weightedDims.safety + weightedDims.community + weightedDims.costQuality) * 100;
  }

  private generateRationale(location: LocationData, dims: any, preferences: UserPreferences): string[] {
    const rationale: string[] = [];
    
    if (dims.safety > 0.7) {
      rationale.push("Low crime rates create a safe community environment");
    } else if (dims.safety < 0.3) {
      rationale.push("Higher than average crime rates may be a safety concern");
    }
    
    if (dims.community > 0.6) {
      rationale.push("Diverse community with representation from many backgrounds");
    }
    
    const rent = location.census?.medianRent;
    if (rent && rent <= preferences.budgetMax) {
      rationale.push(`Housing costs ($${rent.toLocaleString()}) fit within your budget`);
    } else if (rent && rent > preferences.budgetMax) {
      rationale.push(`Housing costs ($${rent.toLocaleString()}) exceed your stated budget`);
    }
    
    return rationale.slice(0, 3); // Top 3 bullets
  }

  private generateCitations(location: LocationData): Array<{ metric: string; source: string; url: string }> {
    return [
      {
        metric: "Crime Statistics",
        source: "FBI Crime Data Explorer",
        url: "https://cde.ucr.cjis.gov/",
      },
      {
        metric: "Demographics & Housing",
        source: "U.S. Census Bureau ACS",
        url: "https://data.census.gov/",
      },
      {
        metric: "Health Indicators",
        source: "CDC PLACES",
        url: "https://www.cdc.gov/places/",
      },
    ];
  }

  private normalize(value: number, range: { min: number; max: number }): number {
    return Math.min(1, Math.max(0, (value - range.min) / (range.max - range.min)));
  }
}

// Legacy scorer for backward compatibility
export class LocationScorer {
  scoreLocation(location: LocationData, preferences: UserPreferences): ScoredLocation {
    const contributions = this.calculateContributions(location, preferences);
    const score = this.calculateFinalScore(contributions, preferences.weights);

    return {
      ...location,
      score,
      contributions
    };
  }

  scoreLocations(locations: LocationData[], preferences: UserPreferences): ScoredLocation[] {
    return locations
      .map(location => this.scoreLocation(location, preferences))
      .sort((a, b) => b.score - a.score);
  }

  private calculateContributions(location: LocationData, preferences: UserPreferences) {
    return {
      safety: this.calculateSafetyScore(location),
      affordability: this.calculateAffordabilityScore(location, preferences.budgetMax),
      diversity: this.calculateDiversityScore(location),
      mobility: this.calculateMobilityScore(location),
      inclusion: this.calculateInclusionScore(location)
    };
  }

  private calculateSafetyScore(location: LocationData): number {
    const safetyScore = location.crime?.safetyScore || 50;
    return Math.min(1, Math.max(0, safetyScore / 100));
  }

  private calculateAffordabilityScore(location: LocationData, budgetMax: number): number {
    const medianRent = location.census?.medianRent || 1500;
    
    const maxRent = 5000;
    const baseAffordability = 1 - (medianRent / maxRent);
    
    let budgetAdjustment = 0;
    if (medianRent <= budgetMax) {
      budgetAdjustment = 0.2;
    } else {
      const overBudget = (medianRent - budgetMax) / budgetMax;
      budgetAdjustment = -Math.min(0.5, overBudget * 0.3);
    }
    
    return Math.min(1, Math.max(0, baseAffordability + budgetAdjustment));
  }

  private calculateDiversityScore(location: LocationData): number {
    const diversityIndex = location.census?.diversityIndex || 0;
    return Math.min(1, Math.max(0, diversityIndex));
  }

  private calculateMobilityScore(location: LocationData): number {
    return location.mobility ? 1 : 0;
  }

  private calculateInclusionScore(location: LocationData): number {
    return location.inclusion ? 1 : 0;
  }

  private calculateFinalScore(contributions: any, weights: UserPreferences['weights']): number {
    const weightedSum = 
      contributions.safety * weights.safety +
      contributions.affordability * weights.affordability +
      contributions.diversity * weights.diversity +
      contributions.mobility * weights.mobility +
      contributions.inclusion * weights.inclusion;

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
}

// Helper function for Convex
export function computeComposite(locationData: LocationData, preferences: UserPreferences): TruePlaceScore {
  const scorer = new TruePlaceScorer();
  return scorer.computeScore(locationData, preferences);
}

export default new LocationScorer();