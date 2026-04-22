import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

type HumidityBand = 'dry' | 'comfortable' | 'humid';

function bandFromRh(rh: number | null | undefined): HumidityBand {
  if (rh == null || Number.isNaN(rh)) return 'comfortable';
  if (rh < 40) return 'dry';
  if (rh > 70) return 'humid';
  return 'comfortable';
}

/**
 * Fetches current outdoor relative humidity (Open-Meteo) using coarse device location.
 */
export function useLocalHumidity() {
  const [percent, setPercent] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const abortController = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=relative_humidity_2m&timezone=auto`;

      timeoutId = setTimeout(() => abortController.abort(), 12_000);
      const res = await fetch(url, { signal: abortController.signal });
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      if (!res.ok) return;

      const json = (await res.json()) as { current?: { relative_humidity_2m?: number } };
      const rh = json.current?.relative_humidity_2m;
      if (typeof rh === 'number' && !Number.isNaN(rh)) {
        setPercent(Math.round(rh));
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      if (__DEV__) console.warn('[useLocalHumidity] fetch failed', e);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const band = bandFromRh(percent);

  return { percent, band, ready, refetch: load };
}

export function getHumidityOneLiner(percent: number | null, band: HumidityBand): string | null {
  if (percent == null) return null;
  if (band === 'humid') {
    return `Air is humid (${percent}%). Seal with oil; skip heavy humectants if hair swells.`;
  }
  if (band === 'dry') {
    return `Air is dry (${percent}%). Add steam or a humectant layer before you seal.`;
  }
  return `Outdoor humidity is moderate (${percent}%) — your usual routine should behave.`;
}
