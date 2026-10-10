"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Typography } from "@heroui/react";

import { ThemeToggle } from "./theme-toggle";

type UserRole = "user" | "admin";

type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

export function HeaderNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    function loadUser() {
      const rawUser = localStorage.getItem("user");

      if (!rawUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(rawUser) as AuthUser);
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      }
    }

    loadUser();
    window.addEventListener("auth-changed", loadUser);

    return () => {
      window.removeEventListener("auth-changed", loadUser);
    };
  }, []);

  return (
    <nav className="border-b border-separator bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
        <Link href="/">
          <Typography type="h5" weight="semibold">
            StarCi Shop
          </Typography>
        </Link>

        <div className="flex items-center gap-4">
          <ul className="flex items-center gap-4 md:gap-6">
            {LINKS.map((link) => {
              const isActive = pathname === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
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

            {user ? (
              <li>
                <Link
                  href="/profile"
                  aria-current={
                    pathname === "/profile" ? "page" : undefined
                  }
                  className={
                    pathname === "/profile"
                      ? "font-medium text-accent"
                      : "text-muted transition-colors hover:text-foreground"
                  }
                >
                  Profile
                </Link>
              </li>
            ) : null}

            {user?.role === "admin" ? (
              <li>
                <Link
                  href="/admin"
                  aria-current={
                    pathname === "/admin" ? "page" : undefined
                  }
                  className={
                    pathname === "/admin"
                      ? "font-medium text-accent"
                      : "text-muted transition-colors hover:text-foreground"
                  }
                >
                  Admin
                </Link>
              </li>
            ) : null}

            {!user ? (
              <>
                <li>
                  <Link href="/login">Login</Link>
                </li>
                <li>
                  <Link href="/register">Register</Link>
                </li>
              </>
            ) : (
              <li>
                <Typography type="body-sm" color="muted">
                  {user.email}
                </Typography>
              </li>
            )}
          </ul>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
