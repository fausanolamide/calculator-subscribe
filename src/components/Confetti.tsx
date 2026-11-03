import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const CONFETTI_COLORS = [
  '#FFD700', // Gold
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#34C759', // Green
  '#007AFF', // Blue
  '#AF52DE', // Purple
  '#FF2D55', // Pink
  '#5856D6', // Indigo
];

const NUM_PIECES = 45;

interface ConfettiPieceProps {
  delay: number;
  startX: number;
  color: string;
  size: number;
  isCircle: boolean;
}

function ConfettiPiece({ delay, startX, color, size, isCircle }: ConfettiPieceProps) {
  const { height: screenHeight } = Dimensions.get('window');
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(startX)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const swingDistance = (Math.random() - 0.5) * 120;
    const duration = 2400 + Math.random() * 1200;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight + 60,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: startX + swingDistance,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 4 + Math.random() * 6,
          duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(duration * 0.7),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.3,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [delay, opacity, rotate, screenHeight, startX, translateX, translateY]);

  const spin = rotate.interpolate({
    inputRange: [0, 10],
    outputRange: ['0deg', '1440deg'],
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: size,
          height: isCircle ? size : size * 1.6,
          borderRadius: isCircle ? size / 2 : 2,
          backgroundColor: color,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { rotate: spin },
          ],
        },
      ]}
    />
  );
}

export function ConfettiOverlay() {
  const { width: screenWidth } = Dimensions.get('window');

  const pieces = React.useMemo(() => {
    return Array.from({ length: NUM_PIECES }).map((_, index) => ({
      id: index,
      delay: Math.random() * 500,
      startX: Math.random() * screenWidth,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      size: 7 + Math.random() * 7,
      isCircle: Math.random() > 0.5,
    }));
  }, [screenWidth]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          delay={piece.delay}
          startX={piece.startX}
          color={piece.color}
          size={piece.size}
          isCircle={piece.isCircle}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
});
