import "dotenv/config";
import { RPCHandler } from "@orpc/server/fetch";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { alias, boolean, decimal, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { ORPCError, os } from "@orpc/server";
import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import z from "zod";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createBunWebSocket } from "hono/bun";

//#region rolldown:runtime
var __defProp = Object.defineProperty;
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
};

//#endregion
//#region src/db/schema/auth.ts
var auth_exports = {};
__export(auth_exports, {
	account: () => account,
	session: () => session,
	user: () => user,
	verification: () => verification
});
const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	role: text("role"),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull()
});
const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })
});
const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull()
});
const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at")
});

//#endregion
//#region src/db/schema/shop.ts
var shop_exports = {};
__export(shop_exports, {
	cartItems: () => cartItems,
	categories: () => categories,
	farmerProfiles: () => farmerProfiles,
	orderItems: () => orderItems,
	orders: () => orders,
	productImages: () => productImages,
	productVariants: () => productVariants,
	products: () => products,
	reviews: () => reviews,
	wishlistItems: () => wishlistItems
});
const categories = pgTable("categories", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull()
});
const products = pgTable("products", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	price: decimal("price", {
		precision: 10,
		scale: 2
	}).notNull(),
	originalPrice: decimal("original_price", {
		precision: 10,
		scale: 2
	}),
	quantity: integer("quantity").notNull(),
	unit: text("unit").notNull(),
	inStock: boolean("in_stock").notNull().default(true),
	rating: decimal("rating", {
		precision: 3,
		scale: 2
	}).default("0"),
	reviewCount: integer("review_count").default(0),
	brand: text("brand"),
	sku: text("sku"),
	weight: text("weight"),
	dimensions: text("dimensions"),
	badge: text("badge"),
	categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
	sellerId: text("seller_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull()
});
const productImages = pgTable("product_images", {
	id: text("id").primaryKey(),
	productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
	url: text("url").notNull(),
	alt: text("alt"),
	isPrimary: boolean("is_primary").default(false),
	createdAt: timestamp("created_at").notNull()
});
const productVariants = pgTable("product_variants", {
	id: text("id").primaryKey(),
	productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	value: text("value").notNull(),
	available: boolean("available").default(true),
	createdAt: timestamp("created_at").notNull()
});
const reviews = pgTable("reviews", {
	id: text("id").primaryKey(),
	productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	rating: integer("rating").notNull(),
	title: text("title"),
	content: text("content").notNull(),
	helpful: integer("helpful").default(0),
	verified: boolean("verified").default(false),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull()
});
const orders = pgTable("orders", {
	id: text("id").primaryKey(),
	customerId: text("customer_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	status: text("status").notNull().default("pending"),
	total: decimal("total", {
		precision: 10,
		scale: 2
	}).notNull(),
	subtotal: decimal("subtotal", {
		precision: 10,
		scale: 2
	}).notNull(),
	tax: decimal("tax", {
		precision: 10,
		scale: 2
	}).default("0"),
	shipping: decimal("shipping", {
		precision: 10,
		scale: 2
	}).default("0"),
	shippingAddress: text("shipping_address"),
	billingAddress: text("billing_address"),
	paymentMethod: text("payment_method"),
	paymentStatus: text("payment_status").default("pending"),
	notes: text("notes"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull()
});
const orderItems = pgTable("order_items", {
	id: text("id").primaryKey(),
	orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
	productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
	sellerId: text("seller_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	quantity: integer("quantity").notNull(),
	price: decimal("price", {
		precision: 10,
		scale: 2
	}).notNull(),
	total: decimal("total", {
		precision: 10,
		scale: 2
	}).notNull(),
	variant: text("variant"),
	createdAt: timestamp("created_at").notNull()
});
const cartItems = pgTable("cart_items", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
	quantity: integer("quantity").notNull(),
	variant: text("variant"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull()
});
const wishlistItems = pgTable("wishlist_items", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull()
});
const farmerProfiles = pgTable("farmer_profiles", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	farmName: text("farm_name"),
	description: text("description"),
	location: text("location"),
	phone: text("phone"),
	website: text("website"),
	certifications: text("certifications"),
	avatar: text("avatar"),
	banner: text("banner"),
	verified: boolean("verified").default(false),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull()
});

//#endregion
//#region src/db/index.ts
const schema = {
	...auth_exports,
	...shop_exports
};
const db = drizzle(process.env.DATABASE_URL || "", { schema });

//#endregion
//#region src/lib/auth.ts
const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: auth_exports
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: { enabled: true },
	user: { additionalFields: { role: {
		type: "string",
		enum: [
			"admin",
			"farmer",
			"customer"
		],
		default: "customer"
	} } },
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL
});

//#endregion
//#region src/lib/context.ts
async function createContext({ context }) {
	const session$1 = await auth.api.getSession({ headers: context.req.raw.headers });
	return { session: session$1 };
}

//#endregion
//#region src/lib/orpc.ts
const o = os.$context();
const publicProcedure = o;
const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) throw new ORPCError("UNAUTHORIZED");
	return next({ context: { session: context.session } });
});
const protectedProcedure = publicProcedure.use(requireAuth);

