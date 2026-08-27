/** Settings tab: language, content source info, revision + manual refresh. */
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content-context';
import { CONTENT_BASE_URL } from '@/lib/config';
import { useLanguage, type UiLanguage } from '@/lib/language-context';
import { useResource } from '@/lib/use-resource';

const LANG_OPTIONS: Array<{ code: UiLanguage; label: string; enabled: boolean }> = [
  { code: 'km', label: 'ខ្មែរ · Khmer', enabled: true },
  { code: 'en', label: 'English', enabled: true },
  { code: 'vi', label: 'Tiếng Việt', enabled: false },
];

export default function SettingsScreen() {
  const { t, lang, setLang } = useLanguage();
  const { client, refresh } = useContent();
  const [refreshing, setRefreshing] = useState(false);
  const [done, setDone] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    setDone(false);
    try {
      await refresh();
      setDone(true);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset }]}>
          <ThemedText type="title">{t('tab.settings')}</ThemedText>

          <ThemedText type="subtitle" themeColor="textSecondary">
            {t('settings.language')}
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.card}>
            {LANG_OPTIONS.map((opt) => (
              <Pressable
                key={opt.code}
                disabled={!opt.enabled}
                onPress={() => setLang(opt.code)}
                style={({ pressed }) => [
                  styles.langRow,
                  pressed && styles.pressed,
                  !opt.enabled && styles.disabled,
                ]}>
                <ThemedText>{opt.label}</ThemedText>
                <ThemedText themeColor="gold">
                  {lang === opt.code ? '●' : opt.enabled ? '○' : t('settings.viSoon')}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>

          <ThemedText type="subtitle" themeColor="textSecondary">
            {t('settings.about')}
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small">{t('settings.aboutBody')}</ThemedText>
          </ThemedView>

          <ThemedText type="subtitle" themeColor="textSecondary">
            {t('settings.contentSource')}
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="code" themeColor="textSecondary" numberOfLines={1}>
              {CONTENT_BASE_URL}
            </ThemedText>
            <RevisionInfo />
            <Pressable
              accessibilityRole="button"
              onPress={() => void onRefresh()}
              disabled={refreshing}
              style={({ pressed }) => [styles.refreshBtn, pressed && styles.pressed]}>
              <ThemedText themeColor="accent">
                {refreshing ? t('settings.refreshing') : t('settings.refresh')}
              </ThemedText>
            </Pressable>
            {!!done && !refreshing && (
              <ThemedText type="small" themeColor="textSecondary">
                {t('settings.refreshDone')}
              </ThemedText>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function RevisionInfo() {
  const { client } = useContent();
  const { t } = useLanguage();
  const res = useResource(async () => {
    const m = await client.getManifest({ staleOk: true });
    return { revision: m.globalRevision, generatedAt: m.generatedAt };
  }, [client]);
  if (!res.data) return null;
  return (
    <ThemedText type="small" themeColor="textSecondary">
      {`${t('settings.revision')}: ${res.data.revision} · ${t('settings.updated')}: ${res.data.generatedAt.slice(0, 10)}`}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  card: { borderRadius: Spacing.three, padding: Spacing.four, gap: Spacing.three },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  refreshBtn: { alignSelf: 'flex-start' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
});
