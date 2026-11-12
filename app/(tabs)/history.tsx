import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useHistory } from '../../hooks/useHistory';

const filters = ['All', 'Residential', 'Commercial', 'Mixed'];

export default function HistoryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { history, isLoading, filter, searchQuery, setFilter, setSearchQuery, loadHistory, deleteAnalysis } = useHistory();

  const handleDelete = (id: string) => {
    Alert.alert('Delete Analysis', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAnalysis(id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>History 📋</Text>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.borderLight }]}
          placeholder="Search by date or location..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}
            style={[styles.filterChip, {
              backgroundColor: filter === f ? colors.primary + '20' : colors.card,
              borderColor: filter === f ? colors.primary : colors.borderLight,
            }]}>
            <Text style={[styles.filterText, { color: filter === f ? colors.primary : colors.textSecondary }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={history}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadHistory} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🏗️</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Analyses Yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Upload a land photo to get your first AI-generated floor plan!</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/upload')}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.emptyBtnText}>Start First Analysis</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push('/results')}
            onLongPress={() => handleDelete(item.id)}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
          >
            <View style={[styles.cardThumb, { backgroundColor: colors.surface }]}>
              <Text style={{ fontSize: 28 }}>🏞️</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardType, { color: colors.text }]}>{item.buildingType}</Text>
              <Text style={[styles.cardArea, { color: colors.primary }]}>{item.areaSqft.toLocaleString()} sqft</Text>
              <Text style={[styles.cardDate, { color: colors.textMuted }]}>{item.date}</Text>
              {item.location && <Text style={[styles.cardLoc, { color: colors.textMuted }]}>📍 {item.location}</Text>}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? colors.successLight : colors.warningLight }]}>
              <Text style={[styles.statusText, { color: item.status === 'completed' ? colors.success : colors.warning }]}>
                {item.status === 'completed' ? '✅' : '⏳'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { fontSize: 28, fontFamily: 'Syne_700Bold', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  searchRow: { paddingHorizontal: 20, marginBottom: 12 },
  searchInput: { height: 44, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, fontSize: 14, fontFamily: 'DMSans_400Regular' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: 'DMSans_500Medium' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 12, gap: 12 },
  cardThumb: { width: 60, height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardType: { fontSize: 15, fontFamily: 'DMSans_500Medium' },
  cardArea: { fontSize: 13, fontFamily: 'Syne_700Bold', marginTop: 2 },
  cardDate: { fontSize: 11, fontFamily: 'DMSans_400Regular', marginTop: 2 },
  cardLoc: { fontSize: 10, fontFamily: 'DMSans_400Regular', marginTop: 1 },
  statusBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: 14 },
  emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 22, fontFamily: 'Syne_700Bold', marginBottom: 8 },
  emptyDesc: { fontSize: 14, fontFamily: 'DMSans_400Regular', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontFamily: 'DMSans_500Medium' },
});
