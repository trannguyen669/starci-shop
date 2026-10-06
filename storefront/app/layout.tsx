import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import { Providers } from "./providers";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={openSans.variable}
    >
      <body className="font-sans text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}