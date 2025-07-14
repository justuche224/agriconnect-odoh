"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Grid3X3, List, Star, ArrowUpDown, Heart } from "lucide-react";
import Image from "next/image";
import Search from "@/components/search";

// Mock product data
const products = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium quality wireless headphones with noise cancellation technology and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.5,
    reviews: 128,
    image: "/placeholder.svg?height=300&width=300",
    category: "Electronics",
    inStock: true,
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    description:
      "Advanced fitness tracking with heart rate monitor, GPS, and waterproof design. Track your workouts and health metrics.",
    price: 299.99,
    originalPrice: null,
    rating: 4.3,
    reviews: 89,
    image: "/placeholder.svg?height=300&width=300",
    category: "Wearables",
    inStock: true,
    badge: "New",
  },
  {
    id: 3,
    name: "Organic Cotton T-Shirt",
    description:
      "Comfortable and sustainable organic cotton t-shirt available in multiple colors. Eco-friendly and ethically made.",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.7,
    reviews: 256,
    image: "/placeholder.svg?height=300&width=300",
    category: "Clothing",
    inStock: true,
    badge: null,
  },
  {
    id: 4,
    name: "Professional Camera Lens",
    description:
      "High-quality 50mm prime lens for professional photography. Sharp images with beautiful bokeh effect.",
    price: 899.99,
    originalPrice: null,
    rating: 4.8,
    reviews: 45,
    image: "/placeholder.svg?height=300&width=300",
    category: "Photography",
    inStock: false,
    badge: null,
  },
  {
    id: 5,
    name: "Ergonomic Office Chair",
    description:
      "Comfortable ergonomic office chair with lumbar support and adjustable height. Perfect for long working hours.",
    price: 449.99,
    originalPrice: 599.99,
    rating: 4.4,
    reviews: 167,
    image: "/placeholder.svg?height=300&width=300",
    category: "Furniture",
    inStock: true,
    badge: "Sale",
  },
  {
    id: 6,
    name: "Stainless Steel Water Bottle",
    description:
      "Insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and eco-friendly.",
    price: 34.99,
    originalPrice: null,
    rating: 4.6,
    reviews: 203,
    image: "/placeholder.svg?height=300&width=300",
    category: "Lifestyle",
    inStock: true,
    badge: null,
  },
];

const categories = [
  "Electronics",
  "Wearables",
  "Clothing",
  "Photography",
  "Furniture",
  "Lifestyle",
];
const priceRanges = [
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $300", min: 100, max: 300 },
  { label: "$300 - $500", min: 300, max: 500 },
  { label: "Over $500", min: 500, max: Number.POSITIVE_INFINITY },
];

export default function Home() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
            ? "fill-yellow-400/50 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const truncateDescription = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const ProductCard = ({
    product,
    isListView,
  }: {
    product: (typeof products)[0];
    isListView: boolean;
  }) => (
    <Card
      className={`group cursor-pointer hover:shadow-lg transition-shadow ${
        isListView ? "flex flex-row" : ""
      }`}
    >
      <div
        className={`relative ${
          isListView ? "w-48 flex-shrink-0" : "aspect-square"
        } overflow-hidden ${isListView ? "rounded-l-lg" : "rounded-t-lg"}`}
      >
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <Badge
            className="absolute top-2 left-2 z-10"
            variant={product.badge === "Sale" ? "destructive" : "default"}
          >
            {product.badge}
          </Badge>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
        >
          <Heart className="w-4 h-4" />
        </Button>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary">Out of Stock</Badge>
          </div>
        )}
      </div>

      <CardContent
        className={`p-4 ${
          isListView ? "flex-1 flex flex-col justify-between" : ""
        }`}
      >
        <div>
          <h3
            className={`font-semibold ${
              isListView ? "text-lg" : "text-base"
            } mb-2 line-clamp-2`}
          >
            {product.name}
          </h3>

          <p
            className={`text-muted-foreground text-sm mb-3 ${
              isListView ? "line-clamp-3" : "line-clamp-2"
            }`}
          >
            {truncateDescription(product.description, isListView ? 150 : 100)}
          </p>

          <div className="flex items-center gap-1 mb-3">
            {renderStars(product.rating)}
            <span className="text-sm text-muted-foreground ml-1">
              {product.rating} ({product.reviews})
            </span>
          </div>
        </div>

        <div
          className={`flex items-center ${
            isListView ? "justify-between" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <Button
            size={isListView ? "default" : "sm"}
            disabled={!product.inStock}
            className={isListView ? "" : "text-xs"}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="flex flex-col pt-10">
      <section
        suppressHydrationWarning
        className="bg-background/50 relative overflow-hidden pt-6 sm:pt-10 rounded-br-2xl rounded-bl-2xl sm:rounded-br-4xl sm:rounded-bl-4xl"
      >
        <div className="absolute -top-5 -left-5 sm:-top-10 sm:-left-10 w-32 h-32 sm:w-60 sm:h-60 bg-blue-400 opacity-30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-5 -right-5 sm:-bottom-10 sm:-right-10 w-32 h-32 sm:w-60 sm:h-60 bg-purple-400 opacity-30 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-balance px-4">
          What are you looking for?
        </h2>
        <Search />
      </section>

      <section className="flex flex-col items-center justify-center mt-6 sm:mt-10">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-4">
          Top Categories
        </h2>
      </section>

      <section className="mt-10 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight mb-4">
                Filters
              </h3>
              <div className="flex lg:flex-col gap-4">
                {/* Categories */}
                <div className="space-y-4">
                  <h4 className="font-medium">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([
                                ...selectedCategories,
                                category,
                              ]);
                            } else {
                              setSelectedCategories(
                                selectedCategories.filter((c) => c !== category)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={category}
                          className="text-sm font-normal"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="hidden lg:block" />

                {/* Price Range */}
                <div className="space-y-4">
                  <h4 className="font-medium">Price Range</h4>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <div
                        key={range.label}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={range.label}
                          checked={selectedPriceRange.includes(range.label)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPriceRange([
                                ...selectedPriceRange,
                                range.label,
                              ]);
                            } else {
                              setSelectedPriceRange(
                                selectedPriceRange.filter(
                                  (p) => p !== range.label
                                )
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={range.label}
                          className="text-sm font-normal"
                        >
                          {range.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="w-full lg:w-3/4">
            {/* Header with view toggle and sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                  Products
                </h2>
                <p className="text-sm text-muted-foreground">
                  Showing {products.length} results
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Sort by
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                      value={sortBy}
                      onValueChange={setSortBy}
                    >
                      <DropdownMenuRadioItem value="featured">
                        Featured
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="newest">
                        Newest
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="price-low">
                        Price: Low to High
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="price-high">
                        Price: High to Low
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="rating">
                        Highest Rated
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Toggle */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isListView={viewMode === "list"}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
