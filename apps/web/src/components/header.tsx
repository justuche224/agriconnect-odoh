"use client";
import Link from "next/link";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { usePathname } from "next/navigation";
import Cart from "./cart";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  const links = [{ to: "/shop", label: "Shop" }];
  const pathname = usePathname();

  if (pathname.includes("/dashboard") || pathname.includes("/admin")) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-2 fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-lg shadow-md">
        <nav className="flex gap-4 text-lg">
          <Link href="/" className="font-bold text-xl">
            AGRICONNECT
          </Link>
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
          <Cart Icon={ShoppingCart} />
        </div>
      </div>
      <hr />
    </div>
  );
}
