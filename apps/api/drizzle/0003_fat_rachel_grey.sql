PRAGMA foreign_keys=OFF;--> statement-breakpoint

-- 1. Drop dependent tables first
DROP TABLE IF EXISTS `five_seconds_feedback`;--> statement-breakpoint
DROP TABLE IF EXISTS `five_seconds_questions`;--> statement-breakpoint
DROP TABLE IF EXISTS `five_seconds_categories`;--> statement-breakpoint

-- 2. Recreate categories first
CREATE TABLE `five_seconds_categories` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`name_en` text DEFAULT '' NOT NULL,
	`name_ar` text DEFAULT '' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);--> statement-breakpoint

CREATE UNIQUE INDEX `category_name_en_idx` ON `five_seconds_categories` (`name_en`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_name_ar_idx` ON `five_seconds_categories` (`name_ar`);--> statement-breakpoint

-- 3. Recreate questions
CREATE TABLE `five_seconds_questions` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`difficulty` text NOT NULL,
	`category_id` text NOT NULL,
	`deletedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `five_seconds_categories`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint

CREATE UNIQUE INDEX `question_text_idx` ON `five_seconds_questions` (`text`);--> statement-breakpoint

-- 4. Recreate feedback
CREATE TABLE `five_seconds_feedback` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`type` text NOT NULL,
	`comment` text,
	`player_id` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `five_seconds_questions`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint

PRAGMA foreign_keys=ON;