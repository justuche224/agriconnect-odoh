"use client";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { redirect, useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import CustomerDashboard from "./customer-dashboard";
import FarmerDashboard from "./farmer-dashboard";
import type { Product } from "@/types";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }
  if (!session || !session.user) {
    router.push("/login");
    return null;
  }

  if (session.user.role === "admin") {
    return redirect("/admin");
  }

  return (
    <DashboardContent userId={session.user.id} userRole={session.user.role} />
  );
}

const DashboardContent = ({
  userId,
  userRole,
}: {
  userId: string;
  userRole: string;
}) => {
  const { data: userOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const response = await orpc.shop.getOrders.call({
        page: 1,
        limit: 50,
      });
      return response;
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await orpc.shop.getProducts.call({
        page: 1,
        limit: 6,
      });
      return response.items;
    },
  });

  const { data: farmerProducts = [], isLoading: farmerProductsLoading } =
    useQuery({
      queryKey: ["farmer-products", userId],
      queryFn: async () => {
        const response = await orpc.shop.getProducts.call({
          page: 1,
          limit: 50,
          sellerId: userId,
        });
        return response.items;
      },
      enabled: userRole?.toLowerCase() === "farmer",
    });

  if (
    ordersLoading ||
    productsLoading ||
    (userRole?.toLowerCase() === "farmer" && farmerProductsLoading)
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (userRole?.toLowerCase() === "farmer") {
    return (
      <FarmerDashboard
        products={farmerProducts}
        orders={userOrders}
        userId={userId}
      />
    );
  }

  const recommendedProducts: Product[] = products.slice(0, 4);
  return (
    <CustomerDashboard
      orders={userOrders}
      recommendedProducts={recommendedProducts}
    />
  );
};
