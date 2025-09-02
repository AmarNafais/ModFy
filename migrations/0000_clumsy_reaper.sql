CREATE TABLE `cart_items` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`session_id` text,
	`user_id` varchar(255),
	`product_id` varchar(255),
	`size` text,
	`color` text,
	`quantity` int NOT NULL DEFAULT 1,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`image_url` text,
	`is_active` boolean DEFAULT true,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collection_products` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`collection_id` varchar(255),
	`product_id` varchar(255),
	`order` int DEFAULT 0,
	CONSTRAINT `collection_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`image_url` text,
	`is_active` boolean DEFAULT true,
	`season` text,
	`year` int,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `collections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`order_id` varchar(255),
	`product_id` varchar(255),
	`size` text,
	`color` text,
	`quantity` int NOT NULL,
	`unit_price` decimal(10,2) NOT NULL,
	`total_price` decimal(10,2) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(255),
	`order_number` text NOT NULL,
	`status` text NOT NULL DEFAULT ('pending'),
	`total_amount` decimal(10,2) NOT NULL,
	`delivery_address` json NOT NULL,
	`phone_number` text NOT NULL,
	`payment_status` text DEFAULT ('pending'),
	`notes` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`category_id` varchar(255),
	`material` text,
	`sizes` json,
	`colors` json,
	`images` json,
	`is_active` boolean DEFAULT true,
	`is_featured` boolean DEFAULT false,
	`stock_quantity` int DEFAULT 0,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(255) NOT NULL,
	`full_name` text,
	`phone_number` text,
	`address_line_1` text,
	`address_line_2` text,
	`city` text,
	`postal_code` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`email` text NOT NULL,
	`password` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`role` text DEFAULT ('customer'),
	`is_email_verified` boolean DEFAULT false,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `wishlist_items_id` PRIMARY KEY(`id`)
);
