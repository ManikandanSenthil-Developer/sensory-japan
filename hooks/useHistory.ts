import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from '../constants/mockData';

const HISTORY_KEY = 'landsense_history';

/**
 * Hook to manage analysis history with AsyncStorage persistence
 */
export const useHistory = () => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      if (data) {
        setHistory(JSON.parse(data));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const deleteAnalysis = useCallback(async (id: string) => {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      if (data) {
        const items: AnalysisResult[] = JSON.parse(data);
        const updated = items.filter((item) => item.id !== id);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        setHistory(updated);
      }
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    await AsyncStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesFilter = filter === 'All' || item.buildingType === filter;
    const matchesSearch =
      !searchQuery ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.includes(searchQuery) ||
      item.buildingType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return {
    history: filteredHistory,
    allHistory: history,
    isLoading,
    filter,
    searchQuery,
    setFilter,
    setSearchQuery,
    loadHistory,
    deleteAnalysis,
    clearHistory,
  };
};
