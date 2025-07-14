"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Banknote, X, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { convertBlobUrlToFile } from "@/lib/convert-blob-url-to-file";
import { uploadImage } from "@/lib/supabase/storage/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";
import Image from "next/image";
import z from "zod";
import formatPrice from "@/lib/format-price";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_FILES = 5;

const ProductSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a valid positive number.",
  }),
  originalPrice: z.string().optional(),
  quantity: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Quantity must be a valid number.",
    }),
  unit: z.string().min(1, {
    message: "Please select a unit.",
  }),
  categoryId: z.string().min(1, {
    message: "Please select a category.",
  }),
  brand: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  badge: z.string().optional(),
  images: z.array(z.string()).min(1, {
    message: "Please upload at least one image.",
  }),
});

type ProductFormData = z.infer<typeof ProductSchema>;

const SellPage = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const getActiveTab = (): string => {
    const page = searchParams.get("page");
    return page === "add" || page === "view" ? page : "view";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      quantity: "",
      unit: "",
      categoryId: "",
      brand: "",
      weight: "",
      dimensions: "",
      badge: "",
      images: [],
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => await orpc.shop.getCategories.call(),
  });

  const { data: userProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["user-products"],
    queryFn: async () => {
      const response = await orpc.shop.getProducts.call({
        page: 1,
        limit: 50,
        sellerId: userId,
      });
      return response.items;
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (uploadedImages.length === 0) {
        throw new Error("At least one product image is required");
      }
      if (uploadedImages.length > MAX_FILES) {
        throw new Error(`Maximum ${MAX_FILES} product images allowed`);
      }

      const uploadedImageUrls = await Promise.all(
        uploadedImages.map(async (url, index) => {
          const imageFile = await convertBlobUrlToFile(url);
          const { imageUrl, error } = await uploadImage({
            file: imageFile,
            bucket: process.env.NEXT_PUBLIC_SUPABASE_BUCKET!,
            folder: "products",
          });

          if (error) throw new Error(`Failed to upload image: ${error}`);
          return imageUrl;
        })
      );

      return await orpc.shop.createProduct.call({
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        quantity: parseInt(data.quantity),
        unit: data.unit,
        categoryId: data.categoryId,
        brand: data.brand,
        weight: data.weight,
        dimensions: data.dimensions,
        badge: data.badge,
        images: uploadedImageUrls,
      });
    },
    onSuccess: () => {
      toast.success("Product Added", {
        description: "Your product has been successfully listed.",
      });
      form.reset();
      setUploadedImages([]);
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
      handleTabChange("view");
    },
    onError: (error) => {
      toast.error("Error", {
        description:
          error.message || "Failed to create product. Please try again.",
      });
    },
  });

  async function onSubmit(values: ProductFormData) {
    createProductMutation.mutate(values);
  }

  const processFiles = (files: File[]) => {
    if (uploadedImages.length + files.length > MAX_FILES) {
      setImageError(`Maximum ${MAX_FILES} images allowed`);
      return;
    }

    const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      setImageError("Some files exceed 4MB limit");
      return;
    }

    const invalidTypes = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidTypes.length > 0) {
      setImageError("Please select only image files");
      return;
    }

    setImageError("");
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    const updatedImages = [...uploadedImages, ...newImageUrls];
    setUploadedImages(updatedImages);
    form.setValue("images", updatedImages);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    processFiles(filesArray);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    processFiles(files);
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = uploadedImages.filter(
      (_, index) => index !== indexToRemove
    );
    setUploadedImages(updatedImages);
    form.setValue("images", updatedImages);
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 mt-16">
      <h1 className="text-3xl font-bold mb-6">Manage Your Products</h1>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Products</TabsTrigger>
          <TabsTrigger value="add">Add Product</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Your Listed Products</CardTitle>
              <CardDescription>
                Products you have listed for sale
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader className="animate-spin" />
                </div>
              ) : userProducts && userProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="p-4"
                      style={{
                        backgroundImage: `url(${product.images[0]})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.description.substring(0, 100)}...
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">
                          {formatPrice(Number(product.price))}
                        </span>
                        <span
                          className={`text-sm ${
                            product.inStock ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {product.inStock
                            ? `${product.quantity} in stock`
                            : "Out of stock"}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  You haven't listed any products yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>
                Fill out the form below to list a new product for sale.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="images"
                    render={() => (
                      <FormItem>
                        <FormLabel>Product Images</FormLabel>
                        <FormDescription>
                          Upload up to {MAX_FILES} images (max 4MB each)
                        </FormDescription>

                        <input
                          type="file"
                          hidden
                          multiple
                          accept="image/*"
                          ref={imageInputRef}
                          onChange={handleImageChange}
                          disabled={
                            createProductMutation.isPending ||
                            uploadedImages.length >= MAX_FILES
                          }
                        />

                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            isDragOver
                              ? "border-primary bg-primary/5"
                              : "border-gray-300 hover:border-gray-400"
                          } ${
                            createProductMutation.isPending ||
                            uploadedImages.length >= MAX_FILES
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => {
                            if (
                              !createProductMutation.isPending &&
                              uploadedImages.length < MAX_FILES
                            ) {
                              imageInputRef.current?.click();
                            }
                          }}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                            </div>
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">
                                {isDragOver
                                  ? "Drop images here"
                                  : "Drag and drop images here"}
                              </p>
                              <p className="text-gray-500">
                                or click to select files
                              </p>
                            </div>
                          </div>
                        </div>

                        {imageError && (
                          <Alert variant="destructive">{imageError}</Alert>
                        )}

                        {uploadedImages.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {uploadedImages.map((url, index) => (
                              <div key={index} className="relative group">
                                <Image
                                  src={url}
                                  width={200}
                                  height={200}
                                  alt={`Product image ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-md shadow-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                {index === 0 && (
                                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
                                    Main Image
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Organic Tomatoes"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={categoriesLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    categoriesLoading
                                      ? "Loading..."
                                      : "Select a category"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category: any) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Set if this product is on sale
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g. 100"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kg">Kilogram (kg)</SelectItem>
                              <SelectItem value="lb">Pound (lb)</SelectItem>
                              <SelectItem value="piece">Piece</SelectItem>
                              <SelectItem value="dozen">Dozen</SelectItem>
                              <SelectItem value="liter">Liter</SelectItem>
                              <SelectItem value="bushel">Bushel</SelectItem>
                              <SelectItem value="crate">Crate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Your Farm Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 500g, 2kg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your product, including quality, origin, farming methods, etc."
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about your product to help customers
                          make informed decisions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {createProductMutation.isPending ? (
                      "Adding Product..."
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellPage;
