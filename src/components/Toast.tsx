import React, { useEffect, useRef, createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, fontWeight, radius, spacing, shadows, elevation } from '@/constants/theme';

type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'aunty';

interface ToastConfig {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  subtitle?: string;
}

const variantStyles: Record<ToastVariant, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: '#E6F9F0', border: '#12C064', text: '#0A6B38', icon: '✓' },
  error:   { bg: '#FFF0F5', border: '#F72585', text: '#A00060', icon: '✕' },
  warning: { bg: '#FFF8E6', border: '#F5A623', text: '#8B5E00', icon: '!' },
  info:    { bg: '#E4F6FD', border: '#00B4D8', text: '#00668A', icon: 'i' },
  aunty:   { bg: '#FDF8E1', border: '#F5C542', text: '#7A5E00', icon: '✦' },
};

function ToastItem({ config, onRemove }: { config: ToastConfig; onRemove: () => void }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(onRemove);
    }, config.duration ?? 3000);

    return () => clearTimeout(timer);
  }, []);

  const v = variantStyles[config.variant ?? 'info'];

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }], backgroundColor: v.bg, borderColor: v.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: `${v.border}25` }]}>
        <Text style={[styles.icon, { color: v.border }]}>{v.icon}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.message, { color: v.text }]}>{config.message}</Text>
        {config.subtitle && <Text style={[styles.subtitle, { color: v.text }]}>{config.subtitle}</Text>}
      </View>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.close, { color: v.text }]}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Context
interface ToastContextType {
  show: (message: string, options?: Omit<ToastConfig, 'id' | 'message'>) => void;
}

const ToastContext = createContext<ToastContextType>({ show: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const insets = useSafeAreaInsets();

  const show = useCallback((message: string, options?: Omit<ToastConfig, 'id' | 'message'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev.slice(-2), { id, message, ...options }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={[styles.container, { top: insets.top + spacing.sm, zIndex: elevation.toast }]}>
        {toasts.map(t => (
          <ToastItem key={t.id} config={t} onRemove={() => remove(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    gap: spacing.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: spacing.sm,
    ...shadows.lg,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 13,
    fontWeight: fontWeight.black,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: fontWeight.bold,
    lineHeight: 18,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: fontWeight.regular,
    opacity: 0.8,
  },
  close: {
    fontSize: 20,
    fontWeight: fontWeight.bold,
    lineHeight: 20,
    opacity: 0.7,
  },
});
