"use client";

import type { PropsWithChildren } from "react";
import { Toast } from "@heroui/react";
import {
  ThemeProvider as NextThemesProvider,
} from "next-themes";

export function Providers({
  children,
}: PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Toast.Provider placement="top end" />

      {children}
    </NextThemesProvider>
  );
}