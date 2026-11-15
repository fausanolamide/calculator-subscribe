import React, { useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScaledSize,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalculatorColors, Typography } from '@/constants/theme';
import {
  CalculatorState,
  Operator,
  evaluateMath,
  formatDisplayNumber,
  initialCalculatorState,
  parseRawNumber,
} from '@/utils/calculator';
import { CalculatorButton } from '@/components/CalculatorButton';
import { CalculatorHeader } from '@/components/CalculatorHeader';
import { SubscriptionModal } from '@/components/SubscriptionModal';

export default function CalculatorScreen() {
  const [calcState, setCalcState] = useState<CalculatorState>(initialCalculatorState);
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showLockedToast, setShowLockedToast] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));

  // Listen to dimension changes
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setWindowDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Compute responsive button size and gaps based on screen height AND width
  const screenH = windowDimensions.height;
  const screenW = windowDimensions.width;
  const isCompact = screenH < 750;
  const gap = isCompact ? 8 : 10;
  const contentWidth = Math.min(screenW - 24, 380);

  // Available height for keypad: target 55% of screen height
  const targetKeypadHeight = screenH * 0.54;
  const maxButtonHeight = Math.floor((targetKeypadHeight - gap * 4) / 5);
  const maxButtonWidth = Math.floor((contentWidth - gap * 3) / 4);

  // Button size constrained by width and height so all 5 rows including '=' ALWAYS fit!
  const buttonSize = Math.max(50, Math.min(maxButtonWidth, maxButtonHeight, 74));

  // Swipe to delete / backspace gesture
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_e: GestureResponderEvent, gestureState) => {
        if (Math.abs(gestureState.dx) > 30) {
          handleBackspace();
        }
      },
    })
  ).current;

  // Handles digit input (0-9)
  const handleDigit = (digit: string) => {
    setShowLockedToast(false);
    setCalcState((prev) => {
      if (prev.isLocked) {
        // Start fresh if user types after a locked result
        return {
          ...initialCalculatorState,
          currentDisplay: digit,
        };
      }

      if (prev.waitingForNewOperand) {
        return {
          ...prev,
          currentDisplay: digit,
          waitingForNewOperand: false,
        };
      }

      if (prev.currentDisplay === '0') {
        return {
          ...prev,
          currentDisplay: digit,
        };
      }

      // Limit input length to 10 characters to prevent overflow
      if (prev.currentDisplay.replace(/[^0-9]/g, '').length >= 10) {
        return prev;
      }

      return {
        ...prev,
        currentDisplay: prev.currentDisplay + digit,
      };
    });
  };

  // Handles decimal point (.)
  const handleDecimal = () => {
    setShowLockedToast(false);
    setCalcState((prev) => {
      if (prev.isLocked || prev.waitingForNewOperand) {
        return {
          ...prev,
          currentDisplay: '0.',
          waitingForNewOperand: false,
          isLocked: false,
        };
      }

      if (!prev.currentDisplay.includes('.')) {
        return {
          ...prev,
          currentDisplay: prev.currentDisplay + '.',
        };
      }

      return prev;
    });
  };

  // Handles backspace / delete last character
  const handleBackspace = () => {
    setCalcState((prev) => {
      if (prev.waitingForNewOperand || prev.isLocked) return prev;
      if (prev.currentDisplay.length <= 1) {
        return { ...prev, currentDisplay: '0' };
      }
      return {
        ...prev,
        currentDisplay: prev.currentDisplay.slice(0, -1),
      };
    });
  };

  // Handles operators (+, −, ×, ÷)
  const handleOperator = (nextOperator: Operator) => {
    setShowLockedToast(false);
    setCalcState((prev) => {
      const currentNum = parseRawNumber(prev.currentDisplay);

      if (prev.previousValue === null) {
        return {
          ...prev,
          previousValue: prev.currentDisplay,
          activeOperator: nextOperator,
          expressionHistory: `${prev.currentDisplay} ${nextOperator}`,
          waitingForNewOperand: true,
          isLocked: false,
        };
      }

      if (prev.activeOperator && !prev.waitingForNewOperand) {
        const prevNum = parseRawNumber(prev.previousValue);
        const intermediate = evaluateMath(prevNum, currentNum, prev.activeOperator);
        return {
          ...prev,
          previousValue: intermediate,
          currentDisplay: intermediate,
          activeOperator: nextOperator,
          expressionHistory: `${intermediate} ${nextOperator}`,
          waitingForNewOperand: true,
          isLocked: false,
        };
      }

      // If user just switches operator
      return {
        ...prev,
        activeOperator: nextOperator,
        expressionHistory: `${prev.previousValue} ${nextOperator}`,
      };
    });
  };

  // Handles negation (±)
  const handleToggleSign = () => {
    setCalcState((prev) => {
      if (prev.currentDisplay === '0' || prev.isLocked) return prev;
      const val = parseRawNumber(prev.currentDisplay);
      return {
        ...prev,
        currentDisplay: (-val).toString(),
      };
    });
  };

  // Handles percentage (%)
  const handlePercentage = () => {
    setCalcState((prev) => {
      if (prev.isLocked) return prev;
      const val = parseRawNumber(prev.currentDisplay);
      const result = (val / 100).toString();
      return {
        ...prev,
        currentDisplay: result,
      };
    });
  };

  // Handles AC / C
  const handleClear = () => {
    setShowLockedToast(false);
    setCalcState(initialCalculatorState);
  };

  // The Big Moment: Handles Equals (=)
  const handleEquals = () => {
    // If already locked and user taps equals again, re-open paywall
    if (calcState.isLocked) {
      setShowPaywall(true);
      return;
    }

    if (calcState.previousValue === null || calcState.activeOperator === null) {
      return;
    }

    const firstOperand = parseRawNumber(calcState.previousValue);
    const secondOperand = parseRawNumber(calcState.currentDisplay);
    const finalResult = evaluateMath(firstOperand, secondOperand, calcState.activeOperator);
    const fullExpression = `${calcState.previousValue} ${calcState.activeOperator} ${calcState.currentDisplay}`;

    if (!isPro) {
      // THE TWIST! Trigger the Paywall Modal!
      setCalcState((prev) => ({
        ...prev,
        expressionHistory: fullExpression,
        pendingResult: finalResult,
        isLocked: true,
      }));
      setShowPaywall(true);
    } else {
      // If already Pro, calculate normally
      setCalcState({
        currentDisplay: finalResult,
        previousValue: null,
        activeOperator: null,
        expressionHistory: `${fullExpression} =`,
        waitingForNewOperand: true,
        isLocked: false,
        pendingResult: null,
      });
    }
  };

  // User taps "Maybe later" on the paywall modal
  const handleMaybeLater = () => {
    setShowPaywall(false);
    setShowLockedToast(true);
  };

  // User taps "Subscribe to Unlock Answer" & completes comedic payment
  const handleSubscribeSuccess = (unlockedResult: string) => {
    setIsPro(true);
    setShowPaywall(false);
    setShowLockedToast(false);

    setCalcState((prev) => ({
      ...prev,
      currentDisplay: unlockedResult,
      previousValue: null,
      activeOperator: null,
      expressionHistory: `${prev.expressionHistory} =`,
      waitingForNewOperand: true,
      isLocked: false,
      pendingResult: null,
    }));
  };

  // Content creator reset tool
  const handleResetSkit = () => {
    setIsPro(false);
    setShowPaywall(false);
    setShowLockedToast(false);
    setCalcState(initialCalculatorState);
  };

  // Determine dynamic font size for main display
  const rawLength = calcState.currentDisplay.length;
  let displayFontSize = 72;
  if (rawLength > 6) displayFontSize = 54;
  if (rawLength > 8) displayFontSize = 42;
  if (rawLength > 10) displayFontSize = 34;

  const isClearAll = calcState.currentDisplay === '0' && calcState.previousValue === null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.outerContainer}>
        <View style={[styles.phoneContainer, { maxWidth: 440 }]}>
          {/* Header with phone status bar & quick reset */}
          <CalculatorHeader
            isPro={isPro}
            onResetSkit={handleResetSkit}
            showLockedToast={showLockedToast}
          />

          {/* Calculator Display Area */}
          <View style={styles.displaySection} {...panResponder.panHandlers}>
            {/* Expression History Line */}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.expressionText}>
              {calcState.expressionHistory || ' '}
            </Text>
            {calcState.isLocked ? (
              <Pressable
                onPress={() => setShowPaywall(true)}
                style={styles.lockedResultContainer}>
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={24} color="#F59E0B" />
                  <Text style={styles.lockedBadgeText}>LOCKED</Text>
                </View>
                <Text style={styles.lockedHintText}>Tap = or tap here to unlock</Text>
              </Pressable>
            ) : (
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[
                  styles.displayText,
                  {
                    fontSize: displayFontSize,
                  },
                ]}>
                {formatDisplayNumber(calcState.currentDisplay)}
              </Text>
            )}
          </View>

          <View style={[styles.keypadContainer, { width: contentWidth, gap }]}>
            <View style={[styles.keypadRow, { gap }]}>
              <CalculatorButton
                label={isClearAll ? 'AC' : 'C'}
                type="function"
                size={buttonSize}
                gap={gap}
                onPress={handleClear}
              />
              <CalculatorButton
                label="±"
                type="function"
                size={buttonSize}
                gap={gap}
                onPress={handleToggleSign}
              />
              <CalculatorButton
                label="%"
                type="function"
                size={buttonSize}
                gap={gap}
                onPress={handlePercentage}
              />
              <CalculatorButton
                label="÷"
                type="operator"
                size={buttonSize}
                gap={gap}
                isActive={calcState.activeOperator === '÷'}
                onPress={() => handleOperator('÷')}
              />
            </View>

            {/* Row 2 */}
            <View style={[styles.keypadRow, { gap }]}>
              <CalculatorButton
                label="7"
                size={buttonSize}
                gap={gap}
                onPress={() => handleDigit('7')}
              />
              <CalculatorButton
                label="8"
                size={buttonSize}
                gap={gap}
                onPress={() => handleDigit('8')}
              />
              <CalculatorButton
                label="9"
                size={buttonSize}
                gap={gap}
                onPress={() => handleDigit('9')}
              />
              <CalculatorButton
                label="×"
                type="operator"
                size={buttonSize}
                gap={gap}
                isActive={calcState.activeOperator === '×'}
                onPress={() => handleOperator('×')}
              />
            </View>

            {/* Row 3 */}
            <View style={[styles.keypadRow, { gap }]}>
              <CalculatorButton
                label="4"
                size={buttonSize}
                gap={gap}
                onPress={() => handleDigit('4')}
              />
              <CalculatorButton
                label="5"
                size={buttonSize}
                gap={gap}
                onPress={() => handleDigit('5')}
              />
              <CalculatorButton
                label="6"
                size={buttonSize}
                gap={gap}
                onPress={() => handleDigit('6')}
              />
              <CalculatorButton
                label="−"
                type="operator"
                size={buttonSize}
                gap={gap}
                isActive={calcState.activeOperator === '−'}
                onPress={() => handleOperator('−')}
              />
            </View>

            {/* Row 4 */}
            <View style={[styles.keypadRow, { gap }]}>
              <CalculatorButton
                label="1"
                size={buttonSize}
                gap={gap}
                onPress={() => handleDigit('1')}
              />
              <CalculatorButton
                label="2"
                size={buttonSize}
                gap={gap}
                onPress={() => handleDigit('2')}
              />
              <CalculatorButton
                label="3"
                size={buttonSize}
                gap={gap}
                onPress={() => handleDigit('3')}
              />
              <CalculatorButton
                label="+"
                type="operator"
                size={buttonSize}
                gap={gap}
                isActive={calcState.activeOperator === '+'}
                onPress={() => handleOperator('+')}
              />
            </View>

            {/* Row 5 */}
            <View style={[styles.keypadRow, { gap }]}>
              <CalculatorButton
                label="0"
                size={buttonSize}
                gap={gap}
                isDoubleWide
                onPress={() => handleDigit('0')}
              />
              <CalculatorButton
                label="."
                size={buttonSize}
                gap={gap}
                onPress={handleDecimal}
              />
              <CalculatorButton
                label="="
                type="equals"
                size={buttonSize}
                gap={gap}
                onPress={handleEquals}
              />
            </View>
          </View>

          {/* Bottom Home Indicator Bar (for realistic iOS recording) */}
          {Platform.OS === 'ios' && (
            <View style={styles.homeIndicatorWrapper}>
              <View style={styles.homeIndicator} />
            </View>
          )}
        </View>
      </View>

      {/* Subscription Paywall Modal */}
      <SubscriptionModal
        visible={showPaywall}
        expression={calcState.expressionHistory}
        calculatedResult={calcState.pendingResult || '4'}
        onSubscribeSuccess={handleSubscribeSuccess}
        onMaybeLater={handleMaybeLater}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CalculatorColors.background,
  },
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CalculatorColors.background,
  },
  phoneContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
    backgroundColor: CalculatorColors.background,
  },
  displaySection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 8,
    minHeight: 50,
  },
  expressionText: {
    fontSize: 24,
    color: CalculatorColors.expressionText,
    fontFamily: Typography.fontFamily,
    marginBottom: 6,
    fontWeight: '400',
  },
  displayText: {
    color: CalculatorColors.displayText,
    fontFamily: Typography.fontFamily,
    fontWeight: '300',
    letterSpacing: -1.5,
    textAlign: 'right',
  },
  lockedResultContainer: {
    alignItems: 'flex-end',
    paddingVertical: 8,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lockedBadgeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 2,
    fontFamily: Typography.fontFamily,
  },
  lockedHintText: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 4,
    fontFamily: Typography.fontFamily,
  },
  keypadContainer: {
    alignSelf: 'center',
    paddingBottom: Platform.OS === 'ios' ? 4 : 8,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeIndicatorWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#3F3F46',
  },
});
