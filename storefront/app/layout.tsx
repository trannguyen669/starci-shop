import type {
  Metadata,
} from "next";
import type {
  ReactNode,
} from "react";
import {
  Open_Sans,
} from "next/font/google";
import {
  Typography,
} from "@heroui/react";

import {
  Providers,
} from "./providers";
import {
  HeaderNav,
} from "./components/header-nav";

import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "StarCi Shop",
  description: "StarCi Shop storefront",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={openSans.variable}
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <Providers>
          <HeaderNav />

          <main className="container mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-6">
            {children}
          </main>

          <footer className="container mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
            <Typography
              type="body-sm"
              color="muted"
            >
              © StarCi Shop
            </Typography>
          </footer>
        </Providers>
      </body>
    </html>
  );
}