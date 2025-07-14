import { orpc } from "@/utils/orpc";

export type Order = Awaited<
  ReturnType<typeof orpc.shop.getOrders.call>
>[number];

export type OrderWithItems = Awaited<
  ReturnType<typeof orpc.shop.getOrder.call>
>;

export type Product = Awaited<
  ReturnType<typeof orpc.shop.getProducts.call>
>["items"][number];

export type Category = Awaited<
  ReturnType<typeof orpc.shop.getCategories.call>
>[number];

export type FarmerProfile = Awaited<
  ReturnType<typeof orpc.shop.getFarmerProfile.call>
>;

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role?: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