//#endregion
//#region src/routers/shop.ts
const createProductSchema = z.object({
	name: z.string().min(2),
	description: z.string().min(10),
	price: z.string().transform((val) => parseFloat(val)),
	originalPrice: z.string().optional().transform((val) => val ? parseFloat(val) : void 0),
	quantity: z.number().int().min(0),
	unit: z.string().min(1),
	categoryId: z.string(),
	brand: z.string().optional(),
	weight: z.string().optional(),
	dimensions: z.string().optional(),
	badge: z.string().optional(),
	images: z.array(z.string()),
	variants: z.array(z.object({
		name: z.string(),
		value: z.string(),
		available: z.boolean().default(true)
	})).optional()
});
const updateProductSchema = createProductSchema.partial().extend({ id: z.string() });
const createReviewSchema = z.object({
	productId: z.string(),
	rating: z.number().int().min(1).max(5),
	title: z.string().optional(),
	content: z.string().min(5)
});
const cartItemSchema = z.object({
	productId: z.string(),
	quantity: z.number().int().min(1),
	variant: z.string().optional()
});
const createOrderSchema = z.object({
	items: z.array(z.object({
		productId: z.string(),
		quantity: z.number().int().min(1),
		variant: z.string().optional()
	})),
	shippingAddress: z.string(),
	billingAddress: z.string().optional(),
	paymentMethod: z.string(),
	notes: z.string().optional()
});
const farmerProfileSchema = z.object({
	farmName: z.string().optional(),
	description: z.string().optional(),
	location: z.string().optional(),
	phone: z.string().optional(),
	website: z.string().optional(),
	certifications: z.string().optional(),
	avatar: z.string().optional(),
	banner: z.string().optional()
});
const shopRouter = {
	getCategories: publicProcedure.handler(async () => {
		return await db.select().from(categories).orderBy(asc(categories.name));
	}),
	createCategory: protectedProcedure.input(z.object({
		name: z.string().min(2),
		description: z.string().optional()
	})).handler(async ({ input, context }) => {
		const categoryId = crypto.randomUUID();
		const now = new Date();
		const [category] = await db.insert(categories).values({
			id: categoryId,
			name: input.name,
			description: input.description,
			createdAt: now,
			updatedAt: now
		}).returning();
		return category;
	}),
	getProducts: publicProcedure.input(z.object({
		page: z.number().default(1),
		limit: z.number().max(50).default(12),
		search: z.string().optional(),
		categoryId: z.string().optional(),
		sellerId: z.string().optional(),
		sortBy: z.enum([
			"featured",
			"newest",
			"price-low",
			"price-high",
			"rating"
		]).default("featured"),
		inStock: z.boolean().optional(),
		minPrice: z.number().optional(),
		maxPrice: z.number().optional()
	})).handler(async ({ input }) => {
		const offset = (input.page - 1) * input.limit;
		let query = db.select({
			id: products.id,
			name: products.name,
			description: products.description,
			price: products.price,
			originalPrice: products.originalPrice,
			quantity: products.quantity,
			unit: products.unit,
			inStock: products.inStock,
			rating: products.rating,
			reviewCount: products.reviewCount,
			badge: products.badge,
			categoryId: products.categoryId,
			sellerId: products.sellerId,
			createdAt: products.createdAt,
			category: {
				id: categories.id,
				name: categories.name
			}
		}).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).$dynamic();
		if (input.search) query = query.where(ilike(products.name, `%${input.search}%`));
		if (input.categoryId) query = query.where(eq(products.categoryId, input.categoryId));
		if (input.sellerId) query = query.where(eq(products.sellerId, input.sellerId));
		if (input.inStock !== void 0) query = query.where(eq(products.inStock, input.inStock));
		if (input.minPrice !== void 0) query = query.where(sql`${products.price} >= ${input.minPrice}`);
		if (input.maxPrice !== void 0) query = query.where(sql`${products.price} <= ${input.maxPrice}`);
		switch (input.sortBy) {
			case "newest":
				query = query.orderBy(desc(products.createdAt));
				break;
			case "price-low":
				query = query.orderBy(asc(products.price));
				break;
			case "price-high":
				query = query.orderBy(desc(products.price));
				break;
			case "rating":
				query = query.orderBy(desc(products.rating));
				break;
			default: query = query.orderBy(desc(products.createdAt));
		}
		const items = await query.limit(input.limit).offset(offset);
		const productIds = items.map((item) => item.id);
		const images = await db.select().from(productImages).where(inArray(productImages.productId, productIds));
		const itemsWithImages = items.map((item) => ({
			...item,
			images: images.filter((img) => img.productId === item.id)
		}));
		return {
			items: itemsWithImages,
			pagination: {
				page: input.page,
				limit: input.limit,
				hasMore: items.length === input.limit
			}
		};
	}),
	getProduct: publicProcedure.input(z.object({ id: z.string() })).handler(async ({ input }) => {
		const [product] = await db.select({
			id: products.id,
			name: products.name,
			description: products.description,
			price: products.price,
			originalPrice: products.originalPrice,
			quantity: products.quantity,
			unit: products.unit,
			inStock: products.inStock,
			rating: products.rating,
			reviewCount: products.reviewCount,
			brand: products.brand,
			sku: products.sku,
			weight: products.weight,
			dimensions: products.dimensions,
			badge: products.badge,
			categoryId: products.categoryId,
			sellerId: products.sellerId,
			createdAt: products.createdAt,
			category: {
				id: categories.id,
				name: categories.name
			},
			seller: {
				id: sql`"user"."id"`,
				name: sql`"user"."name"`,
				email: sql`"user"."email"`,
				image: sql`"user"."image"`
			}
		}).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).leftJoin(sql`"user"`, eq(products.sellerId, sql`"user"."id"`)).where(eq(products.id, input.id));
		if (!product) throw new Error("Product not found");
		const [productImagesData, productVariantsData, farmerProfileData] = await Promise.all([
			db.select().from(productImages).where(eq(productImages.productId, input.id)),
			db.select().from(productVariants).where(eq(productVariants.productId, input.id)),
			db.select().from(farmerProfiles).where(eq(farmerProfiles.userId, product.sellerId))
		]);
		return {
			...product,
			images: productImagesData,
			variants: productVariantsData,
			farmerProfile: farmerProfileData[0] || null
		};
	}),
	createProduct: protectedProcedure.input(createProductSchema).handler(async ({ input, context }) => {
		const productId = crypto.randomUUID();
		const now = new Date();
		const [product] = await db.insert(products).values({
			id: productId,
			name: input.name,
			description: input.description,
			price: input.price.toString(),
			originalPrice: input.originalPrice?.toString(),
			quantity: input.quantity,
			unit: input.unit,
			categoryId: input.categoryId,
			sellerId: context.session.user.id,
			brand: input.brand,
			weight: input.weight,
			dimensions: input.dimensions,
			badge: input.badge,
			createdAt: now,
			updatedAt: now
		}).returning();
		if (input.images.length > 0) await db.insert(productImages).values(input.images.map((url, index) => ({
			id: crypto.randomUUID(),
			productId,
			url,
			isPrimary: index === 0,
			createdAt: now
		})));
		if (input.variants && input.variants.length > 0) await db.insert(productVariants).values(input.variants.map((variant) => ({
			id: crypto.randomUUID(),
			productId,
			name: variant.name,
			value: variant.value,
			available: variant.available,
			createdAt: now
		})));
		return product;
	}),
	updateProduct: protectedProcedure.input(updateProductSchema).handler(async ({ input, context }) => {
		const { id, images, variants,...updateData } = input;
		const now = new Date();
		const [existingProduct] = await db.select({ sellerId: products.sellerId }).from(products).where(eq(products.id, id));
		if (!existingProduct || existingProduct.sellerId !== context.session.user.id) throw new Error("Product not found or unauthorized");
		const [updatedProduct] = await db.update(products).set({
			...updateData,
			price: updateData.price?.toString(),
			originalPrice: updateData.originalPrice?.toString(),
			updatedAt: now
		}).where(eq(products.id, id)).returning();
		return updatedProduct;
	}),
	deleteProduct: protectedProcedure.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
		const [existingProduct] = await db.select({ sellerId: products.sellerId }).from(products).where(eq(products.id, input.id));
		if (!existingProduct || existingProduct.sellerId !== context.session.user.id) throw new Error("Product not found or unauthorized");
		await db.delete(products).where(eq(products.id, input.id));
		return { success: true };
	}),
	getProductReviews: publicProcedure.input(z.object({
		productId: z.string(),
		page: z.number().default(1),
		limit: z.number().max(20).default(10)
	})).handler(async ({ input }) => {
		const offset = (input.page - 1) * input.limit;
		const reviewsData = await db.select({
			id: reviews.id,
			rating: reviews.rating,
			title: reviews.title,
			content: reviews.content,
			helpful: reviews.helpful,
			verified: reviews.verified,
			createdAt: reviews.createdAt,
			user: {
				id: sql`"user"."id"`,
				name: sql`"user"."name"`,
				image: sql`"user"."image"`
			}
		}).from(reviews).leftJoin(sql`"user"`, eq(reviews.userId, sql`"user"."id"`)).where(eq(reviews.productId, input.productId)).orderBy(desc(reviews.createdAt)).limit(input.limit).offset(offset);
		return reviewsData;
	}),
	createReview: protectedProcedure.input(createReviewSchema).handler(async ({ input, context }) => {
		const reviewId = crypto.randomUUID();
		const now = new Date();
		const [review] = await db.insert(reviews).values({
			id: reviewId,
			productId: input.productId,
			userId: context.session.user.id,
			rating: input.rating,
			title: input.title,
			content: input.content,
			createdAt: now,
			updatedAt: now
		}).returning();
		const avgRating = await db.select({
			avg: sql`AVG(${reviews.rating})`,
			count: sql`COUNT(*)`
		}).from(reviews).where(eq(reviews.productId, input.productId));
		if (avgRating[0]) await db.update(products).set({
			rating: avgRating[0].avg.toString(),
			reviewCount: Number(avgRating[0].count)
		}).where(eq(products.id, input.productId));
		return review;
	}),
	getCart: protectedProcedure.handler(async ({ context }) => {
		const items = await db.select({
			id: cartItems.id,
			quantity: cartItems.quantity,
			variant: cartItems.variant,
			createdAt: cartItems.createdAt,
			product: {
				id: products.id,
				name: products.name,
				price: products.price,
				inStock: products.inStock,
				quantity: products.quantity
			}
		}).from(cartItems).leftJoin(products, eq(cartItems.productId, products.id)).where(eq(cartItems.userId, context.session.user.id));
		return items;
	}),
	addToCart: protectedProcedure.input(cartItemSchema).handler(async ({ input, context }) => {
		const cartItemId = crypto.randomUUID();
		const now = new Date();
		const [existingItem] = await db.select().from(cartItems).where(and(eq(cartItems.userId, context.session.user.id), eq(cartItems.productId, input.productId), input.variant ? eq(cartItems.variant, input.variant) : sql`${cartItems.variant} IS NULL`));
		if (existingItem) {
			const [updatedItem] = await db.update(cartItems).set({
				quantity: existingItem.quantity + input.quantity,
				updatedAt: now
			}).where(eq(cartItems.id, existingItem.id)).returning();
			return updatedItem;
		} else {
			const [newItem] = await db.insert(cartItems).values({
				id: cartItemId,
				userId: context.session.user.id,
				productId: input.productId,
				quantity: input.quantity,
				variant: input.variant,
				createdAt: now,
				updatedAt: now
			}).returning();
			return newItem;
		}
	}),
	updateCartItem: protectedProcedure.input(z.object({
		id: z.string(),
		quantity: z.number().int().min(1)
	})).handler(async ({ input, context }) => {
		const [updatedItem] = await db.update(cartItems).set({
			quantity: input.quantity,
			updatedAt: new Date()
		}).where(and(eq(cartItems.id, input.id), eq(cartItems.userId, context.session.user.id))).returning();
		return updatedItem;
	}),
	removeFromCart: protectedProcedure.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
		await db.delete(cartItems).where(and(eq(cartItems.id, input.id), eq(cartItems.userId, context.session.user.id)));
		return { success: true };
	}),
	clearCart: protectedProcedure.handler(async ({ context }) => {
		await db.delete(cartItems).where(eq(cartItems.userId, context.session.user.id));
		return { success: true };
	}),
	getWishlist: protectedProcedure.handler(async ({ context }) => {
		const items = await db.select({
			id: wishlistItems.id,
			createdAt: wishlistItems.createdAt,
			product: {
				id: products.id,
				name: products.name,
				price: products.price,
				originalPrice: products.originalPrice,
				rating: products.rating,
				inStock: products.inStock
			}
		}).from(wishlistItems).leftJoin(products, eq(wishlistItems.productId, products.id)).where(eq(wishlistItems.userId, context.session.user.id)).orderBy(desc(wishlistItems.createdAt));
		return items;
	}),
	addToWishlist: protectedProcedure.input(z.object({ productId: z.string() })).handler(async ({ input, context }) => {
		const wishlistItemId = crypto.randomUUID();
		const now = new Date();
		const [existing] = await db.select().from(wishlistItems).where(and(eq(wishlistItems.userId, context.session.user.id), eq(wishlistItems.productId, input.productId)));
		if (existing) throw new Error("Product already in wishlist");
		const [item] = await db.insert(wishlistItems).values({
			id: wishlistItemId,
			userId: context.session.user.id,
			productId: input.productId,
			createdAt: now
		}).returning();
		return item;
	}),
	removeFromWishlist: protectedProcedure.input(z.object({ productId: z.string() })).handler(async ({ input, context }) => {
		await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, context.session.user.id), eq(wishlistItems.productId, input.productId)));
		return { success: true };
	}),
	createOrder: protectedProcedure.input(createOrderSchema).handler(async ({ input, context }) => {
		const orderId = crypto.randomUUID();
		const now = new Date();
		const productIds = input.items.map((item) => item.productId);
		const productsData = await db.select().from(products).where(inArray(products.id, productIds));
		let subtotal = 0;
		const orderItemsData = input.items.map((item) => {
			const product = productsData.find((p) => p.id === item.productId);
			if (!product) throw new Error(`Product ${item.productId} not found`);
			const price = parseFloat(product.price);
			const total$1 = price * item.quantity;
			subtotal += total$1;
			return {
				id: crypto.randomUUID(),
				orderId,
				productId: item.productId,
				sellerId: product.sellerId,
				quantity: item.quantity,
				price: price.toString(),
				total: total$1.toString(),
				variant: item.variant,
				createdAt: now
			};
		});
		const tax = subtotal * .1;
		const shipping = subtotal > 100 ? 0 : 10;
		const total = subtotal + tax + shipping;
		const [order] = await db.insert(orders).values({
			id: orderId,
			customerId: context.session.user.id,
			subtotal: subtotal.toString(),
			tax: tax.toString(),
			shipping: shipping.toString(),
			total: total.toString(),
			shippingAddress: input.shippingAddress,
			billingAddress: input.billingAddress || input.shippingAddress,
			paymentMethod: input.paymentMethod,
			notes: input.notes,
			createdAt: now,
			updatedAt: now
		}).returning();
		await db.insert(orderItems).values(orderItemsData);
		await db.delete(cartItems).where(and(eq(cartItems.userId, context.session.user.id), inArray(cartItems.productId, productIds)));
		return order;
	}),
	getOrders: protectedProcedure.input(z.object({
		page: z.number().default(1),
		limit: z.number().max(50).default(10)
	})).handler(async ({ input, context }) => {
		const offset = (input.page - 1) * input.limit;
		const ordersData = await db.select().from(orders).where(eq(orders.customerId, context.session.user.id)).orderBy(desc(orders.createdAt)).limit(input.limit).offset(offset);
		return ordersData;
	}),
	getOrder: protectedProcedure.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
		const [order] = await db.select().from(orders).where(and(eq(orders.id, input.id), eq(orders.customerId, context.session.user.id)));
		if (!order) throw new Error("Order not found");
		const items = await db.select({
			id: orderItems.id,
			quantity: orderItems.quantity,
			price: orderItems.price,
			total: orderItems.total,
			variant: orderItems.variant,
			product: {
				id: products.id,
				name: products.name
			}
		}).from(orderItems).leftJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, input.id));
		return {
			...order,
			items
		};
	}),
	getSellerOrders: protectedProcedure.input(z.object({
		page: z.number().default(1),
		limit: z.number().max(50).default(10)
	})).handler(async ({ input, context }) => {
		const offset = (input.page - 1) * input.limit;
		const orderItemsData = await db.select({
			id: orderItems.id,
			orderId: orderItems.orderId,
			quantity: orderItems.quantity,
			price: orderItems.price,
			total: orderItems.total,
			variant: orderItems.variant,
			createdAt: orderItems.createdAt,
			product: {
				id: products.id,
				name: products.name
			},
			order: {
				id: orders.id,
				status: orders.status,
				paymentStatus: orders.paymentStatus,
				shippingAddress: orders.shippingAddress,
				notes: orders.notes,
				createdAt: orders.createdAt
			},
			customer: {
				id: sql`"user"."id"`,
				name: sql`"user"."name"`,
				email: sql`"user"."email"`
			}
		}).from(orderItems).leftJoin(products, eq(orderItems.productId, products.id)).leftJoin(orders, eq(orderItems.orderId, orders.id)).leftJoin(sql`"user"`, eq(orders.customerId, sql`"user"."id"`)).where(eq(orderItems.sellerId, context.session.user.id)).orderBy(desc(orderItems.createdAt)).limit(input.limit).offset(offset);
		return orderItemsData;
	}),
	getFarmers: publicProcedure.input(z.object({
		page: z.number().default(1),
		limit: z.number().max(50).default(12),
		search: z.string().optional(),
		location: z.string().optional(),
		verified: z.boolean().optional()
	})).handler(async ({ input }) => {
		const offset = (input.page - 1) * input.limit;
		let query = db.select({
			id: farmerProfiles.id,
			userId: farmerProfiles.userId,
			farmName: farmerProfiles.farmName,
			description: farmerProfiles.description,
			location: farmerProfiles.location,
			phone: farmerProfiles.phone,
			website: farmerProfiles.website,
			certifications: farmerProfiles.certifications,
			avatar: farmerProfiles.avatar,
			banner: farmerProfiles.banner,
			verified: farmerProfiles.verified,
			createdAt: farmerProfiles.createdAt,
			user: {
				id: sql`"user"."id"`,
				name: sql`"user"."name"`,
				email: sql`"user"."email"`,
				image: sql`"user"."image"`
			}
		}).from(farmerProfiles).leftJoin(sql`"user"`, eq(farmerProfiles.userId, sql`"user"."id"`)).$dynamic();
		if (input.search) query = query.where(sql`${farmerProfiles.farmName} ILIKE ${`%${input.search}%`} OR ${sql`"user"."name"`} ILIKE ${`%${input.search}%`}`);
		if (input.location) query = query.where(ilike(farmerProfiles.location, `%${input.location}%`));
		if (input.verified !== void 0) query = query.where(eq(farmerProfiles.verified, input.verified));
		const items = await query.orderBy(desc(farmerProfiles.createdAt)).limit(input.limit).offset(offset);
		const farmerIds = items.map((item) => item.userId);
		const productCounts = await db.select({
			sellerId: products.sellerId,
			count: sql`count(*)`
		}).from(products).where(inArray(products.sellerId, farmerIds)).groupBy(products.sellerId);
		const itemsWithCounts = items.map((item) => ({
			...item,
			productCount: productCounts.find((p) => p.sellerId === item.userId)?.count || 0
		}));
		return {
			items: itemsWithCounts,
			pagination: {
				page: input.page,
				limit: input.limit,
				hasMore: items.length === input.limit
			}
		};
	}),
	getFarmerProfile: publicProcedure.input(z.object({ userId: z.string() })).handler(async ({ input }) => {
		const [profile] = await db.select({
			id: farmerProfiles.id,
			userId: farmerProfiles.userId,
			farmName: farmerProfiles.farmName,
			description: farmerProfiles.description,
			location: farmerProfiles.location,
			phone: farmerProfiles.phone,
			website: farmerProfiles.website,
			certifications: farmerProfiles.certifications,
			avatar: farmerProfiles.avatar,
			banner: farmerProfiles.banner,
			verified: farmerProfiles.verified,
			createdAt: farmerProfiles.createdAt,
			user: {
				id: sql`"user"."id"`,
				name: sql`"user"."name"`,
				email: sql`"user"."email"`,
				image: sql`"user"."image"`
			}
		}).from(farmerProfiles).leftJoin(sql`"user"`, eq(farmerProfiles.userId, sql`"user"."id"`)).where(eq(farmerProfiles.userId, input.userId));
		if (!profile) {
			const profileId = crypto.randomUUID();
			const now = new Date();
			const [newProfile] = await db.insert(farmerProfiles).values({
				id: profileId,
				userId: input.userId,
				farmName: null,
				description: null,
				location: null,
				phone: null,
				website: null,
				certifications: null,
				avatar: null,
				banner: null,
				verified: false,
				createdAt: now,
				updatedAt: now
			}).returning();
			const [userData] = await db.select().from(sql`"user"`).where(eq(sql`"user"."id"`, input.userId));
			return {
				...newProfile,
				user: userData
			};
		}
		return profile;
	}),
	updateFarmerProfile: protectedProcedure.input(farmerProfileSchema).handler(async ({ input, context }) => {
		const now = new Date();
		const [existingProfile] = await db.select().from(farmerProfiles).where(eq(farmerProfiles.userId, context.session.user.id));
		if (existingProfile) {
			const [updatedProfile] = await db.update(farmerProfiles).set({
				...input,
				updatedAt: now
			}).where(eq(farmerProfiles.userId, context.session.user.id)).returning();
			return updatedProfile;
		} else {
			const profileId = crypto.randomUUID();
			const [newProfile] = await db.insert(farmerProfiles).values({
				id: profileId,
				userId: context.session.user.id,
				...input,
				createdAt: now,
				updatedAt: now
			}).returning();
			return newProfile;
		}
	})
};

