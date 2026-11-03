import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CalculatorColors, Typography } from '@/constants/theme';
import { ConfettiOverlay } from '@/components/Confetti';

interface SubscriptionModalProps {
  visible: boolean;
  expression: string;
  calculatedResult: string;
  onSubscribeSuccess: (result: string) => void;
  onMaybeLater: () => void;
}

type Step = 'paywall' | 'checkout' | 'processing' | 'success';

export function SubscriptionModal({
  visible,
  expression,
  calculatedResult,
  onSubscribeSuccess,
  onMaybeLater,
}: SubscriptionModalProps) {
  const [step, setStep] = useState<Step>('paywall');
  const [processingText, setProcessingText] = useState('Connecting to Central Arithmetic Bank...');

  // Mock Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Animations
  const slideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0.7)).current;

  // Reset step and fields whenever modal visibility changes
  useEffect(() => {
    if (visible) {
      setStep('paywall');
      setProcessingText('Connecting to Central Arithmetic Bank...');
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
          speed: 14,
        }),
      ]).start();

      // Continuous subtle pulse on primary buttons
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.025,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 500,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, pulseAnim]);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(style);
      }
    } catch {}
  };

  // Format card number with spaces (#### #### #### ####)
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  // Format expiry (MM/YY)
  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  // Format CVV (max 3 digits)
  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 3);
    setCvv(cleaned);
  };

  // Quick auto-fill for content creator takes
  const handleAutoFillDemoCard = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setCardNumber('5399 4120 8831 9024');
    setCardHolder('CHIDERA OKONKWO');
    setExpiry('11/29');
    setCvv('782');
  };

  // Step navigation
  const handleProceedToCheckout = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setStep('checkout');
  };

  const handleBackToPaywall = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setStep('paywall');
  };

  const handleProcessPayment = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    setStep('processing');
    setProcessingText('Connecting to Central Arithmetic Bank...');

    // If card wasn't filled, fill it with realistic data for the logs
    const displayCardNumber = cardNumber || '5399 4120 8831 9024';
    const last4 = displayCardNumber.replace(/\s/g, '').slice(-4) || '9024';

    setTimeout(() => {
      setProcessingText(`Authorizing Mastercard ending in ••${last4}...`);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    }, 800);

    setTimeout(() => {
      setProcessingText('Bypassing 3D-Secure OTP (urgent arithmetic)...');
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    }, 1700);

    setTimeout(() => {
      setProcessingText(`Debiting ₦999.00 & decrypting "${expression || 'calculation'}"...`);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    }, 2600);

    setTimeout(() => {
      setStep('success');
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      try {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch {}

      Animated.spring(successScale, {
        toValue: 1,
        bounciness: 12,
        speed: 12,
        useNativeDriver: true,
      }).start();
    }, 3500);
  };

  const handleDismissSuccess = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    onSubscribeSuccess(calculatedResult);
  };

  const handleMaybeLaterPress = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    onMaybeLater();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onMaybeLater}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={step === 'paywall' ? handleMaybeLaterPress : undefined}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}>
          <Animated.View
            style={[
              styles.sheetContainer,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}>
            {/* Top Sheet Drag Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* STEP 1: Absurd Paywall Pitch */}
            {step === 'paywall' && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                {/* Pro Badge */}
                <View style={styles.badgeRow}>
                  <View style={styles.proBadge}>
                    <Ionicons name="sparkles" size={14} color="#000000" />
                    <Text style={styles.proBadgeText}>CALCULATOR PRO</Text>
                  </View>
                </View>

                {/* Title & Dramatic Subtitle */}
                <Text style={styles.title}>Unlock Your Answer</Text>
                <Text style={styles.subtitle}>
                  You&apos;ve reached the free calculation limit. Subscribe to Calculator Pro to reveal your result.
                </Text>

                {/* Calculation Preview Teaser */}
                <View style={styles.calculationPreviewCard}>
                  <View style={styles.previewHeader}>
                    <Text style={styles.previewLabel}>PENDING EQUATION</Text>
                    <View style={styles.previewStatusPill}>
                      <Ionicons name="lock-closed" size={11} color="#F59E0B" />
                      <Text style={styles.previewStatusText}>LOCKED</Text>
                    </View>
                  </View>
                  <View style={styles.previewFormulaRow}>
                    <Text style={styles.previewExpression}>
                      {expression || '2 + 2'} =
                    </Text>
                    <View style={styles.blurredAnswerBox}>
                      <Text style={styles.blurredAnswerText}>???</Text>
                      <Text style={styles.unlockTag}>Pro Only</Text>
                    </View>
                  </View>
                </View>

                {/* Pricing Card */}
                <View style={styles.pricingCard}>
                  <View style={styles.pricingHeader}>
                    <View>
                      <Text style={styles.planName}>Calculator Pro</Text>
                      <Text style={styles.planBilling}>Billed monthly • Cancel anytime</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceAmount}>₦999</Text>
                      <Text style={styles.pricePeriod}>/month</Text>
                    </View>
                  </View>

                  <View style={styles.savingsTag}>
                    <Text style={styles.savingsTagText}>🔥 7-DAY FREE TRIAL INCLUDED</Text>
                  </View>

                  {/* Benefits List */}
                  <View style={styles.benefitsList}>
                    <View style={styles.benefitItem}>
                      <View style={styles.benefitIconWrap}>
                        <Ionicons name="infinite" size={16} color="#FBBF24" />
                      </View>
                      <View style={styles.benefitTextWrap}>
                        <Text style={styles.benefitTitle}>Unlimited calculations</Text>
                        <Text style={styles.benefitDesc}>No daily arithmetic quotas or math caps</Text>
                      </View>
                    </View>

                    <View style={styles.benefitItem}>
                      <View style={styles.benefitIconWrap}>
                        <Ionicons name="flash" size={16} color="#FBBF24" />
                      </View>
                      <View style={styles.benefitTextWrap}>
                        <Text style={styles.benefitTitle}>Instant answers</Text>
                        <Text style={styles.benefitDesc}>Zero-latency cloud arithmetic processing</Text>
                      </View>
                    </View>

                    <View style={styles.benefitItem}>
                      <View style={styles.benefitIconWrap}>
                        <MaterialCommunityIcons name="math-compass" size={16} color="#FBBF24" />
                      </View>
                      <View style={styles.benefitTextWrap}>
                        <Text style={styles.benefitTitle}>Advanced mathematics</Text>
                        <Text style={styles.benefitDesc}>Full access to Division (÷) & negative numbers</Text>
                      </View>
                    </View>

                    <View style={styles.benefitItem}>
                      <View style={styles.benefitIconWrap}>
                        <Ionicons name="shield-checkmark" size={16} color="#FBBF24" />
                      </View>
                      <View style={styles.benefitTextWrap}>
                        <Text style={styles.benefitTitle}>Ad-free experience</Text>
                        <Text style={styles.benefitDesc}>No 30-second unskippable ads before showing totals</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Primary CTA: Move to Card Checkout */}
                <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleProceedToCheckout}
                    style={({ pressed }) => [
                      styles.subscribeButton,
                      pressed && styles.subscribeButtonPressed,
                    ]}>
                    <Text style={styles.subscribeButtonText}>Subscribe to Unlock Answer</Text>
                    <Ionicons name="arrow-forward" size={18} color="#000000" />
                  </Pressable>
                </Animated.View>

                {/* Secondary Option: Maybe later */}
                <Pressable
                  accessibilityRole="button"
                  onPress={handleMaybeLaterPress}
                  style={({ pressed }) => [
                    styles.maybeLaterButton,
                    pressed && { opacity: 0.6 },
                  ]}>
                  <Text style={styles.maybeLaterText}>Maybe later</Text>
                </Pressable>

                <Text style={styles.legalDisclaimer}>
                  Renews automatically at ₦999/month. Calculations not guaranteed to be legally binding. No refunds for simple addition.
                </Text>
              </ScrollView>
            )}

            {/* STEP 2: Realistic Mock Card Checkout */}
            {step === 'checkout' && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                {/* Checkout Navigation Bar */}
                <View style={styles.checkoutNav}>
                  <Pressable
                    onPress={handleBackToPaywall}
                    style={styles.backButton}>
                    <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                    <Text style={styles.backButtonText}>Plan</Text>
                  </Pressable>
                  <Text style={styles.checkoutNavTitle}>Add Payment Method</Text>
                  <Pressable
                    onPress={handleAutoFillDemoCard}
                    style={styles.quickFillButton}>
                    <Ionicons name="flash" size={12} color="#000000" />
                    <Text style={styles.quickFillText}>Demo</Text>
                  </Pressable>
                </View>

                {/* Interactive Virtual Credit Card Graphic */}
                <View style={styles.creditCardPreview}>
                  <View style={styles.cardHeader}>
                    <View style={styles.chipGraphic} />
                    <Ionicons name="wifi" size={18} color="#D4D4D8" style={{ transform: [{ rotate: '90deg' }] }} />
                  </View>

                  <Text style={styles.cardPreviewNumber}>
                    {cardNumber || '•••• •••• •••• ••••'}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardLabel}>CARDHOLDER</Text>
                      <Text numberOfLines={1} style={styles.cardPreviewHolder}>
                        {cardHolder.toUpperCase() || 'YOUR NAME'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginLeft: 16 }}>
                      <Text style={styles.cardLabel}>EXPIRES</Text>
                      <Text style={styles.cardPreviewExpiry}>
                        {expiry || 'MM/YY'}
                      </Text>
                    </View>
                    <View style={styles.mastercardBadge}>
                      <View style={[styles.cardCircle, { backgroundColor: '#EB001B' }]} />
                      <View style={[styles.cardCircle, { backgroundColor: '#F79E1B', marginLeft: -10 }]} />
                    </View>
                  </View>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                  {/* Card Number Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>CARD NUMBER</Text>
                    <View style={styles.inputWrap}>
                      <Ionicons name="card-outline" size={18} color="#9CA3AF" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="5399 4120 8831 9024"
                        placeholderTextColor="#52525B"
                        keyboardType="numeric"
                        value={cardNumber}
                        onChangeText={handleCardNumberChange}
                        maxLength={19}
                      />
                    </View>
                  </View>

                  {/* Cardholder Name Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>CARDHOLDER NAME</Text>
                    <View style={styles.inputWrap}>
                      <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Chidera Okonkwo"
                        placeholderTextColor="#52525B"
                        autoCapitalize="words"
                        value={cardHolder}
                        onChangeText={setCardHolder}
                      />
                    </View>
                  </View>

                  {/* Row: Expiry and CVV */}
                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>EXPIRY DATE</Text>
                      <View style={styles.inputWrap}>
                        <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
                        <TextInput
                          style={styles.textInput}
                          placeholder="MM/YY"
                          placeholderTextColor="#52525B"
                          keyboardType="numeric"
                          value={expiry}
                          onChangeText={handleExpiryChange}
                          maxLength={5}
                        />
                      </View>
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>CVV / CVC</Text>
                      <View style={styles.inputWrap}>
                        <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
                        <TextInput
                          style={styles.textInput}
                          placeholder="882"
                          placeholderTextColor="#52525B"
                          keyboardType="numeric"
                          secureTextEntry
                          value={cvv}
                          onChangeText={handleCvvChange}
                          maxLength={3}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Comedic Terms Agreement */}
                  <Pressable
                    onPress={() => setAgreedTerms(!agreedTerms)}
                    style={styles.agreementRow}>
                    <Ionicons
                      name={agreedTerms ? 'checkbox' : 'square-outline'}
                      size={18}
                      color={agreedTerms ? '#FBBF24' : '#71717A'}
                    />
                    <Text style={styles.agreementText}>
                      I authorize a monthly charge of ₦999.00 to decrypt {expression || 'this calculation'}.
                    </Text>
                  </Pressable>
                </View>

                {/* Final Pay Button */}
                <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%', marginTop: 8 }}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleProcessPayment}
                    style={({ pressed }) => [
                      styles.subscribeButton,
                      pressed && styles.subscribeButtonPressed,
                    ]}>
                    <Ionicons name="lock-closed" size={16} color="#000000" />
                    <Text style={styles.subscribeButtonText}>Pay ₦999 & Reveal Answer</Text>
                  </Pressable>
                </Animated.View>

                {/* Bank Security Badges */}
                <View style={styles.securityRow}>
                  <View style={styles.securityBadgeItem}>
                    <Ionicons name="shield-checkmark" size={13} color="#10B981" />
                    <Text style={styles.securityBadgeText}>256-Bit SSL</Text>
                  </View>
                  <View style={styles.securityBadgeItem}>
                    <Ionicons name="card" size={13} color="#9CA3AF" />
                    <Text style={styles.securityBadgeText}>Verified by Visa</Text>
                  </View>
                  <View style={styles.securityBadgeItem}>
                    <Ionicons name="lock-closed" size={13} color="#9CA3AF" />
                    <Text style={styles.securityBadgeText}>MathPay™ Secure</Text>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* STEP 3: Bank Processing State */}
            {step === 'processing' && (
              <View style={styles.processingContainer}>
                <View style={styles.spinnerWrapper}>
                  <ActivityIndicator size="large" color="#FF9F0A" />
                </View>
                <Text style={styles.processingTitle}>Authorizing Card</Text>
                <Text style={styles.processingSubtext}>{processingText}</Text>
                <View style={styles.securityBadge}>
                  <Ionicons name="lock-closed" size={13} color="#9CA3AF" />
                  <Text style={styles.securityText}>Direct Bank Authorization</Text>
                </View>
              </View>
            )}

            {/* STEP 4: Success & The Grand Reveal */}
            {step === 'success' && (
              <Animated.View
                style={[
                  styles.successContainer,
                  { transform: [{ scale: successScale }] },
                ]}>
                <ConfettiOverlay />

                <View style={styles.successIconWrapper}>
                  <Ionicons name="checkmark-circle" size={72} color="#10B981" />
                </View>

                <Text style={styles.successTitle}>Subscription successful!</Text>
                <Text style={styles.successSubtext}>
                  Payment approved! Your calculation is unlocked:
                </Text>

                {/* The Grand Answer Card */}
                <View style={styles.answerRevealCard}>
                  <Text style={styles.answerEquation}>{expression} =</Text>
                  <Text style={styles.answerNumber}>{calculatedResult}</Text>
                  <View style={styles.verifiedTag}>
                    <Ionicons name="checkmark-done" size={14} color="#10B981" />
                    <Text style={styles.verifiedTagText}>Calculated with Calculator Pro</Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleDismissSuccess}
                  style={({ pressed }) => [
                    styles.continueButton,
                    pressed && { opacity: 0.85 },
                  ]}>
                  <Text style={styles.continueButtonText}>Continue Calculating</Text>
                </Pressable>

                <Text style={styles.successFooter}>
                  Receipt sent to your bank. Enjoy unlimited arithmetic!
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: CalculatorColors.overlayBackground,
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: CalculatorColors.proCardBackground,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: CalculatorColors.proCardBorder,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '94%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: CalculatorColors.sheetHandle,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  badgeRow: {
    marginBottom: 8,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CalculatorColors.proGold,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.8,
    fontFamily: Typography.fontFamily,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: Typography.fontFamily,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    fontFamily: Typography.fontFamily,
    marginBottom: 16,
  },
  calculationPreviewCard: {
    width: '100%',
    backgroundColor: '#0D0D10',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#26262E',
    padding: 14,
    marginBottom: 14,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 0.6,
  },
  previewStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  previewStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  previewFormulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewExpression: {
    fontSize: 19,
    fontWeight: '600',
    color: '#E4E4E7',
    fontFamily: Typography.fontFamily,
  },
  blurredAnswerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1E24',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#F59E0B',
  },
  blurredAnswerText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 2,
  },
  unlockTag: {
    fontSize: 11,
    color: '#FBBF24',
    fontWeight: '600',
  },
  pricingCard: {
    width: '100%',
    backgroundColor: '#1B1B22',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    padding: 16,
    marginBottom: 16,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Typography.fontFamily,
  },
  planBilling: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 2,
    fontFamily: Typography.fontFamily,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FBBF24',
    fontFamily: Typography.fontFamily,
  },
  pricePeriod: {
    fontSize: 12,
    color: '#D4D4D8',
    marginLeft: 2,
    fontFamily: Typography.fontFamily,
  },
  savingsTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  savingsTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FBBF24',
    letterSpacing: 0.5,
  },
  benefitsList: {
    gap: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  benefitIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  benefitTextWrap: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Typography.fontFamily,
  },
  benefitDesc: {
    fontSize: 11,
    color: '#82828C',
    marginTop: 1,
    fontFamily: Typography.fontFamily,
  },
  subscribeButton: {
    width: '100%',
    backgroundColor: CalculatorColors.proGold,
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  subscribeButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  subscribeButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Typography.fontFamily,
  },
  maybeLaterButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maybeLaterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A1A1AA',
    fontFamily: Typography.fontFamily,
  },
  legalDisclaimer: {
    fontSize: 10,
    color: '#52525B',
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 2,
    fontFamily: Typography.fontFamily,
  },

  // Checkout Styles
  checkoutNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 2,
  },
  checkoutNavTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  quickFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quickFillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  creditCardPreview: {
    width: '100%',
    height: 150,
    backgroundColor: '#1E1E26',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3F3F4E',
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipGraphic: {
    width: 32,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#D97706',
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  cardPreviewNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: Typography.fontFamily,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 0.8,
  },
  cardPreviewHolder: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E4E4E7',
    marginTop: 2,
    fontFamily: Typography.fontFamily,
  },
  cardPreviewExpiry: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E4E4E7',
    marginTop: 2,
    fontFamily: Typography.fontFamily,
  },
  mastercardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  cardCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.9,
  },
  formContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 10,
  },
  inputGroup: {
    gap: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A1A1AA',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111116',
    borderWidth: 1,
    borderColor: '#2E2E3A',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  agreementText: {
    fontSize: 11,
    color: '#9CA3AF',
    flex: 1,
    lineHeight: 15,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  securityBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityBadgeText: {
    fontSize: 10,
    color: '#71717A',
    fontWeight: '500',
  },

  // Processing & Success
  processingContainer: {
    paddingVertical: 45,
    alignItems: 'center',
  },
  spinnerWrapper: {
    marginBottom: 20,
    transform: [{ scale: 1.3 }],
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: Typography.fontFamily,
  },
  processingSubtext: {
    fontSize: 13,
    color: '#FBBF24',
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: Typography.fontFamily,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1E24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  securityText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: Typography.fontFamily,
  },
  successContainer: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  successIconWrapper: {
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Typography.fontFamily,
    marginBottom: 6,
  },
  successSubtext: {
    fontSize: 13,
    color: '#A1A1AA',
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
    marginBottom: 18,
  },
  answerRevealCard: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#10B981',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  answerEquation: {
    fontSize: 15,
    color: '#9CA3AF',
    fontFamily: Typography.fontFamily,
    marginBottom: 4,
  },
  answerNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: -1,
    fontFamily: Typography.fontFamily,
    marginVertical: 4,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Typography.fontFamily,
  },
  successFooter: {
    fontSize: 11,
    color: '#71717A',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: Typography.fontFamily,
  },
});
