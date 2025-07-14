import {
  Activity,
  Cloud,
  DollarSign,
  ShoppingCart,
  Sun,
  Users,
  Package,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OverviewChart from "./overview-chart";
import Link from "next/link";
import type { Product, Order } from "@/types";
import formatPrice from "@/lib/format-price";

export const metadata = {
  title: "Farmer Dashboard",
};

interface FarmerDashboardProps {
  products: Product[];
  orders: Order[];
  userId: string;
}

const FarmerDashboard = ({
  products,
  orders,
  userId,
}: FarmerDashboardProps) => {
  // Calculate metrics
  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseFloat(order.total),
    0
  );
  const activeListings = products.filter((p) => p.inStock).length;
  const totalSales = orders.length;
  const totalProducts = products.length;

  // Calculate revenue change (mock data for now)
  const revenueChange = "+20.1%";
  const salesChange = totalSales > 0 ? `+${totalSales}` : "+0%";

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Farmer Dashboard
          </h2>
          <div className="flex items-center space-x-2">
            <Link href="/dashboard/sell?page=add">
              <Button>Add New Product</Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {revenueChange} from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {activeListings} currently in stock
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="text-xs text-muted-foreground">
                {salesChange} from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Listings
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeListings}</div>
              <p className="text-xs text-muted-foreground">
                Out of {totalProducts} total products
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <OverviewChart />
            </CardContent>
          </Card>
          <Card className="col-span-3 flex flex-col">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest customer orders</CardDescription>
            </CardHeader>
            <CardContent className="grow">
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center space-x-4">
                      <Package className="h-6 w-6 text-gray-400" />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(parseFloat(order.total))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-full text-center rounded-lg border-2 border-gray-300 border-dashed">
                  <div>
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p>No orders yet</p>
                    <p className="text-sm text-muted-foreground">
                      Orders will appear here
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Weather Forecast</CardTitle>
              <CardDescription>
                5-day weather forecast for your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Sun className="h-10 w-10 text-yellow-500" />
                <div className="space-y-1">
                  <p className="text-xl font-medium">Sunny</p>
                  <p className="text-sm text-muted-foreground">
                    High: 28°C | Low: 18°C
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <Cloud className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-sm">Tomorrow: Partly Cloudy, 25°C</span>
                </div>
                <div className="flex items-center">
                  <Cloud className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-sm">Day 3: Cloudy, 23°C</span>
                </div>
                <div className="flex items-center">
                  <Sun className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm">Day 4: Sunny, 27°C</span>
                </div>
                <div className="flex items-center">
                  <Sun className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm">Day 5: Sunny, 29°C</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Your latest listed products</CardDescription>
            </CardHeader>
            <CardContent>
              {products && products.length > 0 ? (
                <div className="space-y-4">
                  {products.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-4"
                    >
                      <img
                        src={
                          product.images?.[0]?.url || "/images/placeholder.svg"
                        }
                        className="rounded-md"
                        width={50}
                        height={50}
                        alt={product.name}
                      />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(parseFloat(product.price))}/
                          {product.unit}
                        </p>
                      </div>
                      <Badge
                        variant={product.inStock ? "default" : "secondary"}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-full text-center rounded-lg border-2 border-gray-300 border-dashed">
                  <div>
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p>No products listed yet</p>
                    <Link href="/dashboard/sell?page=add">
                      <Button className="mt-2" size="sm">
                        Add Your First Product
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default FarmerDashboard;