//#endregion
//#region src/routers/admin.ts
const requireAdmin = protectedProcedure.use(async ({ context, next }) => {
	if (context.session.user.role !== "admin") throw new Error("Admin access required");
	return next({ context: { session: context.session } });
});
const adminRouter = {
	getStats: requireAdmin.handler(async () => {
		const [userStats, orderStats, productStats] = await Promise.all([
			db.select({
				total: count(),
				farmers: sql`count(*) filter (where role = 'farmer')`,
				customers: sql`count(*) filter (where role = 'customer')`,
				admins: sql`count(*) filter (where role = 'admin')`
			}).from(user),
			db.select({
				total: count(),
				pending: sql`count(*) filter (where status = 'pending')`,
				processing: sql`count(*) filter (where status = 'processing')`,
				shipped: sql`count(*) filter (where status = 'shipped')`,
				delivered: sql`count(*) filter (where status = 'delivered')`,
				cancelled: sql`count(*) filter (where status = 'cancelled')`,
				totalRevenue: sql`sum(cast(total as decimal))`
			}).from(orders),
			db.select({
				total: count(),
				inStock: sql`count(*) filter (where in_stock = true)`,
				outOfStock: sql`count(*) filter (where in_stock = false)`
			}).from(products)
		]);
		return {
			users: userStats[0],
			orders: orderStats[0],
			products: productStats[0]
		};
	}),
	getUsers: requireAdmin.input(z.object({
		page: z.number().default(1),
		limit: z.number().max(100).default(20),
		search: z.string().optional(),
		role: z.enum([
			"admin",
			"farmer",
			"customer"
		]).optional(),
		sortBy: z.enum([
			"name",
			"email",
			"role",
			"createdAt"
		]).default("createdAt"),
		sortOrder: z.enum(["asc", "desc"]).default("desc")
	})).handler(async ({ input }) => {
		const offset = (input.page - 1) * input.limit;
		let query = db.select().from(user).$dynamic();
		if (input.search) query = query.where(sql`${user.name} ILIKE ${`%${input.search}%`} OR ${user.email} ILIKE ${`%${input.search}%`}`);
		if (input.role) query = query.where(eq(user.role, input.role));
		switch (input.sortBy) {
			case "name":
				query = query.orderBy(input.sortOrder === "asc" ? asc(user.name) : desc(user.name));
				break;
			case "email":
				query = query.orderBy(input.sortOrder === "asc" ? asc(user.email) : desc(user.email));
				break;
			case "role":
				query = query.orderBy(input.sortOrder === "asc" ? asc(user.role) : desc(user.role));
				break;
			default: query = query.orderBy(input.sortOrder === "asc" ? asc(user.createdAt) : desc(user.createdAt));
		}
		const users = await query.limit(input.limit).offset(offset);
		const [totalCount] = await db.select({ count: count() }).from(user);
		return {
			users,
			pagination: {
				page: input.page,
				limit: input.limit,
				total: totalCount.count,
				totalPages: Math.ceil(totalCount.count / input.limit)
			}
		};
	}),
	updateUserRole: requireAdmin.input(z.object({
		userId: z.string(),
		role: z.enum([
			"admin",
			"farmer",
			"customer"
		])
	})).handler(async ({ input }) => {
		const [updatedUser] = await db.update(user).set({
			role: input.role,
			updatedAt: new Date()
		}).where(eq(user.id, input.userId)).returning();
		return updatedUser;
	}),
	deleteUser: requireAdmin.input(z.object({ userId: z.string() })).handler(async ({ input, context }) => {
		if (input.userId === context.session.user.id) throw new Error("Cannot delete your own account");
		await db.delete(user).where(eq(user.id, input.userId));
		return { success: true };
	}),
	getAllOrders: requireAdmin.input(z.object({
		page: z.number().default(1),
		limit: z.number().max(100).default(20),
		search: z.string().optional(),
		status: z.enum([
			"pending",
			"processing",
			"shipped",
			"delivered",
			"cancelled"
		]).optional(),
		paymentStatus: z.enum([
			"pending",
			"paid",
			"failed",
			"refunded"
		]).optional(),
		sortBy: z.enum([
			"createdAt",
			"total",
			"status"
		]).default("createdAt"),
		sortOrder: z.enum(["asc", "desc"]).default("desc")
	})).handler(async ({ input }) => {
		const offset = (input.page - 1) * input.limit;
		const customer = alias(user, "customer");
		let query = db.select({
			id: orders.id,
			customerId: orders.customerId,
			status: orders.status,
			total: orders.total,
			subtotal: orders.subtotal,
			tax: orders.tax,
			shipping: orders.shipping,
			paymentStatus: orders.paymentStatus,
			paymentMethod: orders.paymentMethod,
			shippingAddress: orders.shippingAddress,
			createdAt: orders.createdAt,
			updatedAt: orders.updatedAt,
			customer: {
				id: customer.id,
				name: customer.name,
				email: customer.email
			}
		}).from(orders).leftJoin(customer, eq(orders.customerId, customer.id)).$dynamic();
		if (input.search) query = query.where(sql`${customer.name} ILIKE ${`%${input.search}%`} OR ${customer.email} ILIKE ${`%${input.search}%`} OR ${orders.id} ILIKE ${`%${input.search}%`}`);
		if (input.status) query = query.where(eq(orders.status, input.status));
		if (input.paymentStatus) query = query.where(eq(orders.paymentStatus, input.paymentStatus));
		switch (input.sortBy) {
			case "total":
				query = query.orderBy(input.sortOrder === "asc" ? asc(orders.total) : desc(orders.total));
				break;
			case "status":
				query = query.orderBy(input.sortOrder === "asc" ? asc(orders.status) : desc(orders.status));
				break;
			default: query = query.orderBy(input.sortOrder === "asc" ? asc(orders.createdAt) : desc(orders.createdAt));
		}
		const ordersData = await query.limit(input.limit).offset(offset);
		const [totalCount] = await db.select({ count: count() }).from(orders);
		return {
			orders: ordersData,
			pagination: {
				page: input.page,
				limit: input.limit,
				total: totalCount.count,
				totalPages: Math.ceil(totalCount.count / input.limit)
			}
		};
	}),
	getOrderDetails: requireAdmin.input(z.object({ orderId: z.string() })).handler(async ({ input }) => {
		const customer = alias(user, "customer_details");
		const [order] = await db.select({
			id: orders.id,
			customerId: orders.customerId,
			status: orders.status,
			total: orders.total,
			subtotal: orders.subtotal,
			tax: orders.tax,
			shipping: orders.shipping,
			paymentStatus: orders.paymentStatus,
			paymentMethod: orders.paymentMethod,
			shippingAddress: orders.shippingAddress,
			billingAddress: orders.billingAddress,
			notes: orders.notes,
			createdAt: orders.createdAt,
			updatedAt: orders.updatedAt,
			customer: {
				id: customer.id,
				name: customer.name,
				email: customer.email
			}
		}).from(orders).leftJoin(customer, eq(orders.customerId, customer.id)).where(eq(orders.id, input.orderId));
		if (!order) throw new Error("Order not found");
		const seller = alias(user, "seller");
		const items = await db.select({
			id: orderItems.id,
			quantity: orderItems.quantity,
			price: orderItems.price,
			total: orderItems.total,
			variant: orderItems.variant,
			product: {
				id: products.id,
				name: products.name
			},
			seller: {
				id: seller.id,
				name: seller.name,
				email: seller.email
			}
		}).from(orderItems).leftJoin(products, eq(orderItems.productId, products.id)).leftJoin(seller, eq(orderItems.sellerId, seller.id)).where(eq(orderItems.orderId, input.orderId));
		return {
			...order,
			items
		};
	}),
	updateOrderStatus: requireAdmin.input(z.object({
		orderId: z.string(),
		status: z.enum([
			"pending",
			"processing",
			"shipped",
			"delivered",
			"cancelled"
		])
	})).handler(async ({ input }) => {
		const [updatedOrder] = await db.update(orders).set({
			status: input.status,
			updatedAt: new Date()
		}).where(eq(orders.id, input.orderId)).returning();
		return updatedOrder;
	}),
	updatePaymentStatus: requireAdmin.input(z.object({
		orderId: z.string(),
		paymentStatus: z.enum([
			"pending",
			"paid",
			"failed",
			"refunded"
		])
	})).handler(async ({ input }) => {
		const [updatedOrder] = await db.update(orders).set({
			paymentStatus: input.paymentStatus,
			updatedAt: new Date()
		}).where(eq(orders.id, input.orderId)).returning();
		return updatedOrder;
	})
};

