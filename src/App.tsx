import 'react-native-gesture-handler';
import React from 'react';
import { Platform, View, Text, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AuthProvider } from '@/context/AuthContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import RootNavigator from '@/navigation';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fef8ec', padding: 24 }}>
          <Text style={{ color: '#3d2f1f', fontSize: 20, fontWeight: 'bold', marginTop: 60 }}>
            Something went wrong
          </Text>
          <Text style={{ color: '#5c4a38', fontSize: 14, marginTop: 16, fontFamily: 'monospace' }}>
            {err.message}
          </Text>
          <Text style={{ color: '#9e8c7a', fontSize: 12, marginTop: 12, fontFamily: 'monospace' }}>
            {err.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

function useLoadFonts() {
  const [loaded, setLoaded] = useState(Platform.OS === 'web'); // web uses CSS, skip loading

  useEffect(() => {
    if (Platform.OS === 'web') return;
    Font.loadAsync({
      'Outfit': Outfit_400Regular,
      'Outfit_400Regular': Outfit_400Regular,
      'Outfit_500Medium': Outfit_500Medium,
      'Outfit_600SemiBold': Outfit_600SemiBold,
      'Outfit_700Bold': Outfit_700Bold,
      'Outfit_800ExtraBold': Outfit_800ExtraBold,
      'Outfit_900Black': Outfit_900Black,
      'Plus Jakarta Sans': PlusJakartaSans_400Regular,
      'PlusJakartaSans_400Regular': PlusJakartaSans_400Regular,
      'PlusJakartaSans_500Medium': PlusJakartaSans_500Medium,
      'PlusJakartaSans_600SemiBold': PlusJakartaSans_600SemiBold,
      'PlusJakartaSans_700Bold': PlusJakartaSans_700Bold,
      'PlusJakartaSans_800ExtraBold': PlusJakartaSans_800ExtraBold,
    }).then(() => setLoaded(true)).catch(() => setLoaded(true));
  }, []);

  return loaded;
}

// Inject Google Fonts for web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(link);
}

export default function App() {
  const fontsLoaded = useLoadFonts();

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#fef8ec' }} />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <OnboardingProvider>
                <RootNavigator />
                <StatusBar style="dark" />
              </OnboardingProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
