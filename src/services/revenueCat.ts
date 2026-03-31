import { Platform } from 'react-native';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY!;

// react-native-purchases does not support web — stub all methods on web
export const rcService = {
  init: async (userId: string) => {
    if (Platform.OS === 'web') return;
    const Purchases = (await import('react-native-purchases')).default;
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
  },

  isActive: async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    try {
      const Purchases = (await import('react-native-purchases')).default;
      const info = await Purchases.getCustomerInfo();
      return Object.keys(info.activeSubscriptions).length > 0;
    } catch {
      return false;
    }
  },

  getOfferings: async () => {
    if (Platform.OS === 'web') return [];
    const Purchases = (await import('react-native-purchases')).default;
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  },

  purchase: async (pkg: any): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    try {
      const Purchases = (await import('react-native-purchases')).default;
      const result = await Purchases.purchasePackage(pkg);
      return Object.keys(result.customerInfo.activeSubscriptions).length > 0;
    } catch (e: any) {
      if (e.userCancelled) return false;
      throw e;
    }
  },

  restore: async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    const Purchases = (await import('react-native-purchases')).default;
    const info = await Purchases.restorePurchases();
    return Object.keys(info.activeSubscriptions).length > 0;
  },
};
