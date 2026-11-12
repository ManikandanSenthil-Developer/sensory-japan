import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { mockRecentAnalyses, architecturalTips } from '../../constants/mockData';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>LandSense 🏗️</Text>
          <TouchableOpacity style={[styles.bellBtn, { backgroundColor: colors.card }]}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/upload')} style={{ marginHorizontal: 20 }}>
          <LinearGradient colors={[colors.primary, '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <View>
              <Text style={styles.heroTitle}>Analyze a New Plot</Text>
              <Text style={styles.heroSub}>Upload or capture a land photo to get started</Text>
            </View>
            <View style={styles.heroIcons}>
              <Text style={{ fontSize: 28 }}>📷</Text>
              <Text style={{ fontSize: 28 }}>🖼️</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Analyses', value: '12', icon: '📊' },
            { label: 'Plans', value: '8', icon: '📐' },
            { label: 'PDFs', value: '5', icon: '📄' },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Analyses */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Analyses</Text>
          <FlatList
            horizontal
            data={mockRecentAnalyses}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push('/results')}
                style={[styles.recentCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              >
                <View style={[styles.recentThumb, { backgroundColor: colors.surface }]}>
                  <Text style={{ fontSize: 32 }}>🏞️</Text>
                </View>
                <Text style={[styles.recentDate, { color: colors.textMuted }]}>{item.date}</Text>
                <Text style={[styles.recentType, { color: colors.text }]}>{item.buildingType}</Text>
                <Text style={[styles.recentArea, { color: colors.primary }]}>{item.areaSqft.toLocaleString()} sqft</Text>
                {item.location && (
                  <Text style={[styles.recentLoc, { color: colors.textMuted }]}>📍 {item.location}</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Quick Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Tips 💡</Text>
          <FlatList
            horizontal
            data={architecturalTips}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</Text>
                <Text style={[styles.tipTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.tipDesc, { color: colors.textSecondary }]}>{item.description}</Text>
              </View>
            )}
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontFamily: 'Syne_700Bold' },
  bellBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  heroCard: { borderRadius: 20, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heroTitle: { fontSize: 22, fontFamily: 'Syne_700Bold', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: 'rgba(255,255,255,0.8)' },
  heroIcons: { flexDirection: 'row', gap: 8 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  statValue: { fontSize: 24, fontFamily: 'Syne_700Bold', marginTop: 4 },
  statLabel: { fontSize: 11, fontFamily: 'DMSans_400Regular', marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontFamily: 'Syne_700Bold', paddingHorizontal: 20, marginBottom: 12 },
  recentCard: { width: 160, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  recentThumb: { height: 90, alignItems: 'center', justifyContent: 'center' },
  recentDate: { fontSize: 11, fontFamily: 'DMSans_400Regular', paddingHorizontal: 12, paddingTop: 8 },
  recentType: { fontSize: 14, fontFamily: 'DMSans_500Medium', paddingHorizontal: 12, paddingTop: 2 },
  recentArea: { fontSize: 13, fontFamily: 'Syne_700Bold', paddingHorizontal: 12, paddingTop: 2 },
  recentLoc: { fontSize: 10, fontFamily: 'DMSans_400Regular', paddingHorizontal: 12, paddingVertical: 8 },
  tipCard: { width: 200, padding: 16, borderRadius: 16, borderWidth: 1 },
  tipTitle: { fontSize: 15, fontFamily: 'DMSans_500Medium', marginBottom: 4 },
  tipDesc: { fontSize: 12, fontFamily: 'DMSans_400Regular', lineHeight: 18 },
});
