ALTER TABLE `users` ADD `is_anonymous` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `username` text;--> statement-breakpoint
ALTER TABLE `users` ADD `display_username` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);