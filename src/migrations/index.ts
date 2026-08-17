import * as migration_20260327_142417_add_page_globals from './20260327_142417_add_page_globals';
import * as migration_20260328_120000_expand_about_page from './20260328_120000_expand_about_page';
import * as migration_20260330_000000_slider_settings_upgrade from './20260330_000000_slider_settings_upgrade';
import * as migration_20260514_120000_page_globals_seo_fields from './20260514_120000_page_globals_seo_fields';
import * as migration_20260514_130000_site_settings_contact_opening_hours from './20260514_130000_site_settings_contact_opening_hours';
import * as migration_20260514_131500_homepage_about_preview_labels_image from './20260514_131500_homepage_about_preview_labels_image';
import * as migration_20260817_100000_normalize_locales_en_de from './20260817_100000_normalize_locales_en_de';

export const migrations = [
  {
    up: migration_20260327_142417_add_page_globals.up,
    down: migration_20260327_142417_add_page_globals.down,
    name: '20260327_142417_add_page_globals'
  },
  {
    up: migration_20260328_120000_expand_about_page.up,
    down: migration_20260328_120000_expand_about_page.down,
    name: '20260328_120000_expand_about_page'
  },
  {
    up: migration_20260330_000000_slider_settings_upgrade.up,
    down: migration_20260330_000000_slider_settings_upgrade.down,
    name: '20260330_000000_slider_settings_upgrade'
  },
  {
    up: migration_20260514_120000_page_globals_seo_fields.up,
    down: migration_20260514_120000_page_globals_seo_fields.down,
    name: '20260514_120000_page_globals_seo_fields'
  },
  {
    up: migration_20260514_130000_site_settings_contact_opening_hours.up,
    down: migration_20260514_130000_site_settings_contact_opening_hours.down,
    name: '20260514_130000_site_settings_contact_opening_hours'
  },
  {
    up: migration_20260514_131500_homepage_about_preview_labels_image.up,
    down: migration_20260514_131500_homepage_about_preview_labels_image.down,
    name: '20260514_131500_homepage_about_preview_labels_image'
  },
  {
    up: migration_20260817_100000_normalize_locales_en_de.up,
    down: migration_20260817_100000_normalize_locales_en_de.down,
    name: '20260817_100000_normalize_locales_en_de'
  },
];
