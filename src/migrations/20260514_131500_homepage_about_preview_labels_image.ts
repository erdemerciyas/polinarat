import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** `aboutPreviewLabels.image` on homepage global — previously only applied via incomplete dev push. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage_settings"
      ADD COLUMN IF NOT EXISTS "about_preview_labels_image_id" integer;
  `)
  await db.execute(sql`
    DO $block$ BEGIN
      ALTER TABLE "homepage_settings"
        ADD CONSTRAINT "homepage_settings_about_preview_labels_image_id_media_id_fk"
        FOREIGN KEY ("about_preview_labels_image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $block$;
  `)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "homepage_settings_about_preview_labels_about_preview_lab_idx"
      ON "homepage_settings" USING btree ("about_preview_labels_image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage_settings" DROP COLUMN IF EXISTS "about_preview_labels_image_id";
  `)
}
