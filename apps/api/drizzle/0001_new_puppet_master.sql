CREATE TABLE `banners` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text NOT NULL,
	`description_en` text,
	`description_ar` text,
	`image_url` text,
	`link_url` text,
	`is_active` integer DEFAULT true NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
