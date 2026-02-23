CREATE TABLE `stat_items` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`external_id` text,
	`category` text NOT NULL,
	`name` text NOT NULL,
	`metric_type` text NOT NULL,
	`value` real NOT NULL,
	`unit` text NOT NULL,
	`image_key` text,
	`image_url` text,
	`hint` text,
	`source` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`is_manual_override` integer DEFAULT false,
	`last_synced_at` integer,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_stat_items_game` ON `stat_items` (`category`,`status`,`metric_type`);--> statement-breakpoint
CREATE INDEX `idx_stat_items_external` ON `stat_items` (`external_id`,`category`,`metric_type`);