/**
 * One-off runner for locale normalization when Payload cannot boot (enum mismatch).
 */
import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

async function exec(sql: string) {
  await pool.query(sql)
}

async function main() {
  console.log('Deleting stale locale rows (tr, ar, ru)...')
  await exec(`
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

  console.log('Removing legacy languages from collection...')
  await exec(`
    DELETE FROM "languages"
    WHERE "code" = ANY(ARRAY['tr', 'ar', 'ru', 'it']);
  `)

  console.log('Recreating _locales enum (en, de)...')
  await exec(`
    DO $block$ BEGIN
      CREATE TYPE "public"."_locales_new" AS ENUM('en', 'de');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $block$;
  `)

  await exec(`
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

  await exec(`DROP TYPE IF EXISTS "public"."_locales";`)
  await exec(`ALTER TYPE "public"."_locales_new" RENAME TO "_locales";`)

  console.log('Fixing version published_locale enums...')
  for (const [table, enumName] of [
    ['_news_v', 'enum__news_v_published_locale'],
    ['_pages_v', 'enum__pages_v_published_locale'],
  ] as const) {
    const exists = await pool.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = 'published_locale'`,
      [table],
    )
    if (exists.rowCount === 0) continue

    await exec(`
      DO $block$ BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '${enumName}') THEN
          ALTER TYPE "public"."${enumName}" RENAME TO "${enumName}_old";
        END IF;
      END $block$;
    `)

    await exec(`
      DO $block$ BEGIN
        CREATE TYPE "public"."${enumName}" AS ENUM('en', 'de');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $block$;
    `)

    await exec(`
      UPDATE "${table}"
      SET "published_locale" = NULL
      WHERE "published_locale"::text = ANY(ARRAY['tr', 'ar', 'ru']);
    `)

    await exec(`
      ALTER TABLE "${table}"
        ALTER COLUMN "published_locale" TYPE "public"."${enumName}"
        USING "published_locale"::text::"public"."${enumName}";
    `)

    await exec(`DROP TYPE IF EXISTS "public"."${enumName}_old";`)
  }

  const verify = await pool.query(`
    SELECT enumlabel
    FROM pg_enum
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
    WHERE pg_type.typname = '_locales'
    ORDER BY enumsortorder
  `)
  console.log('_locales enum now:', verify.rows.map((r) => r.enumlabel))

  const langs = await pool.query('SELECT code, is_active FROM languages ORDER BY sort_order')
  console.log('languages:', langs.rows)

  await pool.query(`
    INSERT INTO payload_migrations (name, batch)
    SELECT '20260817_100000_normalize_locales_en_de', COALESCE((SELECT MAX(batch) FROM payload_migrations), 0) + 1
    WHERE NOT EXISTS (
      SELECT 1 FROM payload_migrations WHERE name = '20260817_100000_normalize_locales_en_de'
    )
  `)

  console.log('Done.')
  await pool.end()
}

main().catch(async (e) => {
  console.error(e)
  await pool.end()
  process.exit(1)
})
