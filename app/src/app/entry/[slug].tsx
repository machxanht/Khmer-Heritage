/**
 * Entry detail (master §10): cover → summary → structured sections → sources →
 * license/credits → related. Missing media degrade to placeholders.
 */
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { EntryCard } from '@/components/entry-card';
import { SectionRenderer } from '@/components/content-blocks';
import { EmptyView, ErrorView, LoadingView } from '@/components/states';
import { SeoHead } from '@/components/seo-head';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content-context';
import { useLanguage } from '@/lib/language-context';
import { useResource } from '@/lib/use-resource';
import type { EntryValue } from '@kh/content-schema';
import { resolveLocalized } from '@kh/content-schema';
import seedManifest from '../../../../content-seed/content/manifest.json';

/**
 * Static prerender params for web export (SEO): every entry slug in the
 * content manifest gets its own URL (/entry/<slug>) with real HTML output.
 */
export function generateStaticParams(): { slug: string }[] {
  return seedManifest.entries.map((item) => ({ slug: item.slug }));
}

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
      <SeoHead
        title={`${resolveLocalized(entry.title, contentLang) ?? entry.slug} — Khmer Heritage`}
        description={
          resolveLocalized(entry.summary, contentLang) ?? 'Khmer heritage encyclopedia'
        }
      />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset }]}>
          <EntryCard
            variant="hero"
            title={resolveLocalized(entry.title, contentLang) ?? entry.slug}
            subtitle={resolveLocalized(entry.summary, contentLang)}
            imageUri={coverUri}
            onPress={() => {}}
          />

          <ThemedText type="small" themeColor="textSecondary">
            {t('detail.updated', { date: formatDate(entry.updatedAt, contentLang) })}
          </ThemedText>

          {entry.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}

          {entry.sources.length > 0 && (
            <View style={styles.block}>
              <ThemedText type="subtitle">{t('detail.sources')}</ThemedText>
              {entry.sources.map((src) => {
                const row = (
                  <ThemedView type="backgroundElement" style={styles.sourceRow}>
                    <ThemedText type="smallBold">{src.publisher}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {src.title} · {src.dateAccessed}
                    </ThemedText>
                    {src.url && (
                      <ThemedText type="linkPrimary">{t('detail.visitSource')}</ThemedText>
                    )}
                  </ThemedView>
                );
                return src.url ? (
                  <ExternalLink key={src.id} href={asExternal(src.url)} asChild>
                    <Pressable style={({ pressed }) => pressed && styles.pressed}>{row}</Pressable>
                  </ExternalLink>
                ) : (
                  <View key={src.id}>{row}</View>
                );
              })}
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
              {entry.license.licenseUrl && (
                <ExternalLink href={asExternal(entry.license.licenseUrl)} asChild>
                  <Pressable style={({ pressed }) => pressed && styles.pressed}>
                    <ThemedText type="linkPrimary">{t('detail.viewLicense')}</ThemedText>
                  </Pressable>
                </ExternalLink>
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
    const related = useResource(async () => {
      const entries = await Promise.all(
        entryIds.map((id) => client.getEntry(id, contentLang, { staleOk: true })),
      );
      // Resolve each related entry's cover so the rail shows real thumbnails
      // once media lands (Phase 2); placeholders remain the graceful fallback.
      return Promise.all(
        entries.map(async (entry) => ({
          entry,
          imageUri:
            entry?.coverAssetId != null
              ? await client.resolveAsset(entry.coverAssetId, { staleOk: true })
              : null,
        })),
      );
    }, [client, contentLang, entryIds.join('|')]);
    const items = (related.data ?? []).filter(
      (item): item is { entry: EntryValue; imageUri: string | null } => item.entry !== null,
    );
    if (items.length === 0) return null;
    return (
      <View style={styles.block}>
        <ThemedText type="subtitle">{t('detail.related')}</ThemedText>
        <View style={styles.stack}>
          {items.map(({ entry: rel, imageUri }) => (
            <Link
              key={rel.id}
              href={{ pathname: '/entry/[slug]', params: { slug: rel.slug } }}
              asChild>
              <EntryCard
                variant="row"
                title={resolveLocalized(rel.title, contentLang) ?? rel.slug}
                subtitle={resolveLocalized(rel.summary, contentLang)}
                imageUri={imageUri}
                onPress={() => {}}
              />
            </Link>
          ))}
        </View>
      </View>
    );
  }
}

/** Casts a dynamic URL to expo-router's typed Href for ExternalLink. */
function asExternal(url: string): Parameters<typeof ExternalLink>[0]['href'] {
  return url as never;
}

/** Formats an ISO date for the meta row; falls back to the raw value. */
function formatDate(iso: string, lang: string): string {
  try {
    return new Intl.DateTimeFormat(lang === 'km' ? 'km-KH' : lang === 'vi' ? 'vi-VN' : 'en-GB', {
      dateStyle: 'medium',
    }).format(new Date(iso));
  } catch {
    return iso;
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
  pressed: { opacity: 0.7 },
});
