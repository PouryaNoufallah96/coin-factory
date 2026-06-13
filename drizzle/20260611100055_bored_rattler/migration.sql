CREATE TYPE "inquiry_status" AS ENUM('new', 'reviewed', 'contacted', 'closed');--> statement-breakpoint
CREATE TYPE "question_kind" AS ENUM('radio', 'url', 'contact');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"label" text NOT NULL,
	"sort_order" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"asset_description" text,
	"email" text NOT NULL,
	"whatsapp" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'new'::"inquiry_status" NOT NULL,
	"notified_at" timestamp with time zone,
	"notification_attempted_at" timestamp with time zone,
	"notification_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiry_answers" (
	"inquiry_id" uuid,
	"question_id" uuid,
	"value" text NOT NULL,
	"question_text" text NOT NULL,
	CONSTRAINT "inquiry_answers_pkey" PRIMARY KEY("inquiry_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "inquiry_categories" (
	"inquiry_id" uuid,
	"category_id" uuid,
	"label" text NOT NULL,
	CONSTRAINT "inquiry_categories_pkey" PRIMARY KEY("inquiry_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "inquiry_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"inquiry_id" uuid NOT NULL,
	"storage_key" text NOT NULL UNIQUE,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inquiry_files_size_bytes_check" CHECK ("size_bytes" > 0)
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"sort_order" integer NOT NULL,
	"text" text NOT NULL,
	"kind" "question_kind" NOT NULL,
	"options" text[],
	"active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questions_kind_options_check" CHECK (("kind" = 'radio' and "options" is not null and cardinality("options") > 0) or ("kind" in ('url', 'contact') and "options" is null))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "categories_sort_order_live_unique" ON "categories" ("sort_order") WHERE "deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_label_live_unique" ON "categories" (lower(btrim("label"))) WHERE "deleted_at" is null;--> statement-breakpoint
CREATE INDEX "inquiry_answers_question_id_idx" ON "inquiry_answers" ("question_id");--> statement-breakpoint
CREATE INDEX "inquiry_categories_category_id_idx" ON "inquiry_categories" ("category_id");--> statement-breakpoint
CREATE INDEX "inquiry_files_inquiry_id_idx" ON "inquiry_files" ("inquiry_id");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_sort_order_live_unique" ON "questions" ("sort_order") WHERE "deleted_at" is null;--> statement-breakpoint
ALTER TABLE "inquiry_answers" ADD CONSTRAINT "inquiry_answers_inquiry_id_inquiries_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "inquiry_answers" ADD CONSTRAINT "inquiry_answers_question_id_questions_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "inquiry_categories" ADD CONSTRAINT "inquiry_categories_inquiry_id_inquiries_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "inquiry_categories" ADD CONSTRAINT "inquiry_categories_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "inquiry_files" ADD CONSTRAINT "inquiry_files_inquiry_id_inquiries_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE CASCADE;