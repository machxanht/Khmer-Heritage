import AppTabs from '@/components/app-tabs';

/**
 * Tab group layout — the actual tab bar lives in @/components/app-tabs so the
 * native (NativeTabs) and web (custom Tabs UI) variants stay platform-split.
 */
export default function TabsLayout() {
  return <AppTabs />;
}
