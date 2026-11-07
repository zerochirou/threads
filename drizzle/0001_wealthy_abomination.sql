CREATE TABLE `communities` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`banner_url` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `communities_slug_unique` ON `communities` (`slug`);--> statement-breakpoint
CREATE TABLE `community_members` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joined_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `community_members_community_user_unique` ON `community_members` (`community_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `community_members_userId_idx` ON `community_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `conversation_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`user_id` text NOT NULL,
	`joined_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conv_participants_conv_user_unique` ON `conversation_participants` (`conversation_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `conv_participants_conversationId_idx` ON `conversation_participants` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `conv_participants_userId_idx` ON `conversation_participants` (`user_id`);--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text DEFAULT 'direct' NOT NULL,
	`title` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `follows` (
	`id` text PRIMARY KEY NOT NULL,
	`follower_id` text NOT NULL,
	`following_id` text NOT NULL,
	`status` text DEFAULT 'accepted' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`follower_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`following_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `follows_follower_following_unique` ON `follows` (`follower_id`,`following_id`);--> statement-breakpoint
CREATE INDEX `follows_followerId_idx` ON `follows` (`follower_id`);--> statement-breakpoint
CREATE INDEX `follows_followingId_idx` ON `follows` (`following_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `messages_conversationId_idx` ON `messages` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `messages_senderId_idx` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `messages_createdAt_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`recipient_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`type` text NOT NULL,
	`thread_id` text,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`recipient_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_recipientId_idx` ON `notifications` (`recipient_id`);--> statement-breakpoint
CREATE INDEX `notifications_actorId_idx` ON `notifications` (`actor_id`);--> statement-breakpoint
CREATE INDEX `notifications_threadId_idx` ON `notifications` (`thread_id`);--> statement-breakpoint
CREATE INDEX `notifications_createdAt_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE TABLE `poll_options` (
	`id` text PRIMARY KEY NOT NULL,
	`poll_id` text NOT NULL,
	`option_text` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `poll_options_pollId_idx` ON `poll_options` (`poll_id`);--> statement-breakpoint
CREATE TABLE `poll_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`poll_id` text NOT NULL,
	`poll_option_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`poll_option_id`) REFERENCES `poll_options`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `poll_votes_poll_user_unique` ON `poll_votes` (`poll_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `poll_votes_pollOptionId_idx` ON `poll_votes` (`poll_option_id`);--> statement-breakpoint
CREATE INDEX `poll_votes_userId_idx` ON `poll_votes` (`user_id`);--> statement-breakpoint
CREATE TABLE `polls` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`question` text NOT NULL,
	`expires_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `polls_threadId_idx` ON `polls` (`thread_id`);--> statement-breakpoint
CREATE TABLE `search_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`query` text NOT NULL,
	`target_user_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `search_history_userId_idx` ON `search_history` (`user_id`);--> statement-breakpoint
CREATE INDEX `search_history_createdAt_idx` ON `search_history` (`created_at`);--> statement-breakpoint
CREATE TABLE `thread_bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`thread_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `thread_bookmarks_user_thread_unique` ON `thread_bookmarks` (`user_id`,`thread_id`);--> statement-breakpoint
CREATE INDEX `thread_bookmarks_userId_idx` ON `thread_bookmarks` (`user_id`);--> statement-breakpoint
CREATE INDEX `thread_bookmarks_threadId_idx` ON `thread_bookmarks` (`thread_id`);--> statement-breakpoint
CREATE TABLE `thread_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`thread_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `thread_likes_user_thread_unique` ON `thread_likes` (`user_id`,`thread_id`);--> statement-breakpoint
CREATE INDEX `thread_likes_userId_idx` ON `thread_likes` (`user_id`);--> statement-breakpoint
CREATE INDEX `thread_likes_threadId_idx` ON `thread_likes` (`thread_id`);--> statement-breakpoint
CREATE TABLE `thread_link_previews` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`url` text NOT NULL,
	`domain` text NOT NULL,
	`title` text,
	`headline` text,
	`subheadline` text,
	`tagline` text,
	`image_url` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `thread_link_previews_threadId_idx` ON `thread_link_previews` (`thread_id`);--> statement-breakpoint
CREATE TABLE `thread_locations` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`name` text NOT NULL,
	`latitude` text,
	`longitude` text,
	FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `thread_locations_threadId_idx` ON `thread_locations` (`thread_id`);--> statement-breakpoint
CREATE TABLE `thread_media` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`mime_type` text,
	`width` integer,
	`height` integer,
	`duration_seconds` integer,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `thread_media_threadId_idx` ON `thread_media` (`thread_id`);--> statement-breakpoint
CREATE TABLE `thread_music` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`audio_url` text,
	`album_art_url` text,
	FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `thread_music_threadId_idx` ON `thread_music` (`thread_id`);--> statement-breakpoint
CREATE TABLE `thread_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text NOT NULL,
	`thread_id` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`reporter_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `thread_reports_reporterId_idx` ON `thread_reports` (`reporter_id`);--> statement-breakpoint
CREATE INDEX `thread_reports_threadId_idx` ON `thread_reports` (`thread_id`);--> statement-breakpoint
CREATE TABLE `thread_reposts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`thread_id` text NOT NULL,
	`quote_content` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `thread_reposts_user_thread_unique` ON `thread_reposts` (`user_id`,`thread_id`);--> statement-breakpoint
CREATE INDEX `thread_reposts_userId_idx` ON `thread_reposts` (`user_id`);--> statement-breakpoint
CREATE INDEX `thread_reposts_threadId_idx` ON `thread_reposts` (`thread_id`);--> statement-breakpoint
CREATE TABLE `user_links` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`label` text NOT NULL,
	`url` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_links_userId_idx` ON `user_links` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_mutes` (
	`id` text PRIMARY KEY NOT NULL,
	`muter_id` text NOT NULL,
	`muted_user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`muter_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`muted_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_mutes_muter_muted_unique` ON `user_mutes` (`muter_id`,`muted_user_id`);--> statement-breakpoint
CREATE INDEX `user_mutes_muterId_idx` ON `user_mutes` (`muter_id`);--> statement-breakpoint
CREATE INDEX `user_mutes_mutedUserId_idx` ON `user_mutes` (`muted_user_id`);--> statement-breakpoint
CREATE TABLE `user_onboarding_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`task_key` text NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_onboarding_tasks_user_task_unique` ON `user_onboarding_tasks` (`user_id`,`task_key`);--> statement-breakpoint
CREATE INDEX `user_onboarding_tasks_userId_idx` ON `user_onboarding_tasks` (`user_id`);--> statement-breakpoint
ALTER TABLE `threads` ADD `parent_thread_id` text REFERENCES threads(id);--> statement-breakpoint
ALTER TABLE `threads` ADD `root_thread_id` text REFERENCES threads(id);--> statement-breakpoint
ALTER TABLE `threads` ADD `thread_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `threads` ADD `reply_privacy` text DEFAULT 'anyone' NOT NULL;--> statement-breakpoint
ALTER TABLE `threads` ADD `is_draft` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `threads` ADD `community_id` text REFERENCES communities(id);--> statement-breakpoint
ALTER TABLE `threads` ADD `like_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `threads` ADD `reply_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `threads` ADD `repost_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `threads` ADD `share_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `threads_authorId_idx` ON `threads` (`author_id`);--> statement-breakpoint
CREATE INDEX `threads_parentThreadId_idx` ON `threads` (`parent_thread_id`);--> statement-breakpoint
CREATE INDEX `threads_rootThreadId_idx` ON `threads` (`root_thread_id`);--> statement-breakpoint
CREATE INDEX `threads_communityId_idx` ON `threads` (`community_id`);--> statement-breakpoint
CREATE INDEX `threads_createdAt_idx` ON `threads` (`created_at`);--> statement-breakpoint
ALTER TABLE `user` ADD `username` text;--> statement-breakpoint
ALTER TABLE `user` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `user` ADD `verified` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `has_follow_badge` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `is_private` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `show_instagram_badge` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `show_recent_views` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `podcast_url` text;--> statement-breakpoint
ALTER TABLE `user` ADD `interests` text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);