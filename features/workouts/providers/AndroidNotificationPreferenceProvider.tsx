import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "@gymlog/settings/androidWorkoutNotification";

type AndroidNotificationPreferenceContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
};

const AndroidNotificationPreferenceContext = createContext<
  AndroidNotificationPreferenceContextValue | undefined
>(undefined);

export function AndroidNotificationPreferenceProvider({ children }: PropsWithChildren) {
  const [enabled, setEnabledState] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && saved !== null) {
          setEnabledState(saved === "true");
        }
      } catch {
        // Keep default on read failure.
      } finally {
        if (mounted) {
          setHydrated(true);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, String(enabled)).catch(() => {
      // Ignore storage write errors.
    });
  }, [enabled, hydrated]);

  const value = useMemo(
    () => ({
      enabled,
      setEnabled: (value: boolean) => setEnabledState(value),
    }),
    [enabled],
  );

  return (
    <AndroidNotificationPreferenceContext.Provider value={value}>
      {children}
    </AndroidNotificationPreferenceContext.Provider>
  );
}

export function useAndroidNotificationPreference(): AndroidNotificationPreferenceContextValue {
  const context = useContext(AndroidNotificationPreferenceContext);

  if (!context) {
    return { enabled: true, setEnabled: () => {} };
  }

  return context;
}
