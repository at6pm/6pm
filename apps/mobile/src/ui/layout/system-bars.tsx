import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { systemNav } from '../../../modules/system-nav';

/** Every screen asking for a bar colour, oldest first: the newest one mounted has the bars. */
const asking: { dark: boolean }[] = [];

function apply() {
  const top = asking[asking.length - 1];
  if (top) systemNav?.setLightButtons(top.dark);
}

/**
 * The system bars' ink for the screen under them: light on a dark screen, dark on a light one.
 * The status bar on both platforms, and on Android the navigation bar's buttons, handle and the
 * veil the system lays under three buttons. A screen that mounts one over another's (onboarding
 * and Scan over the look's) hands the bars back when it goes.
 */
export function SystemBars({ dark }: { readonly dark: boolean }) {
  useEffect(() => {
    const entry = { dark };
    asking.push(entry);
    apply();
    return () => {
      asking.splice(asking.indexOf(entry), 1);
      apply();
    };
  }, [dark]);
  return <StatusBar style={dark ? 'light' : 'dark'} animated />;
}
