PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_five_seconds_questions` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`difficulty` text NOT NULL,
	`category_id` text NOT NULL,
	`deletedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `five_seconds_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_five_seconds_questions`("id", "text", "difficulty", "category_id", "deletedAt", "createdAt", "updatedAt") SELECT "id", "text", "difficulty", "category_id", "deletedAt", "createdAt", "updatedAt" FROM `five_seconds_questions`;--> statement-breakpoint
DROP TABLE `five_seconds_questions`;--> statement-breakpoint
ALTER TABLE `__new_five_seconds_questions` RENAME TO `five_seconds_questions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `question_text_idx` ON `five_seconds_questions` (`text`);--> statement-breakpoint
CREATE TABLE `__new_five_seconds_categories` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`name_en` text DEFAULT '' NOT NULL,
	`name_ar` text DEFAULT '' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_five_seconds_categories`("id", "name_en", "name_ar", "createdAt", "updatedAt") SELECT "id", "name_en", "name_ar", "createdAt", "updatedAt" FROM `five_seconds_categories`;--> statement-breakpoint
DROP TABLE `five_seconds_categories`;--> statement-breakpoint
ALTER TABLE `__new_five_seconds_categories` RENAME TO `five_seconds_categories`;--> statement-breakpoint
CREATE UNIQUE INDEX `category_name_en_idx` ON `five_seconds_categories` (`name_en`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_name_ar_idx` ON `five_seconds_categories` (`name_ar`);--> statement-breakpoint
CREATE TABLE `__new_five_seconds_feedback` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`type` text NOT NULL,
	`comment` text,
	`player_id` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `five_seconds_questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_five_seconds_feedback`("id", "question_id", "type", "comment", "player_id", "createdAt", "updatedAt") SELECT "id", "question_id", "type", "comment", "player_id", "createdAt", "updatedAt" FROM `five_seconds_feedback`;--> statement-breakpoint
DROP TABLE `five_seconds_feedback`;--> statement-breakpoint
ALTER TABLE `__new_five_seconds_feedback` RENAME TO `five_seconds_feedback`;