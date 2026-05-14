import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Fixes dev servers hanging on the first HTTP request: Drizzle push prompts interactively when it
 * mistakes legacy `about_page_settings_values_cards*` tables for renames of
 * `site_settings_contact_opening_hours`. Those tables are orphaned after the About page field path
 * moved to `statistics.cards`. Also applies opening-hours + price-range schema that previously
 * only existed after a successful dev push.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "about_page_settings_values_cards_locales" CASCADE;
  `)
  await db.execute(sql`
    DROP TABLE IF EXISTS "about_page_settings_values_cards" CASCADE;
  `)

  await db.execute(sql`
    DO $block$ BEGIN
      CREATE TYPE "public"."enum_site_settings_contact_opening_hours_day_of_week" AS ENUM(
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $block$;
  `)
  await db.execute(sql`
    DO $block$ BEGIN
      CREATE TYPE "public"."enum_site_settings_contact_price_range" AS ENUM('$', '$$', '$$$', '$$$$');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $block$;
  `)

  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "contact_price_range" "enum_site_settings_contact_price_range";
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_settings_contact_opening_hours" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "day_of_week" "enum_site_settings_contact_opening_hours_day_of_week" NOT NULL,
      "opens" varchar,
      "closes" varchar
    );
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "site_settings_contact_opening_hours_order_idx"
      ON "site_settings_contact_opening_hours" USING btree ("_order");
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "site_settings_contact_opening_hours_parent_id_idx"
      ON "site_settings_contact_opening_hours" USING btree ("_parent_id");
  `)
  await db.execute(sql`
    DO $block$ BEGIN
      ALTER TABLE "site_settings_contact_opening_hours"
        ADD CONSTRAINT "site_settings_contact_opening_hours_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $block$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "site_settings_contact_opening_hours" CASCADE;
  `)
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "contact_price_range";
  `)
  await db.execute(sql`
    DROP TYPE IF EXISTS "enum_site_settings_contact_price_range";
  `)
  await db.execute(sql`
    DROP TYPE IF EXISTS "enum_site_settings_contact_opening_hours_day_of_week";
  `)
}
