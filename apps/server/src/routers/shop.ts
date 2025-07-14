import { eq, and, desc, asc, ilike, inArray, sql } from "drizzle-orm";
import z from "zod";
import { db } from "../db";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
import {
  products,
  categories,
  productImages,
  productVariants,
  reviews,
  cartItems,
  wishlistItems,
  orders,
  orderItems,
  farmerProfiles,
} from "../db/schema/shop";

const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.string().transform((val) => parseFloat(val)),
  originalPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  quantity: z.number().int().min(0),
  unit: z.string().min(1),
  categoryId: z.string(),
  brand: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  badge: z.string().optional(),
  images: z.array(z.string()),
  variants: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        available: z.boolean().default(true),
      })
    )
    .optional(),
});

const updateProductSchema = createProductSchema.partial().extend({
  id: z.string(),
});

const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(5),
});

const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
  variant: z.string().optional(),
});

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
      variant: z.string().optional(),
    })
  ),
  shippingAddress: z.string(),
  billingAddress: z.string().optional(),
  paymentMethod: z.string(),
  notes: z.string().optional(),
});

const farmerProfileSchema = z.object({
  farmName: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  certifications: z.string().optional(),
  avatar: z.string().optional(),
  banner: z.string().optional(),
});

export const shopRouter = {
  // Categories
  getCategories: publicProcedure.handler(async () => {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }),

  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        description: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const categoryId = crypto.randomUUID();
      const now = new Date();

      const [category] = await db
        .insert(categories)
        .values({
          id: categoryId,
          name: input.name,
          description: input.description,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return category;
    }),

  // Products
  getProducts: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().max(50).default(12),
        search: z.string().optional(),
        categoryId: z.string().optional(),
        sellerId: z.string().optional(),
        sortBy: z
          .enum(["featured", "newest", "price-low", "price-high", "rating"])
          .default("featured"),
        inStock: z.boolean().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
      })
    )
    .handler(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      // Build dynamic query
      let query = db
        .select({
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
            name: categories.name,
          },
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .$dynamic();

      // Apply conditions
      if (input.search) {
        query = query.where(ilike(products.name, `%${input.search}%`));
      }
      if (input.categoryId) {
        query = query.where(eq(products.categoryId, input.categoryId));
      }
      if (input.sellerId) {
        query = query.where(eq(products.sellerId, input.sellerId));
      }
      if (input.inStock !== undefined) {
        query = query.where(eq(products.inStock, input.inStock));
      }
      if (input.minPrice !== undefined) {
        query = query.where(sql`${products.price} >= ${input.minPrice}`);
      }
      if (input.maxPrice !== undefined) {
        query = query.where(sql`${products.price} <= ${input.maxPrice}`);
      }

      // Apply sorting
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
        default:
          query = query.orderBy(desc(products.createdAt));
      }

      const items = await query.limit(input.limit).offset(offset);

      // Get images for each product
      const productIds = items.map((item) => item.id);
      const images = await db
        .select()
        .from(productImages)
        .where(inArray(productImages.productId, productIds));

      const itemsWithImages = items.map((item) => ({
        ...item,
        images: images.filter((img) => img.productId === item.id),
      }));

      return {
        items: itemsWithImages,
        pagination: {
          page: input.page,
          limit: input.limit,
          hasMore: items.length === input.limit,
        },
      };
    }),

  getProduct: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const [product] = await db
        .select({
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
            name: categories.name,
          },
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.id, input.id));

      if (!product) {
        throw new Error("Product not found");
      }

      const [productImagesData, productVariantsData] = await Promise.all([
        db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, input.id)),
        db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, input.id)),
      ]);

      return {
        ...product,
        images: productImagesData,
        variants: productVariantsData,
      };
    }),

  createProduct: protectedProcedure
    .input(createProductSchema)
    .handler(async ({ input, context }) => {
      const productId = crypto.randomUUID();
      const now = new Date();

      const [product] = await db
        .insert(products)
        .values({
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
          updatedAt: now,
        })
        .returning();

      // Insert images
      if (input.images.length > 0) {
        await db.insert(productImages).values(
          input.images.map((url, index) => ({
            id: crypto.randomUUID(),
            productId,
            url,
            isPrimary: index === 0,
            createdAt: now,
          }))
        );
      }

      // Insert variants if provided
      if (input.variants && input.variants.length > 0) {
        await db.insert(productVariants).values(
          input.variants.map((variant) => ({
            id: crypto.randomUUID(),
            productId,
            name: variant.name,
            value: variant.value,
            available: variant.available,
            createdAt: now,
          }))
        );
      }

      return product;
    }),

  updateProduct: protectedProcedure
    .input(updateProductSchema)
    .handler(async ({ input, context }) => {
      const { id, images, variants, ...updateData } = input;
      const now = new Date();

      // Verify product belongs to user
      const [existingProduct] = await db
        .select({ sellerId: products.sellerId })
        .from(products)
        .where(eq(products.id, id));

      if (
        !existingProduct ||
        existingProduct.sellerId !== context.session.user.id
      ) {
        throw new Error("Product not found or unauthorized");
      }

      const [updatedProduct] = await db
        .update(products)
        .set({
          ...updateData,
          price: updateData.price?.toString(),
          originalPrice: updateData.originalPrice?.toString(),
          updatedAt: now,
        })
        .where(eq(products.id, id))
        .returning();

      return updatedProduct;
    }),

  deleteProduct: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      // Verify product belongs to user
      const [existingProduct] = await db
        .select({ sellerId: products.sellerId })
        .from(products)
        .where(eq(products.id, input.id));

      if (
        !existingProduct ||
        existingProduct.sellerId !== context.session.user.id
      ) {
        throw new Error("Product not found or unauthorized");
      }

      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  // Reviews
  getProductReviews: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        page: z.number().default(1),
        limit: z.number().max(20).default(10),
      })
    )
    .handler(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      const reviewsData = await db
        .select({
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
            image: sql`"user"."image"`,
          },
        })
        .from(reviews)
        .leftJoin(sql`"user"`, eq(reviews.userId, sql`"user"."id"`))
        .where(eq(reviews.productId, input.productId))
        .orderBy(desc(reviews.createdAt))
        .limit(input.limit)
        .offset(offset);

      return reviewsData;
    }),

  createReview: protectedProcedure
    .input(createReviewSchema)
    .handler(async ({ input, context }) => {
      const reviewId = crypto.randomUUID();
      const now = new Date();

      const [review] = await db
        .insert(reviews)
        .values({
          id: reviewId,
          productId: input.productId,
          userId: context.session.user.id,
          rating: input.rating,
          title: input.title,
          content: input.content,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      // Update product rating
      const avgRating = await db
        .select({
          avg: sql<number>`AVG(${reviews.rating})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(reviews)
        .where(eq(reviews.productId, input.productId));

      if (avgRating[0]) {
        await db
          .update(products)
          .set({
            rating: avgRating[0].avg.toString(),
            reviewCount: Number(avgRating[0].count),
          })
          .where(eq(products.id, input.productId));
      }

      return review;
    }),

  // Cart
  getCart: protectedProcedure.handler(async ({ context }) => {
    const items = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        variant: cartItems.variant,
        createdAt: cartItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          inStock: products.inStock,
          quantity: products.quantity,
        },
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, context.session.user.id));

    return items;
  }),

  addToCart: protectedProcedure
    .input(cartItemSchema)
    .handler(async ({ input, context }) => {
      const cartItemId = crypto.randomUUID();
      const now = new Date();

      // Check if item already exists in cart
      const [existingItem] = await db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.userId, context.session.user.id),
            eq(cartItems.productId, input.productId),
            input.variant
              ? eq(cartItems.variant, input.variant)
              : sql`${cartItems.variant} IS NULL`
          )
        );

      if (existingItem) {
        // Update quantity
        const [updatedItem] = await db
          .update(cartItems)
          .set({
            quantity: existingItem.quantity + input.quantity,
            updatedAt: now,
          })
          .where(eq(cartItems.id, existingItem.id))
          .returning();

        return updatedItem;
      } else {
        // Create new cart item
        const [newItem] = await db
          .insert(cartItems)
          .values({
            id: cartItemId,
            userId: context.session.user.id,
            productId: input.productId,
            quantity: input.quantity,
            variant: input.variant,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        return newItem;
      }
    }),

  updateCartItem: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .handler(async ({ input, context }) => {
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          quantity: input.quantity,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(cartItems.id, input.id),
            eq(cartItems.userId, context.session.user.id)
          )
        )
        .returning();

      return updatedItem;
    }),

  removeFromCart: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      await db
        .delete(cartItems)
        .where(
          and(
            eq(cartItems.id, input.id),
            eq(cartItems.userId, context.session.user.id)
          )
        );

      return { success: true };
    }),

  clearCart: protectedProcedure.handler(async ({ context }) => {
    await db
      .delete(cartItems)
      .where(eq(cartItems.userId, context.session.user.id));

    return { success: true };
  }),

  // Wishlist
  getWishlist: protectedProcedure.handler(async ({ context }) => {
    const items = await db
      .select({
        id: wishlistItems.id,
        createdAt: wishlistItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          originalPrice: products.originalPrice,
          rating: products.rating,
          inStock: products.inStock,
        },
      })
      .from(wishlistItems)
      .leftJoin(products, eq(wishlistItems.productId, products.id))
      .where(eq(wishlistItems.userId, context.session.user.id))
      .orderBy(desc(wishlistItems.createdAt));

    return items;
  }),

  addToWishlist: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .handler(async ({ input, context }) => {
      const wishlistItemId = crypto.randomUUID();
      const now = new Date();

      // Check if already in wishlist
      const [existing] = await db
        .select()
        .from(wishlistItems)
        .where(
          and(
            eq(wishlistItems.userId, context.session.user.id),
            eq(wishlistItems.productId, input.productId)
          )
        );

      if (existing) {
        throw new Error("Product already in wishlist");
      }

      const [item] = await db
        .insert(wishlistItems)
        .values({
          id: wishlistItemId,
          userId: context.session.user.id,
          productId: input.productId,
          createdAt: now,
        })
        .returning();

      return item;
    }),

  removeFromWishlist: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .handler(async ({ input, context }) => {
      await db
        .delete(wishlistItems)
        .where(
          and(
            eq(wishlistItems.userId, context.session.user.id),
            eq(wishlistItems.productId, input.productId)
          )
        );

      return { success: true };
    }),

  // Orders
  createOrder: protectedProcedure
    .input(createOrderSchema)
    .handler(async ({ input, context }) => {
      const orderId = crypto.randomUUID();
      const now = new Date();

      // Get product details for order items
      const productIds = input.items.map((item) => item.productId);
      const productsData = await db
        .select()
        .from(products)
        .where(inArray(products.id, productIds));

      let subtotal = 0;
      const orderItemsData = input.items.map((item) => {
        const product = productsData.find((p) => p.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const price = parseFloat(product.price);
        const total = price * item.quantity;
        subtotal += total;

        return {
          id: crypto.randomUUID(),
          orderId,
          productId: item.productId,
          sellerId: product.sellerId,
          quantity: item.quantity,
          price: price.toString(),
          total: total.toString(),
          variant: item.variant,
          createdAt: now,
        };
      });

      const tax = subtotal * 0.1; // 10% tax
      const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
      const total = subtotal + tax + shipping;

      // Create order
      const [order] = await db
        .insert(orders)
        .values({
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
          updatedAt: now,
        })
        .returning();

      // Create order items
      await db.insert(orderItems).values(orderItemsData);

      // Clear cart items for ordered products
      await db
        .delete(cartItems)
        .where(
          and(
            eq(cartItems.userId, context.session.user.id),
            inArray(cartItems.productId, productIds)
          )
        );

      return order;
    }),

  getOrders: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().max(50).default(10),
      })
    )
    .handler(async ({ input, context }) => {
      const offset = (input.page - 1) * input.limit;

      const ordersData = await db
        .select()
        .from(orders)
        .where(eq(orders.customerId, context.session.user.id))
        .orderBy(desc(orders.createdAt))
        .limit(input.limit)
        .offset(offset);

      return ordersData;
    }),

  getOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const [order] = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.id, input.id),
            eq(orders.customerId, context.session.user.id)
          )
        );

      if (!order) {
        throw new Error("Order not found");
      }

      const items = await db
        .select({
          id: orderItems.id,
          quantity: orderItems.quantity,
          price: orderItems.price,
          total: orderItems.total,
          variant: orderItems.variant,
          product: {
            id: products.id,
            name: products.name,
          },
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, input.id));

      return {
        ...order,
        items,
      };
    }),

  // Farmer Profile
  getFarmerProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input }) => {
      const [profile] = await db
        .select()
        .from(farmerProfiles)
        .where(eq(farmerProfiles.userId, input.userId));

      return profile;
    }),

  updateFarmerProfile: protectedProcedure
    .input(farmerProfileSchema)
    .handler(async ({ input, context }) => {
      const now = new Date();

      // Check if profile exists
      const [existingProfile] = await db
        .select()
        .from(farmerProfiles)
        .where(eq(farmerProfiles.userId, context.session.user.id));

      if (existingProfile) {
        const [updatedProfile] = await db
          .update(farmerProfiles)
          .set({
            ...input,
            updatedAt: now,
          })
          .where(eq(farmerProfiles.userId, context.session.user.id))
          .returning();

        return updatedProfile;
      } else {
        const profileId = crypto.randomUUID();
        const [newProfile] = await db
          .insert(farmerProfiles)
          .values({
            id: profileId,
            userId: context.session.user.id,
            ...input,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        return newProfile;
      }
    }),
};
