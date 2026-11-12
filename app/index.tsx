import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;
  const morphAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(morphAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(async () => {
      const hasOnboarded = await AsyncStorage.getItem('has_onboarded');
      if (hasOnboarded) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const morphRotate = morphAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <LinearGradient colors={[colors.background, colors.surfaceAlt, colors.background]} style={styles.container}>
      {/* Background decorative elements */}
      <Animated.View style={[styles.bgCircle1, { opacity: logoOpacity, backgroundColor: colors.primaryLight + '20', transform: [{ scale: morphAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] }) }] }]} />
      <Animated.View style={[styles.bgCircle2, { opacity: logoOpacity, backgroundColor: colors.accentLight + '20', transform: [{ scale: morphAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Animated.View style={[styles.morphIcon, { transform: [{ rotate: morphRotate }] }]}>
          <View style={[styles.landShape, { borderColor: colors.primary }]} />
          <View style={[styles.blueprintShape, { borderColor: colors.accent }]} />
        </Animated.View>
        <Text style={[styles.logoText, { color: colors.textPrimary }]}>LandSense</Text>
        <View style={[styles.logoBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>AI</Text>
        </View>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={{ opacity: taglineOpacity, transform: [{ translateY: taglineY }] }}>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Land Photo → Floor Plan in 60 Seconds</Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View style={[styles.loadingDots, { opacity: taglineOpacity }]}>
        {[0, 1, 2].map(i => (
          <Animated.View key={i} style={[styles.dot, { backgroundColor: colors.primary, opacity: morphAnim.interpolate({ inputRange: [0, 0.33 * i, 0.33 * i + 0.33, 1], outputRange: [0.3, 0.3, 1, 0.3], extrapolate: 'clamp' }) }]} />
        ))}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bgCircle1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(79,127,255,0.04)', top: '20%', left: '-10%' },
  bgCircle2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(167,139,250,0.04)', bottom: '25%', right: '-5%' },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  morphIcon: { width: 80, height: 80, marginBottom: 16, alignItems: 'center', justifyContent: 'center' },
  landShape: { width: 50, height: 50, borderWidth: 3, borderRadius: 8, transform: [{ rotate: '45deg' }], position: 'absolute' },
  blueprintShape: { width: 36, height: 36, borderWidth: 2, borderRadius: 4, borderStyle: 'dashed', position: 'absolute' },
  logoText: { fontSize: 42, fontFamily: 'Syne_700Bold', color: '#FFFFFF', letterSpacing: -1 },
  logoBadge: { position: 'absolute', top: 80, right: -20, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 12, fontFamily: 'Syne_700Bold' },
  tagline: { fontSize: 15, fontFamily: 'DMSans_400Regular', color: '#94A3B8', textAlign: 'center', paddingHorizontal: 40 },
  loadingDots: { flexDirection: 'row', gap: 6, marginTop: 40 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
