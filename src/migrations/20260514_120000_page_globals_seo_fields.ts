import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds `seo` group columns (seo_image on parent, seo_title + seo_description on locales)
 * for globals that use `@/fields/seoFields`. These were previously only applied via dev push.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage_settings"
      ADD COLUMN IF NOT EXISTS "seo_image_id" integer;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "homepage_settings"
        ADD CONSTRAINT "homepage_settings_seo_image_id_media_id_fk"
        FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "homepage_settings_seo_seo_image_idx"
      ON "homepage_settings" USING btree ("seo_image_id");
  `)
  await db.execute(sql`
    ALTER TABLE "homepage_settings_locales"
      ADD COLUMN IF NOT EXISTS "seo_title" varchar,
      ADD COLUMN IF NOT EXISTS "seo_description" varchar;
  `)

  await db.execute(sql`
    ALTER TABLE "about_page_settings"
      ADD COLUMN IF NOT EXISTS "seo_image_id" integer;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "about_page_settings"
        ADD CONSTRAINT "about_page_settings_seo_image_id_media_id_fk"
        FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "about_page_settings_seo_seo_image_idx"
      ON "about_page_settings" USING btree ("seo_image_id");
  `)
  await db.execute(sql`
    ALTER TABLE "about_page_settings_locales"
      ADD COLUMN IF NOT EXISTS "seo_title" varchar,
      ADD COLUMN IF NOT EXISTS "seo_description" varchar;
  `)

  await db.execute(sql`
    ALTER TABLE "contact_page_settings"
      ADD COLUMN IF NOT EXISTS "seo_image_id" integer;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "contact_page_settings"
        ADD CONSTRAINT "contact_page_settings_seo_image_id_media_id_fk"
        FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "contact_page_settings_seo_seo_image_idx"
      ON "contact_page_settings" USING btree ("seo_image_id");
  `)
  await db.execute(sql`
    ALTER TABLE "contact_page_settings_locales"
      ADD COLUMN IF NOT EXISTS "seo_title" varchar,
      ADD COLUMN IF NOT EXISTS "seo_description" varchar;
  `)

  await db.execute(sql`
    ALTER TABLE "news_page_settings"
      ADD COLUMN IF NOT EXISTS "seo_image_id" integer;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "news_page_settings"
        ADD CONSTRAINT "news_page_settings_seo_image_id_media_id_fk"
        FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "news_page_settings_seo_seo_image_idx"
      ON "news_page_settings" USING btree ("seo_image_id");
  `)
  await db.execute(sql`
    ALTER TABLE "news_page_settings_locales"
      ADD COLUMN IF NOT EXISTS "seo_title" varchar,
      ADD COLUMN IF NOT EXISTS "seo_description" varchar;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'our_business_page_settings'
      ) THEN
        ALTER TABLE "our_business_page_settings"
          ADD COLUMN IF NOT EXISTS "seo_image_id" integer;
      END IF;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'our_business_page_settings'
      ) THEN
        BEGIN
          ALTER TABLE "our_business_page_settings"
            ADD CONSTRAINT "our_business_page_settings_seo_image_id_media_id_fk"
            FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id")
            ON DELETE set null ON UPDATE no action;
        EXCEPTION
          WHEN duplicate_object THEN null;
        END;
      END IF;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'our_business_page_settings'
      ) THEN
        CREATE INDEX IF NOT EXISTS "our_business_page_settings_seo_seo_image_idx"
          ON "our_business_page_settings" USING btree ("seo_image_id");
      END IF;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'our_business_page_settings_locales'
      ) THEN
        ALTER TABLE "our_business_page_settings_locales"
          ADD COLUMN IF NOT EXISTS "seo_title" varchar,
          ADD COLUMN IF NOT EXISTS "seo_description" varchar;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage_settings_locales"
      DROP COLUMN IF EXISTS "seo_title",
      DROP COLUMN IF EXISTS "seo_description";
  `)
  await db.execute(sql`
    ALTER TABLE "homepage_settings" DROP COLUMN IF EXISTS "seo_image_id";
  `)

  await db.execute(sql`
    ALTER TABLE "about_page_settings_locales"
      DROP COLUMN IF EXISTS "seo_title",
      DROP COLUMN IF EXISTS "seo_description";
  `)
  await db.execute(sql`
    ALTER TABLE "about_page_settings" DROP COLUMN IF EXISTS "seo_image_id";
  `)

  await db.execute(sql`
    ALTER TABLE "contact_page_settings_locales"
      DROP COLUMN IF EXISTS "seo_title",
      DROP COLUMN IF EXISTS "seo_description";
  `)
  await db.execute(sql`
    ALTER TABLE "contact_page_settings" DROP COLUMN IF EXISTS "seo_image_id";
  `)

  await db.execute(sql`
    ALTER TABLE "news_page_settings_locales"
      DROP COLUMN IF EXISTS "seo_title",
      DROP COLUMN IF EXISTS "seo_description";
  `)
  await db.execute(sql`
    ALTER TABLE "news_page_settings" DROP COLUMN IF EXISTS "seo_image_id";
  `)

  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'our_business_page_settings_locales'
      ) THEN
        ALTER TABLE "our_business_page_settings_locales"
          DROP COLUMN IF EXISTS "seo_title",
          DROP COLUMN IF EXISTS "seo_description";
      END IF;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'our_business_page_settings'
      ) THEN
        ALTER TABLE "our_business_page_settings" DROP COLUMN IF EXISTS "seo_image_id";
      END IF;
    END $$;
  `)
}
