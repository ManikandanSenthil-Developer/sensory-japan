import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const { colors, mode, toggleTheme, unitSystem, setUnitSystem } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Profile 👤</Text>

        {/* Avatar Card */}
        <View style={[styles.avatarCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={{ fontSize: 40 }}>👤</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>John Architect</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>john@landsense.app</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Analyses', value: '12', icon: '📊' },
            { label: 'Saved Plans', value: '8', icon: '💾' },
            { label: 'PDFs', value: '5', icon: '📄' },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={{ fontSize: 18 }}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>SETTINGS</Text>

          <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>🌙 Dark Mode</Text>
            <Switch value={mode === 'dark'} onValueChange={toggleTheme} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
          </View>

          <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>🔔 Notifications</Text>
            <Switch value={true} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
          </View>

          <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>📏 Unit System</Text>
            <View style={styles.unitToggle}>
              {(['sqft', 'sqm'] as const).map(unit => (
                <TouchableOpacity key={unit} onPress={() => setUnitSystem(unit)}
                  style={[styles.unitBtn, { backgroundColor: unitSystem === unit ? colors.primary : 'transparent' }]}>
                  <Text style={[styles.unitText, { color: unitSystem === unit ? '#fff' : colors.textMuted }]}>{unit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ABOUT</Text>
          <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.aboutTitle, { color: colors.text }]}>LandSense 🏗️</Text>
            <Text style={[styles.aboutVersion, { color: colors.textMuted }]}>Version 1.0.0</Text>
            <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
              AI-powered Architectural Planner — Transform vacant land photos into detailed floor plans with compliance analysis.
            </Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.error }]}>
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { fontSize: 28, fontFamily: 'Syne_700Bold', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  avatarCard: { marginHorizontal: 20, padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 20, fontFamily: 'Syne_700Bold' },
  email: { fontSize: 14, fontFamily: 'DMSans_400Regular', marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1 },
  statValue: { fontSize: 20, fontFamily: 'Syne_700Bold', marginTop: 4 },
  statLabel: { fontSize: 10, fontFamily: 'DMSans_400Regular', marginTop: 2 },
  settingsSection: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontFamily: 'DMSans_500Medium', letterSpacing: 1, marginBottom: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  settingLabel: { fontSize: 15, fontFamily: 'DMSans_500Medium' },
  unitToggle: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden' },
  unitBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  unitText: { fontSize: 13, fontFamily: 'DMSans_500Medium' },
  aboutCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
  aboutTitle: { fontSize: 18, fontFamily: 'Syne_700Bold' },
  aboutVersion: { fontSize: 12, fontFamily: 'DMSans_400Regular', marginTop: 2 },
  aboutDesc: { fontSize: 13, fontFamily: 'DMSans_400Regular', lineHeight: 20, marginTop: 8 },
  logoutBtn: { marginHorizontal: 20, padding: 16, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', marginTop: 4 },
  logoutText: { fontSize: 16, fontFamily: 'DMSans_500Medium' },
});
