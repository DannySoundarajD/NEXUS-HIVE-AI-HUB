import axios from 'axios';
import { 
  CodeChallenge, 
  GenerateChallengeResponse, 
  EvaluateSolutionResponse,
  GetHintResponse,
  CategoriesResponse,
  DifficultiesResponse,
  LanguagesResponse
} from '../types/codeChallenge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Get available challenge categories
 */
export const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await axios.get(`${API_URL}/api/codechallenge/categories`);
  return response.data;
};

/**
 * Get available difficulty levels
 */
export const getDifficulties = async (): Promise<DifficultiesResponse> => {
  const response = await axios.get(`${API_URL}/api/codechallenge/difficulties`);
  return response.data;
};

/**
 * Get available programming languages
 */
export const getLanguages = async (): Promise<LanguagesResponse> => {
  const response = await axios.get(`${API_URL}/api/codechallenge/languages`);
  return response.data;
};

/**
 * Generate a new coding challenge
 */
export const generateChallenge = async (
  difficulty: string = 'medium',
  language: string = 'javascript',
  category: string = 'algorithms',
  model: string = 'codegemma:7b'
): Promise<GenerateChallengeResponse> => {
  const response = await axios.post(`${API_URL}/api/codechallenge/generate`, {
    difficulty,
    language,
    category,
    model
  });
  return response.data;
};

/**
 * Evaluate a solution to a coding challenge
 */
export const evaluateSolution = async (
  problem: string,
  solution: string,
  language: string = 'javascript',
  model: string = 'codegemma:7b'
): Promise<EvaluateSolutionResponse> => {
  const response = await axios.post(`${API_URL}/api/codechallenge/evaluate`, {
    problem,
    solution,
    language,
    model
  });
  return response.data;
};

/**
 * Get a hint for a coding challenge
 */
export const getHint = async (
  problem: string,
  currentCode: string = '',
  language: string = 'javascript',
  model: string = 'codegemma:7b'
): Promise<GetHintResponse> => {
  const response = await axios.post(`${API_URL}/api/codechallenge/hint`, {
    problem,
    currentCode,
    language,
    model
  });
  return response.data;
};