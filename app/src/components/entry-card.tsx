/**
 * Reusable entry card used by Home (hero), category lists, search results and
 * related-entry rails. Cover images degrade gracefully: missing asset files or
 * ledger entries fall back to a branded placeholder (QA criterion: missing asset).
 */

import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface EntryCardProps {
  title: string;
  subtitle?: string;
  /** Pre-resolved remote URI from ContentClient.resolveAsset, if any. */
  imageUri?: string | null;
  variant?: 'hero' | 'card' | 'row';
  onPress: () => void;
}

export function EntryCard({ title, subtitle, imageUri, variant = 'card', onPress }: EntryCardProps) {
  const [broken, setBroken] = useState(false);
  const theme = useTheme();
  const showImage = Boolean(imageUri) && !broken;

  const cover =
    variant === 'row' ? (
      <View style={[styles.rowThumb, { backgroundColor: theme.backgroundElement }]}>
        {showImage ? (
          <Image
            source={{ uri: imageUri! }}
            style={StyleSheet.absoluteFill}
            onError={() => setBroken(true)}
            recyclingKey={imageUri ?? undefined}
          />
        ) : (
          <PlaceholderGlyph title={title} color={theme.gold} />
        )}
      </View>
    ) : (
      <View
        style={[
          styles.cover,
          variant === 'hero' ? styles.coverHero : styles.coverCard,
          { backgroundColor: theme.backgroundSelected },
        ]}>
        {showImage ? (
          <Image
            source={{ uri: imageUri! }}
            style={StyleSheet.absoluteFill}
            onError={() => setBroken(true)}
            recyclingKey={imageUri ?? undefined}
          />
        ) : (
          <PlaceholderGlyph title={title} color={theme.gold} large />
        )}
      </View>
    );

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <ThemedView
        type={variant === 'hero' ? 'backgroundElement' : 'background'}
        style={variant === 'row' ? styles.rowBody : styles.body}>
        {cover}
        <View style={variant === 'hero' ? styles.heroText : styles.textBlock}>
          <ThemedText
            type={variant === 'hero' ? 'subtitle' : variant === 'row' ? 'default' : 'default'}
            numberOfLines={variant === 'hero' ? 3 : 2}>
            {title}
          </ThemedText>
          {!!subtitle && (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              numberOfLines={variant === 'row' ? 1 : 3}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );
}

function PlaceholderGlyph({ title, color, large }: { title: string; color: string; large?: boolean }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <ThemedText
        type="code"
        style={[styles.placeholderGlyph, large && styles.placeholderGlyphLarge, { color }]}>
        {title.trim().charAt(0).toUpperCase() || 'KH'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  body: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  rowBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  cover: {
    width: '100%',
  },
  coverHero: {
    aspectRatio: 16 / 10,
  },
  coverCard: {
    aspectRatio: 16 / 9,
  },
  heroText: {
    gap: Spacing.one,
    padding: Spacing.four,
  },
  textBlock: {
    flex: 1,
    gap: Spacing.half,
  },
  rowThumb: {
    width: 56,
    height: 56,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  placeholderGlyph: {
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 56,
    fontWeight: '700',
  },
  placeholderGlyphLarge: {
    fontSize: 48,
    lineHeight: 200,
  },
});
