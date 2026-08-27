/**
 * Entry detail (master §10): cover → summary → structured sections → sources →
 * license/credits → related. Missing media degrade to placeholders.
 */
import { Link, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EntryCard } from '@/components/entry-card';
import { SectionRenderer } from '@/components/content-blocks';
import { EmptyView, ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content-context';
import { useLanguage } from '@/lib/language-context';
import { useResource } from '@/lib/use-resource';
import type { EntryValue } from '@kh/content-schema';
import { resolveLocalized } from '@kh/content-schema';

interface EntryData {
  entry: EntryValue | null;
  coverUri: string | null;
}

export default function EntryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { client } = useContent();
  const { t, contentLang } = useLanguage();

  const page = useResource<EntryData | null>(async () => {
    if (!slug) return null;
    const entry = await client.getEntry(String(slug), contentLang, { staleOk: true });
    if (!entry) return { entry: null, coverUri: null };
    const coverUri = entry.coverAssetId
      ? await client.resolveAsset(entry.coverAssetId, { staleOk: true })
      : null;
    return { entry, coverUri };
  }, [client, contentLang, slug]);

  if (page.loading) return <LoadingView />;
  if (page.error) return <ErrorView message={page.error} onRetry={page.reload} />;
  if (!page.data || !page.data.entry) return <EmptyView title={t('state.notFound')} />;

  const { entry, coverUri } = page.data;

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset }]}>
          <EntryCard
            variant="hero"
            title={resolveLocalized(entry.title, contentLang) ?? entry.slug}
            subtitle={resolveLocalized(entry.summary, contentLang)}
            imageUri={coverUri}
            onPress={() => {}}
          />

          {entry.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}

          {entry.sources.length > 0 && (
            <View style={styles.block}>
              <ThemedText type="subtitle">{t('detail.sources')}</ThemedText>
              {entry.sources.map((src) => (
                <ThemedView key={src.id} type="backgroundElement" style={styles.sourceRow}>
                  <ThemedText type="smallBold">{src.publisher}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {src.title} · {src.dateAccessed}
                  </ThemedText>
                </ThemedView>
              ))}
            </View>
          )}

          <View style={styles.block}>
            <ThemedText type="subtitle">{t('detail.license')}</ThemedText>
            <ThemedView type="backgroundElement" style={styles.sourceRow}>
              <ThemedText type="code">{entry.license.code}</ThemedText>
              {entry.license.attribution && (
                <ThemedText type="small" themeColor="textSecondary">
                  {resolveLocalized(entry.license.attribution, contentLang)}
                </ThemedText>
              )}
            </ThemedView>
          </View>

          {entry.related.length > 0 && (
            <RelatedBlock entryIds={entry.related.map((r) => r.entryId)} />
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );

  function RelatedBlock({ entryIds }: { entryIds: string[] }) {
    const related = useResource(
      () =>
        Promise.all(entryIds.map((id) => client.getEntry(id, contentLang, { staleOk: true }))),
      [client, contentLang, entryIds.join('|')],
    );
    const items = (related.data ?? []).filter((e): e is EntryValue => e !== null);
    if (items.length === 0) return null;
    return (
      <View style={styles.block}>
        <ThemedText type="subtitle">{t('detail.related')}</ThemedText>
        <View style={styles.stack}>
          {items.map((rel) => (
            <Link
              key={rel.id}
              href={{ pathname: '/entry/[slug]', params: { slug: rel.slug } }}
              asChild>
              <EntryCard
                variant="row"
                title={resolveLocalized(rel.title, contentLang) ?? rel.slug}
                imageUri={null}
                onPress={() => {}}
              />
            </Link>
          ))}
        </View>
      </View>
    );
  }
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
  block: { gap: Spacing.two },
  stack: { gap: Spacing.two },
  sourceRow: { borderRadius: Spacing.two, padding: Spacing.three, gap: Spacing.half },
});
