PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" VALUES(1,'0000_next_quentin_quire.sql','2026-01-29 17:35:11');
INSERT INTO "d1_migrations" VALUES(2,'0001_new_puppet_master.sql','2026-01-29 17:35:11');
INSERT INTO "d1_migrations" VALUES(3,'0002_open_lilith.sql','2026-01-29 17:35:12');
INSERT INTO "d1_migrations" VALUES(4,'0003_ambiguous_stardust.sql','2026-01-29 17:35:12');
CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`timezone` text,
	`city` text,
	`country` text,
	`region` text,
	`region_code` text,
	`colo` text,
	`latitude` text,
	`longitude` text,
	`impersonated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`is_anonymous` integer,
	`username` text,
	`display_username` text,
	`role` text,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`ban_expires` integer
);
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
CREATE TABLE `five_seconds_categories` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`name_en` text DEFAULT '' NOT NULL,
	`name_ar` text DEFAULT '' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
INSERT INTO "five_seconds_categories" VALUES('cat_general_v1','General','عامة',1769708251,1769708251);
INSERT INTO "five_seconds_categories" VALUES('cat_tech_games_v1','Tech & Games','تقنية وألعاب',1769708251,1769708251);
INSERT INTO "five_seconds_categories" VALUES('cat_cinema_v1','Cinema','سينما',1769708251,1769708251);
CREATE TABLE `five_seconds_feedback` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`type` text NOT NULL,
	`comment` text,
	`player_id` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `five_seconds_questions`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "five_seconds_feedback" VALUES('ecdwntgv82yez59y7bhnhbw0','d7caa755-604f-4852-bfcc-578b6915bcaa','too_hard','',NULL,1769779650,1769779650);
INSERT INTO "five_seconds_feedback" VALUES('lmq6vib94gj0c0a2nhwduxgk','36b9a108-d2fa-41dd-8a25-132ca7072d8c','annoying','سيئ',NULL,1769780284,1769780284);
INSERT INTO "five_seconds_feedback" VALUES('fc90s7r5g0usa5ttmpxacrwm','c8b491fd-78d0-4f69-a95b-38ba68f1da66','unclear','',NULL,1769891488,1769891488);
CREATE TABLE `five_seconds_questions` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`difficulty` text NOT NULL,
	`category_id` text NOT NULL,
	"deletedAt" integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `five_seconds_categories`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "five_seconds_questions" VALUES('225d6864-57af-4cca-ba7d-5cbd34e32a3a','دول أوربية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('6944ca3d-8201-4995-9a35-423258c7e4b5','انواع اسلاك','hard','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('c8b491fd-78d0-4f69-a95b-38ba68f1da66','أفلام رعب','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('73e03686-c05a-42c7-bf76-67f7a5871eb8','دول أفريقية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('b1d418c6-66a7-48bc-ad98-e621b53a55bf','ماركات جولات','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('eb1eea51-a2de-47e6-9f04-f6f42d57acfe','مسلسلات جريمة','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('c824472d-cd7c-45a4-bb31-91498f754d46','سور من القرآن من أسماء الأنبياء','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('56a541ce-c597-4feb-9bd9-c07d63265304','أجهزة من شركة أبل','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('4568b49f-1e6a-4f6e-bae9-160d8e5d0ec3','مسلسلات تصنيفها دراما','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('ccafbb45-e633-4399-9899-efc37c330a8d','مسلسلات من إنتاج نيتفلكس','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('43a3bef4-b0b5-43dd-9dcf-166ee702bdd9','شخصيات ديزني','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('c937ffe4-ef7d-4ca0-9d2e-897c2ad6b6fa','انميات مشهورة','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('1a283f0c-28af-41f7-9357-8510874b17c7','مسلسلات سبيستون','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('be36e264-93a0-4954-94ae-06f4d1838498','دول زرتها','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('d62e39e3-a594-49dd-a553-f09643cef805','أبطال خارقين من MARVEL','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('209dd9e2-f72e-49d9-b707-1891171dc7ee','أبطال خارقين من DC','hard','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('32ccb391-c475-4299-903d-27cf634d9b45','ممثلين','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('6e346b2f-4a1d-407b-964f-b3b832031687','مخرجين','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('9654759e-f7e1-402c-87f1-bed76149f41a','حِرف قديمة','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('efe2131c-d7a0-43b4-aa97-faee77e28c30','أنواع كورن فليكس','hard','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('dfe4f243-d2eb-4ef5-8d75-dc0e852fc35a','كواكب','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('528d7c9f-9fd2-4519-9166-ad0ef5432c6b','بحار','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('3f4cbfab-0841-4f9a-9549-3b1180d3fcac','مسلسلات خليجية','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('198b2872-cda9-4bfc-810e-752fbd0c964e','مسلسلات قديمة','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('48bd8610-a168-40c0-b9a4-9748ab3af564','كراتين','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('8c60eb62-4bfa-4890-a76f-b8fe30c1b08a','كراتين قديمة','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('11d811f6-74a4-4b1f-b2c7-b79eb547a9db','ممثلين صوتيين','hard','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('7b69725e-f123-4e1d-95d7-f83c62c2aaa6','قطع موجودة في السيارة','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('3d1592e2-27d3-4d2d-a5f3-b742827d268d','بنوك في السعودية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('cfe9c65e-bec9-4733-9109-a9e21e08544c','تطبيقات تسوق','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('3cdfdfc8-b208-4373-a671-d573a26fff08','من عجائب الدنيا السبع','hard','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('400259d3-2db8-4306-8e5f-19f315daf1d1','حيوانات تطير','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('71763151-21ca-4b92-a8fe-3aeadc371bfa','تخصصات جامعية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('bccbbadd-b549-4dba-8ca4-a353864cfd30','أنواع أجبان','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('72265afc-becd-425e-9921-1bcbae8d4a96','مستلزمات للبر','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('be20da49-1944-4ce7-b49d-949137625f54','شركات شبس','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('69913d2b-802d-4f54-897a-ca8eb17ad563','حشرات','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('f5101647-24ed-4663-9992-835a6eb7d8a9','مكتبات','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('fcd0d4df-cfca-48b0-9de5-08be0851e35c','أنواع ألوان','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('7878fc67-d912-49d6-b8b5-827c4cb33b43','كافيهات','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('d0f7e239-f125-4e35-9ab3-d35fc61c55d0','سوبرماركتات مشهورة في السعودية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('28dd7044-7543-49d3-80b3-9a373b8d5ef7','عواصم بحرف الفاء','hard','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('eb465a3c-aade-47ed-882d-73ebdb98d325','مستلزمات للسفر','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('69df2627-6e42-4256-baf0-69d2be88dcf7','شركات أجبان','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('8b8af73f-f62f-45d4-978f-f9eb97b2eda2','مطاعم وجبات سريعة','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('6a4b4f2f-82fe-4308-98af-c8dae7905cf5','برامج توصيل','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('55090319-0cca-4969-9a7b-611d591d46ca','أكلات رمضان','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('8e829893-57b7-4275-b297-a31d164ee26a','ماركات ثياب','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('4ae9d99b-f5a1-4162-b62c-69ade09f4612','أنواع من الأسماك','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('ace6df96-6902-435f-8ce4-fb8f07cd7216','بقالات في حارتكم','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('790b974c-155d-4bf0-8d7e-e8a8f62d26e3','لهجات عربية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('b3c68b1d-9662-45c8-80de-9c74ed2811cb','أنواع لحوم','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('abe92976-6c16-42cf-abae-f16d8042d92d','عملات عربية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('fd115443-3d1e-4902-9373-e6127d1dd688','ماركات بسكويت','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('19f5fd95-17f3-43d2-baa6-1e9f3b428e0d','أنواع كور','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('37f46023-d5b9-4a59-8463-8c805fd064ab','أغاني عربية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('af0106f5-6975-421f-8a17-79064f36e2df','عناصر كيميائية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('948b66d7-45f6-41b6-9430-ecc3e3b6e3a8','شركات شنط','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('ac9dbf22-6e92-4c44-aaf8-904050c132d1','وزارات سعودية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('f5a08218-f5d7-44c3-b5cf-1f65f7a653ec','جوائز عالمية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('140dc82b-4b3a-4a72-bdb6-cf8a116625f4','شركات سيارات ألمانية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('bca36614-b545-4d07-85f4-672f3d6cc29c','ملاعب','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('8194a2fa-514a-4d7a-9012-cbd94742ced1','أسماء أولاد','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('3b73a519-15ed-474d-beeb-5cd10a36468e','أسماء بنات','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('e56bd6ec-309f-4b8a-a546-622345ce540f','أنواع عصافير','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('4e1ed1d6-41b6-475f-a9b8-fe90c8c98b3a','سور من القرآن من أسماء الحيوانات','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('45a44768-f517-4608-9990-ad772ab601d7','جامعات في السعودية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('d916e856-8419-44e1-b7ed-d35221c58577','حضارات في التاريخ','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('32298f70-a496-4529-aabd-fecc27359747','احتفاليات لاعبين','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('e5bd584c-fe8b-44aa-a0a1-fb2364291846','صالات رياضية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('1407cd79-e580-4358-a71e-0dcb2793a03a','فواكه','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('35b530e0-857b-4401-b299-a905e78da546','ديانات','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('4cf3894d-9df0-45ed-962f-24fbcf13d98b','خضار','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('ff7a3555-4275-49ff-9132-7a72026e813f','قنوات أطفال','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('2e03b470-daf2-4951-b57d-86236539c755','قنوات إخبارية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('421824c1-a182-435e-951e-6cc3adabde04','أدوات مدرسية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('9be59d70-4cf8-4663-b8f6-a79370c420b3','مدن في السعودية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('6d13695d-e100-49e2-8166-e2f38867a9a3','مشروبات ساخنة','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('8e119b85-0e36-42d6-8a8d-2042a1f123ed','أعضاء في جسم الإنسان','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('4d5b3881-8cc9-473f-b434-6346c30b720d','مشروبات غازية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('41d3db94-1f97-4c3e-a3a5-78234a5cdb0b','محلات آيس كريم','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('181676f9-b953-4e3b-8d7e-9225d10605f6','منتجات في السوبر ماركت','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('65ac3c78-f930-469d-b497-341fbbb5da69','علماء عرب','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('26c0cfd9-ce08-4436-8f03-c2f07069289c','علماء مسلمين','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('752b6ba6-851f-453b-a9a4-4267a3eb5377','علماء','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('82169563-0252-4536-abd5-dec0f642b7fa','أندية من إسبانيا','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('d01d3881-8216-4342-b3aa-b65b2ec076d2','أنواع معادن','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('ecd9878d-24bc-4165-ab3d-ae43c275a90c','حروب','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('7001a68b-ca4c-4f58-92e9-42f2144ad607','أنبياء','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('9358a30b-66c5-4ca3-acba-81fcc978d762','أكلات صحية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('1d0e14b3-72d4-4e7b-b58e-818eb34ba0f8','من أسماء الله الحسنى','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('76f08ac3-20c9-4084-a9b1-9e077faaa122','أركان الإسلام','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('268b3033-f391-4e73-bd91-0b2150b37dec','خطوط عربية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('1a95be6b-572a-4603-a867-1e60b99e08be','سوبرماركتات مشهورة في أمريكا','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('4cf5aeca-9d3c-432e-83f5-35fdac699a8d','لاعبين من تشيلسي','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('751382d3-a17f-49d4-abf4-0c3fc4dd9fdf','حيوانات مفترسة','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('f3cbe96a-8c39-45f1-b02d-fc56c1ebda4b','أشهر إنجليزية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('68c2e5b2-f223-4fa1-acf4-b757a981ca5f','أنواع الشاي','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('306a56db-64a4-4b55-8336-1c7ebe6a242f','أنواع زهور','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('10fd9f79-76a4-4d7d-bd87-0f25b9acbb60','ألعاب رياضية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('f487a9fa-28a4-4190-8cf6-853abb2322ca','شركات اتصالات في السعودية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('884f0982-bfa7-4527-a94c-2d1aa061cf27','لاعبين برشلونة','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('6b9678e3-f565-463b-b2c2-d1a49a0a217e','مجمعات في الشرقية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('60b41b42-51f5-4a56-a522-4918b14fc416','أنواع قهوة','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('325bd9b4-28ac-41e1-82b5-ff8a70dca07f','مطاعم بيتزا مشهورة','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('12b84b38-1531-4a8c-b8da-65423fbb91c6','جمادات بحرف أ','hard','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('0f32f26a-cae0-4bc0-8ba9-3063dc098c05','ماركات عطور','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('e61bcf2d-5df1-4ad9-88d8-fce9288150ee','مدن أوروبية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('eb226b24-5ee1-4b54-b885-6db95c6b354f','أنواع طيور','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('40736b3a-1552-4ac1-9f63-253fc487117c','شركات سيارات يابانية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('0e1e4c99-dd11-4b13-a710-4f38e5258769','آلات موسيقية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('c3cf5af0-dd63-46cc-a416-97f825de8bde','أنواع حلويات','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('d43927f9-3586-4940-960c-cbdf8e9a0900','محلات ملابس في السعودية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('65d98362-e1b3-4b17-9ef6-d74eb9184289','ماركات ساعات','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('89d19284-7270-4ca6-8668-b5871f295e37','أنواع أحذية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('40155550-c5af-420d-8876-7ea9dbc96460','أنواع سفن فضائية','hard','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('4b7e30a7-f74e-4b52-b921-664ee6ecb83d','شركات طيران','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('3e940322-4e63-443a-b8f0-574e84559d10','جبال مشهورة','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('54d13090-4c48-42db-b839-ab9fdc7e0631','أنواع سيارات كهربائية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('b027c603-98c7-4074-ade5-4d7bc0870bd9','ماركات مكياج','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('20836649-d467-4382-be02-867f9ba5a083','مستلزمات مطبخ','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('fd77d0eb-9590-456f-96e1-7a3cffaaef4e','أنواع أشجار','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('404e619e-b356-4710-8efb-fdcf1683eb22','معالم سياحية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('239a22cd-0b20-41a3-8f29-474c81d8bfa7','حيوانات مائية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('549dea52-833a-45f1-a738-80e459f3f617','وظائف طبية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('9445dd61-9e34-4407-868f-d5ec735ccc4b','أنواع مشروبات طاقة','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('5e1fca1b-4e70-4fcb-a271-f563e9e45175','ماركات شوكولاتة','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('07fafa48-ecd1-48ad-9c94-e02a8d011fe4','حيوانات أليفة','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('fd831bcf-d747-4d79-ba64-831490b89fb3','مكتبات إلكترونية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('0ad7a0c2-e2df-4a74-b006-4f8a55f34760','أنواع بهارات','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('71fa7f52-15f1-442b-ba08-d97f0a466036','مطاعم شاورما','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('6ef4aa57-6933-4d39-848a-aecea9658ca9','شركات شحن','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('24485c6f-a8ab-41ed-a770-ff15c86e0747','عواصم بحرف الباء','hard','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('675b225c-d9e8-447e-a57b-a4779bcafa3b','مستلزمات رياضية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('341aeb2b-6466-416b-b0d0-98d90088aae9','ماركات معجنات','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('dbc0fa68-37de-41c4-9568-85a1852384f4','مطاعم برجر','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('38cb1fd8-317c-44ce-9be3-2f656cd4d4fc','كتب علمية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('92a62bb3-e874-439a-a83a-6203d7ba172d','تطبيقات توصيل طعام','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('c1d92cc4-fcb4-4f66-b2ca-a3239cdb50b9','شعراء عرب','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('5f519cc7-d753-4680-abe4-01b0b56b12ca','أكلات بحرية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('61da8bc1-c6ca-4c34-ab64-6f76b987e59f','ماركات أحذية رياضية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('688ed261-bcaf-46df-a6ec-a7edcd025cc7','دول آسيوية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('d7caa755-604f-4852-bfcc-578b6915bcaa','أنواع حيتان','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('7f903d5a-c1db-4b86-bbc1-d67ee50af614','محلات حلويات في السعودية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('f8c51b59-15f9-45b5-b40a-3ac2167098c4','أنواع حبوب','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('d7238543-63d5-40d1-8085-c081202b0030','عملات أجنبية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('13814fb3-130b-4d11-9e8c-ed9a02af9e9b','ماركات كعك','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('49cb5085-d8a1-4ef5-9aba-805b880ad6fb','أنواع رياضات مائية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('72fc5e90-5857-40da-ac1d-0653988812b2','عناصر فلزية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('b8c318db-2191-4bf9-a51f-aa5eea3d79e4','ماركات حقائب ظهر','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('2a8d6365-99b5-462b-9576-668adebe97c9','هيئات حكومية سعودية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('3ac30df3-771e-4e46-af4e-92e419e84d73','شركات سيارات كورية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('564758e7-50d0-43d1-bc0b-7b23b5747f1e','ملاعب كرة قدم','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('351582a2-06ac-4ee5-b3e3-6caa98c8f068','أسماء أولاد عربية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('c4773cc9-ae84-4667-87f0-5cb715b82556','أسماء بنات عربية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('c5228b26-8b0e-4d11-8010-83556f53367a','أنواع طيور مفترسه','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('631e2771-85ce-41e3-99c2-4832817cd61b','جامعات عالمية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('743ae219-44c4-413c-a209-31bc38c53085','إمبراطوريات تاريخية','hard','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('c0cdcac1-cf5f-42f5-bd1f-15ede2cc4653','حركات لاعبين مشهورة','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('0dc939fd-fbbb-427f-94c4-1fd2eb9a4353','تمور','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('7ae3b27f-6065-480b-b5f9-7613494659e4','مذاهب دينية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('592da6b7-7588-4147-8028-d68f33a9dd2f','أنواع خضروات ورقية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('084345fd-a423-4374-a78b-362c89a9f114','قنوات رياضية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('44244f8b-8aeb-4973-94b0-2e86105d3c37','أدوات رسم','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('2fc2cba6-e8ba-4c7d-bfa7-9c549d603da4','مدن في الإمارات','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('62d2bf52-11f2-48c2-8656-dfe1331bf4ae','مشروبات باردة','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('e97fdb04-fef8-4e99-8455-1706c7bcb71d','عظام في جسم الإنسان','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('afc647b0-701d-4ff4-af6f-868582c30b36','منتجات ألبان','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('9689d35b-3c7c-4c64-a7dc-e4a07824693d','أندية من إيطاليا','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('d2d6480f-4d39-4d0c-9ab0-ef51ce5204ca','معارك تاريخية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('668be926-9528-43fa-b55c-7330a101fbbb','صحابة الرسول','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('c346d830-11d5-4a6f-9220-f30905726811','أكلات شعبية','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('bfb2f740-6970-4fa3-81fb-e02c853decd2','أسماء الصحابيات','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('7d1868f9-134b-4b28-ad8c-337650530802','من أركان الإيمان','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('eb871e0a-acfa-4bc7-bb39-19e94b66dcb1','لاعبين من مانشستر يونايتد','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('529d0da0-6fbd-438d-aa5d-80a7ac34c70d','حيوانات زاحفة','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('a07aeca7-f57d-442f-ad9d-0fd93ba6d06c','لاعبين ريال مدريد','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('137ae692-5c76-48a4-91ca-b2cc4f04fd5c','أنواع حبوب قهوة','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('10bf7bb8-dc68-4395-b92e-22aed2ca783e','ولايات في الولايات المتحدة الأمريكية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('1b2ad102-ab51-4184-90d4-b9cc921ac202','وسائل نقل','easy','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('e4ca338f-7449-4b88-8ef6-97453cef3748','رؤساء دول حاليين','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('26f4c87e-6c34-4b80-a8b8-7b7997616357','رؤساء دول (سابقين)','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('2f6498a4-854a-4235-a74d-8fdc97a9fa6e','شركات أجهزة منزلية','medium','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('c12f52eb-e819-4b49-9044-91e90f942d5e','ماركات معجون أسنان','hard','cat_general_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('b4159220-c793-404d-8d0d-9c5a7e7f4338','أنظمة كمبيوتر','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('25a54546-8dd8-448e-93f1-959eaea90ada','برامج تواصل','easy','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('90008cc8-7d25-4c33-8e7c-f01eb4c51fa5','حصريات بلاي ستيشن','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('be9d08a4-e6c7-4ed4-bd84-f78963f7db33','شركات لأجهزة ألعاب','easy','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('a9c9108b-3934-478d-8e93-ce2c3256c194','ماركات لابتوبات','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('f6775ed3-5b74-4978-9387-4f2e08a782d5','ألعاب FPS','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('32b1bd28-8977-412d-adbb-1e68c7680211','ألعاب مغامرات','easy','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('4a5dc4e9-0427-483e-9dae-26ba5ebe7a93','ألعاب جوال','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('ab1a2d21-943c-48b1-8baf-e77f1a8cc80b','ألعاب حصلت على جوائز','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('023231c7-6670-4b11-8603-e8f399df0297','(ماتت) ألعاب توقفت شعبيتها','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('45c7184e-4cbf-4987-9664-9e6148acf2ee','قطع في الكمبيوتر','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('9edb6ed7-ba0b-40de-8fc1-7b03d0d7ccdc','متاجر إلكترونية','easy','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('d4ae267b-c357-4d55-b070-3ab75e42f009','برامج محتوى صوتي','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('d76c31f3-19f8-4d9f-9221-5fc2ff6c1ff9','متصفحات','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('38d19dda-e652-4232-9b0f-e35880c8798f','أشياء في سيت أب الكمبيوتر','easy','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('0ec5c724-76b4-4043-aff4-dc8166c28a08','محلات إلكترونيات في السعودية','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('10544fae-4a23-4155-b73f-6b27bf660445','ألعاب رهيبة بالنسبة لك','easy','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('cae47fdf-d1b5-4e33-b45a-a24cfa9df45b','مواقع عربية','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('4ebda406-70de-4eb6-92c7-cc816b295f41','ألعاب استراتيجية','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('1c1d3323-96fe-4dc0-9f61-98eac64ce3e0','أجهزة من شركة سامسونج','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('549bfa2f-ef5e-468b-82e2-d0fef561b4e4','برامج حماية من الفيروسات','hard','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('36b9a108-d2fa-41dd-8a25-132ca7072d8c','pc/العاب حصرية على الإكس بوكس','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('8280cffe-e62c-4545-b295-6ce9ae2c86c5','ألعاب سباقات','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('b9272102-1dca-47b9-a4d0-1c51cb260862','ألعاب متعددة اللاعبين (multiplayer)','easy','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('d095feeb-0e7e-49ff-978c-904e72145a2f','مكونات الهاتف الذكي','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('2472ac0f-4d85-4751-80c5-f84a2132aa36','ألعاب كلاسيكية','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('01bf568d-60b7-4b53-8d26-597beb34db70','محافظ اكترونية','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('9ef12342-e7a5-4b49-8e4f-f6835da82a32','مكونات في الكمبيوتر','hard','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('a8240e71-7dd1-43a3-b8d4-4cd1c4674684','محلات ألعاب في السعودية','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('acff22ad-5669-41e6-8b12-1837676e33ef','ألعاب نينتندو','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('abf9acf3-7fa0-4821-9fcb-bc8229dab0e5','ألعاب قتالية','medium','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('55a8c865-6273-423c-822c-d9ab4dc86cd8','شركات اتصالات عالمية','hard','cat_tech_games_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('5f43a52a-64be-4dcc-9857-2277e4602478','شخصيات أنمي','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('902cdaac-dd6c-457a-813f-e3b8ab6c3604','شخصيات من عالم الكرتون','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('cde3f5e3-7d61-4ead-b9b0-f9209bd4112b','أفلام حصلت على أوسكار','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('a2b61dd0-a862-4703-8f4c-ce8b28039ddc','مسلسلات حصلت على جوائز','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('17cfa1bb-96b7-44eb-b36c-09303e9a62ab','شركات منتجة للأفلام','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('25b3b9ee-0490-4132-8d34-742cadbf0f5d','أشياء في السينما','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('efaddaf7-ef2c-41c4-8d46-5d08bb9ce3df','أفلام أكشن','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('2bd36d40-ecc9-4301-932e-83a6782ba461','منصات مشاهدة','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('aea6a1c3-6eae-4e9d-8cae-a2e768f8bdaf','شركات سينما','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('d2bee470-4f81-4e77-b87e-5f47fb953bf3','أحسن مسلسلات عندك / كِ','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('53f53b56-bf3b-489a-b903-97c5353721e6','أحسن أفلام عندك / كِ','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('26a6f8e7-d817-4c38-b62f-89e9ada64cbd','أفلام أنتجت هذه السنة','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('2071fda3-7131-4a33-aae0-0b15c132baf9','روايات','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('8856b3b4-66ae-4aaf-ba62-4f56e7e384f2','كُتاب كتب','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('f48fafe9-5f8c-455e-86dd-18ac9efabd13','شعراء','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('c3164b9a-e848-4291-b5c0-4067cfd7efb3','أفلام كوميدية','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('34a84bf6-c3e5-4f7a-aa64-b83b431b77f3','مسلسلات خيال علمي','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('7912c16a-5906-45ea-90fc-c0801786cf2c','أفلام وثائقية','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('9e204b34-b853-4083-a3db-228721b687d1','مسلسلات كرتونية للأطفال','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('6e047628-7c46-4f4d-a564-bae5522b2863','أفلام رسوم متحركة','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('1f961f73-bdb5-433f-86c3-fb6b615d296b','شخصيات مارفل','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('b204001f-411f-48f1-a4b5-283bc0382eb0','مسلسلات كوميدية عربية','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('57935430-b305-4243-a1a0-98be44c35547','أفلام خيال علمي','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('ca3b3d66-d4a9-4b35-b3a9-75afcf91ad08','ممثلين عرب','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('75e571d8-d1cf-4b5d-84d2-70097c0dbdc7','مخرجين عرب','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('9c974a90-a9db-4b3d-95b9-d37f165d90b8','مسلسلات تركية','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('fdae62e3-8ef7-45e4-bf1f-72d566d5df84','مسلسلات أجنبية','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('f0f29d4a-0033-4efe-abdd-fde462af9081','كرتون نتورك','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('a5df58f1-2258-422b-bdca-363f17c32e68','كرتون ديزني','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('0ee03b78-cb65-43f5-b04a-dafc8d068d80','ممثلين كوميديين','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('07f6e4b5-3a86-4a12-b621-dfc9e4a1b636','شخصيات كرتونية مضحكة','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('39ff057b-ec16-4f10-8bf3-5af7a66ff318','أفلام ديزني','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('ccfcb6bb-eb93-4d01-ac47-48fc1681c94c','شركات إنتاج أنمي','medium','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('02b10902-9f4e-42c3-84a7-0b417182e7a7','أشياء في المسرح','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('cd22853c-1396-47f5-9bde-e5c6a07f17ad','أفلام مغامرات','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('0f23dce0-0717-4554-8f3a-7702c3580720','مغنيين عرب','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('238a8526-9b84-4d7c-995b-2a2e63ef5028','مغنين اجانب','easy','cat_cinema_v1',NULL,1769708251,1769708251);
INSERT INTO "five_seconds_questions" VALUES('ff7886f6-bf6b-469d-b1be-dec2fdb57737','جوائز سينمائية','medium','cat_cinema_v1',NULL,1769708251,1769708251);
CREATE TABLE `custom_list_items` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`team_id` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `custom_lists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "custom_list_items" VALUES('xgwjp9awtp0etj8aziib02du','uv2q1hxe07a2v4wdnvawjb93','qnjg8t7vn79fwcgqlxtxexyn',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('m29mils26k6vgdyv1x9gyo4x','uv2q1hxe07a2v4wdnvawjb93','c75ue635ctfwg6boowew29nx',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('kwnz50f95nyatkmgwllba13o','uv2q1hxe07a2v4wdnvawjb93','yh5v2c5zf5ipcsiwvkcccqc4',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('xh7vbx99uuk3hsi7pksc4292','uv2q1hxe07a2v4wdnvawjb93','ckprd346m0nun4xadbirrek5',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('y4szwk9agki5s8iscyos2239','uv2q1hxe07a2v4wdnvawjb93','gcmyrmiz6u9dgxkbdy8f5gtd',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('v7fgzpihv90totd6jnx9zbq6','uv2q1hxe07a2v4wdnvawjb93','hyhle35322hbann01ag6u3u7',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('y26lxlr5foz8bfs1nq6xm64d','uv2q1hxe07a2v4wdnvawjb93','qp6dukift4l5r22xv43v2c8s',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('tm8q6a52p662ap0b6gayz9v5','uv2q1hxe07a2v4wdnvawjb93','zliuyjq4m9wd0pykefm8572e',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('d1dxcqmyeshqlk0g2dabkvpn','uv2q1hxe07a2v4wdnvawjb93','zaq09rfgneu7atjpq2dfc7ak',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('z6j9xnp5iy8uoh6tk2vqdgu7','uv2q1hxe07a2v4wdnvawjb93','tgvqd79w08u5lystk0f88x4e',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('y3ad9qhnwapcpgn6jqwv10qb','uv2q1hxe07a2v4wdnvawjb93','fx73r1c3b3e8yx9aa8jk4c55',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('vbfi63gx2z477qfqavfpfdpg','uv2q1hxe07a2v4wdnvawjb93','z0fem5xdli1gnu393m4vcavm',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('yp9abp45ghncag51n3wcwz88','uv2q1hxe07a2v4wdnvawjb93','zdc4qineugzpmz6721h7zlcd',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('jmkz64xodskgkseljlvuegrj','uv2q1hxe07a2v4wdnvawjb93','ot3h05b9h28grj2inqhezv43',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('fgj65nwo6fcukq7pialiqdf7','uv2q1hxe07a2v4wdnvawjb93','sorkbsj51u4bkl7yto0su07d',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('s4kfwzglrkk7rf8a13ynxxv0','uv2q1hxe07a2v4wdnvawjb93','zlrr9pb3kpq4zd0dinsm1gg7',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('zqzqpgcqy80xu8udl5ikgr5g','uv2q1hxe07a2v4wdnvawjb93','m94bibv67e6jtxo1yao03lyp',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('h6ei0xjqesxk6uvxorzwm5ba','uv2q1hxe07a2v4wdnvawjb93','olpyle1egtuhqthvezyd3mun',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('xyddpdncz5hicz6iqy94id7s','uv2q1hxe07a2v4wdnvawjb93','oooe9gmrkea1cv2gatnku22h',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('hlnyks72qpj29osaaizw35ur','uv2q1hxe07a2v4wdnvawjb93','nbq6magg7l0iy6orcf9n8r2o',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('gxbmanhj2gwromht3zcsn0z5','uv2q1hxe07a2v4wdnvawjb93','dvsbufl9jcv7kxu9vg320v0i',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('kxvchz2e1chqhebm94rtr7fg','uv2q1hxe07a2v4wdnvawjb93','b6p89bnp8d4c5rhgu4vshplk',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('soxvzzyr0zqvya47esn9223a','uv2q1hxe07a2v4wdnvawjb93','xyl0obllvkhfparsspmvvd68',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('t9vfmfww0a38gswkt87p0vea','uv2q1hxe07a2v4wdnvawjb93','fyjq62inbywl09utzuyxpnuk',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('vjmo7ta5piw5lngxmrrecaj0','uv2q1hxe07a2v4wdnvawjb93','atx5tqo3e5go7ewvw81vuh1e',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('vw4m0klj8hygsr4imuhnl7le','uv2q1hxe07a2v4wdnvawjb93','tz3ln2q5j5c1srg16l7d4bdo',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('wlb9q50mfmjfrnp7k2lvp6o8','uv2q1hxe07a2v4wdnvawjb93','f8lizlid7oi7vqottpmf4hjw',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('iwvxsfo3qvachmiw97s5onjx','uv2q1hxe07a2v4wdnvawjb93','wol9z8y7ey1zl4yf1yf1fm84',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('lc6a3bkhejodw46srnz8rem4','uv2q1hxe07a2v4wdnvawjb93','awho9aqh627yul41pxmricrh',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('lbz4r8sp2089nhpvq8jy43if','uv2q1hxe07a2v4wdnvawjb93','etcik6e877mqmd3leqk5unuq',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('bfodvsk0jckgtjqxizzyvepx','uv2q1hxe07a2v4wdnvawjb93','kgoc04st2tmeuggh4hc3atnw',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('ehhtgl6yny5y7u0dpdexruqd','uv2q1hxe07a2v4wdnvawjb93','sy18zam3grij0ahkfpntsn4b',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('agl3a4epbiqdo3i4vqp3tif8','uv2q1hxe07a2v4wdnvawjb93','shnn37i8vaashlgtbkdjoqa0',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('v3rkeqvbuhra48e8deufmhax','uv2q1hxe07a2v4wdnvawjb93','ijssvfvkg4ksdm6yhf2a1ohr',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('admn1pu8tk3o505ghgf45omb','uv2q1hxe07a2v4wdnvawjb93','o6nroij6mo5ukwzxqhfthluv',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('pinhjsns7u3c3fw928gci3vr','uv2q1hxe07a2v4wdnvawjb93','qvg11ia1pqlip2rq1vo01kju',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('m7vwiy6l1oy9bnyds5ykv22n','uv2q1hxe07a2v4wdnvawjb93','td0z13ogdve2ybnks0x2vun7',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('bp3ba4dcpswngyrf6yd3amfv','uv2q1hxe07a2v4wdnvawjb93','rerzm9ml1cq47h06e027auik',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('s23fde46pkis77aqaq0qpng4','uv2q1hxe07a2v4wdnvawjb93','ul0bd7s9ls488s9g5brd4vuq',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('ep6oct9sjzm53cpe3ykcjo63','uv2q1hxe07a2v4wdnvawjb93','h1azonpu61ix6zcv900rveqe',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('bbf89d9dk5634axsjr9h7spf','uv2q1hxe07a2v4wdnvawjb93','v6nrkww52zjypcro1e5onp97',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('zupkee0h02mddwezf3mc1mob','uv2q1hxe07a2v4wdnvawjb93','fdmezvhf8p7xxxwlau0arkx1',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('zrsy9goiyz6mukj59zrzxl5k','uv2q1hxe07a2v4wdnvawjb93','x10vgvzu3h88kodqk7aysjxx',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('s3vp7kiy4nly9du5gt8hi6nl','uv2q1hxe07a2v4wdnvawjb93','fx4fb07o2yibhavgfkepuojp',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('oonfq8fqbq6zxiqz4m8omr1a','uv2q1hxe07a2v4wdnvawjb93','el4q8i5nlgj0y9brh1l0fgrb',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('n83m7ljcnt9xy2ftpbjtnnrz','uv2q1hxe07a2v4wdnvawjb93','d3h7vlcf5s0mtdjy3xurup5n',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('e1ptx36co7densd0ue91ippg','uv2q1hxe07a2v4wdnvawjb93','awz2xlwgvrpuawhdd8fxd3ih',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('wznj270a7ss7lctzwoih792g','uv2q1hxe07a2v4wdnvawjb93','w83sjgqvgai9ijv68z1kk7pt',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('gtfuqk29eijtrmakde50b2fd','uv2q1hxe07a2v4wdnvawjb93','jhw828r0deoafmn29cynt73y',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('jzbnutoxer0xh3k0p2pdocpb','uv2q1hxe07a2v4wdnvawjb93','o64ietno99zizl2r9tecpraf',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('dg9xkejt8crpqobjusn75jlu','uv2q1hxe07a2v4wdnvawjb93','gomb05rmi1t5a2q3rth7eoqj',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('g6yl1vgtm60e9a360ldafw3j','uv2q1hxe07a2v4wdnvawjb93','t7g8j1exzvwhl6zqzqtpc7y6',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('ca20dnkdjr7ut0qij8j6nkwl','uv2q1hxe07a2v4wdnvawjb93','zv2ut2mqdn60ueunfbs8azuo',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('tco6pkp1g5sqyjtu5suydsez','uv2q1hxe07a2v4wdnvawjb93','lnx6yspzrk5hnrr6tt4zskzi',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('wpd5rbrw8j4l6w2e76tbedog','uv2q1hxe07a2v4wdnvawjb93','hg4fuupdpdwbfl07tc3c1ypz',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('c21ed9mc38jqjstgm0ljo7lx','uv2q1hxe07a2v4wdnvawjb93','dolfrtarpgjrwkn9nxo1m6yk',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('cv7c71e88my57bha333uqxdo','uv2q1hxe07a2v4wdnvawjb93','mymk0bv3ogwpwmxqgg5bolzv',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('by5brdfrbn2y64rwqjg080w0','uv2q1hxe07a2v4wdnvawjb93','ozgyqx1di4qi59q2wzfbhpvp',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('upo3h6ni48bir14y303q7xty','uv2q1hxe07a2v4wdnvawjb93','qi9okxi231gvliwn26aw39tk',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('bc5fsmdlzr6hqhjnsq5uxp3m','uv2q1hxe07a2v4wdnvawjb93','kqvgrg35jm7m99gxo5pisceg',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('abpzddlajuinyq6en5kjx4i7','uv2q1hxe07a2v4wdnvawjb93','n090g8abbbafrxanofzns8n6',1769708251,1769708251);
INSERT INTO "custom_list_items" VALUES('galb6eu6wt7jmvo6u7fot3cf','uv2q1hxe07a2v4wdnvawjb93','dexgjy23xat9pttbi3sk8id9',1769708251,1769708251);
CREATE TABLE `custom_lists` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
INSERT INTO "custom_lists" VALUES('uv2q1hxe07a2v4wdnvawjb93','Top Teams','top-teams',1769708251,1769708251);
CREATE TABLE `leagues` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`region_id` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`region_id`) REFERENCES `sport_regions`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "leagues" VALUES('wrz9dskv553n0fbliso7lda1','League','Jordan','flqnjtp3kpzbferaoo7a6pm3',1769708251,1769708251);
INSERT INTO "leagues" VALUES('v23bvq534wpr332o3fjjggka','Regionalliga - Mitte','Austria','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('afudc5havi1t18edlkzg7q9l','Regionalliga - Ost','Austria','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('uqkefsj3dhfn4gx16wey2zyy','Regionalliga - West','Austria','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('ydgigugj96nxdvu0sdfk4k78','Jupiler Pro League','Belgium','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('gawb0e9xat9a9hkiveq4rhow','Third Amateur Division - ACFF A','Belgium','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('hpc3eh3y1hi9qvvketqemuf0','Third Amateur Division - ACFF B','Belgium','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('qryomjuycwphd3qk0035qlym','Provincial - Brabant ACFF','Belgium','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('umkwmuj1kqe61zt88fwyfyv1','1. Division','Denmark','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('hm9s3234vcgzyoz60bnqzv9t','Denmark Series - Group 1','Denmark','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('j27sthsvg4nosl4agh32eczn','Denmark Series - Group 2','Denmark','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('etep60y30j257cbf70mh0pvy','Premier League','England','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('ylzruklaavu3cr563ug17l9e',' Premier League - North','England','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('z7w16b1tno4yoeied1sd09gr',' Premier League - South','England','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('b7vd47wbaaoujfqruau49ywi','WSL Cup','England','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('ecxzxytk9f6tux0c526jlveg','Women''s Championship','England','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('ubhh4d64ypimk9h844l1qdto','Premier League 2 Division One','England','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('e10ugdve9p1jsdut9xyb39kh','Professional Development League','England','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('i296ccsknpfcx3rewt7krlq8','Ligue 1','France','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('ox26kbnlkqsb3wpyhkywm5l0','Bundesliga','Germany','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('rz2ahnkwc6zmyikoao0nu387','Serie A','Italy','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('ew6q09re7wq0nmjya13pul54','Campionato Primavera - 1','Italy','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('x2ltwml7au3leg86rv4kr5fm','Campionato Primavera - 2','Italy','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('p3rwousl39ockw1wz9mpi86d','Eredivisie','Netherlands','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('vt53pe2klvzjg94z568mphb5','Primeira Liga','Portugal','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('yejul5yi32dhcjcp5myuu3r2','Liga Revelação U23','Portugal','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('t5ylhfz66288jmphl64iyg5x','La Liga','Spain','iz3plzunlht25sza2i03nvnm',1769708251,1769708251);
INSERT INTO "leagues" VALUES('xee2qc0f3fv3gcajfridgd2d','Premier League','Jamaica','ssntwka2j8ar5t8d1in8lsrr',1769708251,1769708251);
INSERT INTO "leagues" VALUES('zhiv3gi2ri4m0yi8xdfuwk69','Cup','Albania','lh3nlxdhw3ig29c53ualzwtl',1769708251,1769708251);
INSERT INTO "leagues" VALUES('tqrdq9liqdnmuxgshuidyrpv','Super Cup','Albania','lh3nlxdhw3ig29c53ualzwtl',1769708251,1769708251);
INSERT INTO "leagues" VALUES('k017l1jopelckquzabgmgx9j','Premyer Liqa','Azerbaijan','lh3nlxdhw3ig29c53ualzwtl',1769708251,1769708251);
INSERT INTO "leagues" VALUES('zbhcep6gvx9k63kkn1yjnlpx','HKFA 1st Division','Hong-Kong','lh3nlxdhw3ig29c53ualzwtl',1769708251,1769708251);
INSERT INTO "leagues" VALUES('va7eeqeind6b5jfbncxnkdkp','1. Division','Kazakhstan','lh3nlxdhw3ig29c53ualzwtl',1769708251,1769708251);
INSERT INTO "leagues" VALUES('pvppzbeea4h4vvl41apyldvo','Professional League','Oman','lh3nlxdhw3ig29c53ualzwtl',1769708251,1769708251);
INSERT INTO "leagues" VALUES('vcign948t917l0r8gxoke9rq','Pro League','Saudi-Arabia','lh3nlxdhw3ig29c53ualzwtl',1769708251,1769708251);
INSERT INTO "leagues" VALUES('lrdqomw1atrc76t3e1x7vq6w','Division 1','Saudi-Arabia','lh3nlxdhw3ig29c53ualzwtl',1769708251,1769708251);
INSERT INTO "leagues" VALUES('a4teagufabhhkjfu9ju2x9vo','Premiership','Scotland','lh3nlxdhw3ig29c53ualzwtl',1769708251,1769708251);
INSERT INTO "leagues" VALUES('oztfofgie64uo46qeoxi7lg3','Welsh Cup','Wales','lh3nlxdhw3ig29c53ualzwtl',1769708251,1769708251);
INSERT INTO "leagues" VALUES('kmxhhzvcsze7qhl4u6f8konv','Serie A','Brazil','hwgt0spwxz1oye69uqopmu42',1769708251,1769708251);
INSERT INTO "leagues" VALUES('dufy7woem33aed9w071j4iwv','Primera División','Venezuela','hwgt0spwxz1oye69uqopmu42',1769708251,1769708251);
INSERT INTO "leagues" VALUES('hi207bostv9mykdxcmzlhwur','Segunda División','Venezuela','hwgt0spwxz1oye69uqopmu42',1769708251,1769708251);
CREATE TABLE `sport_regions` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`name_en` text NOT NULL,
	`name_ar` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
INSERT INTO "sport_regions" VALUES('flqnjtp3kpzbferaoo7a6pm3','asia','asia',1769708251,1769708251);
INSERT INTO "sport_regions" VALUES('iz3plzunlht25sza2i03nvnm','europe','europe',1769708251,1769708251);
INSERT INTO "sport_regions" VALUES('ssntwka2j8ar5t8d1in8lsrr','north-america','north-america',1769708251,1769708251);
INSERT INTO "sport_regions" VALUES('lh3nlxdhw3ig29c53ualzwtl','other','other',1769708251,1769708251);
INSERT INTO "sport_regions" VALUES('hwgt0spwxz1oye69uqopmu42','south-america','south-america',1769708251,1769708251);
CREATE TABLE `teams` (
	`id` text(24) PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`logo` text NOT NULL,
	`league_id` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "teams" VALUES('bgt3oia4z5mmt00s1yvond5l','Al Ahli','https://media.api-sports.io/football/teams/4529.png','wrz9dskv553n0fbliso7lda1',1769708251,1769708251);
INSERT INTO "teams" VALUES('cnxbega1ucl8c6v6cofzdqap','Al Faisaly','https://media.api-sports.io/football/teams/4531.png','wrz9dskv553n0fbliso7lda1',1769708251,1769708251);
INSERT INTO "teams" VALUES('jste2gyvk7mrl748xhumsh3w','Al Hussein','https://media.api-sports.io/football/teams/4532.png','wrz9dskv553n0fbliso7lda1',1769708251,1769708251);
INSERT INTO "teams" VALUES('rz3pfj8x57piy7oozgc22dr1','Al Ramtha','https://media.api-sports.io/football/teams/4534.png','wrz9dskv553n0fbliso7lda1',1769708251,1769708251);
INSERT INTO "teams" VALUES('psaycasfo3c1mypsol2imzxf','Al Salt','https://media.api-sports.io/football/teams/4535.png','wrz9dskv553n0fbliso7lda1',1769708251,1769708251);
INSERT INTO "teams" VALUES('y0jq84sgu5g73grp0p43xgd3','Al Wihdat','https://media.api-sports.io/football/teams/4537.png','wrz9dskv553n0fbliso7lda1',1769708251,1769708251);
INSERT INTO "teams" VALUES('d5wivemti17ia5pebnezwptr','Aqaba','https://media.api-sports.io/football/teams/4538.png','wrz9dskv553n0fbliso7lda1',1769708251,1769708251);
INSERT INTO "teams" VALUES('mipmb6da0xhxnz6d9i7bbbw9','Shabab Al Ordon','https://media.api-sports.io/football/teams/4539.png','wrz9dskv553n0fbliso7lda1',1769708251,1769708251);
INSERT INTO "teams" VALUES('i3acsa4mloyqtws73c3jbi81','Sahab','https://media.api-sports.io/football/teams/4543.png','wrz9dskv553n0fbliso7lda1',1769708251,1769708251);
INSERT INTO "teams" VALUES('e66ewumuagc4hvi3k1lya2bq','Ma''an','https://media.api-sports.io/football/teams/10121.png','wrz9dskv553n0fbliso7lda1',1769708251,1769708251);
INSERT INTO "teams" VALUES('xrhfq6ozgs3td8o8kyjl0dsr','Al Jalil','https://media.api-sports.io/football/teams/11474.png','wrz9dskv553n0fbliso7lda1',1769708251,1769708251);
INSERT INTO "teams" VALUES('rx5ar7kq6scyag9u96gmkb62','Moghayer Al Sarhan','https://media.api-sports.io/football/teams/17467.png','wrz9dskv553n0fbliso7lda1',1769708251,1769708251);
INSERT INTO "teams" VALUES('burubx9uxivljesg0glzvsqu','SK Vorwarts Steyr','https://media.api-sports.io/football/teams/1406.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('vpenxz9cd8k9ef21alowtzbf','Allerheiligen','https://media.api-sports.io/football/teams/4934.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('d2zs1hfhnjh8g18zpwuefpyo','Bad Gleichenberg','https://media.api-sports.io/football/teams/4935.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('yt3fxn7j7xao646144ra706w','Gleisdorf 09','https://media.api-sports.io/football/teams/4940.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('cr5xv99v60buyf8xi3gbto8m','Gurten','https://media.api-sports.io/football/teams/4942.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('h47hpavsv9qlicdvu5rrheji','St. Anna','https://media.api-sports.io/football/teams/4959.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('e9wtgtjczir30vnzt2enhn9x','Union Vöcklamarkt','https://media.api-sports.io/football/teams/4964.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('a9cp4x4f1t0n6smnpzf4mpb1','Deutschlandsberger SC','https://media.api-sports.io/football/teams/4972.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('cjria9yomy6g3ir4zogehcig','Weiz','https://media.api-sports.io/football/teams/4996.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('nkkgsxd3c67eonv4qg2whnzn','Ried II','https://media.api-sports.io/football/teams/8250.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('rbdr2qwnbakjm1ayl9wj81q4','Wolfsberger AC II','https://media.api-sports.io/football/teams/8253.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('pbmfptaie0b7cs9j5nb2q32v','Voitsberg','https://media.api-sports.io/football/teams/8332.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('i39tl32o7nwnw4qvemauva7y','LASK Juniors','https://media.api-sports.io/football/teams/11225.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('n2ay952hkb6unw7ah0wvq34y','ASK Klagenfurt','https://media.api-sports.io/football/teams/17197.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('quvam50myrnt8cxtxkdmovon','Wallern / Marienkirchen','https://media.api-sports.io/football/teams/21534.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('n0wg54b78oa02lgwus31xl2m','WSPG Wels','https://media.api-sports.io/football/teams/22213.png','v23bvq534wpr332o3fjjggka',1769708251,1769708251);
INSERT INTO "teams" VALUES('t5vbhrpn4m41hhnk0uuetqdx','Austria Vienna (Am)','https://media.api-sports.io/football/teams/2860.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('vlpas6jdhpnxv84wsfk5fu4l','Draßburg','https://media.api-sports.io/football/teams/4937.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('qa2lr230djmjcjtu71l49j1y','Leobendorf','https://media.api-sports.io/football/teams/4951.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('ljstwp5wn5yboegpobd6p4fd','Mannsdorf-Großenzersdorf','https://media.api-sports.io/football/teams/4952.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('qs35ivm1m2xx3b7dh2iav5uc','Mauerwerk','https://media.api-sports.io/football/teams/4953.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('y445ttdisqlwpvxn15gipst0','Neusiedl','https://media.api-sports.io/football/teams/4954.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('akj1l6ygiqy0sbw5xz954q0d','Traiskirchen','https://media.api-sports.io/football/teams/4961.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('fjlig5uwn8nkkglsgn7ov21x','Wiener SC','https://media.api-sports.io/football/teams/4965.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('rget7yu7gi994k3zsga5bvgt','Wiener Viktoria','https://media.api-sports.io/football/teams/4966.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('ld9tfnc84ouy2yend1tg4oaj','Krems','https://media.api-sports.io/football/teams/5004.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('band3v4i8feca6alrp5atqsh','Rapid Wien II','https://media.api-sports.io/football/teams/8247.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('r0a5ox90569d63yxy7sut3o4','Oberwart / Rotenturm','https://media.api-sports.io/football/teams/8271.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('zhrzgd16cnf5j9ymtrykhjtl','Ardagger','https://media.api-sports.io/football/teams/8281.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('kar7nhbpo2d86rqf7brlzm0n','Fach-Donaufeld','https://media.api-sports.io/football/teams/8366.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('qi6kfwa3xv43xukiiwa15wbn','Favoritner AC','https://media.api-sports.io/football/teams/8367.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('vjlnkb570m65osffiybs5f54','TWL Elektra','https://media.api-sports.io/football/teams/16999.png','afudc5havi1t18edlkzg7q9l',1769708251,1769708251);
INSERT INTO "teams" VALUES('mu5j38b5599q651mtfnlvil4','Hohenems','https://media.api-sports.io/football/teams/4945.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('zh8wk6wfnz3xafnyoyc2h52l','Kufstein','https://media.api-sports.io/football/teams/4948.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('z237z8wqdeu4dvxbnw3p1oud','Schwaz','https://media.api-sports.io/football/teams/4957.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('ibtygdd94cahfs6p3sx9quyo','Wolfurt','https://media.api-sports.io/football/teams/4968.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('qvdcawhcs48wjgx2esf3uqmo','Dornbirner SV','https://media.api-sports.io/football/teams/4973.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('qbm1mizwyjglc53mr5jf3fy6','Pinzgau Saalfelden','https://media.api-sports.io/football/teams/4980.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('nv8sgm4b1oghskc7os4l1r89','SVG Reichenau','https://media.api-sports.io/football/teams/4981.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('vk4j5zsizaq8zol6ftfu8kue','TSV St. Johann','https://media.api-sports.io/football/teams/4994.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('em4931l941gggnx4z92jo1gc','Austria Salzburg','https://media.api-sports.io/football/teams/5000.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('cn49z7nslxaqq0hdrf3fhydk','Rheindorf Altach II','https://media.api-sports.io/football/teams/8256.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('hful304274ax2wye40a4oeu1','Rot-Weiß Rankweil','https://media.api-sports.io/football/teams/8257.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('qu5vyylzmbraevboifqotci0','Röthis','https://media.api-sports.io/football/teams/8258.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('fwokxvvohgagj8jp6lmtqbx1','Bischofshofen','https://media.api-sports.io/football/teams/8260.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('qjuvmw2k1xhnpnw18ee21w1n','Wals-Grünau','https://media.api-sports.io/football/teams/8261.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('zxwa67qzqjwry1uqsxdcsvym','Silz / Mötz','https://media.api-sports.io/football/teams/8342.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('bx5wsnl7y8qn58swjkxszmqe','Imst','https://media.api-sports.io/football/teams/14709.png','uqkefsj3dhfn4gx16wey2zyy',1769708251,1769708251);
INSERT INTO "teams" VALUES('z3nt192tqo7zpfskbt6wcdi2','Lommel United','https://media.api-sports.io/football/teams/259.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('ug1qcu1kf1fzrhaoifozc7jt','OH Leuven','https://media.api-sports.io/football/teams/260.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('qz5r6gtudfgeun6tuej8j7id','KVC Westerlo','https://media.api-sports.io/football/teams/261.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('vrta2pwmpgqj8h90dtokw87g','KV Mechelen','https://media.api-sports.io/football/teams/266.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('zc71cyhxwwzp9gvynlt1vfsl','Anderlecht','https://media.api-sports.io/football/teams/554.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('ay8ny4u0a7pu0f7tbo699wpm','Club Brugge KV','https://media.api-sports.io/football/teams/569.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('ojl5pkx040mm52wpuvmib3nj','Gent','https://media.api-sports.io/football/teams/631.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('fhdrbr9t03jgywt7xac7qn67','Standard Liege','https://media.api-sports.io/football/teams/733.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('k3bjmpebwoxpqx8vp8wwrydp','Kortrijk','https://media.api-sports.io/football/teams/734.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('tv4xiujm121wq7o77mndxlf6','St. Truiden','https://media.api-sports.io/football/teams/735.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('tyhfimy329r2c8wfk7fv107c','Charleroi','https://media.api-sports.io/football/teams/736.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('ovstegiohj3vgb8oh09q10g0','AS Eupen','https://media.api-sports.io/football/teams/739.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('lybi1nw4pk4elhk3vpqts7h8','Antwerp','https://media.api-sports.io/football/teams/740.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('onycxpr2ec3kgxqpf3nzkcck','Cercle Brugge','https://media.api-sports.io/football/teams/741.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('lrz5aekaxpfy3fq7rtc3t8wu','Genk','https://media.api-sports.io/football/teams/742.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('awclsftgol6zqvc29xqu3t8n','Union St. Gilloise','https://media.api-sports.io/football/teams/1393.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('b1jj4vd0593edhpkdb7mgah6','RWDM','https://media.api-sports.io/football/teams/6224.png','ydgigugj96nxdvu0sdfk4k78',1769708251,1769708251);
INSERT INTO "teams" VALUES('jhex8kym8c6g346zmt0qd8p3','Aische','https://media.api-sports.io/football/teams/5739.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('krta4pqjjvze1ocucdxbey0s','Belœil','https://media.api-sports.io/football/teams/5750.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('oi8rkubdzbrd4anpxhjh6skq','Braine','https://media.api-sports.io/football/teams/5764.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('h4ndnypi9x52v7zu2tva9xot','Couvin-Mariembourg','https://media.api-sports.io/football/teams/5769.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('qlwpf663hakljzwvk0cxj5vb','Crossing Schaerbeek','https://media.api-sports.io/football/teams/5770.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('bfctk5woj1bcbq5f4mkt1zx1','Entité Manageoise','https://media.api-sports.io/football/teams/5793.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('k1aphj6356mojcxldulbub27','Jodoigne','https://media.api-sports.io/football/teams/5838.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('q0s96z43jcueblio4plg3x2w','Onhaye','https://media.api-sports.io/football/teams/5888.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('accg9nj66icdfmhf3gts308o','Ostiches','https://media.api-sports.io/football/teams/5893.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('g4vkdf1tv14vn63ahskpryrv','Rapid Symphorinois','https://media.api-sports.io/football/teams/5909.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('gsf7j8pti60tufp8fe84oxx8','Wallonne Ciney','https://media.api-sports.io/football/teams/5982.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('kqomwp8g4smzfouv6gmt212i','RAS Monceau','https://media.api-sports.io/football/teams/8452.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('wqy1mw0j481eq65huxg8z6ae','Jeunesse Tamines','https://media.api-sports.io/football/teams/8488.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('fl7p0ytq7v2s4vzyc7esouvr','Arquet','https://media.api-sports.io/football/teams/14150.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('hqbd6mzne920d64kq80daprw','Perwez','https://media.api-sports.io/football/teams/19521.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('d22cgl16y6ow6d37drk78e40','Flénu','https://media.api-sports.io/football/teams/19779.png','gawb0e9xat9a9hkiveq4rhow',1769708251,1769708251);
INSERT INTO "teams" VALUES('z1jxsqi344r559e8ad6ck8as','Aywaille','https://media.api-sports.io/football/teams/5747.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('yij564fa3svl5e8yenkc5wgp','Elsautoise','https://media.api-sports.io/football/teams/5791.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('tbj9var10pds43o9yldm0zuv','Habay-la-Neuve','https://media.api-sports.io/football/teams/5814.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('smwyub2gtoc9n18ervhs050f','Herstal','https://media.api-sports.io/football/teams/5821.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('gxv1uvejqgcigjr6whgkx3cv','Huy','https://media.api-sports.io/football/teams/5832.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('qjdjdq0le22nza10kpp0zozr','Meix-Devant-Virton','https://media.api-sports.io/football/teams/5870.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('l6ops9rbhg3cnws17xbij2di','Mormont','https://media.api-sports.io/football/teams/5876.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('lkcq0d3x4qshvhtunyk7aibg','Raeren-Eynatten','https://media.api-sports.io/football/teams/5908.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('j0o5mekuwt1uqmox74po5649','Richelle United','https://media.api-sports.io/football/teams/5913.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('z0819xgt456rbnytknkycgb0','Sprimont','https://media.api-sports.io/football/teams/5935.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('pha3wbl761hl1z80wwb1zm4b','Wanze / Bas-Oha','https://media.api-sports.io/football/teams/5983.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('zrbp3ss3g2hadrp63mi9gvv5','Waremme','https://media.api-sports.io/football/teams/5984.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('b9p0vg480p3b8rat2x2opzdk','Gouvy','https://media.api-sports.io/football/teams/8478.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('q11y6bughupg4zgdsokowbhd','Marloie Sport','https://media.api-sports.io/football/teams/8481.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('wkokv359u5j4snleae2n2l3y','Longlier','https://media.api-sports.io/football/teams/15164.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('k97e82cbo715nmap46u31kkf','Seraing II','https://media.api-sports.io/football/teams/19901.png','hpc3eh3y1hi9qvvketqemuf0',1769708251,1769708251);
INSERT INTO "teams" VALUES('sdy00kxu51sb4iavb26tzc73','Ixelles','https://media.api-sports.io/football/teams/5833.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('zzpro57nvt7lufndymn2xsu5','Kosova Schaerbeek','https://media.api-sports.io/football/teams/5850.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('vjk42m6v8z4x5gz5hhuk4rw6','Léopold','https://media.api-sports.io/football/teams/5865.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('fax3dsqvu3mtvbp8eys5h5fl','Saint-Josse','https://media.api-sports.io/football/teams/5919.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('yy25sa5p0y44l0sa2lzcexz7','Stade Everois','https://media.api-sports.io/football/teams/5939.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('lxazkrrgx7mipud64xiq29hb','Union Lasne-Ohain','https://media.api-sports.io/football/teams/5963.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('hovjyx57fid99ktbyfc2jb2k','BX Brussels','https://media.api-sports.io/football/teams/8431.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('f96t2abnp168abm7k28v5kck','Genappe','https://media.api-sports.io/football/teams/8435.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('hgswoytp0zjijeohx84sov6n','Sporting Bruxelles','https://media.api-sports.io/football/teams/8444.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('jgukta6bz1zbbmz4ls94enix','Waterloo','https://media.api-sports.io/football/teams/8446.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('qp27gsct82a3394hg8ombmfr','Grez-Doiceau','https://media.api-sports.io/football/teams/15172.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('b3hphot0mtscbh1uio4pecl3','NSeth Berchem','https://media.api-sports.io/football/teams/15173.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('tvi9ekzeu3odldc642ln8dx9','Tubize II','https://media.api-sports.io/football/teams/17495.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('nlzzizjacwjt8n5sydjej6p7','Saint-Michel','https://media.api-sports.io/football/teams/19778.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('efupb6j95wusidn5oduh5k0b','Auderghem','https://media.api-sports.io/football/teams/21777.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('lj88qo5bf1qney8wtkorznqq','Amicii Bruxelles','https://media.api-sports.io/football/teams/21852.png','qryomjuycwphd3qk0035qlym',1769708251,1769708251);
INSERT INTO "teams" VALUES('op3dcduhiqcuub8m1zl9cp25','Sonderjyske','https://media.api-sports.io/football/teams/396.png','umkwmuj1kqe61zt88fwyfyv1',1769708251,1769708251);
INSERT INTO "teams" VALUES('fn6rol5bvbxo1gvx9n7txei0','Vendsyssel FF','https://media.api-sports.io/football/teams/399.png','umkwmuj1kqe61zt88fwyfyv1',1769708251,1769708251);
INSERT INTO "teams" VALUES('lezw6w0w1j0vxvh30dhzsizx','Aalborg','https://media.api-sports.io/football/teams/402.png','umkwmuj1kqe61zt88fwyfyv1',1769708251,1769708251);
INSERT INTO "teams" VALUES('x62l4g5293nidb4fu42vd8o1','AC Horsens','https://media.api-sports.io/football/teams/404.png','umkwmuj1kqe61zt88fwyfyv1',1769708251,1769708251);
INSERT INTO "teams" VALUES('gapemxaksmyyedi9b7k6gq7l','Hobro','https://media.api-sports.io/football/teams/408.png','umkwmuj1kqe61zt88fwyfyv1',1769708251,1769708251);
INSERT INTO "teams" VALUES('s080d56mdgich5ebhlb4wo97','FC Fredericia','https://media.api-sports.io/football/teams/2061.png','umkwmuj1kqe61zt88fwyfyv1',1769708251,1769708251);
INSERT INTO "teams" VALUES('cehx24nizv0046bmtglf66mb','FC Helsingor','https://media.api-sports.io/football/teams/2062.png','umkwmuj1kqe61zt88fwyfyv1',1769708251,1769708251);
INSERT INTO "teams" VALUES('wh2bftd2b00rseksxwjwpwmk','HB Koge','https://media.api-sports.io/football/teams/2063.png','umkwmuj1kqe61zt88fwyfyv1',1769708251,1769708251);
INSERT INTO "teams" VALUES('l9xrmacdqe9che7m8rg47ktd','Naestved','https://media.api-sports.io/football/teams/2066.png','umkwmuj1kqe61zt88fwyfyv1',1769708251,1769708251);
INSERT INTO "teams" VALUES('whyxqgfejjdvt7oma3agv84a','Kolding IF','https://media.api-sports.io/football/teams/4676.png','umkwmuj1kqe61zt88fwyfyv1',1769708251,1769708251);
INSERT INTO "teams" VALUES('n6ds3i4z2xrk89pcqc4gq7on','B 93','https://media.api-sports.io/football/teams/6009.png','umkwmuj1kqe61zt88fwyfyv1',1769708251,1769708251);
INSERT INTO "teams" VALUES('zmpd2sgfa2szr6d39b1w0puu','Hillerød','https://media.api-sports.io/football/teams/6026.png','umkwmuj1kqe61zt88fwyfyv1',1769708251,1769708251);
INSERT INTO "teams" VALUES('mobrnllxwj39lib8kpyj3j5o','Brønshøj','https://media.api-sports.io/football/teams/6012.png','hm9s3234vcgzyoz60bnqzv9t',1769708251,1769708251);
INSERT INTO "teams" VALUES('d1n5dj3yacvy7y0v5axm64lq','Herlev','https://media.api-sports.io/football/teams/6024.png','hm9s3234vcgzyoz60bnqzv9t',1769708251,1769708251);
INSERT INTO "teams" VALUES('vi7loc6752djtxbssszidehf','KFUM Roskilde','https://media.api-sports.io/football/teams/6384.png','hm9s3234vcgzyoz60bnqzv9t',1769708251,1769708251);
INSERT INTO "teams" VALUES('xad5rt1a2lu6w0k4rv2xjlt7','Allerød','https://media.api-sports.io/football/teams/8636.png','hm9s3234vcgzyoz60bnqzv9t',1769708251,1769708251);
INSERT INTO "teams" VALUES('a68ey4vakdqakvlkaewev6w1','Tårnby FF','https://media.api-sports.io/football/teams/8640.png','hm9s3234vcgzyoz60bnqzv9t',1769708251,1769708251);
INSERT INTO "teams" VALUES('o7avx9sbx1gwcl4ovhgmj2b3','AB Tårnby','https://media.api-sports.io/football/teams/8641.png','hm9s3234vcgzyoz60bnqzv9t',1769708251,1769708251);
INSERT INTO "teams" VALUES('m14oqel1z5qhapk1yd5juvra','Greve','https://media.api-sports.io/football/teams/8644.png','hm9s3234vcgzyoz60bnqzv9t',1769708251,1769708251);
INSERT INTO "teams" VALUES('ue4tbx8r8cwhnii131t92qm9','Sundby','https://media.api-sports.io/football/teams/11566.png','hm9s3234vcgzyoz60bnqzv9t',1769708251,1769708251);
INSERT INTO "teams" VALUES('b8iohefdcmzjn8efong6whox','Næstved II','https://media.api-sports.io/football/teams/11627.png','hm9s3234vcgzyoz60bnqzv9t',1769708251,1769708251);
INSERT INTO "teams" VALUES('f4qeks2mdoksuwl30ja8ldj2','Gørslev','https://media.api-sports.io/football/teams/19305.png','hm9s3234vcgzyoz60bnqzv9t',1769708251,1769708251);
INSERT INTO "teams" VALUES('m6xemg2ecu02054h35a1uf1b','B 1908','https://media.api-sports.io/football/teams/6008.png','j27sthsvg4nosl4agh32eczn',1769708251,1769708251);
INSERT INTO "teams" VALUES('fwqs3r7vsrswlgtikz559fi0','Karlslunde','https://media.api-sports.io/football/teams/6033.png','j27sthsvg4nosl4agh32eczn',1769708251,1769708251);
INSERT INTO "teams" VALUES('ck13bytwpqk8b7ppef1sme1g','LSF','https://media.api-sports.io/football/teams/6037.png','j27sthsvg4nosl4agh32eczn',1769708251,1769708251);
INSERT INTO "teams" VALUES('am7liz5d3ybfzuhemw4z6uol','Skjold Sæby','https://media.api-sports.io/football/teams/6055.png','j27sthsvg4nosl4agh32eczn',1769708251,1769708251);
INSERT INTO "teams" VALUES('tvvbqg6flejrz16uiuzigb0t','Slagelse B&I','https://media.api-sports.io/football/teams/6057.png','j27sthsvg4nosl4agh32eczn',1769708251,1769708251);
INSERT INTO "teams" VALUES('e20ou4mo5xm490yg3i86ek1l','Frederikssund','https://media.api-sports.io/football/teams/8642.png','j27sthsvg4nosl4agh32eczn',1769708251,1769708251);
INSERT INTO "teams" VALUES('wwzt1p01vm9iry0fcvmblyos','Hørsholm-Usserød','https://media.api-sports.io/football/teams/11507.png','j27sthsvg4nosl4agh32eczn',1769708251,1769708251);
INSERT INTO "teams" VALUES('ii66s6v8kbel9833ojndz2no','Ringsted','https://media.api-sports.io/football/teams/11532.png','j27sthsvg4nosl4agh32eczn',1769708251,1769708251);
INSERT INTO "teams" VALUES('k3a7qnh7h6ftstvu2lkfr55w','VB 1968','https://media.api-sports.io/football/teams/11536.png','j27sthsvg4nosl4agh32eczn',1769708251,1769708251);
INSERT INTO "teams" VALUES('uyytdizr9t3qbe2dsnzc5vfb','Glostrup','https://media.api-sports.io/football/teams/14445.png','j27sthsvg4nosl4agh32eczn',1769708251,1769708251);
INSERT INTO "teams" VALUES('qnjg8t7vn79fwcgqlxtxexyn','Manchester United','https://media.api-sports.io/football/teams/33.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('ax1m7ez7u6b7lmskhsip1i87','Newcastle','https://media.api-sports.io/football/teams/34.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('xmmvcrza5w8rljhbso3zi2ll','Bournemouth','https://media.api-sports.io/football/teams/35.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('c75ue635ctfwg6boowew29nx','Fulham','https://media.api-sports.io/football/teams/36.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('ah2j2jl7jdk72jji0ckmne09','Wolves','https://media.api-sports.io/football/teams/39.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('yh5v2c5zf5ipcsiwvkcccqc4','Liverpool','https://media.api-sports.io/football/teams/40.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('ckprd346m0nun4xadbirrek5','Arsenal','https://media.api-sports.io/football/teams/42.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('uyq03tugt0t0782d24ldxdig','Burnley','https://media.api-sports.io/football/teams/44.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('gcmyrmiz6u9dgxkbdy8f5gtd','Everton','https://media.api-sports.io/football/teams/45.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('ebju5q0er6ej5x6tyqqy32dt','Tottenham','https://media.api-sports.io/football/teams/47.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('hmgp4benlxl7yiywn2f9k039','West Ham','https://media.api-sports.io/football/teams/48.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('hyhle35322hbann01ag6u3u7','Chelsea','https://media.api-sports.io/football/teams/49.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('c4ee1dvugk4yg9jxfklw24k6','Manchester City','https://media.api-sports.io/football/teams/50.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('si96rzr5javk0g6s09qcmjvb','Brighton','https://media.api-sports.io/football/teams/51.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('z6cyde7mojwx3vykhfczye5o','Crystal Palace','https://media.api-sports.io/football/teams/52.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('qp6dukift4l5r22xv43v2c8s','Brentford','https://media.api-sports.io/football/teams/55.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('xc5ukwqe4wtx7tqnhiofsldc','Sheffield Utd','https://media.api-sports.io/football/teams/62.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('tgvqd79w08u5lystk0f88x4e','Nottingham Forest','https://media.api-sports.io/football/teams/65.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('zliuyjq4m9wd0pykefm8572e','Aston Villa','https://media.api-sports.io/football/teams/66.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('v6hnfv4zadk6bj0o3nxcfbed','Luton','https://media.api-sports.io/football/teams/1359.png','etep60y30j257cbf70mh0pvy',1769708251,1769708251);
INSERT INTO "teams" VALUES('n2h3v7zjc10ukyt4lm3pc6qj','Blackburn Rovers ','https://media.api-sports.io/football/teams/15375.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('ta6myurqjj5fn26zp1j9sr16','Derby County ','https://media.api-sports.io/football/teams/15377.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('gxdjl18g6hja1yxfyaffpf17','Everton ','https://media.api-sports.io/football/teams/15378.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('t05fy2s1z640wl5dzu8sd3za','Leeds United ','https://media.api-sports.io/football/teams/15379.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('p3d48iawni1hmyrejn55iz6p','Liverpool ','https://media.api-sports.io/football/teams/15380.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('mne1r9go0tynh0ufhgicymbt','Manchester City ','https://media.api-sports.io/football/teams/15381.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('s34ceban6zxk54zeq66spxwt','Manchester United ','https://media.api-sports.io/football/teams/15382.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('ilsm5mqsz478vvt0io158j4x','Middlesbrough ','https://media.api-sports.io/football/teams/15383.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('flwb9f6dx6m66ujk9g5jmq2g','Newcastle United ','https://media.api-sports.io/football/teams/15384.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('aprn5dh2xxkhenosd75v0cac','Stoke City ','https://media.api-sports.io/football/teams/15385.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('gr9d2bdied7n6ib1ycyxrj1f','Sunderland ','https://media.api-sports.io/football/teams/15386.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('zx5rn4qaw97xmn64mhvl11sl','Wolves ','https://media.api-sports.io/football/teams/15387.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('p9yf2gmn1mgddxx51obmu1ic','Nottingham Forest ','https://media.api-sports.io/football/teams/17426.png','ylzruklaavu3cr563ug17l9e',1769708251,1769708251);
INSERT INTO "teams" VALUES('lgydwectb6ubspao1e39fhs2','Arsenal ','https://media.api-sports.io/football/teams/15388.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('w32xktrqg8ezw7s772cjwwaw','Aston Villa ','https://media.api-sports.io/football/teams/15389.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('vvhu50m8n0ah44p8f2quyr74','Brighton ','https://media.api-sports.io/football/teams/15390.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('mkmggucg18f6efljc0pnj3n4','Chelsea ','https://media.api-sports.io/football/teams/15391.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('eiohipde7uxxdlz84nvxwvo4','Crystal Palace ','https://media.api-sports.io/football/teams/15392.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('ivc78vi8lhgvoa3gcl88onbx','Fulham ','https://media.api-sports.io/football/teams/15393.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('flfkjvrru04lzndio3nrxeii','Leicester City ','https://media.api-sports.io/football/teams/15394.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('qltpx0za630viux56dcasl4r','Norwich City ','https://media.api-sports.io/football/teams/15395.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('vga4ithvp13848wbyh7tthhj','Reading ','https://media.api-sports.io/football/teams/15396.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('sa34pmm2dhu1700b0una8aa0','Southampton ','https://media.api-sports.io/football/teams/15397.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('fqwr14v4h3aneosqpuwze0ha','Tottenham Hotspur ','https://media.api-sports.io/football/teams/15398.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('nc873hqvx5ifx3hv9fddc9in','West Bromwich Albion ','https://media.api-sports.io/football/teams/15399.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('mb50un73w9vijfmaifs2j5om','West Ham United ','https://media.api-sports.io/football/teams/15400.png','z7w16b1tno4yoeied1sd09gr',1769708251,1769708251);
INSERT INTO "teams" VALUES('pc41la50tsymlarar9fsn30y','Bristol City W','https://media.api-sports.io/football/teams/1846.png','b7vd47wbaaoujfqruau49ywi',1769708251,1769708251);
INSERT INTO "teams" VALUES('h7oy8mxy2kt1v5uc26e8y8b9','Liverpool W','https://media.api-sports.io/football/teams/1847.png','b7vd47wbaaoujfqruau49ywi',1769708251,1769708251);
INSERT INTO "teams" VALUES('b42ev9uqojliigk7km1a5uhr','Arsenal W','https://media.api-sports.io/football/teams/1850.png','b7vd47wbaaoujfqruau49ywi',1769708251,1769708251);
INSERT INTO "teams" VALUES('ix9wecixlb0yrl17tev17qr0','Chelsea W','https://media.api-sports.io/football/teams/1853.png','b7vd47wbaaoujfqruau49ywi',1769708251,1769708251);
INSERT INTO "teams" VALUES('bietqmigrhjg6a2bfxpeknjg','Manchester City W','https://media.api-sports.io/football/teams/1854.png','b7vd47wbaaoujfqruau49ywi',1769708251,1769708251);
INSERT INTO "teams" VALUES('jm41ly5hqqvhx7lmn4dmp9se','Everton W','https://media.api-sports.io/football/teams/1855.png','b7vd47wbaaoujfqruau49ywi',1769708251,1769708251);
INSERT INTO "teams" VALUES('s01haxmll60e6dqzxpcdn24k','West Ham W','https://media.api-sports.io/football/teams/1856.png','b7vd47wbaaoujfqruau49ywi',1769708251,1769708251);
INSERT INTO "teams" VALUES('i7tfxx7sd2oqcp75z0azsdsk','Brighton W','https://media.api-sports.io/football/teams/1857.png','b7vd47wbaaoujfqruau49ywi',1769708251,1769708251);
INSERT INTO "teams" VALUES('rq5jcjgtv69psylfuh5qqfor','Tottenham Hotspur W','https://media.api-sports.io/football/teams/4899.png','b7vd47wbaaoujfqruau49ywi',1769708251,1769708251);
INSERT INTO "teams" VALUES('jqmhuajdok6v571tevs2l5t2','Aston Villa W','https://media.api-sports.io/football/teams/14219.png','b7vd47wbaaoujfqruau49ywi',1769708251,1769708251);
INSERT INTO "teams" VALUES('vmqvfhb2fp4z579w3uv4gr71','Leicester City ','https://media.api-sports.io/football/teams/15404.png','b7vd47wbaaoujfqruau49ywi',1769708251,1769708251);
INSERT INTO "teams" VALUES('aruivlzbkozzxcfsf4e4e5a9','Birmingham City W','https://media.api-sports.io/football/teams/1845.png','ecxzxytk9f6tux0c526jlveg',1769708251,1769708251);
INSERT INTO "teams" VALUES('a0b67bewybwg265iod15crjg','Sunderland W','https://media.api-sports.io/football/teams/1848.png','ecxzxytk9f6tux0c526jlveg',1769708251,1769708251);
INSERT INTO "teams" VALUES('w2dfu6c9u8ciloxcqdog4qvx','Reading W','https://media.api-sports.io/football/teams/1852.png','ecxzxytk9f6tux0c526jlveg',1769708251,1769708251);
INSERT INTO "teams" VALUES('j16k1lrkhrtw16t170fsl9fr','Blackburn Rovers W','https://media.api-sports.io/football/teams/15401.png','ecxzxytk9f6tux0c526jlveg',1769708251,1769708251);
INSERT INTO "teams" VALUES('f9rsefmgk45654kdvl9o766c','Charlton Athletic W','https://media.api-sports.io/football/teams/15402.png','ecxzxytk9f6tux0c526jlveg',1769708251,1769708251);
INSERT INTO "teams" VALUES('zmc293sqejlntykptjeuehgt','Durham W','https://media.api-sports.io/football/teams/15403.png','ecxzxytk9f6tux0c526jlveg',1769708251,1769708251);
INSERT INTO "teams" VALUES('ba6xe5rlms4i57251tcsuq6y','London City Lionesses','https://media.api-sports.io/football/teams/15406.png','ecxzxytk9f6tux0c526jlveg',1769708251,1769708251);
INSERT INTO "teams" VALUES('vef3382ydj4b642g5ipzqiwd','Sheffield United W','https://media.api-sports.io/football/teams/15407.png','ecxzxytk9f6tux0c526jlveg',1769708251,1769708251);
INSERT INTO "teams" VALUES('bortxljrpc72wscgmc5vjmql','Crystal Palace W','https://media.api-sports.io/football/teams/15409.png','ecxzxytk9f6tux0c526jlveg',1769708251,1769708251);
INSERT INTO "teams" VALUES('r9mle2ovw3u84yash9is0la8','Lewes W','https://media.api-sports.io/football/teams/15410.png','ecxzxytk9f6tux0c526jlveg',1769708251,1769708251);
INSERT INTO "teams" VALUES('ldt1v3792f8aeihopu6c18jd','Southampton W','https://media.api-sports.io/football/teams/15454.png','ecxzxytk9f6tux0c526jlveg',1769708251,1769708251);
INSERT INTO "teams" VALUES('s1wbazeqkbfkhl31clv69qq5','Watford W','https://media.api-sports.io/football/teams/15457.png','ecxzxytk9f6tux0c526jlveg',1769708251,1769708251);
INSERT INTO "teams" VALUES('xnj910npfj59ubs45d70wfmu','Arsenal','https://media.api-sports.io/football/teams/7189.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('kwo90a7sx84wy1vs0zsukdtm','Aston Villa','https://media.api-sports.io/football/teams/7190.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('xl6mlc190nkq46plgbovnhbq','Brighton','https://media.api-sports.io/football/teams/7191.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('fdjco23harftajdspc2bul04','Chelsea','https://media.api-sports.io/football/teams/7192.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('u4jsansekgns8f68tmuip1e1','Everton','https://media.api-sports.io/football/teams/7193.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('ln184zdntdp9tfkhaemxix99','Fulham','https://media.api-sports.io/football/teams/7194.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('fx73r1c3b3e8yx9aa8jk4c55','Leicester City','https://media.api-sports.io/football/teams/7195.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('uesn7lfhese4r1z8ni8njq1q','Liverpool','https://media.api-sports.io/football/teams/7196.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('lx0gh3lmonorpokd7au08eu4','Manchester City','https://media.api-sports.io/football/teams/7197.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('zf9sd60pwox4gdzbm9m8jj7w','Manchester United','https://media.api-sports.io/football/teams/7198.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('zaq09rfgneu7atjpq2dfc7ak','Newcastle United','https://media.api-sports.io/football/teams/7199.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('ukd8hpxid12e6zpf0v785xg9','Norwich City','https://media.api-sports.io/football/teams/7200.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('z8vb41f0x6f6zrt1lpxp9wph','Southampton','https://media.api-sports.io/football/teams/7201.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('zdc4qineugzpmz6721h7zlcd','Tottenham Hotspur','https://media.api-sports.io/football/teams/7202.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('z0fem5xdli1gnu393m4vcavm','West Ham United','https://media.api-sports.io/football/teams/7203.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('ms4c39aoa15yxm1eaurpz29n','Wolves','https://media.api-sports.io/football/teams/7204.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('v2f9ywk3vedysmm3y96hfiyf','Middlesbrough','https://media.api-sports.io/football/teams/11910.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('p0hupxxk9hjbdd6xayt16tae','Stoke City','https://media.api-sports.io/football/teams/11911.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('lha7e2grdv9tv0k8yhj1t9ab','West Bromwich Albion','https://media.api-sports.io/football/teams/11913.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('qjfk4elr111xiwrpnma88wlq','Reading','https://media.api-sports.io/football/teams/11914.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('f7f8p6lwwx2dpfxxg1imjvjx','Sunderland','https://media.api-sports.io/football/teams/11915.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('bz685mdswqbmpaj7j9u6lrat','Leeds United','https://media.api-sports.io/football/teams/14430.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('qcpkphdxeas1tstvdw2xnxl9','Crystal Palace','https://media.api-sports.io/football/teams/17000.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('jea5jsi7u0pqp8mseqf8i4jo','Blackburn Rovers','https://media.api-sports.io/football/teams/19744.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('eqkdkdyd0ritdpalb26h1r8g','Derby County','https://media.api-sports.io/football/teams/19745.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('mtcyql24k9itk2g9kwm99xtq','Nottingham Forest','https://media.api-sports.io/football/teams/19746.png','ubhh4d64ypimk9h844l1qdto',1769708251,1769708251);
INSERT INTO "teams" VALUES('i5yimuwfd4caxfbqbuitbuv8','Swansea City','https://media.api-sports.io/football/teams/11912.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('ot3h05b9h28grj2inqhezv43','AFC Bournemouth','https://media.api-sports.io/football/teams/20000.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('rw803c6n1t9t2nggskorn8kw','Cardiff City','https://media.api-sports.io/football/teams/20016.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('yv94v1p75yl6zylht3fzpp3s','Peterborough United','https://media.api-sports.io/football/teams/20018.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('jqq7zi6p03ne3mzf0mgsmj2x','Watford','https://media.api-sports.io/football/teams/20019.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('fg9xn2po0n2wffuqwx4hdic7','Birmingham City','https://media.api-sports.io/football/teams/20078.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('u0ch0eqi5uacazz2vd7yx2t4','Bristol City','https://media.api-sports.io/football/teams/20080.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('b6wngpve8g6wsesaqquwc8i6','Burnley','https://media.api-sports.io/football/teams/20081.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('ka01b8rgg7u22fz5dnm42yoo','Charlton Athletic','https://media.api-sports.io/football/teams/20082.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('diw377hvtk8eqjl75545kk6q','Colchester United','https://media.api-sports.io/football/teams/20083.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('kg71c2gbarg18oz5qlslawu6','Hull City','https://media.api-sports.io/football/teams/20084.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('sorkbsj51u4bkl7yto0su07d','Queens Park Rangers','https://media.api-sports.io/football/teams/20085.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('zmyfmwmzahb09eug8g8egciu','Sheffield United','https://media.api-sports.io/football/teams/20086.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('c2tj2qfw9sdz91k46a61zsum','Barnsley','https://media.api-sports.io/football/teams/20091.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('leyx6gj748l3tthofdfvromp','Coventry City','https://media.api-sports.io/football/teams/20092.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('wdtokfi5iwzjyhlwk8qxgusq','Crewe Alexandra','https://media.api-sports.io/football/teams/20093.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('fon2n4lju5wkst5qudnyqg90','Ipswich Town','https://media.api-sports.io/football/teams/20094.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('q7afdkwq7e5diicvwe18pwvg','Millwall','https://media.api-sports.io/football/teams/20095.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('ljiy6qbe0255pwztkwif6w1t','Sheffield Wednesday','https://media.api-sports.io/football/teams/20096.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('f3jsgz04oqbr18s0it42ryhj','Wigan Athletic','https://media.api-sports.io/football/teams/20097.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('rby3r4ajv88qrnohzfb8x43i','Fleetwood Town','https://media.api-sports.io/football/teams/22173.png','e10ugdve9p1jsdut9xyb39kh',1769708251,1769708251);
INSERT INTO "teams" VALUES('zlrr9pb3kpq4zd0dinsm1gg7','Lille','https://media.api-sports.io/football/teams/79.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('fnfe4kt8wofpdd0xfv2s218p','Lyon','https://media.api-sports.io/football/teams/80.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('fhi879mcm6huqep02qhq56a1','Marseille','https://media.api-sports.io/football/teams/81.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('qpw0dkja85ccfek7xcioirz7','Montpellier','https://media.api-sports.io/football/teams/82.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('wmfqhgchbcpg04bs073pl4h7','Nantes','https://media.api-sports.io/football/teams/83.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('m94bibv67e6jtxo1yao03lyp','Nice','https://media.api-sports.io/football/teams/84.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('olpyle1egtuhqthvezyd3mun','Paris Saint Germain','https://media.api-sports.io/football/teams/85.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('wdtp1y8qujjr172kle0oqlzq','Monaco','https://media.api-sports.io/football/teams/91.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('u7sg9migw9rtl2zgqulwkbuj','Reims','https://media.api-sports.io/football/teams/93.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('krlh88yef89iihmyb1lslzdp','Rennes','https://media.api-sports.io/football/teams/94.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('z560tcy92xyc63iqsmt6fa4b','Strasbourg','https://media.api-sports.io/football/teams/95.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('p9dcjb16bjmh90js0qe6ua3u','Toulouse','https://media.api-sports.io/football/teams/96.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('xitv40ph4fqci7matigb62y0','Lorient','https://media.api-sports.io/football/teams/97.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('bi2hj0b7rxpe4isru51109xy','Clermont Foot','https://media.api-sports.io/football/teams/99.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('tamsc56e0g0yfj4skhqe1vk7','Stade Brestois 29','https://media.api-sports.io/football/teams/106.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('ql1xu7mtqid57bazz6xtxofe','Le Havre','https://media.api-sports.io/football/teams/111.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('y8k0awafuwvm007gxcv4qsqg','Metz','https://media.api-sports.io/football/teams/112.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('ig6lnyt65zo8x26qhc9ke9c5','Lens','https://media.api-sports.io/football/teams/116.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('ivtw8fc9jlp5ght7yd7f7ipu','Saint Etienne','https://media.api-sports.io/football/teams/1063.png','i296ccsknpfcx3rewt7krlq8',1769708251,1769708251);
INSERT INTO "teams" VALUES('oooe9gmrkea1cv2gatnku22h','Bayern München','https://media.api-sports.io/football/teams/157.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('btwmps8gdydgkm1h28mwl9cv','Fortuna Düsseldorf','https://media.api-sports.io/football/teams/158.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('ladgqezursbpvto51djtn5ov','SC Freiburg','https://media.api-sports.io/football/teams/160.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('tklar9sexk0j37xv7yxb8iut','VfL Wolfsburg','https://media.api-sports.io/football/teams/161.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('y95qh11iegy2wx4x73g099st','Werder Bremen','https://media.api-sports.io/football/teams/162.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('wtu8j5pa2plqou25zdjnwd89','Borussia Mönchengladbach','https://media.api-sports.io/football/teams/163.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('ehgljvvxdgkrr9fdsgq7cuv9','FSV Mainz 05','https://media.api-sports.io/football/teams/164.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('nbq6magg7l0iy6orcf9n8r2o','Borussia Dortmund','https://media.api-sports.io/football/teams/165.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('dvsbufl9jcv7kxu9vg320v0i','1899 Hoffenheim','https://media.api-sports.io/football/teams/167.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('b6p89bnp8d4c5rhgu4vshplk','Bayer Leverkusen','https://media.api-sports.io/football/teams/168.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('xyl0obllvkhfparsspmvvd68','Eintracht Frankfurt','https://media.api-sports.io/football/teams/169.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('r1s4pvzss3064eggeglbsshy','FC Augsburg','https://media.api-sports.io/football/teams/170.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('rh4b0kt3c4k2q8yo7mjh5q7a','VfB Stuttgart','https://media.api-sports.io/football/teams/172.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('fyjq62inbywl09utzuyxpnuk','RB Leipzig','https://media.api-sports.io/football/teams/173.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('c8vdefqknijs7247hnpxh6jc','VfL Bochum','https://media.api-sports.io/football/teams/176.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('h3hlxbkhw07e813f4c8zntav','1. FC Heidenheim','https://media.api-sports.io/football/teams/180.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('td9xd9qd2hs3vp8z4jkl8zj9','SV Darmstadt 98','https://media.api-sports.io/football/teams/181.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('yxqnzq3ib8y0ytrduogk1b8k','Union Berlin','https://media.api-sports.io/football/teams/182.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('uzqyh81cefk10nwmwknvdrji','1.FC Köln','https://media.api-sports.io/football/teams/192.png','ox26kbnlkqsb3wpyhkywm5l0',1769708251,1769708251);
INSERT INTO "teams" VALUES('atx5tqo3e5go7ewvw81vuh1e','Lazio','https://media.api-sports.io/football/teams/487.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('it2xabb6rbwv74a8np6ug6ov','Sassuolo','https://media.api-sports.io/football/teams/488.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('szmuujq1wjllgv3g8r1fv0cf','AC Milan','https://media.api-sports.io/football/teams/489.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('ebj6ionsesx4wiuzb7ilfbxo','Cagliari','https://media.api-sports.io/football/teams/490.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('tz3ln2q5j5c1srg16l7d4bdo','Napoli','https://media.api-sports.io/football/teams/492.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('mpa8df2rsqv39jmxwzfap8ir','Udinese','https://media.api-sports.io/football/teams/494.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('f8lizlid7oi7vqottpmf4hjw','Genoa','https://media.api-sports.io/football/teams/495.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('wol9z8y7ey1zl4yf1yf1fm84','Juventus','https://media.api-sports.io/football/teams/496.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('awho9aqh627yul41pxmricrh','Roma','https://media.api-sports.io/football/teams/497.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('xq2d0wy1lpfbewdb8ycf16k2','Atalanta','https://media.api-sports.io/football/teams/499.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('ea3o55t332xq37pyfkde84nk','Bologna','https://media.api-sports.io/football/teams/500.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('etcik6e877mqmd3leqk5unuq','Fiorentina','https://media.api-sports.io/football/teams/502.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('l8qeak4vl6tibna3gnm2mxql','Torino','https://media.api-sports.io/football/teams/503.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('gdprcijd2v65y78vxtlcju2h','Verona','https://media.api-sports.io/football/teams/504.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('htfv4jux3o98jxo10ycu7uom','Inter','https://media.api-sports.io/football/teams/505.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('cm4qaeju115wnp4jwr3ipye2','Empoli','https://media.api-sports.io/football/teams/511.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('cpjl1qjmch66mawdymhm1zs9','Frosinone','https://media.api-sports.io/football/teams/512.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('l3jtnazpdnd6ncocdtdijjlm','Salernitana','https://media.api-sports.io/football/teams/514.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('oz0k5rzsafjgf7rv9wkbmov0','Lecce','https://media.api-sports.io/football/teams/867.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('thfk4qdtsbcpqf2e1cea322z','Monza','https://media.api-sports.io/football/teams/1579.png','rz2ahnkwc6zmyikoao0nu387',1769708251,1769708251);
INSERT INTO "teams" VALUES('pffc01uf4slitrdp052acizx','Atalanta U19','https://media.api-sports.io/football/teams/7883.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('yxh3kmrpwc0l0vvsmogv6q1d','Internazionale U19','https://media.api-sports.io/football/teams/7903.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('owbb1q9fr58j6bvtki2yx86l','Juventus U19','https://media.api-sports.io/football/teams/7904.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('heg27mn3i2ig0lzfi0holvyj','Bologna U19','https://media.api-sports.io/football/teams/15656.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('p3oobdby3yqy8bgug6agm66o','Cagliari U19','https://media.api-sports.io/football/teams/15658.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('kes314yck9n4j69krnkyu343','Empoli U19','https://media.api-sports.io/football/teams/15664.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('l53h8cpcjjwd2iwsfrcbo8t5','Fiorentina U19','https://media.api-sports.io/football/teams/15665.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('p4hn7r47myqzy17a7hd7bhiw','Frosinone U19','https://media.api-sports.io/football/teams/15666.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('qi42odqminfh9yje5vfvg9yt','Genoa U19','https://media.api-sports.io/football/teams/15667.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('u8stx5d0zm661wckwf2dryis','Lazio U19','https://media.api-sports.io/football/teams/15668.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('cnj8cniqfrohlmqgvb3mpmji','Lecce U19','https://media.api-sports.io/football/teams/15669.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('w75fzb500oln06ejxt29ezbb','Milan U19','https://media.api-sports.io/football/teams/15670.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('t6cbapq40rfm9vyi00qtf0yr','Monza U19','https://media.api-sports.io/football/teams/15671.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('cooul45n7nvoptwzobhk33uv','Sampdoria U19','https://media.api-sports.io/football/teams/15680.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('h1alc3c9n7q59zmq6p7gngxo','Sassuolo U19','https://media.api-sports.io/football/teams/15681.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('kdnq2whf4qxnzrxim7610gtx','Torino U19','https://media.api-sports.io/football/teams/15683.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('r22hwzbynesgjstp27ppv77o','Verona U19','https://media.api-sports.io/football/teams/15686.png','ew6q09re7wq0nmjya13pul54',1769708251,1769708251);
INSERT INTO "teams" VALUES('j4oxpzp74t6fp8h39syzqdrq','Napoli U19','https://media.api-sports.io/football/teams/7917.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('xnwnv4o5n9who74be8uspxiy','Ascoli U19','https://media.api-sports.io/football/teams/15654.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('fnpla70ze0jj3d3ucg67j02e','Benevento U19','https://media.api-sports.io/football/teams/15655.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('da2cytcjbumdcjlwela42jo7','Brescia U19','https://media.api-sports.io/football/teams/15657.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('qi69vjkefc4o0vikwem6gqyi','Cittadella U19','https://media.api-sports.io/football/teams/15660.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('sclxg3eepk7oz3fusi8nw617','Cosenza U19','https://media.api-sports.io/football/teams/15661.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('nan8qwo8en73gyn49eqf0j0a','Cremonese U19','https://media.api-sports.io/football/teams/15662.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('a9atafgot96svn1higxhi3me','Crotone U19','https://media.api-sports.io/football/teams/15663.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('kwc2qc8j7sx5uvlr6vqmfhyd','Parma U19','https://media.api-sports.io/football/teams/15672.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('qd2xf1mj0nwnackp19tcqmbh','Pescara U19','https://media.api-sports.io/football/teams/15673.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('ym2p4zlcguz47lfzsp0vrysq','Pisa U19','https://media.api-sports.io/football/teams/15674.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('nishaqpvgugoofsctjja60q8','Reggiana U19','https://media.api-sports.io/football/teams/15676.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('u0dljoyu6nwutvc3knox5ua7','SPAL U19','https://media.api-sports.io/football/teams/15678.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('nwsdbzc14h6zvifft6z9vv8j','Salernitana U19','https://media.api-sports.io/football/teams/15679.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('d0cg4hjw6dd9vpb067krjq98','Spezia U19','https://media.api-sports.io/football/teams/15682.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('kra8k0mxgpmhizoq4bwiqi7o','Udinese U19','https://media.api-sports.io/football/teams/15684.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('rgno0yg9t4v08x3nk0ll1747','Venezia U19','https://media.api-sports.io/football/teams/15685.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('rxepw7geb4uqlat9r8bo5cpm','Vicenza U19','https://media.api-sports.io/football/teams/15687.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('l8yoldi8m1smuc6habafg50n','Virtus Entella U19','https://media.api-sports.io/football/teams/15688.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('vn13wdmmkvluh2q0l3u0m9pr','Alessandria U19','https://media.api-sports.io/football/teams/17726.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('ylnp7mh52moae0nmba0c72zd','Cesena U19','https://media.api-sports.io/football/teams/17727.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('ewbvi7uj39e5ybyr7uv4i2u4','Como U19','https://media.api-sports.io/football/teams/17728.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('b9egrnh35oi02z42nlky1gqm','Perugia U19','https://media.api-sports.io/football/teams/17729.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('o0lwnnnh71gfp19yb17vmxfy','Ternana U19','https://media.api-sports.io/football/teams/17730.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('yerkovx7d3ftf9ryf050ic05','AlbinoLeffe U19','https://media.api-sports.io/football/teams/19852.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('emcpm1si55sd0gg9f1z040he','FeralpiSalò U19','https://media.api-sports.io/football/teams/19853.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('bxdh0j7xp43qne2ibdrd9wqj','Monopoli U19','https://media.api-sports.io/football/teams/19855.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('mcyxq5q40rk50rt4pcukrak7','Padova U19','https://media.api-sports.io/football/teams/19856.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('hru1dqd6zqb3rw2f8e6hojba','Bari U19','https://media.api-sports.io/football/teams/22403.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('gvj28sgk12avfke3ag2tuqr6','Palermo U19','https://media.api-sports.io/football/teams/22404.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('uvgpg2gimufj2ycs2nyv308d','Renate U19','https://media.api-sports.io/football/teams/22405.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('uo7czfv5dqw2yjkdu7uwf1h1','Sudtirol U19','https://media.api-sports.io/football/teams/22406.png','x2ltwml7au3leg86rv4kr5fm',1769708251,1769708251);
INSERT INTO "teams" VALUES('q88gpzlq44r66x9hm5mwtsah','PEC Zwolle','https://media.api-sports.io/football/teams/193.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('sy18zam3grij0ahkfpntsn4b','Ajax','https://media.api-sports.io/football/teams/194.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('r1fz669rk7lj2yjcyflvya2a','Excelsior','https://media.api-sports.io/football/teams/196.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('shnn37i8vaashlgtbkdjoqa0','PSV Eindhoven','https://media.api-sports.io/football/teams/197.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('ww8ktx41x2mebbmfpvnzkcus','ADO Den Haag','https://media.api-sports.io/football/teams/198.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('cidhqbymy1rre3uhojt4kf91','De Graafschap','https://media.api-sports.io/football/teams/199.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('zaj199ealaxbaqdhs83a627e','Vitesse','https://media.api-sports.io/football/teams/200.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('ppbrg47k06xozzsjugqo77hd','AZ Alkmaar','https://media.api-sports.io/football/teams/201.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('vyg5qiac6w9xm3ugexifhiu0','NAC Breda','https://media.api-sports.io/football/teams/203.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('j9xlcdbh0rz12a89348ts49r','Fortuna Sittard','https://media.api-sports.io/football/teams/205.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('kvktrenvg3flcmrql47qe7xl','Heracles','https://media.api-sports.io/football/teams/206.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('x6v1orntfs82ml5se5tku9gw','Utrecht','https://media.api-sports.io/football/teams/207.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('bzaq0nb23knc8yxs1djkw753','Emmen','https://media.api-sports.io/football/teams/208.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('m7jicejnhb7z967h3sd0g4w1','Feyenoord','https://media.api-sports.io/football/teams/209.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('y32mb5aequs0rf16psxhl5jm','Heerenveen','https://media.api-sports.io/football/teams/210.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('d4kq8l3fudz0yclve46t42t3','Dordrecht','https://media.api-sports.io/football/teams/409.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('t3vv6nrf49fvwt2npk4i4e48','GO Ahead Eagles','https://media.api-sports.io/football/teams/410.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('vauvxg62p4ec2gca1erumv0z','NEC Nijmegen','https://media.api-sports.io/football/teams/413.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('y91osts1x8tvlexap7uov2hg','Roda','https://media.api-sports.io/football/teams/414.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('d7fgb7d0ss0psfrdelvflizm','Twente','https://media.api-sports.io/football/teams/415.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('u1nf4996gvvun602hbvliaxa','FC Volendam','https://media.api-sports.io/football/teams/416.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('o21ei6oxjhtxey0azy8y8a2n','Waalwijk','https://media.api-sports.io/football/teams/417.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('rbhvzz6mfyuxnsi6vx1d29yf','Almere City FC','https://media.api-sports.io/football/teams/419.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('v1c6xd5a3kq36j3yuposkfvq','Sparta Rotterdam','https://media.api-sports.io/football/teams/426.png','p3rwousl39ockw1wz9mpi86d',1769708251,1769708251);
INSERT INTO "teams" VALUES('ijssvfvkg4ksdm6yhf2a1ohr','Benfica','https://media.api-sports.io/football/teams/211.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('o6nroij6mo5ukwzxqhfthluv','FC Porto','https://media.api-sports.io/football/teams/212.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('fbb9p3jijelj9fl30tfvihuc','Moreirense','https://media.api-sports.io/football/teams/215.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('bol4s4ewcelt0wu6ee37nnyy','Portimonense','https://media.api-sports.io/football/teams/216.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('qabwdxuemdmc9fnfxt7jnl6f','SC Braga','https://media.api-sports.io/football/teams/217.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('zrdzon434n6el8y3r17eaoon','Boavista','https://media.api-sports.io/football/teams/222.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('t0p6gzoozhxdbezloulea4v3','Chaves','https://media.api-sports.io/football/teams/223.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('nn22n71vptpphdqh5jqvxwij','Guimaraes','https://media.api-sports.io/football/teams/224.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('nkfjo34jn43xwp674ishk5r1','Rio Ave','https://media.api-sports.io/football/teams/226.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('qvg11ia1pqlip2rq1vo01kju','Sporting CP','https://media.api-sports.io/football/teams/228.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('eqwsr6ij07wns7f2brbk7p2o','Estoril','https://media.api-sports.io/football/teams/230.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('kby2scgjdlzt8pjv41g5e2qs','Farense','https://media.api-sports.io/football/teams/231.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('kp2psks3al0libpxvqm8ck1l','Arouca','https://media.api-sports.io/football/teams/240.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('bajhe20edmeefhwlvajeuaoh','Famalicao','https://media.api-sports.io/football/teams/242.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('gxl57d0mqxziyauw1c8xrbhv','GIL Vicente','https://media.api-sports.io/football/teams/762.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('vnvsmrphm9hcgb8r6x5iwd9m','Vizela','https://media.api-sports.io/football/teams/810.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('ziv0shrkmwt0mvizx7e5k9wt','Casa Pia','https://media.api-sports.io/football/teams/4716.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('vogjycypmmmrzwn1fszaghkz','Estrela','https://media.api-sports.io/football/teams/15130.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('reddgxzcvgf3zhtkwmj4izcb','AVS','https://media.api-sports.io/football/teams/21595.png','vt53pe2klvzjg94z568mphb5',1769708251,1769708251);
INSERT INTO "teams" VALUES('td0z13ogdve2ybnks0x2vun7','Benfica U23','https://media.api-sports.io/football/teams/15460.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('spcburtct58h2js680bipmfg','Estoril U23','https://media.api-sports.io/football/teams/15463.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('euuppvirtvib7u08dbyr5gut','Famalicão U23','https://media.api-sports.io/football/teams/15464.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('fn00ssjgwsker73pb9mb1vqr','Leixões U23','https://media.api-sports.io/football/teams/15465.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('la4ahhw5m166ubmggsi3xmk8','Portimonense U23','https://media.api-sports.io/football/teams/15467.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('di34p4nfn61n08ijlka6m6c8','Rio Ave U23','https://media.api-sports.io/football/teams/15468.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('wwcoyie380izdqdojqzv2kg0','Sporting Braga U23','https://media.api-sports.io/football/teams/15469.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('rerzm9ml1cq47h06e027auik','Sporting CP U23','https://media.api-sports.io/football/teams/15470.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('p76pc24lesx9pc5i87fyjd4p','Farense U23','https://media.api-sports.io/football/teams/17474.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('fxxmsscyea5n5ctsyi5il6bj','Vizela U23','https://media.api-sports.io/football/teams/17475.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('tg29kt6yiov09tbisuae63dg','Estrela U23','https://media.api-sports.io/football/teams/19824.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('vsqn6amk94s1gwd0ipfqb7ck','Gil Vicente U23','https://media.api-sports.io/football/teams/19825.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('z5ktcqv7b18tqmbckipvu943','Mafra U23','https://media.api-sports.io/football/teams/19826.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('ab0tp0eal82v80rjo1fx8bh0','Academico Viseu U23','https://media.api-sports.io/football/teams/21718.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('tfigmc65m944gdwtbh34vspj','Santa Clara U23','https://media.api-sports.io/football/teams/21719.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('rd5amw7dmaj0cegq4qkh574p','Torreense U23','https://media.api-sports.io/football/teams/21720.png','yejul5yi32dhcjcp5myuu3r2',1769708251,1769708251);
INSERT INTO "teams" VALUES('ul0bd7s9ls488s9g5brd4vuq','Barcelona','https://media.api-sports.io/football/teams/529.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('h1azonpu61ix6zcv900rveqe','Atletico Madrid','https://media.api-sports.io/football/teams/530.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('oprjsqftr674ehxpu1uzu1go','Athletic Club','https://media.api-sports.io/football/teams/531.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('v6nrkww52zjypcro1e5onp97','Valencia','https://media.api-sports.io/football/teams/532.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('fdmezvhf8p7xxxwlau0arkx1','Villarreal','https://media.api-sports.io/football/teams/533.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('dh1cglnqsnatmgvtck51r3ku','Las Palmas','https://media.api-sports.io/football/teams/534.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('x10vgvzu3h88kodqk7aysjxx','Sevilla','https://media.api-sports.io/football/teams/536.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('e023xrzj05tfd6qg7eehfr75','Celta Vigo','https://media.api-sports.io/football/teams/538.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('fx4fb07o2yibhavgfkepuojp','Real Madrid','https://media.api-sports.io/football/teams/541.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('rffq2hvub0dv55tv3s8ug253','Alaves','https://media.api-sports.io/football/teams/542.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('wxr3m0uore36bte6gghd22hm','Real Betis','https://media.api-sports.io/football/teams/543.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('lrbp44sj2p1ilm7hx8lcrzl8','Getafe','https://media.api-sports.io/football/teams/546.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('tkwhygra351xd5jhvlr3kbil','Girona','https://media.api-sports.io/football/teams/547.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('poto8frtefu6t8mpua1vczp3','Real Sociedad','https://media.api-sports.io/football/teams/548.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('hlopln3joqob2qwujwhclbz4','Granada CF','https://media.api-sports.io/football/teams/715.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('abdsm6it9q1i9tbg3si2jtxc','Almeria','https://media.api-sports.io/football/teams/723.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('el9joc7rwtavbae9fyi6plzc','Cadiz','https://media.api-sports.io/football/teams/724.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('s91v6ojusj8px7mifjibk6r5','Osasuna','https://media.api-sports.io/football/teams/727.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('h47821uhoy99du6zprsnrghm','Rayo Vallecano','https://media.api-sports.io/football/teams/728.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('cfiizv1ocapha0vgq3nn0n7f','Mallorca','https://media.api-sports.io/football/teams/798.png','t5ylhfz66288jmphl64iyg5x',1769708251,1769708251);
INSERT INTO "teams" VALUES('lr94ua8m1p55m9qicf2n8zxg','Arnett Gardens','https://media.api-sports.io/football/teams/3436.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('kp584iamf0v2rn8uojg9nerq','Cavalier','https://media.api-sports.io/football/teams/3437.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('gmp2nzhvqdwaohoq0urnzir5','Dunbeholden','https://media.api-sports.io/football/teams/3438.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('hw8ynm2lwwrmzu9z9lxn9275','Harbour View','https://media.api-sports.io/football/teams/3439.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('nfmt6z2j8lxgtwqbngpwqdwk','Humble Lions','https://media.api-sports.io/football/teams/3440.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('g65okmf576xle0pzpx0au9ne','Montego Bay United','https://media.api-sports.io/football/teams/3441.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('s2iqvf0hhvwrf8en9pgf58le','Mount Pleasant Academy','https://media.api-sports.io/football/teams/3442.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('nsj92t1wjybcxvzmnz5h4nd7','Portmore United','https://media.api-sports.io/football/teams/3443.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('el0tpjtj6htswpfqzbngnxxu','Tivoli Gardens','https://media.api-sports.io/football/teams/3445.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('s3rtycw4erkb3b7dotpdphi5','Waterhouse','https://media.api-sports.io/football/teams/3447.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('mdn380523iqunqnh0cd17oof','Molynes United','https://media.api-sports.io/football/teams/6407.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('olwwwrk1frmeqhybtidwney9','Vere United','https://media.api-sports.io/football/teams/6408.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('l6rn58ab3nbla8j0qv9qlg4i','Lime Hall Academy','https://media.api-sports.io/football/teams/22605.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('wgtdy9mv46qy10ex50p7ejdw','Treasure Beach','https://media.api-sports.io/football/teams/22606.png','xee2qc0f3fv3gcajfridgd2d',1769708251,1769708251);
INSERT INTO "teams" VALUES('oilswv7gk1ys55rho1ph6mt1','FK Kukesi','https://media.api-sports.io/football/teams/577.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('z1whppugt33f5chw0dzj48yf','Skenderbeu Korce','https://media.api-sports.io/football/teams/605.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('abx1009upqyhjm03ado1e3z7','Tirana','https://media.api-sports.io/football/teams/694.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('adnu73ajky24y37jqg91axue','Laci','https://media.api-sports.io/football/teams/2256.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('yt3kk17tw9reblbaybd97t19','Flamurtari','https://media.api-sports.io/football/teams/3317.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('azzj35gds64mwqtqcmdykqp7','Kastrioti Krujë','https://media.api-sports.io/football/teams/3319.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('u9muk3jyxm4tfyc5yxa6knmv','Teuta Durrës','https://media.api-sports.io/football/teams/3320.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('evt9czmbsnadzdijooktelez','Apolonia Fier','https://media.api-sports.io/football/teams/3321.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('ebkrsyho3jaj4fcxpawz6ifw','Besa Kavajë','https://media.api-sports.io/football/teams/3322.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('i847w6p83bnaczeg3jg4wgym','Besëlidhja Lezhë','https://media.api-sports.io/football/teams/3323.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('thdk7ohcnh0uocpqqb4aeie4','Burreli','https://media.api-sports.io/football/teams/3324.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('mo6u2qg8s2b0rqzl7r5jtj6e','Bylis','https://media.api-sports.io/football/teams/3325.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('r38dci37pf5289jjw973mmpe','Dinamo Tirana','https://media.api-sports.io/football/teams/3326.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('b85fb1yqawje9h4frxg5cqiw','Erzeni Shijak','https://media.api-sports.io/football/teams/3329.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('xjy8bk5wmqd45plstb54p8ad','Iliria Fushë-Krujë','https://media.api-sports.io/football/teams/3330.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('n6031oo24w3cbn90un5r2zgt','Korabi Peshkopi','https://media.api-sports.io/football/teams/3331.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('isaknifr1rdyc0xhs12l1sb5','Lushnja','https://media.api-sports.io/football/teams/3332.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('f2eea1g4vvmglfde6vl6yw4m','Oriku','https://media.api-sports.io/football/teams/3333.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('mqk4yu0x5suzgb2rd40jv20u','Pogradeci','https://media.api-sports.io/football/teams/3334.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('ik7ftjkshxxvo4k1fercd74y','Shënkolli','https://media.api-sports.io/football/teams/3335.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('svrkckjdsdjk0ldvjrramrcx','Tomori Berat','https://media.api-sports.io/football/teams/3336.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('l5c9iv8hmvrpjyjagzagyvmo','Turbina Cërrik','https://media.api-sports.io/football/teams/3337.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('xlkjlc9p18sjru97k6kf158u','Veleçiku Koplik','https://media.api-sports.io/football/teams/3338.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('gx1wgtxq6l7i7nlgcuo3gqs9','Vllaznia Shkodër','https://media.api-sports.io/football/teams/3339.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('h7e8emiplzie8p607e4d5nu5','Vora','https://media.api-sports.io/football/teams/3340.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('p1tk7x71n5gacdyhmzskajao','Naftëtari Kuçovë','https://media.api-sports.io/football/teams/3834.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('cee2glnius6syr2bh3dal89j','Shkumbini Peqin','https://media.api-sports.io/football/teams/3835.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('n7e6rvp9yeyzbccqg36wsqnu','Tërbuni Pukë','https://media.api-sports.io/football/teams/3836.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('kf430cnjmz6malo4gnqwq7m2','Sopoti Librazhd','https://media.api-sports.io/football/teams/3839.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('w08r7asydqlysif6l2948gh9','Butrinti Sarandë','https://media.api-sports.io/football/teams/4671.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('zi7ruh46pxqbna3ipo905ogm','Devolli','https://media.api-sports.io/football/teams/7507.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('h05dfgzxyivyn3gt1wcup81s','Gramshi','https://media.api-sports.io/football/teams/10704.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('e929niz44425ow1qq1p8v61b','Luzi 2008','https://media.api-sports.io/football/teams/10720.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('z5946xefqmz6i9irr8cnblni','Delvina','https://media.api-sports.io/football/teams/10724.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('q3ya9osebj804jqpwtdmc6xl','Maliqi','https://media.api-sports.io/football/teams/10726.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('o4pxbmc4zhp3ims0nvp9xdyq','Valbona','https://media.api-sports.io/football/teams/15511.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('wdwst0rxq92ba26qzfb4nucd','Labëria','https://media.api-sports.io/football/teams/15512.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('zr6kx8tb51vakd0lhij2iuja','Murlani','https://media.api-sports.io/football/teams/17739.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('d3nwm1w0ffhrg45ahlq2t33m','Luftëtari','https://media.api-sports.io/football/teams/17740.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('ke7ndt3p8b6e2hfj41hsq9pc','AF Elbasani','https://media.api-sports.io/football/teams/20406.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('ld2gljop5kd80evock83edgo','Adriatiku','https://media.api-sports.io/football/teams/22351.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('ucnclqd58fe8km196um54jio','Albanët','https://media.api-sports.io/football/teams/22352.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('uve83ca2ew2cjewir37dm7sx','Partizani','https://media.api-sports.io/football/teams/708.png','tqrdq9liqdnmuxgshuidyrpv',1769708251,1769708251);
INSERT INTO "teams" VALUES('rahans8anujiz1ocl5xficga','Egnatia Rrogozhinë','https://media.api-sports.io/football/teams/3327.png','tqrdq9liqdnmuxgshuidyrpv',1769708251,1769708251);
INSERT INTO "teams" VALUES('f61z9ni23qcl7i5yp8g6vlfa','Alashkert','https://media.api-sports.io/football/teams/582.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('nn3ndkcj278pnjfjhp3rnm6r','Gandzasar','https://media.api-sports.io/football/teams/688.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('uezg41t0z8jsz5ewbhkqfh13','Pyunik Yerevan','https://media.api-sports.io/football/teams/709.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('xcsgat7jn1q5ex087dk3byg3','FC Urartu','https://media.api-sports.io/football/teams/2276.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('wby2qjnli43qtf5mvv87hsuy','Ararat','https://media.api-sports.io/football/teams/3682.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('fsri128wgvc6xu34t6cf145c','Ararat-Armenia','https://media.api-sports.io/football/teams/3683.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('hm6r5wc9khte7qpfzb64mk2c','FC Noah','https://media.api-sports.io/football/teams/3684.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('rla5nehfsogz0m5fb5rji6wy','Shirak','https://media.api-sports.io/football/teams/3686.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('rjknurjay89sic32t3dwpxml','BKMA','https://media.api-sports.io/football/teams/6279.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('ej6r07wkgj8v36ihl60a2mk5','Lernayin Artsakh','https://media.api-sports.io/football/teams/6281.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('gfqb7ct6800q3c36ywll39iz','Van','https://media.api-sports.io/football/teams/6286.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('ke8pmawidat8nydj3fqwnxc5','West Armenia','https://media.api-sports.io/football/teams/6287.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('blvfdvi84n1j43sdkeu1nu1c','Mika','https://media.api-sports.io/football/teams/11174.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('xi4m77o1sldrlyx91vefak0q','Falcons','https://media.api-sports.io/football/teams/16186.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('vtec5v7xrv3zvi3hzlwcn0cf','Syunik','https://media.api-sports.io/football/teams/20087.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('kqqvrgvztp430pf9rwg84rng','Andranik','https://media.api-sports.io/football/teams/21877.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('lb8jn52g6wv45u8i655fnyzr','Nikarm','https://media.api-sports.io/football/teams/21878.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('ejbc8qxavzhezhpxxh0nklmo','Onor','https://media.api-sports.io/football/teams/21880.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('x9ggaxzfxb1hrtwvcau08ttc','Cilicia','https://media.api-sports.io/football/teams/22561.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('zpbcp54kh3icbjued6j2ww0m','Ecoville','https://media.api-sports.io/football/teams/22562.png','zhiv3gi2ri4m0yi8xdfuwk69',1769708251,1769708251);
INSERT INTO "teams" VALUES('kwtsm0d7mhd3olzakts1b1zb','Qarabag','https://media.api-sports.io/football/teams/556.png','k017l1jopelckquzabgmgx9j',1769708251,1769708251);
INSERT INTO "teams" VALUES('y8amanhiov7gzlqmfkh1f6oa','Qabala','https://media.api-sports.io/football/teams/627.png','k017l1jopelckquzabgmgx9j',1769708251,1769708251);
INSERT INTO "teams" VALUES('rkwsiygwm4qztpotyzwh071h','Zira','https://media.api-sports.io/football/teams/648.png','k017l1jopelckquzabgmgx9j',1769708251,1769708251);
INSERT INTO "teams" VALUES('nmp033b8e82dtfd3uheapfp4','Neftchi Baku','https://media.api-sports.io/football/teams/2270.png','k017l1jopelckquzabgmgx9j',1769708251,1769708251);
INSERT INTO "teams" VALUES('z4azien0us9c7uglle70dn8r','Səbail','https://media.api-sports.io/football/teams/4199.png','k017l1jopelckquzabgmgx9j',1769708251,1769708251);
INSERT INTO "teams" VALUES('ny853yjrsta05rmjviar244n','Kapaz','https://media.api-sports.io/football/teams/5490.png','k017l1jopelckquzabgmgx9j',1769708251,1769708251);
INSERT INTO "teams" VALUES('c4zu73ribm49pzq86f3ps188','Turan','https://media.api-sports.io/football/teams/5499.png','k017l1jopelckquzabgmgx9j',1769708251,1769708251);
INSERT INTO "teams" VALUES('zr4g5csivyfy086k2zel3fg6','Sumqayıt','https://media.api-sports.io/football/teams/5503.png','k017l1jopelckquzabgmgx9j',1769708251,1769708251);
INSERT INTO "teams" VALUES('hh2tr052kf0wbi0j5kh9u9qk','Araz','https://media.api-sports.io/football/teams/11238.png','k017l1jopelckquzabgmgx9j',1769708251,1769708251);
INSERT INTO "teams" VALUES('aog3ohz9vq1wkwxep5wux27c','Sabah FA','https://media.api-sports.io/football/teams/13976.png','k017l1jopelckquzabgmgx9j',1769708251,1769708251);
INSERT INTO "teams" VALUES('ftkcv6uvuqfgoht9ic4zldew','Hoi King','https://media.api-sports.io/football/teams/4452.png','zbhcep6gvx9k63kkn1yjnlpx',1769708251,1769708251);
INSERT INTO "teams" VALUES('ncsg7174cgny8yvpbw6w6p1v','Yuen Long','https://media.api-sports.io/football/teams/4458.png','zbhcep6gvx9k63kkn1yjnlpx',1769708251,1769708251);
INSERT INTO "teams" VALUES('ma44q2a8e2fln081dabvspnq','South China','https://media.api-sports.io/football/teams/4463.png','zbhcep6gvx9k63kkn1yjnlpx',1769708251,1769708251);
INSERT INTO "teams" VALUES('z3pc799sye6d4n8euu0z8hd7','Central & Western','https://media.api-sports.io/football/teams/4464.png','zbhcep6gvx9k63kkn1yjnlpx',1769708251,1769708251);
INSERT INTO "teams" VALUES('enyv61axrb73sgmqbsafspf8','Citizen AA','https://media.api-sports.io/football/teams/4465.png','zbhcep6gvx9k63kkn1yjnlpx',1769708251,1769708251);
INSERT INTO "teams" VALUES('nm9ld2gstikmbfxpoiejkecl','Eastern District','https://media.api-sports.io/football/teams/4467.png','zbhcep6gvx9k63kkn1yjnlpx',1769708251,1769708251);
INSERT INTO "teams" VALUES('fp40xuwhct77r535o7l3omv7','Shatin','https://media.api-sports.io/football/teams/4471.png','zbhcep6gvx9k63kkn1yjnlpx',1769708251,1769708251);
INSERT INTO "teams" VALUES('st65pi81upgr9ryuda0sgmn7','Wing Yee','https://media.api-sports.io/football/teams/4472.png','zbhcep6gvx9k63kkn1yjnlpx',1769708251,1769708251);
INSERT INTO "teams" VALUES('zipv6s6b375jau49lzid6lz0','Wong Tai Sin','https://media.api-sports.io/football/teams/4473.png','zbhcep6gvx9k63kkn1yjnlpx',1769708251,1769708251);
INSERT INTO "teams" VALUES('c7dz2o8dklbf74hxpxquvot2','Kowloon City','https://media.api-sports.io/football/teams/20392.png','zbhcep6gvx9k63kkn1yjnlpx',1769708251,1769708251);
INSERT INTO "teams" VALUES('caf67r6p02m8xal2scbfneyg','3 Sing','https://media.api-sports.io/football/teams/22524.png','zbhcep6gvx9k63kkn1yjnlpx',1769708251,1769708251);
INSERT INTO "teams" VALUES('l3dtxbh71k5n6hborirxyhko','Sai Kung','https://media.api-sports.io/football/teams/22525.png','zbhcep6gvx9k63kkn1yjnlpx',1769708251,1769708251);
INSERT INTO "teams" VALUES('key6kouuxhqazfg6qq6zany5','Akademiya Ontustik','https://media.api-sports.io/football/teams/4545.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('hicywtix3i5cvkla80hxti27','Aktobe Jas','https://media.api-sports.io/football/teams/4546.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('umt5mugzx8s3b0bnc2e9nage','Akzhayik','https://media.api-sports.io/football/teams/4547.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('dl2yxn6h6xiyn4nc35tq84qo','Astana II','https://media.api-sports.io/football/teams/4548.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('e0sp2myb0etlfq3n3b4vgvzp','Ekibastuz','https://media.api-sports.io/football/teams/4551.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('cql83hl2eemq7y1ym8wj8sm5','Kyran','https://media.api-sports.io/football/teams/4553.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('omdh49dx3tm1e9isky1nqaj1','Sport Academy Kairat','https://media.api-sports.io/football/teams/4556.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('zvfvyyoj5mwdhg095ejjw0im','Taraz','https://media.api-sports.io/football/teams/4559.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('rht6c8cmxjv1s5zpd7bqpwxn','Arys','https://media.api-sports.io/football/teams/10414.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('tbm2ouwmwxfifetvkblccnkz','Jas Qyran','https://media.api-sports.io/football/teams/16608.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('t8c9ntfrd6bgpul1o6r2x9ar','Yassy Turkistan','https://media.api-sports.io/football/teams/16610.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('y8hh20ww12jw3e8a2k7vnfta','Zhenys','https://media.api-sports.io/football/teams/16611.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('xid790078znoz0r22fnrdi2l','Khan Tengri','https://media.api-sports.io/football/teams/18805.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('y56ey8lw8r2vufnid5l5646p','Yelimay Semey','https://media.api-sports.io/football/teams/21011.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('narcu1tdn1n0dboxqstdz7xa','Turan Turkistan','https://media.api-sports.io/football/teams/21502.png','va7eeqeind6b5jfbncxnkdkp',1769708251,1769708251);
INSERT INTO "teams" VALUES('fkga8suyeqvhzi4ohlzv5zsz','Al Nasr','https://media.api-sports.io/football/teams/2878.png','pvppzbeea4h4vvl41apyldvo',1769708251,1769708251);
INSERT INTO "teams" VALUES('dzkva5zc1oyux9mtr6k1juj2','Al-Nahda','https://media.api-sports.io/football/teams/5327.png','pvppzbeea4h4vvl41apyldvo',1769708251,1769708251);
INSERT INTO "teams" VALUES('ylz2fsyop04266s3y95c8w95','Al-Rustaq','https://media.api-sports.io/football/teams/5328.png','pvppzbeea4h4vvl41apyldvo',1769708251,1769708251);
INSERT INTO "teams" VALUES('h2nfzg4pznq2ideic792qau8','Al-Shabab','https://media.api-sports.io/football/teams/5329.png','pvppzbeea4h4vvl41apyldvo',1769708251,1769708251);
INSERT INTO "teams" VALUES('bhiyw20upri9nif759ymlnj7','Dhofar','https://media.api-sports.io/football/teams/5330.png','pvppzbeea4h4vvl41apyldvo',1769708251,1769708251);
INSERT INTO "teams" VALUES('jt3wmdxb6pcrfetpr3dk0atl','Oman Club','https://media.api-sports.io/football/teams/5334.png','pvppzbeea4h4vvl41apyldvo',1769708251,1769708251);
INSERT INTO "teams" VALUES('a6b38fd4zg7slk9dufinow62','Sohar','https://media.api-sports.io/football/teams/5336.png','pvppzbeea4h4vvl41apyldvo',1769708251,1769708251);
INSERT INTO "teams" VALUES('khbthq1aqayjhc2bjedhjpqu','Sur','https://media.api-sports.io/football/teams/5337.png','pvppzbeea4h4vvl41apyldvo',1769708251,1769708251);
INSERT INTO "teams" VALUES('jvdo9h4pao7vmlgonpamabtu','Al Seeb','https://media.api-sports.io/football/teams/7504.png','pvppzbeea4h4vvl41apyldvo',1769708251,1769708251);
INSERT INTO "teams" VALUES('co4u49suvl8u832v2df6f0sh','Bahla','https://media.api-sports.io/football/teams/7505.png','pvppzbeea4h4vvl41apyldvo',1769708251,1769708251);
INSERT INTO "teams" VALUES('g9onhngcgl1gqnfixppnmb7l','Ibri','https://media.api-sports.io/football/teams/15960.png','pvppzbeea4h4vvl41apyldvo',1769708251,1769708251);
INSERT INTO "teams" VALUES('ddxlegjjnybj54lsmesj2dmm','Al Wehda','https://media.api-sports.io/football/teams/17461.png','pvppzbeea4h4vvl41apyldvo',1769708251,1769708251);
INSERT INTO "teams" VALUES('nlc1xsmg23kkmfyarwyy39ml','Al Khaleej Saihat','https://media.api-sports.io/football/teams/2928.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('c3kz8okbwnko1eo8vxcaqgeh','Al-Ahli Jeddah','https://media.api-sports.io/football/teams/2929.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('vpozflkbbnnxcv3tdwzg6pbv','Al-Fateh','https://media.api-sports.io/football/teams/2931.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('el4q8i5nlgj0y9brh1l0fgrb','Al-Hilal Saudi FC','https://media.api-sports.io/football/teams/2932.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('ighc321v7pcyicjheyxtad8n','Al-Ettifaq','https://media.api-sports.io/football/teams/2934.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('yne8aobaweakm5y94tfpemae','Al-Raed','https://media.api-sports.io/football/teams/2935.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('h7d2e1ef3j5o1jhu75ybpbhv','Al Taawon','https://media.api-sports.io/football/teams/2936.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('ei4qq1knooh8u3czqpmx2vsx','Al Wehda Club','https://media.api-sports.io/football/teams/2937.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('gy82ipquh13emppqvk6bw4d8','Al-Ittihad FC','https://media.api-sports.io/football/teams/2938.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('fn7yaebbcfd9m7g4ajr4gsez','Al-Nassr','https://media.api-sports.io/football/teams/2939.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('fcve5wv258svp6hybc7vnpu4','Al Shabab','https://media.api-sports.io/football/teams/2940.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('o0ifkpegd9c6ycoarrv02gqc','Al Taee','https://media.api-sports.io/football/teams/2942.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('o7ksdc8zmvsrcuh0l7iiqvi7','Al-Fayha','https://media.api-sports.io/football/teams/2944.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('k71kvot0zknqanqifcmbsg3j','Al-Hazm','https://media.api-sports.io/football/teams/2945.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('lrk7n6sqdzwe8lh4jekbi6iq','Abha','https://media.api-sports.io/football/teams/2951.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('ddyxq8mhcu82aqwb6uqorle2','Damac','https://media.api-sports.io/football/teams/2956.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('inu2n71skxdcyoql3oscqbgb','Al Akhdoud','https://media.api-sports.io/football/teams/2977.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('ojoffd14b06b744n4j85zxva','Al Riyadh','https://media.api-sports.io/football/teams/10511.png','vcign948t917l0r8gxoke9rq',1769708251,1769708251);
INSERT INTO "teams" VALUES('j26zxib0e34aebekwtz33jus','Al Baten','https://media.api-sports.io/football/teams/2926.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('rsd3jqlrvpdqlxvc1shncspv','Al-Faisaly FC','https://media.api-sports.io/football/teams/2930.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('f444mdy7tes7euwn0cl65gia','Al-Qadisiyah FC','https://media.api-sports.io/football/teams/2933.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('vhmlm016cvi611kdmomkckil','Ohod','https://media.api-sports.io/football/teams/2943.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('rnkaj5uet70jfiyobn2biltg','Jeddah Club','https://media.api-sports.io/football/teams/2947.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('xvdmp4oefnnkdd7cewapzaar','Hajer','https://media.api-sports.io/football/teams/2948.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('r30798g0n1m5e9boawism1b9','Al-Adalah','https://media.api-sports.io/football/teams/2950.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('vpbrq6km8cineenkfsa303ai','Al Jabalain','https://media.api-sports.io/football/teams/2958.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('n4zbyxk60ghnsot2b9rmuqej','Al Qaisoma','https://media.api-sports.io/football/teams/2959.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('zizk2y21uz6s2userrd2gm7w','Al Orubah','https://media.api-sports.io/football/teams/2961.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('mhvqoua64d1cry7sdy9ovz4d','Al Bukayriyah','https://media.api-sports.io/football/teams/2966.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('xmvgs9n8mmrvzclazo2z9d05','Al Arabi SC','https://media.api-sports.io/football/teams/2971.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('arc6anz5q6e2f9abedggzqr0','Al Safa','https://media.api-sports.io/football/teams/2990.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('kepnzymq4hobegjaf1775imy','Al Taraji','https://media.api-sports.io/football/teams/2991.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('qk6nkadab3jo7m33mt74h1ro','Al Najma','https://media.api-sports.io/football/teams/2992.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('pl6isojsbskz8cfcmnbrr3g8','Al Jandal','https://media.api-sports.io/football/teams/10507.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('edswljp0j4dbsn6nxpw50jdb','Al Kholood','https://media.api-sports.io/football/teams/10509.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('g7sz6h9ns5j4p82mowh4tkwa','Al-Ain','https://media.api-sports.io/football/teams/13170.png','lrdqomw1atrc76t3e1x7vq6w',1769708251,1769708251);
INSERT INTO "teams" VALUES('d3h7vlcf5s0mtdjy3xurup5n','Celtic','https://media.api-sports.io/football/teams/247.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('ugjpkdv3ck4m5fgoc31ush7l','Hibernian','https://media.api-sports.io/football/teams/249.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('fmanmpbmvp1dpgfjsozbrnnz','Kilmarnock','https://media.api-sports.io/football/teams/250.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('d2ksie5p28mufv8xdtq1f5hj','ST Mirren','https://media.api-sports.io/football/teams/251.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('ov7sshaase5nph0wohh12zww','Aberdeen','https://media.api-sports.io/football/teams/252.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('rksqx3ni6hq6euttr1ani04e','Dundee','https://media.api-sports.io/football/teams/253.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('x9jgwwntm0tfa33mx2f5k1nn','Heart Of Midlothian','https://media.api-sports.io/football/teams/254.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('a07yrwqkbw9fy31m5e0q4xit','Livingston','https://media.api-sports.io/football/teams/255.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('l1amw5sbus9u4oorfcvko2hi','Motherwell','https://media.api-sports.io/football/teams/256.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('awz2xlwgvrpuawhdd8fxd3ih','Rangers','https://media.api-sports.io/football/teams/257.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('n195ww88jfk7n0k0xdd161l1','ST Johnstone','https://media.api-sports.io/football/teams/258.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('hc6rd84q4vhu9tkdejvg78th','Partick','https://media.api-sports.io/football/teams/901.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('fh1ebkt3ve8hjftufwvrzmkh','Ross County','https://media.api-sports.io/football/teams/902.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('qrs2s3dsem12h9tg6n2c72vz','Raith Rovers','https://media.api-sports.io/football/teams/1385.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('xnen2i5uw6gegew7zreq5s8q','Airdrie United','https://media.api-sports.io/football/teams/4668.png','a4teagufabhhkjfu9ju2x9vo',1769708251,1769708251);
INSERT INTO "teams" VALUES('thxrqbswmeh7f4uzyehc1xu3','Aberystwyth Town','https://media.api-sports.io/football/teams/351.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('ectlm3hhkmmvp1dae82tgi1m','Bala Town','https://media.api-sports.io/football/teams/352.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('qch6ovq4sp80i2omazoidsjf','Cardiff MET','https://media.api-sports.io/football/teams/353.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('aevpcg4clv3winri0vzvwrti','The New Saints','https://media.api-sports.io/football/teams/354.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('h8m46fb5n0ttit9y04eo61rg','Caernarfon Town','https://media.api-sports.io/football/teams/356.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('huxiujyeod6e6n1fkhz6ekvr','GAP Connah S Quay FC','https://media.api-sports.io/football/teams/357.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('zk8ublv0edicdzo32gi6bx3d','Newtown AFC','https://media.api-sports.io/football/teams/358.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('mhpg5y3srndp5d0dmcts649b','Barry Town','https://media.api-sports.io/football/teams/361.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('i19jo0phz8zyfq4l9yujatb1','Penybont','https://media.api-sports.io/football/teams/2191.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('wce8fktby3fw9fe7bjxhqufj','Pontypridd Town','https://media.api-sports.io/football/teams/2192.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('buuisktz97w1m7qbr33110nj','Haverfordwest County AFC','https://media.api-sports.io/football/teams/2194.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('z8bbob9ciqdns01k84wkjvwu','Colwyn Bay','https://media.api-sports.io/football/teams/5611.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('ustyhlkow82hyrq4g05jr22d','llanelli AFC','https://media.api-sports.io/football/teams/355.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('kgrc66bklqeh3bjdgarr5ugg','Carmarthen Town','https://media.api-sports.io/football/teams/359.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('dgcg0cz98nvm4u0bwimvxjh0','Llandudno','https://media.api-sports.io/football/teams/362.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('l0dhliis5jdlv2g1rviz3e4p','Goytre United','https://media.api-sports.io/football/teams/2187.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('st9uuublyjfqs32qgf7f84be','Ammanford AFC','https://media.api-sports.io/football/teams/2188.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('w83sjgqvgai9ijv68z1kk7pt','Cwmbran Celtic','https://media.api-sports.io/football/teams/2190.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('gn1lzbrcjea4hnjf9iq4hdfh','Llantwit Major','https://media.api-sports.io/football/teams/2196.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('mymkbwwayy7nsb8bi9dwp722','Taffs Well','https://media.api-sports.io/football/teams/2199.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('qaeityvbi8tje35x4x3h5rvo','Afan Lido','https://media.api-sports.io/football/teams/2200.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('h2wi82zingkoxi8bwh1u8seu','Briton Ferry','https://media.api-sports.io/football/teams/2201.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('wqwqcb3egbuh4lrtyh7cmfsc','Cambrian & Clydach','https://media.api-sports.io/football/teams/2202.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('d6fsbw687kvd435743zc5zn3','Airbus UK','https://media.api-sports.io/football/teams/4909.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('azyos199yo21fadspj5fyb5u','Buckley Town','https://media.api-sports.io/football/teams/5609.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('qy6g8d8hfuwv1ngwaqm9le6m','Caerau (Ely)','https://media.api-sports.io/football/teams/5610.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('o9b34ehaxx7a3tnsphgch1k6','Conwy Borough','https://media.api-sports.io/football/teams/5612.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('emtf78260hy0xpmyqo76rris','Corwen','https://media.api-sports.io/football/teams/5613.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('mzu6l7bwg4fb326dhzjql1t9','Flint Town United','https://media.api-sports.io/football/teams/5614.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('nsqho49fjo8b2tdmm9nz2fva','Gresford Athletic','https://media.api-sports.io/football/teams/5615.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('o680x0nn4gjxh8moueeqf216','Guilsfield','https://media.api-sports.io/football/teams/5616.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('albk6gc8gwdsisd6212gt976','Penrhyncoch','https://media.api-sports.io/football/teams/5620.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('pomnt8qu7e1h0wgdat8x0uce','Porthmadog','https://media.api-sports.io/football/teams/5621.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('dbpc7e6yvi9br8xy5dsi5h4k','Prestatyn Town','https://media.api-sports.io/football/teams/5622.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('rwbyh3is40abh0qmbfyh5u2l','Rhyl','https://media.api-sports.io/football/teams/5623.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('fp56dgrbahf7ls1zu6csbd9g','Ruthin Town','https://media.api-sports.io/football/teams/5624.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('jhw828r0deoafmn29cynt73y','Brickfield Rangers','https://media.api-sports.io/football/teams/6443.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('gkarujun5vk47axcsyiwp4gx','Caersws','https://media.api-sports.io/football/teams/6445.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('ixwj74bpzakd4krmzhtg5rwa','Cefn Albion','https://media.api-sports.io/football/teams/6447.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('bgh1p8x1jowydj1g0dgid83z','Cwmbran Town','https://media.api-sports.io/football/teams/6450.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('kfviw1lzfrxaa4x4na3ti6ue','Denbigh Town','https://media.api-sports.io/football/teams/6451.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('c66mmrh5h6rsi1z3gybm9s1v','Dyffryn Nantlle Vale','https://media.api-sports.io/football/teams/6454.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('oiw0udp7zbxh55691lml3a8f','Holyhead Hotspur','https://media.api-sports.io/football/teams/6457.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('h30mascsf7rhnyeziaet5quu','Holywell','https://media.api-sports.io/football/teams/6459.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('crikg3mozdo0rw4fiqpp7se0','Llanidloes Town','https://media.api-sports.io/football/teams/6463.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('fdxep2btb65or8v8tfssg26p','Mold Alexandra','https://media.api-sports.io/football/teams/6465.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('wd76kt2q3l7g4zucykw61a34','Penycae','https://media.api-sports.io/football/teams/6471.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('res9t015d2czpa1uaj4qwqy5','Pontyclun','https://media.api-sports.io/football/teams/6472.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('bbjqtutlf8jhppulk685w4e9','Pwllheli','https://media.api-sports.io/football/teams/6473.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('wd65vq5ps0tru5tkn5z8gqjc','Radnor Valley','https://media.api-sports.io/football/teams/6474.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('i6pktic2lqp5e52hfkal5fdg','St Asaph City','https://media.api-sports.io/football/teams/6477.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('a2vt1bnjsezefa72h1y2wpir','Sully Sports','https://media.api-sports.io/football/teams/6478.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('t3czqmud376cuds9ouiejzjs','Trefelin','https://media.api-sports.io/football/teams/6479.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('k94o1711lndeju2971kg69ek','Treharris Athl. Western','https://media.api-sports.io/football/teams/6480.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('vkg5q7eu7btzs4lqprdnc19h','Abergavenny Town','https://media.api-sports.io/football/teams/7579.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('ucui7npvua2s0l1f6wjcd0a8','Abertillery Bluebirds','https://media.api-sports.io/football/teams/7580.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('ivtly4cqbggoj3nlw3xhqmb7','Bangor 1876','https://media.api-sports.io/football/teams/7581.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('cxgt16wcygytq5g3ian320k5','Builth Wells','https://media.api-sports.io/football/teams/7583.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('o64ietno99zizl2r9tecpraf','Cardiff Corinthians','https://media.api-sports.io/football/teams/7585.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('umhze9hdvkz9tvr66btk2tb9','Chepstow Town','https://media.api-sports.io/football/teams/7588.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('t3o58k57qydzdkhj0c0lod8n','Montgomery Town','https://media.api-sports.io/football/teams/7594.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('nsnw57iybnb6x41ejrqiqvem','Penparcau','https://media.api-sports.io/football/teams/7597.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('hi2lpi3602ydyygvekxo9yw0','Pontardawe Town','https://media.api-sports.io/football/teams/7598.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('zuzbm8ez2xd9l2c58yp8rg69','Chirk AAA','https://media.api-sports.io/football/teams/7685.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('hcnm5cku8tp0uw9isejz3gw4','FC Cwmaman','https://media.api-sports.io/football/teams/7686.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('fm6h5zctwmncm6jconmp8aiz','Bow Street','https://media.api-sports.io/football/teams/11281.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('g0x6ue8qoe7ufuyr7wvjdyl7','Caerphilly Athletic','https://media.api-sports.io/football/teams/11283.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('zi48b0koqmt8lw3einmafyz3','Llandudno Junction','https://media.api-sports.io/football/teams/11288.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('sgkw9bc4akt9p4fwnjgjiuj9','Llanrwst United','https://media.api-sports.io/football/teams/11289.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('pwqhhaiznl9rsae7v3lcu42t','Mochdre Sports','https://media.api-sports.io/football/teams/11292.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('yy8vmz0famiefnespmvdm3za','Penydarren BGC','https://media.api-sports.io/football/teams/11294.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('aa1zfn4syx7nr9axcmx9hxyw','Glantraeth','https://media.api-sports.io/football/teams/11302.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('njyu5nyencos1n72engvufhr','Llanuwchllyn','https://media.api-sports.io/football/teams/11303.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('flgs9ilsz3duflqbmtse3duq','Trethomas Bluebirds','https://media.api-sports.io/football/teams/11310.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('hl1n7g2wgxily7eql04gp26k','Llantwit Fardre','https://media.api-sports.io/football/teams/11317.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('nu480ne123iysdl68uvj7h0f','Canton Liberal','https://media.api-sports.io/football/teams/11324.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('gomb05rmi1t5a2q3rth7eoqj','Ely Rangers','https://media.api-sports.io/football/teams/11345.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('o7kos3u8ehuudscmaro15qz3','Aber Valley','https://media.api-sports.io/football/teams/17343.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('z783iz8bmemy0cyyz8hr0ial','Cardiff Airport','https://media.api-sports.io/football/teams/17346.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('t7g8j1exzvwhl6zqzqtpc7y6','Penrhiwceiber Rangers','https://media.api-sports.io/football/teams/17351.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('bm4svg7qapej3bwspwl23ykx','Porthcawl Town Athletic','https://media.api-sports.io/football/teams/17352.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('wexwz3blg2wxrx1pjkax7j0h','Rhos Aelwyd','https://media.api-sports.io/football/teams/17353.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('aweghh8jr8cj5gjbjpd09egx','Y Felinheli','https://media.api-sports.io/football/teams/17354.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('sablejdqaxrjrp87j517y1wu','Aberfan','https://media.api-sports.io/football/teams/20357.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('xw307fsm7ftgqnru2tu185ns','Baglan Dragons','https://media.api-sports.io/football/teams/20358.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('x8ehxmb5nl2z8bhmkcvr73qf','Flint Mountain','https://media.api-sports.io/football/teams/20360.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('ld7fmhljl9okxd2huol655fp','Newport City','https://media.api-sports.io/football/teams/20364.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('oab7mm7cduzbh7lers60nccy','Pill AFC','https://media.api-sports.io/football/teams/20365.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('reztsdpy1epi58qd444yic6y','Rockspur','https://media.api-sports.io/football/teams/20366.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('ssiuc16o5pritu8rlld9zj6e','Abercarn United','https://media.api-sports.io/football/teams/22282.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('fre1c50pd08r7wsta4resld1','Afan United','https://media.api-sports.io/football/teams/22283.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('rsysxmfa9ubfi7si16bvf13y','Cefn Fforest','https://media.api-sports.io/football/teams/22284.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('tqenq9iq66yocyn0s454h0d2','Cerrigydrudion','https://media.api-sports.io/football/teams/22285.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('ed6quq0fosc88htstlg7a0r1','Evans & Williams','https://media.api-sports.io/football/teams/22286.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('b6mz4a9fr9f1ye3it1s9x30j','Menai Bridge Tigers','https://media.api-sports.io/football/teams/22287.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('zv2ut2mqdn60ueunfbs8azuo','Mumbles Rangers','https://media.api-sports.io/football/teams/22288.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('xkgoq2nk2v2h4vdlftffxlp7','South Gower','https://media.api-sports.io/football/teams/22289.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('mu68u8mr3idz6940p0sd7rk5','St Albans','https://media.api-sports.io/football/teams/22290.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('t7bxyl2e5nspfqfh22yr3ipq','Tregaron Turfs','https://media.api-sports.io/football/teams/22291.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('mvjmnaq5hrrz68yo0hydcqlw','NFA','https://media.api-sports.io/football/teams/22350.png','oztfofgie64uo46qeoxi7lg3',1769708251,1769708251);
INSERT INTO "teams" VALUES('nn8kg42t48oucqvjc5nwh4e2','Bahia','https://media.api-sports.io/football/teams/118.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('llj8bc1vgl667z4mf3qa963i','Internacional','https://media.api-sports.io/football/teams/119.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('lnx6yspzrk5hnrr6tt4zskzi','Botafogo','https://media.api-sports.io/football/teams/120.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('hg4fuupdpdwbfl07tc3c1ypz','Palmeiras','https://media.api-sports.io/football/teams/121.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('dolfrtarpgjrwkn9nxo1m6yk','Fluminense','https://media.api-sports.io/football/teams/124.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('sjcssryngx74w3iscat02yq9','America Mineiro','https://media.api-sports.io/football/teams/125.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('mymk0bv3ogwpwmxqgg5bolzv','Sao Paulo','https://media.api-sports.io/football/teams/126.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('ozgyqx1di4qi59q2wzfbhpvp','Flamengo','https://media.api-sports.io/football/teams/127.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('qi9okxi231gvliwn26aw39tk','Santos','https://media.api-sports.io/football/teams/128.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('o7vmmk2d8xttm9xo4ndezr4j','Gremio','https://media.api-sports.io/football/teams/130.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('kqvgrg35jm7m99gxo5pisceg','Corinthians','https://media.api-sports.io/football/teams/131.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('n090g8abbbafrxanofzns8n6','Vasco DA Gama','https://media.api-sports.io/football/teams/133.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('ejm1hgsaqjvptm3ro8chzfjq','Atletico Paranaense','https://media.api-sports.io/football/teams/134.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('dexgjy23xat9pttbi3sk8id9','Cruzeiro','https://media.api-sports.io/football/teams/135.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('rmxfiwfuar02ak4etp8wqlcj','Coritiba','https://media.api-sports.io/football/teams/147.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('aiebu3xx1sfpkboi8e9m0ygl','Goias','https://media.api-sports.io/football/teams/151.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('hw8wy9uym0fa4niiwcvkxy74','Fortaleza EC','https://media.api-sports.io/football/teams/154.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('htcmjncw5sg7jrosa8d7vfxi','RB Bragantino','https://media.api-sports.io/football/teams/794.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('v0ks8v8s69gy7e3cyloafz1x','Atletico-MG','https://media.api-sports.io/football/teams/1062.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('vhwhhmgopyqbk1pexwk5383m','Cuiaba','https://media.api-sports.io/football/teams/1193.png','kmxhhzvcsze7qhl4u6f8konv',1769708251,1769708251);
INSERT INTO "teams" VALUES('jhg3wtjvt1gfawptlz297pfd','Zamora FC','https://media.api-sports.io/football/teams/2806.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('i8exy9k6zpozohxa633m7yhq','Deportivo Tachira FC','https://media.api-sports.io/football/teams/2807.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('mziwnabn49jgqs83yreu1drt','Caracas FC','https://media.api-sports.io/football/teams/2808.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('hdhvgnj34ce9n5cll0zc7343','Carabobo FC','https://media.api-sports.io/football/teams/2810.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('t44pfsbb2khkp15zdbvbpst2','Monagas SC','https://media.api-sports.io/football/teams/2811.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('cs1tubh451i7sj457vn60kam','Real Esppor Club','https://media.api-sports.io/football/teams/2813.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('yqpg4epccny6v7576plp4j1y','Portuguesa FC','https://media.api-sports.io/football/teams/2814.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('ddnxjswdh62gygyi523xw610','Estudiantes de Merida FC','https://media.api-sports.io/football/teams/2818.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('ipyofbgae9bpsvalf02ga9mk','Mineros de Guyana','https://media.api-sports.io/football/teams/2824.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('hrg7b2enc74hjqrorpkxx8ep','Metropolitanos FC','https://media.api-sports.io/football/teams/2825.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('ygewot338ggw6uidwx6lih7c','Puerto Cabello','https://media.api-sports.io/football/teams/2827.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('sdtfraa4yxsz5fod35crfdxa','Angostura FC','https://media.api-sports.io/football/teams/2838.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('tytzyz42ef02y6mioatyqqws','UCV','https://media.api-sports.io/football/teams/2840.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('ngw2kc2ct3089ls8nad65td6','CD Hermanos Colmenarez','https://media.api-sports.io/football/teams/2854.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('bh2rabeqrxk0liutjk769dlq','Rayo Zuliano','https://media.api-sports.io/football/teams/16847.png','dufy7woem33aed9w071j4iwv',1769708251,1769708251);
INSERT INTO "teams" VALUES('zhahlq224qxiuk77dfaaj3rq','Trujillanos FC','https://media.api-sports.io/football/teams/2815.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('kflmkdujer48rejsw7h7fbcy','Urena SC','https://media.api-sports.io/football/teams/2816.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('p6148anqstsz7t9own3x9djh','Yaracuyanos FC','https://media.api-sports.io/football/teams/2829.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('v2q2uizu720ol9fmv7mog2nv','Atletico el Vigia FC','https://media.api-sports.io/football/teams/2832.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('rubwtxynhtwlg55m857jvbv1','Titanes FC','https://media.api-sports.io/football/teams/2837.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('fb44gsas6l6k0hm49uffy7oo','Real Frontera','https://media.api-sports.io/football/teams/2847.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('x7rkn8phzqc5dqrac0xy4m8d','Petare FC','https://media.api-sports.io/football/teams/2853.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('tv4fv6g0b5o2n7aycqtwemj5','Dinamo de Puerto La Cruz','https://media.api-sports.io/football/teams/2858.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('fjd5ahkpewjnx4kfm10y12l6','Fundacion AIFI','https://media.api-sports.io/football/teams/2859.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('qshjrld2z8qy7eq1ubzn56vz','Fundación Lara Deportiva','https://media.api-sports.io/football/teams/10091.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('oprrg24zzdk7h8q2s174i8w2','Atlético La Cruz','https://media.api-sports.io/football/teams/16696.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('dum21ie71oyvva3kcksri3st','Academia Anzoátegui','https://media.api-sports.io/football/teams/18806.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('zsiahyl2f5f3i0vfv7tehzpi','Héroes de Falcón','https://media.api-sports.io/football/teams/18807.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('d3dogsxsnrn84c5ewcyvanp7','Nueva Esparta','https://media.api-sports.io/football/teams/18808.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('g7yv0mdnlq5y8c0xqypaecaj','Marítimo','https://media.api-sports.io/football/teams/21208.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('sfalt35pacytaazbyyufv9eq','Bolívar','https://media.api-sports.io/football/teams/21231.png','hi207bostv9mykdxcmzlhwur',1769708251,1769708251);
INSERT INTO "teams" VALUES('kgoc04st2tmeuggh4hc3atnw','Milan','https://media.api-sports.io/football/teams/15670.png',NULL,1769708251,1769708251);
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
	"created_at" integer NOT NULL,
	"updated_at" integer NOT NULL
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('d1_migrations',4);
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
CREATE UNIQUE INDEX `category_name_en_idx` ON `five_seconds_categories` (`name_en`);
CREATE UNIQUE INDEX `category_name_ar_idx` ON `five_seconds_categories` (`name_ar`);
CREATE UNIQUE INDEX `question_text_idx` ON `five_seconds_questions` (`text`);
CREATE UNIQUE INDEX `custom_lists_slug_unique` ON `custom_lists` (`slug`);