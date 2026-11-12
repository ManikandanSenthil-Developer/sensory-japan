import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import ProcessingSteps from '../components/ProcessingSteps';
import { processingFacts } from '../constants/mockData';
import { useAnalysis } from '../hooks/useAnalysis';

const { width } = Dimensions.get('window');

const stepsConfig = [
  { label: 'Preprocessing Image...' },
  { label: 'Detecting Land Boundary...' },
  { label: 'Analyzing Site Context...' },
  { label: 'Generating Floor Plan...' },
  { label: 'Rendering Final Output...' },
];

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { analyzeImage } = useAnalysis();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const progress = useSharedValue(0);

  const [steps, setSteps] = useState(stepsConfig.map(s => ({ ...s, completed: false })));

  useEffect(() => {
    // Fact rotation
    const factInterval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % processingFacts.length);
    }, 3000);

    return () => clearInterval(factInterval);
  }, []);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        // Start progress bar animation
        progress.value = withTiming(1, { duration: 8000, easing: Easing.linear });

        // Simulate step progression
        for (let i = 0; i < stepsConfig.length; i++) {
          setCurrentStep(i);
          await new Promise(r => setTimeout(r, 8000 / stepsConfig.length));
          setSteps(prev => {
            const next = [...prev];
            next[i].completed = true;
            return next;
          });
        }
        
        // Call analysis function
        const result = await analyzeImage(
          params.imageUri as string || '', 
          params.buildingType as string || 'Residential', 
          params.plotSize ? Number(params.plotSize) : undefined
        );
        
        router.replace({ pathname: '/results', params: { analysisId: result.id } });
      } catch (e) {
        console.error(e);
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/home');
        }
      }
    };

    runAnalysis();
  }, [analyzeImage, params, progress, router]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: progress.value * (width - 80),
    };
  });

  return (
    <LinearGradient colors={[colors.background, colors.surface]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Analyzing Plot 🤖</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>~30–45 seconds remaining</Text>

          {/* Lottie placeholder / animation */}
          <View style={[styles.animContainer, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={{ fontSize: 64 }}>🏗️</Text>
          </View>

          <View style={styles.stepsContainer}>
             <ProcessingSteps steps={steps} currentStep={currentStep} />
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.borderLight }]}>
              <Animated.View style={[styles.progressBarFill, { backgroundColor: colors.primary }, progressStyle]} />
            </View>
          </View>

          <View style={[styles.factContainer, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.factText, { color: colors.primary }]}>{processingFacts[factIndex]}</Text>
          </View>

          <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.borderLight }]} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  title: { fontSize: 24, fontFamily: 'Syne_700Bold', marginTop: 20 },
  subtitle: { fontSize: 14, fontFamily: 'DMSans_400Regular', marginTop: 8, marginBottom: 32 },
  animContainer: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  stepsContainer: { width: '100%', marginBottom: 40 },
  progressContainer: { width: '100%', paddingHorizontal: 16, marginBottom: 32 },
  progressBarBg: { height: 8, borderRadius: 4, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  factContainer: { padding: 16, borderRadius: 12, width: '100%', marginBottom: 'auto' },
  factText: { fontSize: 13, fontFamily: 'DMSans_500Medium', textAlign: 'center', lineHeight: 20 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 24, borderWidth: 1, marginTop: 24 },
  cancelText: { fontSize: 14, fontFamily: 'DMSans_500Medium' },
});
