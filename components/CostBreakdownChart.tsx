import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CostEstimation } from '../constants/mockData';

interface Props {
  data: CostEstimation;
}

const formatCurrency = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString()}`;
};

const CostBreakdownChart: React.FC<Props> = ({ data }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
      <Text style={[styles.title, { color: colors.text }]}>💰 Cost Estimation</Text>
      <View style={styles.costRange}>
        <Text style={[styles.costText, { color: colors.primary }]}>{formatCurrency(data.minCost)}</Text>
        <Text style={[styles.dash, { color: colors.textMuted }]}> — </Text>
        <Text style={[styles.costText, { color: colors.primary }]}>{formatCurrency(data.maxCost)}</Text>
      </View>
      <View style={styles.bar}>
        {data.breakdown.map((item, i) => (
          <View key={i} style={[styles.seg, { width: `${item.percentage}%` as any, backgroundColor: item.color,
            borderTopLeftRadius: i === 0 ? 8 : 0, borderBottomLeftRadius: i === 0 ? 8 : 0,
            borderTopRightRadius: i === data.breakdown.length - 1 ? 8 : 0, borderBottomRightRadius: i === data.breakdown.length - 1 ? 8 : 0 }]} />
        ))}
      </View>
      <View style={styles.legend}>
        {data.breakdown.map((item, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.legendPct, { color: colors.textSecondary }]}>{item.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: 20, borderRadius: 16, borderWidth: 1, padding: 16 },
  title: { fontSize: 18, fontFamily: 'Syne_700Bold', marginBottom: 12 },
  costRange: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  costText: { fontSize: 22, fontFamily: 'Syne_700Bold' },
  dash: { fontSize: 18 },
  bar: { flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  seg: { height: '100%' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '45%' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 13, fontFamily: 'DMSans_500Medium' },
  legendPct: { fontSize: 11, fontFamily: 'DMSans_400Regular' },
});

export default CostBreakdownChart;
