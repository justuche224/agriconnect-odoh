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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock product data
const product = {
  id: 1,
  name: "Premium Wireless Bluetooth Headphones",
  description: `Experience exceptional sound quality with these premium wireless Bluetooth headphones. 
  Featuring advanced noise cancellation technology, these headphones deliver crystal-clear audio 
  whether you're listening to music, taking calls, or enjoying podcasts.

  The ergonomic design ensures comfortable wear for extended periods, while the premium materials 
  provide durability and style. With up to 30 hours of battery life and quick charge capability, 
  these headphones are perfect for daily use, travel, and professional applications.

  Key features include:
  • Advanced Active Noise Cancellation (ANC)
  • High-resolution audio drivers
  • Comfortable over-ear design
  • 30-hour battery life
  • Quick charge: 15 minutes = 3 hours playback
  • Multi-device connectivity
  • Built-in voice assistant support
  • Foldable design for easy storage`,
  price: 199.99,
  originalPrice: 249.99,
  rating: 4.5,
  reviewCount: 128,
  inStock: true,
  stockCount: 15,
  images: [
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
  ],
  colors: [
    { name: "Midnight Black", value: "black", available: true },
    { name: "Pearl White", value: "white", available: true },
    { name: "Rose Gold", value: "rose-gold", available: false },
  ],
  sizes: ["One Size"],
  category: "Electronics",
  brand: "AudioTech",
  sku: "AT-WH-001",
  weight: "280g",
  dimensions: "19 x 17 x 8 cm",
};

const reviews = [
  {
    id: 1,
    user: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    date: "2024-01-15",
    title: "Excellent sound quality!",
    content:
      "These headphones exceeded my expectations. The noise cancellation is fantastic and the battery life is exactly as advertised. Very comfortable for long listening sessions.",
    helpful: 12,
    verified: true,
  },
  {
    id: 2,
    user: "Mike Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    date: "2024-01-10",
    title: "Great value for money",
    content:
      "Really impressed with the build quality and sound. The only minor issue is that they can get a bit warm during extended use, but overall very satisfied.",
    helpful: 8,
    verified: true,
  },
  {
    id: 3,
    user: "Emily Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    date: "2024-01-08",
    title: "Perfect for work from home",
    content:
      "The noise cancellation is a game-changer for video calls. Crystal clear audio and the microphone quality is excellent. Highly recommend for remote work.",
    helpful: 15,
    verified: true,
  },
  {
    id: 4,
    user: "Alex Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    date: "2024-01-05",
    title: "Comfortable and stylish",
    content:
      "Love the design and they're very comfortable. Sound quality is great for the price point. Quick charging feature is very convenient.",
    helpful: 6,
    verified: false,
  },
];

const ratingDistribution = [
  { stars: 5, count: 64, percentage: 50 },
  { stars: 4, count: 38, percentage: 30 },
  { stars: 3, count: 19, percentage: 15 },
  { stars: 2, count: 5, percentage: 4 },
  { stars: 1, count: 2, percentage: 1 },
];

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0].value);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${starSize} ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
            ? "fill-yellow-400/50 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-md:pt-20">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
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
          </div>

          {/* Thumbnail Images */}
          <div className="flex space-x-2 overflow-x-auto">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                  selectedImage === index ? "border-primary" : "border-gray-200"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} ${index + 1}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="outline">{product.brand}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
              {product.originalPrice && (
                <Badge variant="destructive">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </Badge>
              )}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h3 className="font-medium mb-3">Color</h3>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() =>
                    color.available && setSelectedColor(color.value)
                  }
                  disabled={!color.available}
                  className={`px-4 py-2 rounded-md border text-sm ${
                    selectedColor === color.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : color.available
                      ? "border-gray-300 hover:border-gray-400"
                      : "border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <h3 className="font-medium mb-3">Size</h3>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {product.sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
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
                    setQuantity(Math.min(product.stockCount, quantity + 1))
                  }
                  disabled={quantity >= product.stockCount}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.stockCount} items available
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex gap-3">
            <Button size="lg" className="flex-1">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
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

          {/* Features */}
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
              <span>2-year warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.reviewCount})
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
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Brand:</dt>
                        <dd>{product.brand}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">SKU:</dt>
                        <dd>{product.sku}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Weight:</dt>
                        <dd>{product.weight}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Dimensions:</dt>
                        <dd>{product.dimensions}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Bluetooth 5.0 connectivity</li>
                      <li>• Active noise cancellation</li>
                      <li>• 30-hour battery life</li>
                      <li>• Quick charge capability</li>
                      <li>• Voice assistant support</li>
                      <li>• Foldable design</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {/* Rating Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {product.rating}
                      </div>
                      <div className="flex justify-center mb-2">
                        {renderStars(product.rating, "md")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Based on {product.reviewCount} reviews
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

              {/* Individual Reviews */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage
                            src={review.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {review.user
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{review.user}</span>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(review.rating)}
                            <span className="text-sm text-muted-foreground">
                              {review.date}
                            </span>
                          </div>
                          <h4 className="font-medium mb-2">{review.title}</h4>
                          <p className="text-muted-foreground mb-3">
                            {review.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <button className="hover:text-foreground">
                              Helpful ({review.helpful})
                            </button>
                            <button className="hover:text-foreground">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
