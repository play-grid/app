-- Create shared countries table
CREATE TABLE `countries` (
  `id` text(24) PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `name_ar` text,
  `flag_url` text NOT NULL,
  `country_code` text NOT NULL UNIQUE,
  `external_id` text,
  `region` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);--> statement-breakpoint
-- Add country_id foreign key to stat_items
ALTER TABLE `stat_items` ADD COLUMN `country_id` text REFERENCES `countries` (`id`);
