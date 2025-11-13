PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_custom_lists` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_custom_lists`("id", "name", "slug", "createdAt", "updatedAt") SELECT "id", "name", "slug", "createdAt", "updatedAt" FROM `custom_lists`;--> statement-breakpoint
DROP TABLE `custom_lists`;--> statement-breakpoint
ALTER TABLE `__new_custom_lists` RENAME TO `custom_lists`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `custom_lists_slug_unique` ON `custom_lists` (`slug`);