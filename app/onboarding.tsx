import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  { icon: '📸', title: 'Capture Your Land', desc: 'Take or upload a photo of vacant land to begin your architectural journey.' },
  { icon: '🤖', title: 'AI Analyzes Everything', desc: 'Site area, orientation, terrain, road access, vegetation — analyzed in seconds.' },
  { icon: '🏠', title: 'Get Your Floor Plan', desc: 'Instant architectural concept with NBC compliance, Vastu analysis & PDF export.' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleDone = async () => {
    await AsyncStorage.setItem('has_onboarded', 'true');
    router.replace('/(tabs)/home');
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      handleDone();
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.surface]} style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleDone}>
        <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
        }}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.slideIcon}>{item.icon}</Text>
            </View>
            <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.slideDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, {
            backgroundColor: i === activeIndex ? colors.primary : colors.border,
            width: i === activeIndex ? 24 : 8,
          }]} />
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity onPress={handleNext} style={{ marginHorizontal: 24, marginBottom: 40 }}>
        <LinearGradient colors={[colors.primary, '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
          <Text style={styles.ctaText}>
            {activeIndex === slides.length - 1 ? 'Get Started 🚀' : 'Next'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: 'absolute', top: 56, right: 24, zIndex: 10, padding: 8 },
  skipText: { fontSize: 15, fontFamily: 'DMSans_500Medium' },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  iconContainer: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  slideIcon: { fontSize: 52 },
  slideTitle: { fontSize: 28, fontFamily: 'Syne_700Bold', textAlign: 'center', marginBottom: 12 },
  slideDesc: { fontSize: 16, fontFamily: 'DMSans_400Regular', textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4 },
  ctaBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 17, fontFamily: 'Syne_700Bold' },
});
