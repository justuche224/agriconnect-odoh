"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Globe,
  BadgeCheck,
  User,
  Loader,
  Package,
  Star,
  Heart,
  ShoppingCart,
  Calendar,
  Mail,
  Award,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { orpc } from "@/utils/orpc";
import formatPrice from "@/lib/format-price";

const hasUserName = (user: any): user is { name: string } => {
  return user && typeof user === "object" && "name" in user;
};

const hasUserEmail = (user: any): user is { email: string } => {
  return user && typeof user === "object" && "email" in user;
};

const hasUserImage = (user: any): user is { image: string } => {
  return user && typeof user === "object" && "image" in user;
};

export default function FarmerProfilePage() {
  const params = useParams();
  const farmerId = params.id as string;

  const [productsPage, setProductsPage] = useState(1);
  const [productsSortBy, setProductsSortBy] = useState<
    "featured" | "newest" | "price-low" | "price-high" | "rating"
  >("featured");

  const {
    data: farmer,
    isLoading: farmerLoading,
    error: farmerError,
  } = useQuery({
    queryKey: ["farmer", farmerId],
    queryFn: async () => {
      return await orpc.shop.getFarmerProfile.call({ userId: farmerId });
    },
    enabled: !!farmerId,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["farmer-products", farmerId, productsPage, productsSortBy],
    queryFn: async () => {
      return await orpc.shop.getProducts.call({
        page: productsPage,
        limit: 12,
        sellerId: farmerId,
        sortBy: productsSortBy,
      });
    },
    enabled: !!farmerId,
  });

  const renderStars = (rating: number) => {
    const numRating = Number(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(numRating)
            ? "fill-yellow-400 text-yellow-400"
            : i < numRating
            ? "fill-yellow-400/50 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (farmerLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (farmerError || !farmer) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Farmer Not Found</h1>
        <p className="text-muted-foreground mb-4">
          Sorry, the farmer profile you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/shop/farmers">Back to Farmers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[url(/images/hero-bg.png),linear-gradient(#000,#000)] bg-cover bg-fixed">
      <div className="container mx-auto px-4 py-8 mt-20 bg-background/50 backdrop-blur-lg rounded-lg">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <span>/</span>
          <Link href="/shop/farmers" className="hover:text-foreground">
            Farmers
          </Link>
          <span>/</span>
          <span className="text-foreground">
            {farmer.farmName ||
              (farmer.user && "name" in farmer.user
                ? farmer.user.name
                : null) ||
              "Farmer"}
          </span>
        </nav>
        {/* Hero Section */}
        <div className="relative mb-8">
          {/* Banner Image */}
          <div className="h-48 md:h-64 bg-gradient-to-br from-green-400 via-emerald-500 to-blue-500 rounded-lg mb-6 relative overflow-hidden">
            {farmer.banner && (
              <Image
                src={farmer.banner}
                alt="Farm banner"
                fill
                className="object-cover"
              />
            )}
            {/* Overlay for better text contrast */}
            <div className="absolute inset-0 bg-black/20 md:bg-black/30"></div>
          </div>
          {/* Profile Info */}
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-20 relative z-10">
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                  <AvatarImage
                    src={
                      farmer.avatar ||
                      (hasUserImage(farmer.user) ? farmer.user.image : "") ||
                      ""
                    }
                    alt={
                      farmer.farmName ||
                      (hasUserName(farmer.user) ? farmer.user.name : "") ||
                      "Farmer"
                    }
                  />
                  <AvatarFallback className="text-2xl">
                    {(
                      farmer.farmName ||
                      (hasUserName(farmer.user) ? farmer.user.name : "") ||
                      "F"
                    )
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {farmer.verified && (
                  <BadgeCheck className="w-8 h-8 text-blue-600 absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-md" />
                )}
              </div>
            </div>
            <div className="flex-1 bg-background/95 backdrop-blur-sm rounded-lg p-6 shadow-lg border">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {farmer.farmName ||
                    (hasUserName(farmer.user) ? farmer.user.name : "") ||
                    "Unknown Farmer"}
                </h1>
                {farmer.verified && (
                  <Badge variant="secondary">
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xl text-muted-foreground mb-4">
                {(hasUserName(farmer.user) ? farmer.user.name : "") || "Farmer"}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {farmer.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{farmer.location}</span>
                  </div>
                )}
                {hasUserEmail(farmer.user) && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{farmer.user.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Member since{" "}
                    {new Date(farmer.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                {farmer.phone && (
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    {farmer.phone}
                  </Button>
                )}
                {farmer.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={farmer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Products</h2>
              <Select
                value={productsSortBy}
                onValueChange={(value: any) => setProductsSortBy(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {productsLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="animate-spin" />
              </div>
            ) : products?.items && products.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.items.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={product.images?.[0]?.url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                        {product.badge && (
                          <Badge
                            variant={
                              product.badge === "Sale"
                                ? "destructive"
                                : "default"
                            }
                            className="absolute top-2 left-2"
                          >
                            {product.badge}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">
                          {product.category?.name}
                        </Badge>
                        {product.inStock ? (
                          <Badge variant="default">In Stock</Badge>
                        ) : (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                      </div>
                      <h3 className="font-medium mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(Number(product.rating))}
                        <span className="text-sm text-muted-foreground">
                          ({product.reviewCount || 0})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold">
                          {formatPrice(Number(product.price))}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(Number(product.originalPrice))}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/shop/product/${product.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  This farmer hasn't listed any products yet.
                </p>
              </div>
            )}
            {/* Load More */}
            {products?.pagination?.hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setProductsPage(productsPage + 1)}
                  disabled={productsLoading}
                >
                  {productsLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  About{" "}
                  {farmer.farmName ||
                    (hasUserName(farmer.user) ? farmer.user.name : "")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {farmer.description ? (
                    <div>
                      <h3 className="font-medium mb-2">Farm Description</h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {farmer.description}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No description available
                      </h3>
                      <p className="text-muted-foreground">
                        The farmer hasn't added a description yet.
                      </p>
                    </div>
                  )}
                  {farmer.certifications && (
                    <div>
                      <h3 className="font-medium mb-2">Certifications</h3>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="text-muted-foreground">
                          {farmer.certifications}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h4 className="font-medium mb-2">Quick Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Products Listed:
                          </span>
                          <span>{products?.items?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Verified:
                          </span>
                          <span>{farmer.verified ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Member Since:
                          </span>
                          <span>
                            {new Date(farmer.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hasUserEmail(farmer.user) && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">
                          {farmer.user.email}
                        </p>
                      </div>
                    </div>
                  )}
                  {farmer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">{farmer.phone}</p>
                      </div>
                    </div>
                  )}
                  {farmer.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">
                          {farmer.location}
                        </p>
                      </div>
                    </div>
                  )}
                  {farmer.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a
                          href={farmer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {farmer.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {!farmer.phone && !farmer.website && (
                    <div className="text-center py-8">
                      <Phone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Limited contact information
                      </h3>
                      <p className="text-muted-foreground">
                        Additional contact details are not available.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
