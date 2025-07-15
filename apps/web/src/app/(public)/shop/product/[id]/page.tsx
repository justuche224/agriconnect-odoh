"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader,
  MapPin,
  Phone,
  Globe,
  BadgeCheck,
  User,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import formatPrice from "@/lib/format-price";
import { useParams } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { data: session } = authClient.useSession();

  const {
    data: product,
    isLoading: productLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await orpc.shop.getProduct.call({ id: productId });
      return response;
    },
    enabled: !!productId,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const response = await orpc.shop.getProductReviews.call({
        productId,
        page: 1,
        limit: 10,
      });
      return response;
    },
    enabled: !!productId,
  });

  const handleAddToCart = () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: quantity,
        image: product.images?.[0]?.url || "/placeholder.svg",
        trackQuantity: true,
        inStock: product.quantity,
        productSlug: product.id,
      };

      addItem(cartItem);
      toast.success(`Added ${product.name} to cart!`);
    } catch (error) {
      toast.error("Failed to add item to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const numRating = Number(rating) || 0;
    const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${starSize} ${
          i < Math.floor(numRating)
            ? "fill-yellow-400 text-yellow-400"
            : i < numRating
            ? "fill-yellow-400/50 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const nextImage = () => {
    if (product?.images) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setSelectedImage(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  };

  if (productLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-4">
          Sorry, the product you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const ratingDistribution = [
    {
      stars: 5,
      count: Math.floor((product.reviewCount || 0) * 0.5),
      percentage: 50,
    },
    {
      stars: 4,
      count: Math.floor((product.reviewCount || 0) * 0.3),
      percentage: 30,
    },
    {
      stars: 3,
      count: Math.floor((product.reviewCount || 0) * 0.15),
      percentage: 15,
    },
    {
      stars: 2,
      count: Math.floor((product.reviewCount || 0) * 0.04),
      percentage: 4,
    },
    {
      stars: 1,
      count: Math.floor((product.reviewCount || 0) * 0.01),
      percentage: 1,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.images?.[selectedImage]?.url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.images && product.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category?.name}</Badge>
              {product.brand && (
                <Badge variant="outline">{product.brand}</Badge>
              )}
              {product.badge && (
                <Badge
                  variant={product.badge === "Sale" ? "destructive" : "default"}
                >
                  {product.badge}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {renderStars(Number(product.rating))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount || 0} reviews)
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">
                {formatPrice(Number(product.price))}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(Number(product.originalPrice))}
                  </span>
                  <Badge variant="destructive">
                    Save{" "}
                    {formatPrice(
                      Number(product.originalPrice) - Number(product.price)
                    )}
                  </Badge>
                </>
              )}
            </div>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Options</h3>
              <Select
                value={selectedVariant}
                onValueChange={setSelectedVariant}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem
                      key={variant.id}
                      value={variant.value}
                      disabled={!variant.available}
                    >
                      {variant.name}: {variant.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuantity(Math.min(product.quantity, quantity + 1))
                  }
                  disabled={quantity >= product.quantity}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.quantity} {product.unit} available
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              disabled={!product.inStock || isAddingToCart}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAddingToCart ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : product.inStock ? (
                "Add to Cart"
              ) : (
                "Out of Stock"
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-green-600" />
              <span>Free shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span>30-day returns</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Quality guaranteed</span>
            </div>
          </div>

          {/* Farmer Information */}
          {product.seller && (
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Sold by</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16">
                        <AvatarImage
                          src={
                            product.farmerProfile?.avatar ||
                            product.seller.image ||
                            ""
                          }
                        />
                        <AvatarFallback>
                          {(product.seller?.name || "")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("") || "F"}
                        </AvatarFallback>
                      </Avatar>
                      {product.farmerProfile?.verified && (
                        <BadgeCheck className="w-5 h-5 text-blue-600 absolute -top-1 -right-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">
                          {product.farmerProfile?.farmName ||
                            product.seller?.name}
                        </h4>
                        {product.farmerProfile?.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      {product.farmerProfile?.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{product.farmerProfile.location}</span>
                        </div>
                      )}
                      {product.farmerProfile?.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.farmerProfile.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/shop/farmers/${product.sellerId}`}>
                            <User className="w-4 h-4 mr-2" />
                            View Profile
                          </Link>
                        </Button>
                        {session?.user &&
                          session.user.id !== product.sellerId && (
                            <Button asChild size="sm" variant="default">
                              <Link
                                href={`/dashboard/inbox?chat=${product.sellerId}`}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message
                              </Link>
                            </Button>
                          )}
                        {product.farmerProfile?.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{product.farmerProfile.phone}</span>
                          </div>
                        )}
                        {product.farmerProfile?.website && (
                          <a
                            href={product.farmerProfile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Website</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.reviewCount || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Product Details</h4>
                    <dl className="space-y-2 text-sm">
                      {product.brand && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Brand:</dt>
                          <dd>{product.brand}</dd>
                        </div>
                      )}
                      {product.sku && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">SKU:</dt>
                          <dd>{product.sku}</dd>
                        </div>
                      )}
                      {product.weight && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Weight:</dt>
                          <dd>{product.weight}</dd>
                        </div>
                      )}
                      {product.dimensions && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Dimensions:</dt>
                          <dd>{product.dimensions}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Unit:</dt>
                        <dd>{product.unit}</dd>
                      </div>
                    </dl>
                  </div>
                  {product.variants && product.variants.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Available Options</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {product.variants.map((variant) => (
                          <li key={variant.id}>
                            • {variant.name}: {variant.value}
                            {!variant.available && " (Out of stock)"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {product.rating || "0"}
                      </div>
                      <div className="flex justify-center mb-2">
                        {renderStars(Number(product.rating), "md")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Based on {product.reviewCount || 0} reviews
                      </div>
                    </div>
                    <div className="space-y-2">
                      {ratingDistribution.map((item) => (
                        <div
                          key={item.stars}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-8">{item.stars}★</span>
                          <Progress
                            value={item.percentage}
                            className="flex-1"
                          />
                          <span className="w-8 text-muted-foreground">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="animate-spin" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={review.user?.image || ""} />
                            <AvatarFallback>
                              {review.user?.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">
                                {review.user?.name || "Anonymous"}
                              </span>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-muted-foreground">
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {review.title && (
                              <h4 className="font-medium mb-2">
                                {review.title}
                              </h4>
                            )}
                            <p className="text-muted-foreground mb-3">
                              {review.content}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <button className="hover:text-foreground">
                                Helpful ({review.helpful || 0})
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
