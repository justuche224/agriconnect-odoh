"use client";

import Checkout from "@/components/checkout";
import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

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
  return <Checkout />;
};

export default page;