//#endregion
//#region src/db/schema/chat.ts
const conversations = pgTable("conversations", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title"),
	type: text("type").notNull().default("direct"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	lastMessageAt: timestamp("last_message_at")
});
const conversationParticipants = pgTable("conversation_participants", {
	id: uuid("id").primaryKey().defaultRandom(),
	conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	joinedAt: timestamp("joined_at").notNull().defaultNow(),
	isAdmin: boolean("is_admin").notNull().default(false)
});
const messages = pgTable("messages", {
	id: uuid("id").primaryKey().defaultRandom(),
	conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
	senderId: text("sender_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	content: text("content"),
	messageType: text("message_type").notNull().default("text"),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isEdited: boolean("is_edited").notNull().default(false),
	isDeleted: boolean("is_deleted").notNull().default(false)
});
const messageReads = pgTable("message_reads", {
	id: uuid("id").primaryKey().defaultRandom(),
	messageId: uuid("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	readAt: timestamp("read_at").notNull().defaultNow()
});

//#endregion
//#region src/lib/websocket-manager.ts
var WebSocketManager = class {
	connections = new Map();
	userConnections = new Map();
	conversationRooms = new Map();
	addConnection(connection) {
		this.connections.set(connection.connectionId, connection);
		if (!this.userConnections.has(connection.userId)) this.userConnections.set(connection.userId, new Set());
		this.userConnections.get(connection.userId).add(connection.connectionId);
		this.updateUserConversationRooms(connection.userId, connection.connectionId);
		console.log(`WebSocket connection added: ${connection.connectionId} for user ${connection.userId}`);
	}
	removeConnection(connectionId) {
		const connection = this.connections.get(connectionId);
		if (!connection) return;
		const userConnections = this.userConnections.get(connection.userId);
		if (userConnections) {
			userConnections.delete(connectionId);
			if (userConnections.size === 0) this.userConnections.delete(connection.userId);
		}
		connection.conversationIds.forEach((conversationId) => {
			const room = this.conversationRooms.get(conversationId);
			if (room) {
				room.delete(connectionId);
				if (room.size === 0) this.conversationRooms.delete(conversationId);
			}
		});
		this.connections.delete(connectionId);
		console.log(`WebSocket connection removed: ${connectionId}`);
	}
	async updateUserConversationRooms(userId, connectionId) {
		try {
			const userConversations = await db.select({ conversationId: conversationParticipants.conversationId }).from(conversationParticipants).where(eq(conversationParticipants.userId, userId));
			const connection = this.connections.get(connectionId);
			if (!connection) return;
			userConversations.forEach(({ conversationId }) => {
				if (!this.conversationRooms.has(conversationId)) this.conversationRooms.set(conversationId, new Set());
				this.conversationRooms.get(conversationId).add(connectionId);
				connection.conversationIds.add(conversationId);
			});
		} catch (error) {
			console.error("Error updating user conversation rooms:", error);
		}
	}
	broadcastToConversation(conversationId, event, excludeUserId) {
		const room = this.conversationRooms.get(conversationId);
		if (!room) return;
		const message = JSON.stringify(event);
		let sentCount = 0;
		room.forEach((connectionId) => {
			const connection = this.connections.get(connectionId);
			if (!connection || !connection.isAlive) {
				this.removeConnection(connectionId);
				return;
			}
			if (excludeUserId && connection.userId === excludeUserId) return;
			try {
				connection.ws.send(message);
				sentCount++;
			} catch (error) {
				console.error(`Error sending WebSocket message to ${connectionId}:`, error);
				this.removeConnection(connectionId);
			}
		});
		console.log(`Broadcasted ${event.type} to conversation ${conversationId}: ${sentCount} recipients`);
	}
	broadcastToUser(userId, event) {
		const userConnections = this.userConnections.get(userId);
		if (!userConnections) return;
		const message = JSON.stringify(event);
		let sentCount = 0;
		userConnections.forEach((connectionId) => {
			const connection = this.connections.get(connectionId);
			if (!connection || !connection.isAlive) {
				this.removeConnection(connectionId);
				return;
			}
			try {
				connection.ws.send(message);
				sentCount++;
			} catch (error) {
				console.error(`Error sending WebSocket message to ${connectionId}:`, error);
				this.removeConnection(connectionId);
			}
		});
		console.log(`Broadcasted ${event.type} to user ${userId}: ${sentCount} connections`);
	}
	broadcastToAll(event) {
		const message = JSON.stringify(event);
		let sentCount = 0;
		this.connections.forEach((connection, connectionId) => {
			if (!connection.isAlive) {
				this.removeConnection(connectionId);
				return;
			}
			try {
				connection.ws.send(message);
				sentCount++;
			} catch (error) {
				console.error(`Error sending WebSocket message to ${connectionId}:`, error);
				this.removeConnection(connectionId);
			}
		});
		console.log(`Broadcasted ${event.type} to all: ${sentCount} connections`);
	}
	isUserOnline(userId) {
		return this.userConnections.has(userId);
	}
	getOnlineUsers() {
		return Array.from(this.userConnections.keys());
	}
	getConnectionCount() {
		return this.connections.size;
	}
	heartbeat() {
		this.connections.forEach((connection, connectionId) => {
			if (!connection.isAlive) {
				this.removeConnection(connectionId);
				return;
			}
			if (connection.ws.readyState !== connection.ws.OPEN) {
				this.removeConnection(connectionId);
				return;
			}
			connection.isAlive = false;
			try {
				connection.ws.send(JSON.stringify({
					type: "HEARTBEAT",
					timestamp: new Date()
				}));
			} catch (error) {
				this.removeConnection(connectionId);
			}
		});
	}
	markConnectionAlive(connectionId) {
		const connection = this.connections.get(connectionId);
		if (connection) connection.isAlive = true;
	}
};
const wsManager = new WebSocketManager();
setInterval(() => {
	wsManager.heartbeat();
}, 3e4);

//#endregion
//#region src/routers/chat.ts
const chatRouter = {
	getConversations: protectedProcedure.input(z.object({
		page: z.number().default(1),
		limit: z.number().max(50).default(20)
	})).handler(async ({ input, context }) => {
		const offset = (input.page - 1) * input.limit;
		const userId = context.session.user.id;
		const otherParticipant = alias(user, "other_participant");
		const lastMessage = alias(messages, "last_message");
		const lastSender = alias(user, "last_sender");
		const userConversations = await db.select({
			conversation: {
				id: conversations.id,
				title: conversations.title,
				type: conversations.type,
				createdAt: conversations.createdAt,
				lastMessageAt: conversations.lastMessageAt
			},
			otherParticipant: {
				id: otherParticipant.id,
				name: otherParticipant.name,
				email: otherParticipant.email,
				image: otherParticipant.image
			},
			lastMessage: {
				id: lastMessage.id,
				content: lastMessage.content,
				messageType: lastMessage.messageType,
				imageUrl: lastMessage.imageUrl,
				createdAt: lastMessage.createdAt,
				senderId: lastMessage.senderId,
				senderName: lastSender.name
			},
			unreadCount: sql`
            COALESCE((
              SELECT COUNT(*)
              FROM ${messages} m
              LEFT JOIN ${messageReads} mr ON m.id = mr.message_id AND mr.user_id = ${userId}
              WHERE m.conversation_id = ${conversations.id} 
                AND m.sender_id != ${userId}
                AND mr.id IS NULL
                AND m.is_deleted = false
            ), 0)
          `
		}).from(conversationParticipants).innerJoin(conversations, eq(conversationParticipants.conversationId, conversations.id)).leftJoin(otherParticipant, and(eq(otherParticipant.id, sql`(
                SELECT cp2.user_id 
                FROM ${conversationParticipants} cp2 
                WHERE cp2.conversation_id = ${conversations.id} 
                  AND cp2.user_id != ${userId} 
                LIMIT 1
              )`))).leftJoin(lastMessage, eq(lastMessage.id, sql`(
              SELECT m.id 
              FROM ${messages} m 
              WHERE m.conversation_id = ${conversations.id} 
                AND m.is_deleted = false
              ORDER BY m.created_at DESC 
              LIMIT 1
            )`)).leftJoin(lastSender, eq(lastMessage.senderId, lastSender.id)).where(eq(conversationParticipants.userId, userId)).orderBy(desc(conversations.lastMessageAt)).limit(input.limit).offset(offset);
		const [totalCount] = await db.select({ count: count() }).from(conversationParticipants).where(eq(conversationParticipants.userId, userId));
		return {
			conversations: userConversations,
			pagination: {
				page: input.page,
				limit: input.limit,
				total: totalCount.count,
				totalPages: Math.ceil(totalCount.count / input.limit)
			}
		};
	}),
	createOrGetConversation: protectedProcedure.input(z.object({
		participantId: z.string(),
		title: z.string().optional()
	})).handler(async ({ input, context }) => {
		const userId = context.session.user.id;
		if (userId === input.participantId) throw new Error("Cannot create conversation with yourself");
		const existingConversation = await db.select({ conversationId: conversationParticipants.conversationId }).from(conversationParticipants).where(sql`${conversationParticipants.conversationId} IN (
            SELECT cp1.conversation_id 
            FROM ${conversationParticipants} cp1
            INNER JOIN ${conversationParticipants} cp2 ON cp1.conversation_id = cp2.conversation_id
            WHERE cp1.user_id = ${userId} AND cp2.user_id = ${input.participantId}
              AND cp1.conversation_id IN (
                SELECT conversation_id 
                FROM ${conversationParticipants} 
                GROUP BY conversation_id 
                HAVING COUNT(*) = 2
              )
          )`).limit(1);
		if (existingConversation.length > 0) return { conversationId: existingConversation[0].conversationId };
		const [newConversation] = await db.insert(conversations).values({
			title: input.title,
			type: "direct"
		}).returning();
		await db.insert(conversationParticipants).values([{
			conversationId: newConversation.id,
			userId
		}, {
			conversationId: newConversation.id,
			userId: input.participantId
		}]);
		return { conversationId: newConversation.id };
	}),
	getMessages: protectedProcedure.input(z.object({
		conversationId: z.string(),
		page: z.number().default(1),
		limit: z.number().max(100).default(50)
	})).handler(async ({ input, context }) => {
		const userId = context.session.user.id;
		const offset = (input.page - 1) * input.limit;
		const participation = await db.select().from(conversationParticipants).where(and(eq(conversationParticipants.conversationId, input.conversationId), eq(conversationParticipants.userId, userId))).limit(1);
		if (participation.length === 0) throw new Error("Access denied to this conversation");
		const sender = alias(user, "sender");
		const conversationMessages = await db.select({
			id: messages.id,
			content: messages.content,
			messageType: messages.messageType,
			imageUrl: messages.imageUrl,
			createdAt: messages.createdAt,
			isEdited: messages.isEdited,
			sender: {
				id: sender.id,
				name: sender.name,
				email: sender.email,
				image: sender.image
			},
			isOwn: sql`${messages.senderId} = ${userId}`
		}).from(messages).innerJoin(sender, eq(messages.senderId, sender.id)).where(and(eq(messages.conversationId, input.conversationId), eq(messages.isDeleted, false))).orderBy(desc(messages.createdAt)).limit(input.limit).offset(offset);
		const unreadMessageIds = conversationMessages.filter((msg) => !msg.isOwn).map((msg) => msg.id);
		if (unreadMessageIds.length > 0) await db.insert(messageReads).values(unreadMessageIds.map((messageId) => ({
			messageId,
			userId
		}))).onConflictDoNothing();
		const [totalCount] = await db.select({ count: count() }).from(messages).where(and(eq(messages.conversationId, input.conversationId), eq(messages.isDeleted, false)));
		return {
			messages: conversationMessages.reverse(),
			pagination: {
				page: input.page,
				limit: input.limit,
				total: totalCount.count,
				totalPages: Math.ceil(totalCount.count / input.limit)
			}
		};
	}),
	sendMessage: protectedProcedure.input(z.object({
		conversationId: z.string(),
		content: z.string().optional(),
		messageType: z.enum(["text", "image"]).default("text"),
		imageUrl: z.string().optional()
	})).handler(async ({ input, context }) => {
		const userId = context.session.user.id;
		if (input.messageType === "text" && !input.content?.trim()) throw new Error("Text message cannot be empty");
		if (input.messageType === "image" && !input.imageUrl) throw new Error("Image URL is required for image messages");
		const participation = await db.select().from(conversationParticipants).where(and(eq(conversationParticipants.conversationId, input.conversationId), eq(conversationParticipants.userId, userId))).limit(1);
		if (participation.length === 0) throw new Error("Access denied to this conversation");
		const [newMessage] = await db.insert(messages).values({
			conversationId: input.conversationId,
			senderId: userId,
			content: input.content,
			messageType: input.messageType,
			imageUrl: input.imageUrl
		}).returning();
		await db.update(conversations).set({
			lastMessageAt: new Date(),
			updatedAt: new Date()
		}).where(eq(conversations.id, input.conversationId));
		const [senderInfo] = await db.select({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image
		}).from(user).where(eq(user.id, userId)).limit(1);
		const messageEvent = {
			type: "MESSAGE_NEW",
			data: {
				conversationId: input.conversationId,
				message: {
					id: newMessage.id,
					content: newMessage.content,
					messageType: newMessage.messageType,
					imageUrl: newMessage.imageUrl,
					createdAt: newMessage.createdAt,
					isEdited: newMessage.isEdited,
					sender: senderInfo,
					isOwn: false
				}
			},
			timestamp: new Date()
		};
		wsManager.broadcastToConversation(input.conversationId, messageEvent, userId);
		const conversationEvent = {
			type: "CONVERSATION_UPDATED",
			data: {
				conversationId: input.conversationId,
				lastMessageAt: new Date(),
				lastMessage: {
					id: newMessage.id,
					content: newMessage.content,
					messageType: newMessage.messageType,
					imageUrl: newMessage.imageUrl,
					createdAt: newMessage.createdAt,
					senderId: userId,
					senderName: senderInfo.name
				}
			},
			timestamp: new Date()
		};
		wsManager.broadcastToConversation(input.conversationId, conversationEvent);
		return newMessage;
	}),
	getParticipants: protectedProcedure.input(z.object({ conversationId: z.string() })).handler(async ({ input, context }) => {
		const userId = context.session.user.id;
		const participation = await db.select().from(conversationParticipants).where(and(eq(conversationParticipants.conversationId, input.conversationId), eq(conversationParticipants.userId, userId))).limit(1);
		if (participation.length === 0) throw new Error("Access denied to this conversation");
		const participant = alias(user, "participant");
		const participants = await db.select({
			id: participant.id,
			name: participant.name,
			email: participant.email,
			image: participant.image,
			role: participant.role,
			joinedAt: conversationParticipants.joinedAt,
			isAdmin: conversationParticipants.isAdmin
		}).from(conversationParticipants).innerJoin(participant, eq(conversationParticipants.userId, participant.id)).where(eq(conversationParticipants.conversationId, input.conversationId)).orderBy(conversationParticipants.joinedAt);
		return participants;
	}),
	searchUsers: protectedProcedure.input(z.object({
		query: z.string().min(1),
		limit: z.number().max(20).default(10)
	})).handler(async ({ input, context }) => {
		const userId = context.session.user.id;
		const users = await db.select({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			role: user.role
		}).from(user).where(and(sql`${user.name} ILIKE ${`%${input.query}%`} OR ${user.email} ILIKE ${`%${input.query}%`}`, sql`${user.id} != ${userId}`)).limit(input.limit);
		return users;
	})
};

//#endregion
//#region src/routers/index.ts
const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user
		};
	}),
	shop: shopRouter,
	admin: adminRouter,
	chat: chatRouter
};

