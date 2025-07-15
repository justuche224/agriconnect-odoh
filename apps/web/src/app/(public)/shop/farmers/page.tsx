"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Phone,
  Globe,
  BadgeCheck,
  User,
  Search,
  Filter,
  Loader,
  Package,
} from "lucide-react";
import Link from "next/link";
import { orpc } from "@/utils/orpc";

export default function FarmersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [verified, setVerified] = useState<boolean | undefined>(undefined);

  const { data, isLoading, error } = useQuery({
    queryKey: ["farmers", page, search, location, verified],
    queryFn: async () => {
      const params: any = {
        page,
        limit: 12,
      };
      if (search) params.search = search;
      if (location) params.location = location;
      if (verified !== undefined) params.verified = verified;

      return await orpc.shop.getFarmers.call(params);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setVerified(undefined);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Farmers</h1>
        <p className="text-muted-foreground">Failed to load farmers list.</p>
      </div>
    );
  }

  return (
    <div className="bg-[url(/images/hero-bg.png),linear-gradient(#000,#000)] bg-cover bg-fixed">
      <div className="container mx-auto px-4 py-8 mt-20 bg-background/50 backdrop-blur-lg rounded-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Our Farmers</h1>
          <p className="text-muted-foreground">
            Meet the farmers who grow and provide fresh, quality produce
            directly to your table.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4 mb-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search farmers or farm names..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full sm:w-40"
            />
            <Select
              value={verified?.toString() || "all"}
              onValueChange={(value) =>
                setVerified(value === "all" ? undefined : value === "true")
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Farmers</SelectItem>
                <SelectItem value="true">Verified Only</SelectItem>
                <SelectItem value="false">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
            <span className="text-sm text-muted-foreground">
              {data?.items?.length || 0} farmer(s) found
            </span>
          </div>
        </div>

        {/* Farmers Grid */}
        {data?.items && data.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {data.items.map((farmer) => (
              <Card
                key={farmer.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-16 h-16">
                          <AvatarImage
                            src={farmer.avatar || farmer.user?.image || ""}
                            alt={
                              farmer.farmName || farmer.user?.name || "Farmer"
                            }
                          />
                          <AvatarFallback>
                            {(farmer.farmName || farmer.user?.name || "F")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {farmer.verified && (
                          <BadgeCheck className="w-5 h-5 text-blue-600 absolute -top-1 -right-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium line-clamp-1">
                            {farmer.farmName ||
                              farmer.user?.name ||
                              "Unknown Farmer"}
                          </h3>
                          {farmer.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {farmer.user?.name || "Farmer"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {farmer.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{farmer.location}</span>
                    </div>
                  )}
                  {farmer.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {farmer.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <Package className="w-3 h-3" />
                    <span>{farmer.productCount} product(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/shop/farmers/${farmer.userId}`}>
                        <User className="w-4 h-4 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                    {farmer.phone && (
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                    {farmer.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={farmer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No farmers found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or clear the filters.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.hasMore && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={isLoading}
            >
              {isLoading ? (
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
      </div>
    </div>
  );
}
