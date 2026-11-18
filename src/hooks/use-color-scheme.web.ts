
import { useSyncExternalStore } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

const subscribe = () => () => {};

export function useColorScheme() {
  const colorScheme = useRNColorScheme();

  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return isHydrated ? colorScheme : "light";
}
