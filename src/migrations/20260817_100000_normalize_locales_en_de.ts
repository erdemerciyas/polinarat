import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Aligns the database with Payload localization config (en + de only).
 *
 * Legacy tr/ar/ru locale rows block Drizzle dev push with:
 *   invalid input value for enum _locales: "tr"
 * which breaks admin locale switching intermittently.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Remove stale locale rows from every table with _locale column
  await db.execute(sql`
    DO $block$
    DECLARE
      r RECORD;
    BEGIN
      FOR r IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = '_locale'
      LOOP
        EXECUTE format(
          'DELETE FROM %I WHERE _locale::text = ANY(ARRAY[''tr'', ''ar'', ''ru''])',
          r.table_name
        );
      END LOOP;
    END
    $block$;
  `)

  // 2. Remove legacy languages from the Languages collection
  await db.execute(sql`
    DELETE FROM "languages"
    WHERE "code" = ANY(ARRAY['tr', 'ar', 'ru', 'it']);
  `)

  // 3. Recreate _locales enum as en + de only
  await db.execute(sql`
    DO $block$ BEGIN
      CREATE TYPE "public"."_locales_new" AS ENUM('en', 'de');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $block$;
  `)

  await db.execute(sql`
    DO $block$
    DECLARE
      r RECORD;
    BEGIN
      FOR r IN
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND udt_name = '_locales'
      LOOP
        EXECUTE format(
          'ALTER TABLE %I ALTER COLUMN %I TYPE "public"."_locales_new" USING %I::text::"public"."_locales_new"',
          r.table_name,
          r.column_name,
          r.column_name
        );
      END LOOP;
    END
    $block$;
  `)

  await db.execute(sql`
    DO $block$ BEGIN
      DROP TYPE IF EXISTS "public"."_locales";
    END $block$;
  `)

  await db.execute(sql`
    ALTER TYPE "public"."_locales_new" RENAME TO "_locales";
  `)

  // 4. Fix version published_locale enums if present
  await db.execute(sql`
    DO $block$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum__news_v_published_locale') THEN
        ALTER TYPE "public"."enum__news_v_published_locale" RENAME TO "enum__news_v_published_locale_old";
      END IF;
    END $block$;
  `)

  await db.execute(sql`
    DO $block$ BEGIN
      CREATE TYPE "public"."enum__news_v_published_locale" AS ENUM('en', 'de');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $block$;
  `)

  await db.execute(sql`
    DO $block$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = '_news_v' AND column_name = 'published_locale'
      ) THEN
        UPDATE "_news_v"
        SET "published_locale" = NULL
        WHERE "published_locale"::text = ANY(ARRAY['tr', 'ar', 'ru']);

        ALTER TABLE "_news_v"
          ALTER COLUMN "published_locale" TYPE "public"."enum__news_v_published_locale"
          USING "published_locale"::text::"public"."enum__news_v_published_locale";
      END IF;
    END
    $block$;
  `)

  await db.execute(sql`
    DO $block$ BEGIN
      DROP TYPE IF EXISTS "public"."enum__news_v_published_locale_old";
    END $block$;
  `)

  await db.execute(sql`
    DO $block$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum__pages_v_published_locale') THEN
        ALTER TYPE "public"."enum__pages_v_published_locale" RENAME TO "enum__pages_v_published_locale_old";
      END IF;
    END $block$;
  `)

  await db.execute(sql`
    DO $block$ BEGIN
      CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'de');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $block$;
  `)

  await db.execute(sql`
    DO $block$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = '_pages_v' AND column_name = 'published_locale'
      ) THEN
        UPDATE "_pages_v"
        SET "published_locale" = NULL
        WHERE "published_locale"::text = ANY(ARRAY['tr', 'ar', 'ru']);

        ALTER TABLE "_pages_v"
          ALTER COLUMN "published_locale" TYPE "public"."enum__pages_v_published_locale"
          USING "published_locale"::text::"public"."enum__pages_v_published_locale";
      END IF;
    END
    $block$;
  `)

  await db.execute(sql`
    DO $block$ BEGIN
      DROP TYPE IF EXISTS "public"."enum__pages_v_published_locale_old";
    END $block$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Non-reversible: stale locale rows are deleted intentionally.
  await db.execute(sql`SELECT 1`)
}
