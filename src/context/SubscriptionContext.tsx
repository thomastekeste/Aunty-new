/**
 * SubscriptionContext — RevenueCat-powered subscription management.
 *
 * Subscription-only model: everyone pays, everyone gets everything.
 * No free tier, no feature gating.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';

// ─── Config ────────────────────────────────────────────────────

const RC_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';
const ENTITLEMENT_ID = 'Aunty Pro';

// ─── Types ─────────────────────────────────────────────────────

interface SubscriptionContextValue {
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  currentOffering: PurchasesOffering | null;
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
  const [error, setError] = useState<string | null>(null);

  const isSubscribed = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]?.isActive ?? false;

  // Initialize RevenueCat (skip in Expo Go — native module not available)
  useEffect(() => {
    async function init() {
      if (!RC_API_KEY) {
        console.log('[RevenueCat] No API key — skipping (set EXPO_PUBLIC_REVENUECAT_API_KEY)');
        setIsLoading(false);
        return;
      }

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
        const msg = e.message || String(e);
        console.warn('[RevenueCat] Skipping — likely running in Expo Go:', msg);
        setError(msg);
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

  const value: SubscriptionContextValue = {
    isSubscribed,
    isLoading,
    error,
    currentOffering,
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
