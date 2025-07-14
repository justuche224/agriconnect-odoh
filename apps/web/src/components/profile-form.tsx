"use client";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Loader2,
  Building,
  MapPin,
  Phone,
  Link as LinkIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import type { User, FarmerProfile } from "@/types";

interface EditProfileFormProps {
  user: User;
  profile?: FarmerProfile | null;
}

const EditProfileForm = ({ user, profile }: EditProfileFormProps) => {
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const profileFormSchema = z.object({
    farmName: z
      .string()
      .min(2, { message: "Farm name must be at least 2 characters." })
      .optional(),
    description: z.string().max(500).optional(),
    location: z.string().optional(),
    phone: z.string().optional(),
    website: z
      .string()
      .url({ message: "Please enter a valid URL." })
      .optional()
      .or(z.literal("")),
    certifications: z.string().optional(),
  });

  type ProfileFormData = z.infer<typeof profileFormSchema>;

  const accountForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      farmName: profile?.farmName || "",
      description: profile?.description || "",
      location: profile?.location || "",
      phone: profile?.phone || "",
      website: profile?.website || "",
      certifications: profile?.certifications || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await orpc.shop.updateFarmerProfile.call(data);
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["farmer-profile"] });
      setUpdating(false);
      router.back();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
      setUpdating(false);
    },
  });

  const handleAccountSubmit = async (data: ProfileFormData) => {
    setUpdating(true);
    updateProfileMutation.mutate(data);
  };

  return (
    <Card className="container mx-auto m-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Button
            className="back-button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-12 h-12" />
          </Button>
          <h1 className="mx-auto">Profile Settings</h1>
        </CardTitle>
        <CardDescription className="text-center">
          Update your farm profile information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800">Current User Info</h3>
          <p className="text-sm text-blue-600">
            Name: {user?.name} | Email: {user?.email} | Role: {user?.role}
          </p>
          <p className="text-xs text-blue-500 mt-1">
            Account details (name, email) can be managed through account
            settings.
          </p>
        </div>

        <Form {...accountForm}>
          <form
            onSubmit={accountForm.handleSubmit(handleAccountSubmit)}
            className="space-y-6"
          >
            <FormField
              control={accountForm.control}
              name="farmName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        placeholder="Your farm name"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell customers about your farm and what you grow..."
                      className="resize-none min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        placeholder="123 Farm Road, Rural County"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        placeholder="https://www.myfarm.com"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certifications</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List your organic certifications, awards, or other credentials..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button
                type="submit"
                className="w-full md:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={updating}
              >
                Save Changes{" "}
                {updating && <Loader2 className="animate-spin" color="green" />}
              </Button>
              <Button
                className="back-button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditProfileForm;
