import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.landsense.app';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error: No response received');
    }
    return Promise.reject(error);
  }
);

export interface AnalyzeRequest {
  image: {
    uri: string;
    type: string;
    name: string;
  };
  buildingType: string;
  plotSize?: number;
  latitude?: number;
  longitude?: number;
}

export interface AnalyzeResponse {
  id: string;
  siteAnalysis: {
    estimatedArea: number;
    roadAccess: string;
    vegetation: string;
    terrain: string;
    bestOrientation: string;
    soilType: string;
  };
  floorPlan: any;
  compliance: any;
  costEstimation: any;
  designRationale: string;
}

export const api = {
  /**
   * Submit an image for AI analysis
   */
  analyzeImage: async (data: AnalyzeRequest): Promise<AnalyzeResponse> => {
    const formData = new FormData();
    formData.append('image', {
      uri: data.image.uri,
      type: data.image.type || 'image/jpeg',
      name: data.image.name || 'land_photo.jpg',
    } as any);
    formData.append('buildingType', data.buildingType);
    if (data.plotSize) formData.append('plotSize', String(data.plotSize));
    if (data.latitude) formData.append('latitude', String(data.latitude));
    if (data.longitude) formData.append('longitude', String(data.longitude));

    const response = await apiClient.post('/api/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return response.data;
  },

  /**
   * Export analysis as PDF
   */
  exportPDF: async (analysisId: string): Promise<Blob> => {
    const response = await apiClient.post(
      '/api/export-pdf',
      { analysisId },
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Get past analyses
   */
  getHistory: async (): Promise<AnalyzeResponse[]> => {
    const response = await apiClient.get('/api/history');
    return response.data;
  },

  /**
   * Refine a floor plan with AI chat
   */
  refineWithAI: async (analysisId: string, message: string): Promise<AnalyzeResponse> => {
    const response = await apiClient.post('/api/refine', {
      analysisId,
      message,
    });
    return response.data;
  },
};

export default api;
