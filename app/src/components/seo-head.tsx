/**
 * SEO head tags for web only. expo-router/head must not render on native, so
 * this wrapper is a no-op there; on web it emits <title> and meta description.
 */
import Head from 'expo-router/head';
import { Platform } from 'react-native';

interface SeoHeadProps {
  title: string;
  description?: string;
}

export function SeoHead({ title, description }: SeoHeadProps) {
  if (Platform.OS !== 'web') return null;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description ?? title} />
    </Head>
  );
}
