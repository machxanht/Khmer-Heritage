/**
 * Shared loading / error / empty states (master §11 APP criteria).
 */

import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/lib/language-context';

export function LoadingView({ label }: { label?: string }) {
  const { t } = useLanguage();
  return (
    <ThemedView style={styles.center}>
      <ActivityIndicator />
      <ThemedText themeColor="textSecondary">{label ?? t('state.loading')}</ThemedText>
    </ThemedView>
  );
}

export function ErrorView({ message, onRetry }: { message?: string | null; onRetry: () => void }) {
  const { t } = useLanguage();
  const theme = useTheme();
  return (
    <ThemedView style={styles.center}>
      <SymbolView
        name={{ ios: 'exclamationmark.triangle', android: 'error', web: 'warning' }}
        size={36}
        tintColor={theme.accent}
      />
      <ThemedText type="smallBold" style={styles.gapTop}>
        {t('state.errorTitle')}
      </ThemedText>
      {!!message && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
          {message}
        </ThemedText>
      )}
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
        <ThemedView type="backgroundElement" style={styles.retryInner}>
          <ThemedText type="smallBold" themeColor="accent">
            {t('state.retry')}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

export function EmptyView({ title, subtitle }: { title: string; subtitle?: string }) {
  const theme = useTheme();
  return (
    <ThemedView style={styles.center}>
      <SymbolView
        name={{ ios: 'tray', android: 'inbox', web: 'mail' }}
        size={36}
        tintColor={theme.textSecondary}
      />
      <ThemedText type="smallBold" style={styles.gapTop}>
        {title}
      </ThemedText>
      {!!subtitle && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
          {subtitle}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.five,
  },
  gapTop: {
    marginTop: Spacing.one,
  },
  message: {
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.three,
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  retryInner: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
