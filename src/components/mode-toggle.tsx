"use client";

import { useTheme } from "./theme-provider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun02FreeIcons,
  MoonsetFreeIcons,
  LaptopPhoneSyncFreeIcons,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light" | "system";

const icons = {
  dark: (
    <HugeiconsIcon
      icon={MoonsetFreeIcons}
      size={20}
      color="currentColor"
      strokeWidth={1.5}
    />
  ),
  light: (
    <HugeiconsIcon
      icon={Sun02FreeIcons}
      size={20}
      color="currentColor"
      strokeWidth={1.5}
    />
  ),
  system: (
    <HugeiconsIcon
      icon={LaptopPhoneSyncFreeIcons}
      size={20}
      color="currentColor"
      strokeWidth={1.5}
    />
  ),
};

export function ModeToggle() {
  const { setTheme, theme: currentTheme } = useTheme();
  const themes = ["light", "system", "dark"];
  return (
    <div className="flex gap-1 p-1 rounded-xl !bg-secondary/50">
      {themes.map((theme) => (
        <div
          role="button"
          onClick={() => setTheme(theme)}
          className={cn(
            "p-2 rounded-lg",
            theme === currentTheme ? "bg-secondary text-primary" : "",
          )}
          key={`theme-${theme}`}
        >
          {icons[theme as Theme]}
        </div>
      ))}
    </div>
  );
}
