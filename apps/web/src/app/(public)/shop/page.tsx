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
import {
  Grid3X3,
  List,
  Star,
  ArrowUpDown,
  Heart,
  Loader,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Search from "@/components/search";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import type { Product, Category } from "@/types";
import formatPrice from "@/lib/format-price";
import { useCartStore } from "@/lib/store/cart";
import { toast } from "sonner";

const priceRanges = [
  { label: "Under NGN 5,000", min: 0, max: 5000 },
  { label: "NGN 5,000 - NGN 10,000", min: 5000, max: 10000 },
  { label: "NGN 10,000 - NGN 15,000", min: 10000, max: 15000 },
  { label: "NGN 15,000 - NGN 20,000", min: 15000, max: 20000 },
  { label: "Over NGN 20,000", min: 20000, max: 1000000 },
];

export default function ShopPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => await orpc.shop.getCategories.call(),
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: [
      "products",
      currentPage,
      sortBy,
      selectedCategories,
      searchQuery,
    ],
    queryFn: async () => {
      const response = await orpc.shop.getProducts.call({
        page: currentPage,
        limit: 12,
        search: searchQuery || undefined,
        categoryId: selectedCategories[0] || undefined,
        sortBy: sortBy as any,
      });
      return response;
    },
  });

  const products = productsData?.items || [];

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(product.id);

    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
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
      setAddingToCart(null);
    }
  };

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

  const truncateDescription = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const ProductCard = ({
    product,
    isListView,
  }: {
    product: Product;
    isListView: boolean;
  }) => (
    <Card
      className={`group hover:shadow-lg transition-shadow ${
        isListView ? "flex flex-row" : ""
      }`}
    >
      <Link
        href={`/shop/product/${product.id}`}
        className={isListView ? "w-48 flex-shrink-0" : ""}
      >
        <div
          className={`relative ${
            isListView ? "w-48 flex-shrink-0" : "aspect-square"
          } overflow-hidden ${isListView ? "rounded-l-lg" : "rounded-t-lg"}`}
        >
          <Image
            src={product.images?.[0]?.url || "/placeholder.svg"}
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="w-4 h-4" />
          </Button>
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent
        className={`p-4 ${
          isListView ? "flex-1 flex flex-col justify-between" : ""
        }`}
      >
        <div>
          <Link href={`/shop/product/${product.id}`}>
            <h3
              className={`font-semibold ${
                isListView ? "text-lg" : "text-base"
              } mb-2 line-clamp-2 hover:text-primary cursor-pointer`}
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
              {renderStars(Number(product.rating))}
              <span className="text-sm text-muted-foreground ml-1">
                {product.rating} ({product.reviewCount || 0})
              </span>
            </div>
          </Link>
        </div>

        <div
          className={`flex items-center ${
            isListView ? "justify-between" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              {formatPrice(Number(product.price))}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(Number(product.originalPrice))}
              </span>
            )}
          </div>

          <Button
            size={isListView ? "default" : "sm"}
            disabled={!product.inStock || addingToCart === product.id}
            className={isListView ? "" : "text-xs"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (product.inStock) {
                handleAddToCart(product);
              }
            }}
          >
            {addingToCart === product.id ? (
              <>
                <Loader className="w-3 h-3 mr-1 animate-spin" />
                Adding...
              </>
            ) : product.inStock ? (
              <>
                <ShoppingCart className="w-3 h-3 mr-1" />
                Add to Cart
              </>
            ) : (
              "Out of Stock"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (categoriesLoading || productsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <section className="flex flex-col py-10 bg-[url(/images/hero-bg.png),linear-gradient(#000,#000)] bg-cover bg-fixed">
      <section
        suppressHydrationWarning
        className="bg-background/50 backdrop-blur-lg relative overflow-hidden pt-6 sm:pt-10 rounded-br-2xl rounded-bl-2xl sm:rounded-br-4xl sm:rounded-bl-4xl"
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
          Farm Products Marketplace
        </h2>
      </section>

      <section className="mt-10 px-4 max-w-7xl mx-auto bg-background/50 backdrop-blur-lg rounded-lg">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight mb-4">
                Filters
              </h3>
              <div className="flex lg:flex-col gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category: Category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([category.id]);
                            } else {
                              setSelectedCategories([]);
                            }
                            setCurrentPage(1);
                          }}
                        />
                        <Label
                          htmlFor={category.id}
                          className="text-sm font-normal"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="hidden lg:block" />

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
                              setSelectedPriceRange([range.label]);
                            } else {
                              setSelectedPriceRange([]);
                            }
                            setCurrentPage(1);
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

          <div className="w-full lg:w-3/4">
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
                      onValueChange={(value) => {
                        setSortBy(value);
                        setCurrentPage(1);
                      }}
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

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}

            {productsData?.pagination?.hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
