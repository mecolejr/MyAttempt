// Scoring algorithms for TruePlace recommendations

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
    // Normalize safety score from [0,100] to [0,1]
    const safetyScore = location.crime?.safetyScore || 50;
    return Math.min(1, Math.max(0, safetyScore / 100));
  }

  private calculateAffordabilityScore(location: LocationData, budgetMax: number): number {
    const medianRent = location.census?.medianRent || 1500;
    
    // Base affordability: inverse of normalized rent
    const maxRent = 5000; // Reasonable max for normalization
    const baseAffordability = 1 - (medianRent / maxRent);
    
    // Budget adjustment: bonus if under budget, penalty if over
    let budgetAdjustment = 0;
    if (medianRent <= budgetMax) {
      budgetAdjustment = 0.2; // 20% bonus for being under budget
    } else {
      const overBudget = (medianRent - budgetMax) / budgetMax;
      budgetAdjustment = -Math.min(0.5, overBudget * 0.3); // Penalty for being over budget
    }
    
    return Math.min(1, Math.max(0, baseAffordability + budgetAdjustment));
  }

  private calculateDiversityScore(location: LocationData): number {
    // Diversity index is already in [0,1] range (Simpson's index)
    const diversityIndex = location.census?.diversityIndex || 0;
    return Math.min(1, Math.max(0, diversityIndex));
  }

  private calculateMobilityScore(location: LocationData): number {
    // Simple boolean mapping
    return location.mobility ? 1 : 0;
  }

  private calculateInclusionScore(location: LocationData): number {
    // Simple boolean mapping
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
    
    // Normalize by total weight to get score in [0,1] range
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
}

export default new LocationScorer();