import { useState, useEffect, useCallback } from 'react';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';

const ENTITLEMENTS = {
  PREMIUM: 'premium',
};

export const SUBSCRIPTION_LIMITS = {
  free: {
    maxPhotos: 3,
    maxCheckins: 4,
    maxAunties: 4,
    maxProducts: 3,
    progressComparison: false,
    seasonalUpdates: false,
  },
  premium: {
    maxPhotos: Infinity,
    maxCheckins: Infinity,
    maxAunties: 7,
    maxProducts: Infinity,
    progressComparison: true,
    seasonalUpdates: true,
  },
};

export function useSubscription() {
  const [tier, setTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState(null);

  useEffect(() => {
    initializePurchases();
  }, []);

  async function initializePurchases() {
    try {
      if (Platform.OS !== 'web') {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        await checkEntitlements();
        const offered = await Purchases.getOfferings();
        setOfferings(offered.current);
      }
    } catch (err) {
      console.warn('RevenueCat init error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function checkEntitlements() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const hasPremium = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM];
      setTier(hasPremium ? 'premium' : 'free');
    } catch (err) {
      console.warn('Entitlement check error:', err.message);
      setTier('free');
    }
  }

  const purchasePremium = useCallback(async (packageToBuy) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
      const hasPremium = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM];
      setTier(hasPremium ? 'premium' : 'free');
      return true;
    } catch (err) {
      if (!err.userCancelled) console.error('Purchase error:', err.message);
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasPremium = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM];
      setTier(hasPremium ? 'premium' : 'free');
      return hasPremium;
    } catch (err) {
      console.error('Restore error:', err.message);
      return false;
    }
  }, []);

  const isPremium = tier === 'premium';
  const limits = SUBSCRIPTION_LIMITS[tier];

  return {
    tier,
    isPremium,
    limits,
    loading,
    offerings,
    purchasePremium,
    restorePurchases,
    checkEntitlements,
  };
}
