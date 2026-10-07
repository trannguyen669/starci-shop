"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Typography } from "@heroui/react";

const LINKS = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/products",
    label: "Products",
  },
  {
    href: "/login",
    label: "Login",
  },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-separator bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
        <Link href="/">
          <Typography
            type="h5"
            weight="semibold"
          >
            StarCi Shop
          </Typography>
        </Link>

        <ul className="flex items-center gap-4 md:gap-6">
          {LINKS.map((link) => {
            const isActive =
              pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                  className={
                    isActive
                      ? "font-medium text-accent"
                      : "text-muted transition-colors hover:text-foreground"
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}