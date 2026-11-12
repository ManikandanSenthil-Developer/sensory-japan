import { Magnetometer } from 'expo-sensors';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import * as Location from 'expo-location';

interface CompassProps {
  recommendedBearing: number;
  size?: number;
}

export function CompassWidget({ recommendedBearing, size = 160 }: CompassProps) {
  const rotation = useSharedValue(0);
  const [hasMagnetometer, setHasMagnetometer] = useState(false);
  const [fallbackHeading, setFallbackHeading] = useState(0);

  useEffect(() => {
    let subscription: any;
    
    const startSensors = async () => {
      const isAvailable = await Magnetometer.isAvailableAsync();
      setHasMagnetometer(isAvailable);
      
      if (isAvailable) {
        Magnetometer.setUpdateInterval(100);
        subscription = Magnetometer.addListener((data) => {
          const heading = Math.atan2(data.y, data.x) * (180 / Math.PI);
          const adjusted = (heading + 360) % 360;
          rotation.value = withSpring(-adjusted, { damping: 14, stiffness: 80 });
        });
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const heading = location.coords.heading || 0;
          setFallbackHeading(heading);
          rotation.value = withSpring(-heading, { damping: 14, stiffness: 80 });
        }
      }
    };
    
    startSensors();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const center = size / 2;
  const radius = (size / 2) - 5;
  const innerRadius = radius - 15;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
        <Svg width={size} height={size}>
          {/* Outer ring */}
          <Circle cx={center} cy={center} r={radius} stroke={Colors.compassRing} strokeWidth="2" fill={Colors.compassFace} />
          
          {/* Inner ring */}
          <Circle cx={center} cy={center} r={innerRadius} stroke={Colors.border} strokeWidth="0.8" fill="none" />
          
          {/* Marks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i * 10) * (Math.PI / 180);
            const isMajor = i % 9 === 0;
            const length = isMajor ? 8 : 4;
            return (
              <Line
                key={i}
                x1={center + (innerRadius - length) * Math.sin(angle)}
                y1={center - (innerRadius - length) * Math.cos(angle)}
                x2={center + innerRadius * Math.sin(angle)}
                y2={center - innerRadius * Math.cos(angle)}
                stroke={Colors.border}
                strokeWidth={isMajor ? 1.5 : 0.8}
              />
            );
          })}
          
          {/* Cardinal Marks */}
          <SvgText x={center} y={center - innerRadius + 15} fill={Colors.compassNeedle} fontSize="12" fontFamily={Typography.mono.fontFamily} textAnchor="middle" alignmentBaseline="middle">N</SvgText>
          <SvgText x={center} y={center + innerRadius - 15} fill={Colors.compassText} fontSize="12" fontFamily={Typography.mono.fontFamily} textAnchor="middle" alignmentBaseline="middle">S</SvgText>
          <SvgText x={center + innerRadius - 15} y={center} fill={Colors.compassText} fontSize="12" fontFamily={Typography.mono.fontFamily} textAnchor="middle" alignmentBaseline="middle">E</SvgText>
          <SvgText x={center - innerRadius + 15} y={center} fill={Colors.compassText} fontSize="12" fontFamily={Typography.mono.fontFamily} textAnchor="middle" alignmentBaseline="middle">W</SvgText>
          
          {/* Needle */}
          <Polygon
            points={`${center},${center - innerRadius + 20} ${center + 6},${center} ${center},${center + innerRadius - 20} ${center - 6},${center}`}
            fill={Colors.compassNeedle} 
          />
          <Polygon
            points={`${center},${center + innerRadius - 20} ${center + 6},${center} ${center},${center} ${center - 6},${center}`}
            fill={Colors.textMuted}
          />
          
          {/* Center */}
          <Circle cx={center} cy={center} r={6} fill={Colors.surface} stroke={Colors.compassRing} />
        </Svg>
      </Animated.View>
    </View>
  );
}

export default CompassWidget;
