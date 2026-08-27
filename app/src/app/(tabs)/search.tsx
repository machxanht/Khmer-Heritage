/** Search tab (MVP): manifest-driven title/slug/category/tag search. */
import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyView, ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content-context';
import { useLanguage } from '@/lib/language-context';
import { useResource } from '@/lib/use-resource';
import type { ManifestItemValue } from '@kh/content-schema';
import { resolveLocalized } from '@kh/content-schema';

export default function SearchScreen() {
  const { client } = useContent();
  const { t, contentLang } = useLanguage();
  const [query, setQuery] = useState('');
  const search = useResource<ManifestItemValue[] | null>(
    () => (query.trim() ? client.searchEntries(query, contentLang) : Promise.resolve(null)),
    [client, contentLang, query],
  );

  const showResults = query.trim().length > 0;

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset }]}>
          <ThemedText type="title">{t('tab.search')}</ThemedText>
          <ThemedView type="backgroundElement" style={styles.fieldBox}>
            <TextInput
              accessibilityLabel={t('search.placeholder')}
              placeholder={t('search.placeholder')}
              placeholderTextColor="#8a8a8a"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              style={styles.input}
            />
          </ThemedView>

          {!showResults && <HintText text={t('state.searchHint')} />}

          {showResults && search.loading && <LoadingView />}
          {showResults && !search.loading && search.error && (
            <ErrorView message={search.error} onRetry={search.reload} />
          )}
          {showResults && !search.loading && !search.error && search.data && (
            <>
              <View style={styles.stack}>
                {search.data.map((hit) => (
                  <Link
                    key={hit.id}
                    href={{ pathname: '/entry/[slug]', params: { slug: hit.slug } }}
                    asChild>
                    <Pressable style={({ pressed }) => pressed && styles.pressed}>
                      <ThemedView type="backgroundElement" style={styles.row}>
                        <ThemedText numberOfLines={1}>
                          {resolveLocalized(hit.title, contentLang) ?? hit.slug}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                          {hit.categoryId}
                        </ThemedText>
                      </ThemedView>
                    </Pressable>
                  </Link>
                ))}
                {search.data.length === 0 && <EmptyView title={t('state.emptySearch')} />}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function HintText({ text }: { text: string }) {
  return (
    <ThemedText themeColor="textSecondary" style={styles.hint}>
      {text}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  fieldBox: { borderRadius: 999, paddingHorizontal: Spacing.four, paddingVertical: Spacing.one },
  input: { height: 44, fontSize: 16 },
  stack: { gap: Spacing.two },
  row: { borderRadius: Spacing.two, padding: Spacing.three, gap: Spacing.half },
  hint: { textAlign: 'center', marginTop: Spacing.six },
  pressed: { opacity: 0.8 },
});
