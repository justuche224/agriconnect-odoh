"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import UserMenu from "@/components/user-menu";
import { ModeToggle } from "@/components/mode-toggle";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = authClient.useSession();

  return (
    <SidebarProvider>
      <AppSidebar
        user={
          session?.user
            ? { name: session.user.name, role: session.user.role.toLowerCase() }
            : { name: null, role: null }
        }
      />
      <main className="grow">
        <header className="flex justify-between p-2 shadow-md bg-sidebar sticky top-0 z-50">
          <Button variant="outline" size="icon" asChild>
            <SidebarTrigger />
          </Button>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu />
          </div>
        </header>
        {children}
      </main>
    </SidebarProvider>
  );
};

export default DashboardLayout;
