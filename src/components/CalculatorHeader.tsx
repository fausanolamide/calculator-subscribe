import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/constants/theme';

interface CalculatorHeaderProps {
  isPro: boolean;
  onResetSkit: () => void;
  showLockedToast?: boolean;
}

export function CalculatorHeader({
  isPro,
  onResetSkit,
  showLockedToast,
}: CalculatorHeaderProps) {
  const [time, setTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setTime(`${hours}:${formattedMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Authentic Mobile Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.timeText}>{time}</Text>

        <View style={styles.statusIcons}>
          {isPro && (
            <View style={styles.proStatusTag}>
              <Ionicons name="sparkles" size={10} color="#000000" />
              <Text style={styles.proStatusText}>PRO</Text>
            </View>
          )}

          {/* Signal bars */}
          <Ionicons name="cellular" size={14} color="#FFFFFF" />
          {/* Wifi */}
          <Ionicons name="wifi" size={14} color="#FFFFFF" />
          {/* Battery */}
          <Ionicons name="battery-full" size={19} color="#FFFFFF" />

          {/* Quick reset button for content creators to reset skit */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset Skit for New Video Take"
            onPress={onResetSkit}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && { opacity: 0.5 },
            ]}>
            <Ionicons name="refresh" size={13} color="#71717A" />
          </Pressable>
        </View>
      </View>

      {/* Comedic Locked Calculation Notification Toast */}
      {showLockedToast && (
        <View style={styles.lockedToast}>
          <Ionicons name="lock-closed" size={13} color="#F59E0B" />
          <Text style={styles.lockedToastText}>
            Calculation locked. Upgrade to Pro anytime to see answer.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 32,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.fontFamily,
    letterSpacing: -0.2,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FBBF24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
  },
  resetButton: {
    padding: 4,
    marginLeft: 2,
  },
  lockedToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#3F3F46',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginTop: 6,
    alignSelf: 'center',
  },
  lockedToastText: {
    color: '#D4D4D8',
    fontSize: 11,
    fontWeight: '500',
    fontFamily: Typography.fontFamily,
  },
});
