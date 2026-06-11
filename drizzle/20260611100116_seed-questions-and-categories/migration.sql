-- Launch content: the 6 wizard questions and 7 business categories, verbatim design copy.
INSERT INTO "questions" ("sort_order", "text", "kind", "options") VALUES
(1, 'What stage is your project currently in?', 'radio', ARRAY['Idea Stage', 'MVP', 'Active Business', 'Established Business']),
(2, 'What is your primary goal for tokenization?', 'radio', ARRAY['Fundraising', 'Community Growth', 'Customer Loyalty', 'Rewards System', 'Asset Tokenization', 'Others']),
(3, 'Would you be interested in CoinFactory investing in your project?', 'radio', ARRAY['Yes', 'No', 'Open to discussion']),
(4, 'Would you consider allocating a portion of your token supply to CoinFactory instead of paying full cash fees?', 'radio', ARRAY['Yes', 'No', 'Open to discussion']),
(5, 'Please enter your website or project link.', 'url', NULL),
(6, 'How can we contact you?', 'contact', NULL);--> statement-breakpoint
INSERT INTO "categories" ("sort_order", "label") VALUES
(1, 'Luxury Hotel'),
(2, 'Gold Mine'),
(3, 'AI Startup'),
(4, 'Solar Farm'),
(5, 'Oil Refinery'),
(6, 'Football Club'),
(7, 'Factory');
