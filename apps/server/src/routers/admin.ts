import { eq, desc, asc, sql, count, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";
import { db } from "../db";
import { protectedProcedure } from "../lib/orpc";
import { user } from "../db/schema/auth";
import { orders, orderItems, products, categories } from "../db/schema/shop";

const requireAdmin = protectedProcedure.use(async ({ context, next }) => {
  if (context.session.user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const adminRouter = {
  getStats: requireAdmin.handler(async () => {
    const [userStats, orderStats, productStats] = await Promise.all([
      db
        .select({
          total: count(),
          farmers: sql<number>`count(*) filter (where role = 'farmer')`,
          customers: sql<number>`count(*) filter (where role = 'customer')`,
          admins: sql<number>`count(*) filter (where role = 'admin')`,
        })
        .from(user),
      db
        .select({
          total: count(),
          pending: sql<number>`count(*) filter (where status = 'pending')`,
          processing: sql<number>`count(*) filter (where status = 'processing')`,
          shipped: sql<number>`count(*) filter (where status = 'shipped')`,
          delivered: sql<number>`count(*) filter (where status = 'delivered')`,
          cancelled: sql<number>`count(*) filter (where status = 'cancelled')`,
          totalRevenue: sql<number>`sum(cast(total as decimal))`,
        })
        .from(orders),
      db
        .select({
          total: count(),
          inStock: sql<number>`count(*) filter (where in_stock = true)`,
          outOfStock: sql<number>`count(*) filter (where in_stock = false)`,
        })
        .from(products),
    ]);

    return {
      users: userStats[0],
      orders: orderStats[0],
      products: productStats[0],
    };
  }),

  getUsers: requireAdmin
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().max(100).default(20),
        search: z.string().optional(),
        role: z.enum(["admin", "farmer", "customer"]).optional(),
        sortBy: z
          .enum(["name", "email", "role", "createdAt"])
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .handler(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      let query = db.select().from(user).$dynamic();

      if (input.search) {
        query = query.where(
          sql`${user.name} ILIKE ${`%${input.search}%`} OR ${
            user.email
          } ILIKE ${`%${input.search}%`}`
        );
      }

      if (input.role) {
        query = query.where(eq(user.role, input.role));
      }

      switch (input.sortBy) {
        case "name":
          query = query.orderBy(
            input.sortOrder === "asc" ? asc(user.name) : desc(user.name)
          );
          break;
        case "email":
          query = query.orderBy(
            input.sortOrder === "asc" ? asc(user.email) : desc(user.email)
          );
          break;
        case "role":
          query = query.orderBy(
            input.sortOrder === "asc" ? asc(user.role) : desc(user.role)
          );
          break;
        default:
          query = query.orderBy(
            input.sortOrder === "asc"
              ? asc(user.createdAt)
              : desc(user.createdAt)
          );
      }

      const users = await query.limit(input.limit).offset(offset);

      const [totalCount] = await db.select({ count: count() }).from(user);

      return {
        users,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalCount.count,
          totalPages: Math.ceil(totalCount.count / input.limit),
        },
      };
    }),

  updateUserRole: requireAdmin
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["admin", "farmer", "customer"]),
      })
    )
    .handler(async ({ input }) => {
      const [updatedUser] = await db
        .update(user)
        .set({
          role: input.role,
          updatedAt: new Date(),
        })
        .where(eq(user.id, input.userId))
        .returning();

      return updatedUser;
    }),

  deleteUser: requireAdmin
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      if (input.userId === context.session.user.id) {
        throw new Error("Cannot delete your own account");
      }

      await db.delete(user).where(eq(user.id, input.userId));
      return { success: true };
    }),

  getAllOrders: requireAdmin
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().max(100).default(20),
        search: z.string().optional(),
        status: z
          .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
          .optional(),
        paymentStatus: z
          .enum(["pending", "paid", "failed", "refunded"])
          .optional(),
        sortBy: z.enum(["createdAt", "total", "status"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .handler(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      const customer = alias(user, "customer");
      let query = db
        .select({
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
            email: customer.email,
          },
        })
        .from(orders)
        .leftJoin(customer, eq(orders.customerId, customer.id))
        .$dynamic();

      if (input.search) {
        query = query.where(
          sql`${customer.name} ILIKE ${`%${input.search}%`} OR ${
            customer.email
          } ILIKE ${`%${input.search}%`} OR ${
            orders.id
          } ILIKE ${`%${input.search}%`}`
        );
      }

      if (input.status) {
        query = query.where(eq(orders.status, input.status));
      }

      if (input.paymentStatus) {
        query = query.where(eq(orders.paymentStatus, input.paymentStatus));
      }

      switch (input.sortBy) {
        case "total":
          query = query.orderBy(
            input.sortOrder === "asc" ? asc(orders.total) : desc(orders.total)
          );
          break;
        case "status":
          query = query.orderBy(
            input.sortOrder === "asc" ? asc(orders.status) : desc(orders.status)
          );
          break;
        default:
          query = query.orderBy(
            input.sortOrder === "asc"
              ? asc(orders.createdAt)
              : desc(orders.createdAt)
          );
      }

      const ordersData = await query.limit(input.limit).offset(offset);

      const [totalCount] = await db.select({ count: count() }).from(orders);

      return {
        orders: ordersData,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: totalCount.count,
          totalPages: Math.ceil(totalCount.count / input.limit),
        },
      };
    }),

  getOrderDetails: requireAdmin
    .input(z.object({ orderId: z.string() }))
    .handler(async ({ input }) => {
      const customer = alias(user, "customer_details");
      const [order] = await db
        .select({
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
            email: customer.email,
          },
        })
        .from(orders)
        .leftJoin(customer, eq(orders.customerId, customer.id))
        .where(eq(orders.id, input.orderId));

      if (!order) {
        throw new Error("Order not found");
      }

      const seller = alias(user, "seller");
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
          seller: {
            id: seller.id,
            name: seller.name,
            email: seller.email,
          },
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(seller, eq(orderItems.sellerId, seller.id))
        .where(eq(orderItems.orderId, input.orderId));

      return {
        ...order,
        items,
      };
    }),

  updateOrderStatus: requireAdmin
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum([
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ]),
      })
    )
    .handler(async ({ input }) => {
      const [updatedOrder] = await db
        .update(orders)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.orderId))
        .returning();

      return updatedOrder;
    }),

  updatePaymentStatus: requireAdmin
    .input(
      z.object({
        orderId: z.string(),
        paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
      })
    )
    .handler(async ({ input }) => {
      const [updatedOrder] = await db
        .update(orders)
        .set({
          paymentStatus: input.paymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.orderId))
        .returning();

      return updatedOrder;
    }),
};
