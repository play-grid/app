CREATE TABLE `five_seconds_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`type` text NOT NULL,
	`comment` text,
	`player_id` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `five_seconds_questions`(`id`) ON UPDATE no action ON DELETE cascade
);
