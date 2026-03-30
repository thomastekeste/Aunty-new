import Purchases from 'react-native-purchases';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY!;

export const rcService = {
  init: async (userId: string) => {
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
  },

  isActive: async (): Promise<boolean> => {
    try {
      const info = await Purchases.getCustomerInfo();
      return Object.keys(info.activeSubscriptions).length > 0;
    } catch {
      return false;
    }
  },

  getOfferings: async () => {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  },

  purchase: async (pkg: any): Promise<boolean> => {
    try {
      const result = await Purchases.purchasePackage(pkg);
      return Object.keys(result.customerInfo.activeSubscriptions).length > 0;
    } catch (e: any) {
      if (e.userCancelled) return false;
      throw e;
    }
  },

  restore: async (): Promise<boolean> => {
    const info = await Purchases.restorePurchases();
    return Object.keys(info.activeSubscriptions).length > 0;
  },
};
