import { useCallback, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Alert, InteractionManager, Platform, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';

/**
 * Captures a 9:16 view ref and opens the system share sheet (image).
 */
export function useShareVerdictImage() {
  const [sharing, setSharing] = useState(false);
  const shareInFlight = useRef(false);

  const share = useCallback(async (viewRef: RefObject<View | null>) => {
    if (Platform.OS === 'web') {
      Alert.alert('Sharing', 'Image sharing is available in the iOS and Android apps.');
      return;
    }
    if (shareInFlight.current) return;
    const node = viewRef.current;
    if (!node) {
      Alert.alert('Share', 'Content is not ready yet. Try again in a second.');
      return;
    }
    shareInFlight.current = true;
    setSharing(true);
    try {
      await new Promise<void>((resolve) => {
        InteractionManager.runAfterInteractions(() => resolve());
      });
      const uri = await captureRef(node, {
        format: 'png',
        quality: 0.92,
        result: 'tmpfile',
      });
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Share unavailable', 'Sharing is not available on this device.');
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      await Sharing.shareAsync(uri, {
        UTI: 'public.png',
        mimeType: 'image/png',
        dialogTitle: 'Share your verdict',
      });
    } catch (e) {
      if (__DEV__) console.warn('[useShareVerdictImage]', e);
      Alert.alert('Could not share', 'Please try again in a moment.');
    } finally {
      shareInFlight.current = false;
      setSharing(false);
    }
  }, []);

  return { share, sharing };
}
