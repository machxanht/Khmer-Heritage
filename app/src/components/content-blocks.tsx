/**
 * Renders structured content blocks (docs/CONTENT_SCHEMA.md §4) inside an
 * entry's sections. Every block type in schema v1.0 is handled here so CMS
 * editors can rely on consistent rendering across app + website.
 */

import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useContent } from '@/lib/content-context';
import { useLanguage } from '@/lib/language-context';
import { useResource } from '@/lib/use-resource';
import type { BlockValue, LocalizedTextValue, SectionValue } from '@kh/content-schema';
import { resolveLocalized } from '@kh/content-schema';

export function SectionRenderer({ section }: { section: SectionValue }) {
  const { contentLang } = useLanguage();
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {resolveLocalized(section.title ?? {}, contentLang)}
      </ThemedText>
      {section.blocks.map((block, i) => (
        <BlockRenderer key={`${section.id}-${i}`} block={block} />
      ))}
    </ThemedView>
  );
}

export function BlockRenderer({ block }: { block: BlockValue }) {
  switch (block.blockType) {
    case 'heading':
      return <HeadingBlock text={block.text} />;
    case 'paragraph':
      return <ParagraphBlock text={block.text} />;
    case 'list':
      return <ListBlock ordered={block.ordered} items={block.items} />;
    case 'quote':
      return <QuoteBlock text={block.text} attribution={block.attribution} />;
    case 'image':
      return <AssetImage assetId={block.assetId} caption={block.caption} aspect={16 / 10} />;
    case 'gallery':
      return <GalleryBlock assetIds={block.assetIds} caption={block.caption} />;
    case 'audio':
      return (
        <MediaCard kind="audio" title={block.title} assetId={block.assetId} transcript={block.transcript} />
      );
    case 'video':
      return (
        <MediaCard
          kind="video"
          title={block.title}
          provider={block.provider}
          url={'url' in block ? block.url : undefined}
          assetId={'assetId' in block ? block.assetId : undefined}
        />
      );
    case 'keyFacts':
      return <KeyFactsBlock facts={block.facts} />;
    case 'timeline':
      return <TimelineBlock events={block.events} />;
    case 'mapPoint':
      return <MapPointBlock lat={block.lat} lng={block.lng} label={block.label} />;
    case 'callout':
      return <CalloutBlock variant={block.variant} text={block.text} />;
    default:
      return null;
  }
}

/* ------------------------------ helpers ----------------------------- */

function L({ text }: { text: LocalizedTextValue }) {
  const { contentLang } = useLanguage();
  return <>{resolveLocalized(text, contentLang)}</>;
}

function HeadingBlock({ text }: { text: LocalizedTextValue }) {
  return (
    <ThemedText type="subtitle" style={styles.blockGap}>
      <L text={text} />
    </ThemedText>
  );
}

function ParagraphBlock({ text }: { text: LocalizedTextValue }) {
  return (
    <ThemedText style={styles.blockGap}>
      <L text={text} />
    </ThemedText>
  );
}

