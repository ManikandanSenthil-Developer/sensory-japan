import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Share, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../context/ThemeContext';
import { useHistory } from '../hooks/useHistory';
import SiteAnalysisCards from '../components/SiteAnalysisCard';
import CompassWidget from '../components/CompassWidget';
import FloorPlanViewer from '../components/FloorPlanViewer';
import CostBreakdownChart from '../components/CostBreakdownChart';
import AIChatSheet from '../components/AIChatSheet';
import { mockSiteAnalysis, mockFloorPlan, mockCompliance, mockCostEstimation, mockDesignRationale } from '../constants/mockData';

export default function ResultsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  // Using useHistory hook to get real data if available from analysisId, else use mock directly for UI demo
  const { allHistory } = useHistory();
  const params = useLocalSearchParams();
  const analysisId = params.analysisId as string;
  
  const resultData = allHistory.find(h => h.id === analysisId) || {
    siteAnalysis: mockSiteAnalysis,
    floorPlan: mockFloorPlan,
    compliance: mockCompliance,
    costEstimation: mockCostEstimation,
    designRationale: mockDesignRationale,
  };

  const [chatVisible, setChatVisible] = useState(false);
  const [rationaleExpanded, setRationaleExpanded] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out this AI-generated floor plan from LandSense! 🏠✨',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      Alert.alert('Downloading', 'Generating PDF report...');
      // Simulate PDF generation delay
      setTimeout(() => {
        Alert.alert('Success', 'PDF report downloaded successfully! 📄✅');
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={[styles.backText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Analysis Results</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={[styles.shareText, { color: colors.primary }]}>Share 📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Section A - Site Analysis */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Site Context</Text>
          <SiteAnalysisCards data={resultData.siteAnalysis} />
        </View>

        {/* Section B - Solar Orientation */}
        <View style={styles.section}>
           <CompassWidget bestOrientation={resultData.siteAnalysis.bestOrientation} />
        </View>

        {/* Section C - Floor Plan */}
        <View style={styles.section}>
           <FloorPlanViewer data={resultData.floorPlan} />
        </View>

        {/* Section D - Compliance */}
        <View style={styles.section}>
           <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 20 }]}>Compliance</Text>
           <View style={styles.complianceRow}>
              <View style={[styles.badge, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
                <Text style={[styles.badgeIcon]}>✅</Text>
                <Text style={[styles.badgeText, { color: colors.success }]}>{resultData.compliance.nbc2016.label}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
                <Text style={[styles.badgeIcon]}>🕉️</Text>
                <Text style={[styles.badgeText, { color: colors.warning }]}>{resultData.compliance.vastu.label}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                <Text style={[styles.badgeIcon]}>🌱</Text>
                <Text style={[styles.badgeText, { color: colors.primary }]}>Green Score: {resultData.compliance.greenScore}/10</Text>
              </View>
           </View>
        </View>

        {/* Section E - Design Rationale */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.rationaleCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            onPress={() => setRationaleExpanded(!rationaleExpanded)}
          >
             <View style={styles.rationaleHeader}>
               <Text style={[styles.rationaleTitle, { color: colors.text }]}>🧠 Why this layout?</Text>
               <Text style={{ color: colors.textSecondary }}>{rationaleExpanded ? '▲' : '▼'}</Text>
             </View>
             {rationaleExpanded && (
               <Text style={[styles.rationaleText, { color: colors.textSecondary }]}>{resultData.designRationale}</Text>
             )}
          </TouchableOpacity>
        </View>

        {/* Section F - Cost Estimation */}
        <View style={styles.section}>
           <CostBreakdownChart data={resultData.costEstimation} />
        </View>

        {/* Section G - Actions */}
        <View style={styles.actionsContainer}>
           <TouchableOpacity onPress={() => setChatVisible(true)}>
             <LinearGradient colors={[colors.primary, '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryActionBtn}>
               <Text style={styles.primaryActionText}>💬 Refine with AI</Text>
             </LinearGradient>
           </TouchableOpacity>

           <View style={styles.secondaryActions}>
             <TouchableOpacity style={[styles.secBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]} onPress={handleDownloadPDF}>
                <Text style={[styles.secBtnText, { color: colors.text }]}>📄 Download PDF</Text>
             </TouchableOpacity>
             <TouchableOpacity style={[styles.secBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]} onPress={() => router.push('/(tabs)/upload')}>
                <Text style={[styles.secBtnText, { color: colors.text }]}>🔁 New Layout</Text>
             </TouchableOpacity>
           </View>
        </View>

      </ScrollView>

      {/* AI Chat Bottom Sheet */}
      {chatVisible && (
        <>
          <TouchableOpacity style={styles.chatOverlay} onPress={() => setChatVisible(false)} />
          <AIChatSheet visible={chatVisible} onClose={() => setChatVisible(false)} />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  backBtn: { padding: 8, marginLeft: -8 },
  backText: { fontSize: 16, fontFamily: 'DMSans_500Medium' },
  headerTitle: { fontSize: 18, fontFamily: 'Syne_700Bold' },
  shareBtn: { padding: 8, marginRight: -8 },
  shareText: { fontSize: 14, fontFamily: 'DMSans_500Medium' },
  scroll: { flex: 1 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontFamily: 'Syne_700Bold', marginBottom: 12, paddingHorizontal: 20 },
  complianceRow: { paddingHorizontal: 20, gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  badgeIcon: { fontSize: 16, marginRight: 8 },
  badgeText: { fontSize: 13, fontFamily: 'DMSans_500Medium' },
  rationaleCard: { marginHorizontal: 20, borderRadius: 16, borderWidth: 1, padding: 16 },
  rationaleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rationaleTitle: { fontSize: 16, fontFamily: 'Syne_700Bold' },
  rationaleText: { fontSize: 14, fontFamily: 'DMSans_400Regular', lineHeight: 22, marginTop: 12 },
  actionsContainer: { paddingHorizontal: 20, marginTop: 12 },
  primaryActionBtn: { paddingVertical: 16, borderRadius: 28, alignItems: 'center', marginBottom: 16 },
  primaryActionText: { color: '#fff', fontSize: 16, fontFamily: 'Syne_700Bold' },
  secondaryActions: { flexDirection: 'row', gap: 12 },
  secBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  secBtnText: { fontSize: 14, fontFamily: 'DMSans_500Medium' },
  chatOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 5 },
});
