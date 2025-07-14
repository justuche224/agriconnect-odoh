"use client";

import EditProfileForm from "@/components/profile-form";
import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import type { User } from "@/types";

const page = () => {
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

  return <Component user={session.user} />;
};

export default page;

const Component = ({ user }: { user: User }) => {
  const { data: farmerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["farmer-profile", user.id],
    queryFn: async () => {
      const response = await orpc.shop.getFarmerProfile.call({
        userId: user.id,
      });
      return response;
    },
    enabled: !!user.id,
  });

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return <EditProfileForm user={user} profile={farmerProfile} />;
};
