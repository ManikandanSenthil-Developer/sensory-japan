import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Step {
  label: string;
  completed: boolean;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

const ProcessingSteps: React.FC<Props> = ({ steps, currentStep }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = step.completed;
        return (
          <View key={i} style={styles.stepRow}>
            <View style={[styles.iconCircle, {
              backgroundColor: isDone ? colors.success + '20' : isActive ? colors.primary + '20' : colors.surface,
              borderColor: isDone ? colors.success : isActive ? colors.primary : colors.border,
            }]}>
              <Text style={styles.iconText}>{isDone ? '✅' : '⏳'}</Text>
            </View>
            <Text style={[styles.label, {
              color: isDone ? colors.success : isActive ? colors.text : colors.textMuted,
              fontFamily: isActive ? 'DMSans_500Medium' : 'DMSans_400Regular',
            }]}>
              {step.label}
            </Text>
            {isDone && (
              <Text style={[styles.done, { color: colors.success }]}>Done</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16, paddingHorizontal: 32 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 16 },
  label: { fontSize: 14, flex: 1 },
  done: { fontSize: 12, fontFamily: 'DMSans_500Medium' },
});

export default ProcessingSteps;
