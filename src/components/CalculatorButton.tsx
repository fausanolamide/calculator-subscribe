import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalculatorColors, Typography } from '@/constants/theme';

export type ButtonType = 'number' | 'function' | 'operator' | 'equals';

interface CalculatorButtonProps {
  label: string;
  type?: ButtonType;
  isActive?: boolean;
  isDoubleWide?: boolean;
  size: number;
  gap?: number;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function CalculatorButton({
  label,
  type = 'number',
  isActive = false,
  isDoubleWide = false,
  size,
  gap = 12,
  onPress,
  accessibilityLabel,
}: CalculatorButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.90,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

    // Trigger haptic feedback safely
    try {
      if (Platform.OS !== 'web') {
        if (type === 'equals') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    } catch {
      // Ignore if haptics unavailable
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  // Determine button background and text color based on type and active state
  let backgroundColor: string = CalculatorColors.numberButton;
  let textColor: string = CalculatorColors.numberText;

  if (type === 'function') {
    backgroundColor = CalculatorColors.functionButton;
    textColor = CalculatorColors.functionText;
  } else if (type === 'operator' || type === 'equals') {
    if (isActive) {
      backgroundColor = CalculatorColors.operatorActiveBackground;
      textColor = CalculatorColors.operatorActiveText;
    } else {
      backgroundColor = CalculatorColors.operatorButton;
      textColor = CalculatorColors.operatorText;
    }
  }

  // Double-wide width calculation: spans 2 button columns + the gap
  const buttonWidth = isDoubleWide ? size * 2 + gap : size;
  const buttonHeight = size;
  const borderRadius = size / 2;

  // Font size scaling
  const fontSize = label.length > 2 ? size * 0.32 : size * 0.44;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        width: buttonWidth,
        height: buttonHeight,
      }}>
      <Pressable
        accessibilityLabel={accessibilityLabel || label}
        accessibilityRole="button"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            width: buttonWidth,
            height: buttonHeight,
            borderRadius,
            backgroundColor: pressed
              ? type === 'number'
                ? CalculatorColors.numberButtonPressed
                : type === 'function'
                ? CalculatorColors.functionButtonPressed
                : CalculatorColors.operatorButtonPressed
              : backgroundColor,
            alignItems: isDoubleWide ? 'flex-start' : 'center',
            paddingLeft: isDoubleWide ? size * 0.38 : 0,
          },
        ]}>
        <Text
          style={[
            styles.buttonText,
            {
              color: textColor,
              fontSize,
              fontFamily: Typography.fontFamily,
              fontWeight: type === 'operator' || type === 'equals' ? '600' : '400',
            },
          ]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
    userSelect: 'none',
  } as ViewStyle,
  buttonText: {
    letterSpacing: -0.5,
    textAlign: 'center',
  },
});
