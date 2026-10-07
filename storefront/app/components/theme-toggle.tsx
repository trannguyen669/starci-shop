"use client";

import { useEffect, useState } from "react";
import { Label, Switch } from "@heroui/react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  const {
    resolvedTheme,
    setTheme,
  } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Switch
      isSelected={isDark}
      onChange={(isSelected) => {
        setTheme(
          isSelected ? "dark" : "light",
        );
      }}
    >
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>

        <Label>Chế độ tối</Label>
      </Switch.Content>
    </Switch>
  );
}