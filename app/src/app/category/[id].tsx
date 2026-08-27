/** Category detail: all PUBLISHED entries of one category. */
import { Link, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import enCategories from '../../../../content-seed/content/en/categories.json';
import { EntryCard } from '@/components/entry-card';
import { EmptyView, ErrorView, LoadingView } from '@/components/states';
import { SeoHead } from '@/components/seo-head';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content-context';
import { useLanguage } from '@/lib/language-context';
import { useResource } from '@/lib/use-resource';
import type { ManifestItemValue } from '@kh/content-schema';
import { resolveLocalized } from '@kh/content-schema';

/** Static prerender params for web export (SEO): one URL per category. */
export function generateStaticParams(): { id: string }[] {
  return enCategories.categories.map((cat) => ({ id: cat.id }));
}

interface CategoryEntry extends ManifestItemValue {
  imageUri: string | null;
}

interface CategoryData {
  title: string;
  description: string | null;
  entries: CategoryEntry[];
}

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client } = useContent();
  const { t, contentLang } = useLanguage();

  const page = useResource<CategoryData | null>(async () => {
    if (!id) return null;
    const [cats, manifest] = await Promise.all([
      client.getCategories(contentLang, { staleOk: true }),
      client.getManifest({ staleOk: true }),
    ]);
    const cat = cats.categories.find((c) => c.id === id);
    if (!cat) return null;
    const filtered = manifest.entries
      .filter((e) => e.categoryId === id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const entries: CategoryEntry[] = await Promise.all(
      filtered.map(async (item) => ({
        ...item,
        imageUri: item.thumbAssetId
          ? await client.resolveAsset(item.thumbAssetId, { staleOk: true })
          : null,
      })),
    );
    return {
      title: resolveLocalized(cat?.title ?? {}, contentLang) ?? String(id),
      description: resolveLocalized(cat?.description ?? {}, contentLang) ?? null,
      entries,
    };
  }, [client, contentLang, id]);

  if (page.loading) return <LoadingView />;
  if (page.error) return <ErrorView message={page.error} onRetry={page.reload} />;
  if (!page.data) return <EmptyView title={t('state.notFound')} />;
  const { title, description, entries } = page.data;

  return (
    <ThemedView style={styles.flex}>
      <SeoHead
        title={`${title} — Khmer Heritage`}
        description={description ?? 'Khmer heritage encyclopedia'}
      />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset }]}>
          <ThemedText type="title">{title}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {t('category.entries', { count: entries.length })}
          </ThemedText>
          <View style={styles.stack}>
            {entries.map((item) => (
              <Link
                key={item.id}
                href={{ pathname: '/entry/[slug]', params: { slug: item.slug } }}
                asChild>
                <EntryCard
                  variant="card"
                  title={resolveLocalized(item.title, contentLang) ?? item.slug}
                  imageUri={item.imageUri}
                  onPress={() => {}}
                />
              </Link>
            ))}
            {entries.length === 0 && <EmptyView title={t('state.empty')} />}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
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
  stack: { gap: Spacing.three, marginTop: Spacing.two },
});
