/**
 * SubscriptionContext — RevenueCat-powered subscription management.
 *
 * Initializes RevenueCat SDK, checks entitlements, provides
 * purchase functions, and gates features based on "Aunty Pro" entitlement.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Platform } from 'react-native';
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';

// ─── Config ────────────────────────────────────────────────────

const RC_API_KEY = 'appl_test_yrphoAjDJZIVlLnfxntZjumIQFa';
const ENTITLEMENT_ID = 'Aunty Pro';

// ─── Types ─────────────────────────────────────────────────────

type Tier = 'free' | 'premium';

type Feature =
  | 'unlimited_routines'
  | 'unlimited_checkins'
  | 'unlimited_photos'
  | 'full_chat'
  | 'product_recommendations'
  | 'progress_comparison'
  | 'seasonal_updates';

interface SubscriptionContextValue {
  tier: Tier;
  isActive: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  canAccess: (feature: Feature) => boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

// ─── Context ───────────────────────────────────────────────────

const SubscriptionCtx = createContext<SubscriptionContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive tier from entitlements
  const isActive = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]?.isActive ?? false;
  const tier: Tier = isActive ? 'premium' : 'free';

  // Initialize RevenueCat (skip in Expo Go — native module not available)
  useEffect(() => {
    async function init() {
      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        Purchases.configure({ apiKey: RC_API_KEY });

        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);

        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setCurrentOffering(offerings.current);
        }
      } catch (e: any) {
        // Gracefully handle Expo Go (no native store available)
        console.warn('[RevenueCat] Skipping — likely running in Expo Go:', e.message || e);
      } finally {
        setIsLoading(false);
      }
    }

    init();

    try {
      Purchases.addCustomerInfoUpdateListener((info) => {
        setCustomerInfo(info);
      });
    } catch {
      // Ignore in Expo Go
    }
  }, []);

  // Purchase a package
  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      const { customerInfo: info } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(info);
      return info.entitlements.active[ENTITLEMENT_ID]?.isActive ?? false;
    } catch (e: any) {
      if (!e.userCancelled) {
        console.warn('[RevenueCat] Purchase failed:', e);
      }
      return false;
    }
  }, []);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return info.entitlements.active[ENTITLEMENT_ID]?.isActive ?? false;
    } catch (e) {
      console.warn('[RevenueCat] Restore failed:', e);
      return false;
    }
  }, []);

  // Feature gating
  const canAccess = useCallback((feature: Feature): boolean => {
    if (tier === 'premium') return true;
    // Free tier gets nothing gated
    return false;
  }, [tier]);

  const value: SubscriptionContextValue = {
    tier,
    isActive,
    isLoading,
    customerInfo,
    currentOffering,
    canAccess,
    purchasePackage,
    restorePurchases,
  };

  return (
    <SubscriptionCtx.Provider value={value}>
      {children}
    </SubscriptionCtx.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────

export function useSubscription() {
  const ctx = useContext(SubscriptionCtx);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
