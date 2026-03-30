import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PortraitRow from './PortraitRow';
import { colors } from '../theme';

export default function PaywallModal({ visible, onClose, onPurchase, offerings }) {
  const [purchasing, setPurchasing] = useState(false);

  const monthlyPackage = offerings?.availablePackages?.find(
    (p) => p.packageType === 'MONTHLY'
  );
  const annualPackage = offerings?.availablePackages?.find(
    (p) => p.packageType === 'ANNUAL'
  );

  const handlePurchase = async (pkg) => {
    if (!pkg || !onPurchase) return;
    setPurchasing(true);
    await onPurchase(pkg);
    setPurchasing(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <PortraitRow size={44} overlap={12} style={{ marginBottom: 20 }} />

          <Text style={styles.title}>Unlock the full council.</Text>
          <Text style={styles.subtitle}>
            All seven aunties. Unlimited check-ins. Your full routine history.
          </Text>

          <View style={styles.featureList}>
            {[
              'All 7 aunties fully active',
              'Unlimited check-ins',
              'Unlimited photo uploads',
              'Progress comparison photos',
              'Seasonal routine updates',
              'Full product shelf',
            ].map((f) => (
              <View key={f} style={styles.featureRow}>
                <View style={styles.featureDot} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => handlePurchase(monthlyPackage)}
            activeOpacity={0.8}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.ctaText}>
                Unlock Aunty Premium
                {monthlyPackage ? ` · ${monthlyPackage.product.priceString}/mo` : ' · $6.99/mo'}
              </Text>
            )}
          </TouchableOpacity>

          {annualPackage && (
            <TouchableOpacity
              style={styles.annualButton}
              onPress={() => handlePurchase(annualPackage)}
              activeOpacity={0.7}
            >
              <Text style={styles.annualText}>
                Annual · {annualPackage.product.priceString}/year — best value
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.dismissButton} onPress={onClose} activeOpacity={0.6}>
            <Text style={styles.dismissText}>Not right now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(131, 24, 67, 0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 44,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    maxWidth: 300,
  },
  featureList: {
    width: '100%',
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  featureText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: colors.text,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: colors.white,
    fontWeight: '600',
  },
  annualButton: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  annualText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  dismissButton: {
    paddingVertical: 10,
  },
  dismissText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
