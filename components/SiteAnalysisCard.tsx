import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SiteAnalysis } from '../constants/mockData';

interface SiteAnalysisCardProps {
  data: SiteAnalysis;
}

interface AnalysisItem {
  icon: string;
  label: string;
  value: string;
}

const SiteAnalysisCards: React.FC<SiteAnalysisCardProps> = ({ data }) => {
  const { colors } = useTheme();

  const items: AnalysisItem[] = [
    { icon: '📐', label: 'Estimated Area', value: `${data.estimatedArea.toLocaleString()} sqft` },
    { icon: '🧭', label: 'Road Access', value: data.roadAccess },
    { icon: '🌿', label: 'Vegetation', value: data.vegetation },
    { icon: '🪨', label: 'Terrain', value: data.terrain },
    { icon: '☀️', label: 'Best Orientation', value: data.bestOrientation },
    { icon: '🏗️', label: 'Soil Type', value: data.soilType },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {items.map((item, index) => (
        <View
          key={index}
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {item.label}
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {item.value}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    fontFamily: 'Syne_700Bold',
    textAlign: 'center',
  },
});

export default SiteAnalysisCards;
