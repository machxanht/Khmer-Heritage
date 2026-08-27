/** Categories tab: every category with its PUBLISHED entry count. */
import { Link, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorView, LoadingView } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useContent } from '@/lib/content-context';
import { useLanguage } from '@/lib/language-context';
import { useResource } from '@/lib/use-resource';
import { resolveLocalized } from '@kh/content-schema';

interface CategoryRow {
  id: string;
  title: string;
  count: number;
}

export default function CategoriesScreen() {
  const { client } = useContent();
  const { t, contentLang } = useLanguage();

  const cats = useResource<CategoryRow[]>(async () => {
    const [catsFile, manifest] = await Promise.all([
      client.getCategories(contentLang, { staleOk: true }),
      client.getManifest({ staleOk: true }),
    ]);
    return catsFile.categories
      .sort((a, b) => a.order - b.order)
      .map((c) => ({
        id: c.id,
        title: resolveLocalized(c.title, contentLang) ?? c.id,
        count: manifest.entries.filter((e) => e.categoryId === c.id).length,
      }));
  }, [client, contentLang]);

  if (cats.loading) return <LoadingView />;
  if (cats.error || !cats.data) return <ErrorView message={cats.error} onRetry={cats.reload} />;

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset }]}>
          <ThemedText type="title">{t('tab.categories')}</ThemedText>
          <View style={styles.stack}>
            {cats.data.map((row) => (
              <Link key={row.id} href={{ pathname: '/category/[id]', params: { id: row.id } }} asChild>
                <Pressable style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedView type="backgroundElement" style={styles.row}>
                    <ThemedText type="subtitle" numberOfLines={1}>
                      {row.title}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {t('category.entries', { count: row.count })}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              </Link>
            ))}
            {cats.data.length === 0 && (
              <ThemedText themeColor="textSecondary">{t('state.empty')}</ThemedText>
            )}
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
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  stack: { gap: Spacing.two },
  row: { borderRadius: Spacing.three, padding: Spacing.four, gap: Spacing.half },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
});
