CREATE TABLE `web_analyses` (
	`web_id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`url` text(2048) NOT NULL,
	`gemini_model` text(50) NOT NULL,
	`request_payload` text,
	`response_payload` text,
	`analysis_summary` text,
	`status` text(20) DEFAULT 'PENDING' NOT NULL,
	`error_message` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
DROP TABLE `archived_responses`;--> statement-breakpoint
DROP TABLE `jobs`;--> statement-breakpoint
DROP TABLE `responses`;--> statement-breakpoint
ALTER TABLE `users` ADD `provider` text(50);--> statement-breakpoint
ALTER TABLE `users` ADD `provider_id` text(256);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password_hash`;