function ListBlock({
  ordered,
  items,
}: {
  ordered: boolean;
  items: { text: LocalizedTextValue }[];
}) {
  return (
    <View style={[styles.list, styles.blockGap]}>
      {items.map((item, i) => (
        <View key={i} style={styles.listRow}>
          <ThemedText type="smallBold" themeColor="accent" style={styles.listMarker}>
            {ordered ? `${i + 1}.` : '•'}
          </ThemedText>
          <ThemedText style={styles.flexText}>
            <L text={item.text} />
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function QuoteBlock({
  text,
  attribution,
}: {
  text: LocalizedTextValue;
  attribution?: LocalizedTextValue;
}) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={[styles.quote, styles.blockGap]}>
      <View style={[styles.quoteBar, { backgroundColor: theme.gold }]} />
      <View style={styles.flexText}>
        <ThemedText style={styles.quoteText}>
          <L text={text} />
        </ThemedText>
        {!!attribution && (
          <ThemedText type="small" themeColor="textSecondary">
            — <L text={attribution} />
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

function GalleryBlock({
  assetIds,
  caption,
}: {
  assetIds: string[];
  caption?: LocalizedTextValue;
}) {
  return (
    <View style={styles.blockGap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryRow}>
        {assetIds.map((id) => (
          <AssetImage key={id} assetId={id} aspect={4 / 3} width={260} />
        ))}
      </ScrollView>
      {!!caption && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
          <L text={caption} />
        </ThemedText>
      )}
    </View>
  );
}

/** Resolves an assetId through the ledger → URL; falls back to a placeholder tile. */
function AssetImage({
  assetId,
  caption,
  aspect = 16 / 9,
  width,
}: {
  assetId: string;
  caption?: LocalizedTextValue;
  aspect?: number;
  width?: number;
}) {
  const { client } = useContent();
  const [broken, setBroken] = useState(false);
  const { data: uri } = useResource(() => client.resolveAsset(assetId), [client, assetId]);
  const showImage = Boolean(uri) && !broken;
  return (
    <View style={width != null ? { width } : undefined}>
      <View style={[styles.imageFrame, { aspectRatio: aspect }]}>
        {showImage ? (
          <Image
            source={{ uri: uri! }}
            style={StyleSheet.absoluteFill}
            onError={() => setBroken(true)}
            recyclingKey={uri ?? undefined}
          />
        ) : (
          <PlaceholderTile glyph={assetId} />
        )}
      </View>
      {!!caption && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
          <L text={caption} />
        </ThemedText>
      )}
    </View>
  );
}

function PlaceholderTile({ glyph }: { glyph: string }) {
  const theme = useTheme();
  return (
    <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
      <ThemedText type="code" style={{ color: theme.gold }}>
        {glyph.replace(/^img-/, '').slice(0, 18)}
      </ThemedText>
    </View>
  );
}

function MediaCard({
  kind,
  title,
  provider,
  url,
  assetId,
}: {
  kind: 'audio' | 'video';
  title: LocalizedTextValue;
  provider?: string;
  url?: string;
  assetId?: string;
  transcript?: LocalizedTextValue;
}) {
  const { t } = useLanguage();
  return (
    <ThemedView type="backgroundElement" style={[styles.mediaCard, styles.blockGap]}>
      <ThemedText type="smallBold" themeColor="accent">
        {kind === 'audio' ? '♪' : '▶'} <L text={title} />
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('detail.mediaUnavailable')}
      </ThemedText>
      {kind === 'video' && url && (
        <ExternalLink href={url as Parameters<typeof ExternalLink>[0]['href']} asChild>
          <Pressable style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="linkPrimary">{t('detail.watchVideo')}</ThemedText>
          </Pressable>
        </ExternalLink>
      )}
      {(provider || url || assetId) && (
        <ThemedText type="code" themeColor="textSecondary" numberOfLines={1}>
          {[provider, url ?? assetId].filter(Boolean).join(' · ')}
        </ThemedText>
      )}
    </ThemedView>
  );
}

function KeyFactsBlock({
  facts,
}: {
  facts: { id: string; label: LocalizedTextValue; value: LocalizedTextValue }[];
}) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={[styles.keyFacts, styles.blockGap]}>
      {facts.map((fact) => (
        <View key={fact.id} style={styles.factRow}>
          <ThemedText type="small" themeColor="textSecondary">
            <L text={fact.label} />
          </ThemedText>
          <ThemedText type="smallBold">
            <L text={fact.value} />
          </ThemedText>
          <View style={[styles.hairline, { backgroundColor: theme.backgroundSelected }]} />
        </View>
      ))}
    </ThemedView>
  );
}

function TimelineBlock({
  events,
}: {
  events: { period: string; text: LocalizedTextValue }[];
}) {
  const theme = useTheme();
  return (
    <View style={[styles.timeline, styles.blockGap]}>
      {events.map((event, i) => (
        <View key={i} style={styles.timelineRow}>
          <View style={styles.timelineRail}>
            <View style={[styles.timelineDot, { backgroundColor: theme.accent }]} />
            {i < events.length - 1 && (
              <View style={[styles.timelineLine, { backgroundColor: theme.backgroundSelected }]} />
            )}
          </View>
          <View style={styles.flexText}>
            <ThemedText type="smallBold" themeColor="gold">
              {event.period}
            </ThemedText>
            <ThemedText type="small">
              <L text={event.text} />
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

function MapPointBlock({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: LocalizedTextValue;
  zoom?: number;
}) {
  const { t } = useLanguage();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  return (
    <ThemedView type="backgroundElement" style={[styles.mapCard, styles.blockGap]}>
      <ThemedText>📍 <L text={label} /></ThemedText>
      <ThemedText type="code" themeColor="textSecondary">
        {lat.toFixed(4)}°, {lng.toFixed(4)}°
      </ThemedText>
      <ExternalLink href={mapsUrl as Parameters<typeof ExternalLink>[0]['href']} asChild>
        <Pressable style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="linkPrimary">{t('detail.openMap')}</ThemedText>
        </Pressable>
      </ExternalLink>
    </ThemedView>
  );
}

function CalloutBlock({
  variant,
  text,
}: {
  variant: 'info' | 'warning';
  text: LocalizedTextValue;
}) {
  const theme = useTheme();
  const tint = variant === 'warning' ? theme.accent : theme.gold;
  return (
    <View style={[styles.callout, styles.blockGap, { borderLeftColor: tint }]}>
      <ThemedText type="small">
        <L text={text} />
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 32,
  },
  blockGap: {
    marginBottom: Spacing.one,
  },
  list: {
    gap: Spacing.one,
  },
  listRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  listMarker: {
    minWidth: 18,
  },
  flexText: {
    flex: 1,
    gap: Spacing.half,
  },
  quote: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  quoteBar: {
    width: 3,
    borderRadius: 2,
  },
  quoteText: {
    fontStyle: 'italic',
  },
  galleryRow: {
    flexGrow: 0,
  },
  imageFrame: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    marginTop: Spacing.one,
  },
  mediaCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  keyFacts: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  factRow: {
    paddingVertical: Spacing.two,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    marginTop: Spacing.two,
  },
  timeline: {
    gap: Spacing.two,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    minHeight: 44,
  },
  timelineRail: {
    width: 12,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  mapCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  callout: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.three,
    paddingVertical: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
});
