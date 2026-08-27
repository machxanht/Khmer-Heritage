import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ErrorView, LoadingView } from '@/components/states';
import { ContentProvider, useContent } from '@/lib/content-context';
import { LanguageProvider, useLanguage } from '@/lib/language-context';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { status, errorMessage, refresh } = useContent();
  const { t } = useLanguage();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {status === 'loading' && <LoadingView />}
      {status === 'error' && (
        <ErrorView message={errorMessage ?? undefined} onRetry={() => void refresh()} />
      )}
      {status === 'ready' && (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="category/[id]" />
          <Stack.Screen name="entry/[slug]" />
        </Stack>
      )}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <ContentProvider>
        <RootNavigator />
      </ContentProvider>
    </LanguageProvider>
  );
}

