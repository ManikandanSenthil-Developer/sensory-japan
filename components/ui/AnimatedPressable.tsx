import { Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

type Props = {
  onPress: () => void;
  style?: object | object[];
  children: React.ReactNode;
  haptic?: boolean;
};

export function AnimatedPressable({ 
  onPress, style, children, haptic = true 
}: Props) {
  const scale = new Animated.Value(1);
  const opacity = new Animated.Value(1);

  const onPressIn = () => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(scale,   { toValue: 0.97, useNativeDriver: true,
                                  speed: 50, bounciness: 4 }),
      Animated.timing(opacity, { toValue: 0.82, duration: 80, 
                                  useNativeDriver: true }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true,
                                  speed: 30, bounciness: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 120, 
                                  useNativeDriver: true }),
    ]).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} 
               onPressOut={onPressOut}>
      <Animated.View style={[style, 
        { transform: [{ scale }], opacity }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
