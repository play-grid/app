CREATE TABLE `companies` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`name_en` text NOT NULL,
	`name_ar` text,
	`list_id` text NOT NULL,
	`is_active` integer DEFAULT true,
	`is_manual_override` integer DEFAULT false,
	`last_synced_at` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
