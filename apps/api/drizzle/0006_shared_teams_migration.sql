-- Add external_id column to teams table (without UNIQUE constraint initially)
ALTER TABLE `teams` ADD COLUMN `external_id` text;--> statement-breakpoint
-- Rename logo column to logo_url in teams table
ALTER TABLE `teams` RENAME COLUMN `logo` TO `logo_url`;--> statement-breakpoint
-- Add team_id foreign key to stat_items
ALTER TABLE `stat_items` ADD COLUMN `team_id` text REFERENCES `teams` (`id`);--> statement-breakpoint
-- Add player_id column to stat_items (for future use)
ALTER TABLE `stat_items` ADD COLUMN `player_id` text;
