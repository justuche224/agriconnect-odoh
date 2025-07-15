"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { usePathname } from "next/navigation";
import Cart from "./cart";
import { ShoppingCart } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const links = [
    { to: "/shop", label: "Shop" },
    { to: "/shop/farmers", label: "Farmers" },
    { to: "/about", label: "About" },
  ];
  const pathname = usePathname();

  if (pathname.includes("/dashboard") || pathname.includes("/admin")) {
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-2 fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-lg shadow-md">
        <nav className="flex gap-4 text-lg items-center">
          <Link href="/" className="font-bold text-xl">
            AGRICONNECT
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4">
            {links.map(({ to, label }) => {
              return (
                <Link key={to} href={to}>
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
          <Cart Icon={ShoppingCart} />
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg shadow-lg md:hidden">
          <nav className="flex flex-col px-4 py-4 space-y-4">
            {links.map(({ to, label }) => {
              return (
                <Link
                  key={to}
                  href={to}
                  className="text-lg hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <hr />
    </div>
  );
}
