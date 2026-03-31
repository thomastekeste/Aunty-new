import React, { createContext, useContext, useEffect, useState } from 'react';
import { rcService } from '@/services/revenueCat';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  isActive: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  restore: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  // All features unlocked by default — billing gates will be re-wired later
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // RevenueCat init commented out until billing is enabled
    // if (user) {
    //   rcService.init(user.id)
    //     .then(() => refresh())
    //     .catch(() => setIsLoading(false));
    // } else {
    //   setIsActive(false);
    //   setIsLoading(false);
    // }
  }, [user?.id]);

  const refresh = async () => {
    try {
      setIsLoading(true);
      const active = await rcService.isActive();
      setIsActive(active);
    } catch {
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const restore = async (): Promise<boolean> => {
    const active = await rcService.restore();
    setIsActive(active);
    return active;
  };

  return (
    <SubscriptionContext.Provider value={{ isActive, isLoading, refresh, restore }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return ctx;
}
