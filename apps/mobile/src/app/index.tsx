import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { useDay } from '../data/money-provider';
import { HomeShell } from '../features/home/home-shell';
import { requestHomeTab } from '../features/home/home-tab-request';
import { isHomeTab } from '../features/home/home-tabs';

export default function Home() {
  const day = useDay();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  // A widget's link to a tab reaches Home already open as a new `tab`: turn to it.
  useEffect(() => {
    if (isHomeTab(tab)) requestHomeTab(tab);
  }, [tab]);
  // A phone with no month set up (first launch, or after Delete all data) starts at onboarding.
  if (day === null) return <Redirect href="/onboarding" />;
  return <HomeShell day={day} initialTab={isHomeTab(tab) ? tab : 'today'} />;
}
