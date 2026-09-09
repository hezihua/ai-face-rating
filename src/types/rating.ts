export interface DimensionScore {
  name: string;
  label: string;
  score: number;
  description: string;
}

export interface FaceRatingResult {
  overallScore: number;
  dimensions: DimensionScore[];
  summary: string;
  suggestions: string[];
  mode: 'ai' | 'local';
}

export interface RatingParams {
  imageUri: string;
  base64?: string;
}