//#endregion
//#region src/index.ts
const { upgradeWebSocket, websocket } = createBunWebSocket();
const app = new Hono();
app.use(logger());
app.use("/*", cors({
	origin: process.env.CORS_ORIGIN || "",
	allowMethods: [
		"GET",
		"POST",
		"OPTIONS"
	],
	allowHeaders: ["Content-Type", "Authorization"],
	credentials: true
}));
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));
const handler = new RPCHandler(appRouter);
app.use("/rpc/*", async (c, next) => {
	const context = await createContext({ context: c });
	const { matched, response } = await handler.handle(c.req.raw, {
		prefix: "/rpc",
		context
	});
	if (matched) return c.newResponse(response.body, response);
	await next();
});
app.get("/ws", async (c, next) => {
	const context = await createContext({ context: c });
	if (!context.session?.user) return c.text("Unauthorized", 401);
	await next();
}, upgradeWebSocket((c) => {
	return {
		async onOpen(event, ws) {
			try {
				const context = await createContext({ context: c });
				if (!context.session?.user) {
					console.log("WebSocket connection rejected: No valid session");
					ws.close(1008, "Unauthorized");
					return;
				}
				const userId = context.session.user.id;
				const connectionId = crypto.randomUUID();
				const connection = {
					ws,
					userId,
					connectionId,
					isAlive: true,
					conversationIds: new Set()
				};
				wsManager.addConnection(connection);
				ws.send(JSON.stringify({
					type: "CONNECTION_ESTABLISHED",
					data: {
						connectionId,
						userId
					},
					timestamp: new Date()
				}));
			} catch (error) {
				console.error("WebSocket authentication error:", error);
				ws.close(1011, "Internal Server Error");
			}
		},
		async onMessage(event, ws) {
			try {
				const data = JSON.parse(event.data.toString());
				if (data.type === "HEARTBEAT_RESPONSE") {
					console.log("Heartbeat response received");
					return;
				}
				if (data.type === "MESSAGE_TYPING") console.log("Typing event received:", data);
			} catch (error) {
				console.error("WebSocket message error:", error);
			}
		},
		onClose() {
			console.log("WebSocket connection closed");
		},
		onError(event, ws) {
			console.error("WebSocket error:", event);
		}
	};
}));
app.get("/", (c) => {
	return c.text("OK");
});
var src_default = {
	fetch: app.fetch,
	websocket
};

//#endregion
export { src_default as default };