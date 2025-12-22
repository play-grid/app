ALTER TABLE `five_seconds_questions` RENAME COLUMN "question" TO "text";--> statement-breakpoint
DROP INDEX `question_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `question_text_idx` ON `five_seconds_questions` (`text`);--> statement-breakpoint
ALTER TABLE `five_seconds_questions` DROP COLUMN `example_answers`;--> statement-breakpoint
ALTER TABLE `five_seconds_questions` DROP COLUMN `metadata`;