/**
 * Home tab (master §10): hero/featured → recently updated → browse categories.
 * All strings come from i18n; all content from the typed ContentClient.
 */
import { Link, Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EntryCard } from '@/components/entry-card';
import { ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content-context';
import { useLanguage } from '@/lib/language-context';
import { useResource } from '@/lib/use-resource';
import type { CategoriesFileValue, ManifestItemValue, ManifestValue } from '@kh/content-schema';
import { resolveLocalized } from '@kh/content-schema';

interface FeaturedItem {
  item: ManifestItemValue;
  summary?: string;
  imageUri: string | null;
}

interface HomeData {
  categories: CategoriesFileValue;
  manifest: ManifestValue;
  featured: FeaturedItem[];
}

export default function HomeScreen() {
  const { client } = useContent();
  const { t, contentLang } = useLanguage();

  const home = useResource<HomeData>(async () => {
    const [categories, manifest] = await Promise.all([
      client.getCategories(contentLang, { staleOk: true }),
      client.getManifest({ staleOk: true }),
    ]);
    const items = manifest.entries
      .filter((e) => e.featuredOrder != null)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
      .slice(0, 5);
    const featured: FeaturedItem[] = await Promise.all(
      items.map(async (item) => {
        const entry = await client.getEntry(item.slug, contentLang, { staleOk: true });
        return {
          item,
          summary: entry ? resolveLocalized(entry.summary, contentLang) : undefined,
          imageUri: item.thumbAssetId
            ? await client.resolveAsset(item.thumbAssetId, { staleOk: true })
            : null,
        };
      }),
    );
    return { categories, manifest, featured };
  }, [client, contentLang]);

  if (home.loading) return <LoadingView />;
  if (home.error || !home.data) return <ErrorView message={home.error} onRetry={home.reload} />;
  const { categories, manifest, featured } = home.data;
  const recent = [...manifest.entries]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset }]}>
          <ThemedText type="title">{t('app.name')}</ThemedText>
          <ThemedText themeColor="textSecondary">{t('app.tagline')}</ThemedText>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('home.featured')}
          </ThemedText>
          <View style={styles.stack}>
            {featured.map(({ item, summary, imageUri }) => (
              <Link
                key={item.id}
                href={{ pathname: '/entry/[slug]', params: { slug: item.slug } }}
                asChild>
                <EntryCard
                  variant="hero"
                  title={resolveLocalized(item.title, contentLang) ?? item.slug}
                  subtitle={summary}
                  imageUri={imageUri}
                  onPress={() => {}}
                />
              </Link>
            ))}
            {featured.length === 0 && (
              <ThemedView type="backgroundElement" style={styles.emptyBox}>
                <ThemedText themeColor="textSecondary">{t('state.empty')}</ThemedText>
              </ThemedView>
            )}
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('home.recentlyUpdated')}
          </ThemedText>
          <View style={styles.stack}>
            {recent.map((item) => (
              <Link
                key={item.id}
                href={{ pathname: '/entry/[slug]', params: { slug: item.slug } }}
                asChild>
                <EntryCard
                  variant="row"
                  title={resolveLocalized(item.title, contentLang) ?? item.slug}
                  imageUri={null}
                  onPress={() => {}}
                />
              </Link>
            ))}
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('home.browseCategories')}
          </ThemedText>
          <View style={styles.chipWrap}>
            {categories.categories.map((cat) => (
              <Link
                key={cat.id}
                href={{ pathname: '/category/[id]', params: { id: cat.id } }}
                asChild>
                <ThemedView type="backgroundElement" style={styles.chip}>
                  <ThemedText type="small">
                    {resolveLocalized(cat.title, contentLang) ?? cat.id}
                  </ThemedText>
                </ThemedView>
              </Link>
            ))}
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
  sectionTitle: { marginTop: Spacing.four },
  stack: { gap: Spacing.three },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999 },
  emptyBox: { borderRadius: Spacing.three, padding: Spacing.four, alignItems: 'center' },
});
