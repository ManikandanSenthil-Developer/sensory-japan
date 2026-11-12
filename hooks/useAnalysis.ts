import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  mockSiteAnalysis,
  mockFloorPlan,
  mockCompliance,
  mockCostEstimation,
  mockDesignRationale,
  AnalysisResult,
} from '../constants/mockData';

const HISTORY_KEY = 'landsense_history';

/**
 * Hook to manage analysis operations — currently uses mock data
 * Replace with real API calls when backend is ready
 */
export const useAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(
    async (imageUri: string, buildingType: string, plotSize?: number) => {
      setIsAnalyzing(true);
      setError(null);

      try {
        // Simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 8000));

        const result: AnalysisResult = {
          id: Date.now().toString(),
          thumbnail: imageUri,
          date: new Date().toISOString().split('T')[0],
          buildingType: buildingType as any,
          areaSqft: plotSize || mockSiteAnalysis.estimatedArea,
          status: 'completed',
          location: 'Current Location',
          siteAnalysis: mockSiteAnalysis,
          floorPlan: mockFloorPlan,
          compliance: mockCompliance,
          costEstimation: mockCostEstimation,
          designRationale: mockDesignRationale,
        };

        // Save to history
        const existing = await AsyncStorage.getItem(HISTORY_KEY);
        const history: AnalysisResult[] = existing ? JSON.parse(existing) : [];
        history.unshift(result);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));

        setCurrentResult(result);
        setIsAnalyzing(false);
        return result;
      } catch (e: any) {
        setError(e.message || 'Analysis failed');
        setIsAnalyzing(false);
        throw e;
      }
    },
    []
  );

  return { isAnalyzing, currentResult, error, analyzeImage, setCurrentResult };
};
