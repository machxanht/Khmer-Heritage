/**
 * UI localization layer (master §3): no interface strings hardcoded in
 * components. Priority: requested → English fallback for UI chrome;
 * *content* strings resolve through @kh/content-schema (requested → km → en).
 */

import type { LanguageCode } from '@kh/content-schema';

export type UiKey =
  | 'tab.home'
  | 'tab.categories'
  | 'tab.search'
  | 'tab.settings'
  | 'app.name'
  | 'app.tagline'
  | 'home.featured'
  | 'home.recentlyUpdated'
  | 'home.browseCategories'
  | 'state.loading'
  | 'state.errorTitle'
  | 'state.retry'
  | 'state.empty'
  | 'state.emptySearch'
  | 'state.searchHint'
  | 'state.notFound'
  | 'search.placeholder'
  | 'category.entries'
  | 'detail.sources'
  | 'detail.related'
  | 'detail.license'
  | 'detail.credits'
  | 'detail.openMap'
  | 'detail.mediaUnavailable'
  | 'settings.language'
  | 'settings.languageHint'
  | 'settings.viSoon'
  | 'settings.contentSource'
  | 'settings.revision'
  | 'settings.updated'
  | 'settings.refresh'
  | 'settings.refreshing'
  | 'settings.refreshDone'
  | 'settings.about'
  | 'settings.aboutBody';

type Dict = Record<UiKey, string>;

const en: Dict = {
  'tab.home': 'Home',
  'tab.categories': 'Categories',
  'tab.search': 'Search',
  'tab.settings': 'Settings',
  'app.name': 'KHMER HERITAGE',
  'app.tagline': 'Explore the heritage and culture of Cambodia',
  'home.featured': 'Featured heritage',
  'home.recentlyUpdated': 'Recently updated',
  'home.browseCategories': 'Browse by category',
  'state.loading': 'Loading…',
  'state.errorTitle': 'Something went wrong',
  'state.retry': 'Try again',
  'state.empty': 'Nothing here yet',
  'state.emptySearch': 'No results',
  'state.searchHint': 'Search temples, history, arts, music and more.',
  'state.notFound': 'This content could not be found.',
  'search.placeholder': 'Search the encyclopedia…',
  'category.entries': '{count} entries',
  'detail.sources': 'Sources',
  'detail.related': 'Related entries',
  'detail.license': 'License',
  'detail.credits': 'Credits',
  'detail.openMap': 'Open in Maps',
  'detail.mediaUnavailable':
    'Audio/video arrives with Phase 2 (media pipeline). Metadata shown below.',
  'settings.language': 'Language',
  'settings.languageHint': 'Interface and content language',
  'settings.viSoon': 'Coming soon',
  'settings.contentSource': 'Content source',
  'settings.revision': 'Revision',
  'settings.updated': 'Manifest generated',
  'settings.refresh': 'Check for updates',
  'settings.refreshing': 'Checking…',
  'settings.refreshDone': 'Up to date',
  'settings.about': 'About',
  'settings.aboutBody':
    'KHMER HERITAGE is a digital encyclopedia of Khmer heritage and culture. Every entry cites its sources and licenses.',
};

const km: Dict = {
  ...en,
  'tab.home': 'ដើម',
  'tab.categories': 'ប្រភេទ',
  'tab.search': 'ស្វែងរក',
  'tab.settings': 'ការកំណត់',
  'app.name': 'មរតកខ្មែរ',
  'app.tagline': 'ស្វែងយល់ពីមរតក និងវប្បធម៌កម្ពុជា',
  'home.featured': 'មរតកពិសេស',
  'home.recentlyUpdated': 'ធ្វើបច្ចុប្បន្នភាពថ្មីៗ',
  'home.browseCategories': 'រុករកតាមប្រភេទ',
  'state.loading': 'កំពុងផ្ទុក…',
  'state.errorTitle': 'មានបញ្ហាបានកើតឡើង',
  'state.retry': 'ព្យាយាមម្តងទៀត',
  'state.empty': 'មិនមានទិន្នន័យទេ',
  'state.emptySearch': 'រកមិនឃើញ',
  'state.searchHint': 'ស្វែងរកប្រាសាទ ប្រវត្តិសាស្ត្រ សិល្បៈ តន្ត្រី និងច្រើនទៀត។',
  'state.notFound': 'រកមិនឃើញមាតិកានេះទេ។',
  'search.placeholder': 'ស្វែងរកសព្វវចនាធិប្បាយ…',
  'category.entries': 'មាតិកា {count}',
  'detail.sources': 'ប្រភព',
  'detail.related': 'មាតិកាទាក់ទង',
  'detail.license': 'អាជ្ញាបណ្ណ',
  'detail.credits': 'គុណគូរ',
  'detail.openMap': 'បើកក្នុងផែនទី',
  'detail.mediaUnavailable': 'សម្លេង/វីដេអូនឹងមកដល់នៅដំណាក់កាលទី២។',
  'settings.language': 'ភាសា',
  'settings.languageHint': 'ភាសាសម្រាប់កម្មវិធី និងមាតិកា',
  'settings.viSoon': 'នឹងមកដល់ឆាប់ៗ',
  'settings.contentSource': 'ប្រភពមាតិកា',
  'settings.revision': 'កំណែ',
  'settings.updated': 'បានបង្កើតនៅ',
  'settings.refresh': 'ពិនិត្យរកបច្ចុប្បន្នភាព',
  'settings.refreshing': 'កំពុងពិនិត្យ…',
  'settings.refreshDone': 'ទំនើបរួចរាល់',
  'settings.about': 'អំពី',
  'settings.aboutBody':
    'មរតកខ្មែរ ជាសព្វវចនាធិប្បាយឌីជីថលអំពីមរតក និងវប្បធម៌ខ្មែរ។ មាតិកាទាំងអស់មានប្រភព និងអាជ្ញាបណ្ណច្បាស់លាស់។',
};

/** Vietnamese ships after km/en (master §3 priority); falls back to English. */
const vi: Partial<Dict> = {
  'tab.home': 'Trang chủ',
  'tab.categories': 'Chủ đề',
  'tab.search': 'Tìm kiếm',
  'tab.settings': 'Cài đặt',
};

const DICTS: Record<LanguageCode, Partial<Dict>> = { km, en, vi };

export type Translator = (key: UiKey, params?: Record<string, string | number>) => string;

/** Pure translate factory with graceful fallback: lang → en → key itself. */
export function createTranslator(lang: LanguageCode): Translator {
  return (key, params) => {
    let out = DICTS[lang]?.[key] ?? en[key] ?? String(key);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        out = out.replaceAll(`{${k}}`, String(v));
      }
    }
    return out;
  };
}
