"use client";

import { cn } from "@/lib";
import { Moon01FreeIcons, Sun01FreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import React, { ReactNode } from "react";

const themes: {
  label: string;
  value: "light" | "dark";
  icon: ReactNode;
}[] = [
  {
    label: "Light",
    value: "light",
    icon: <HugeiconsIcon icon={Sun01FreeIcons} className="w-6" />,
  },
  {
    label: "Dark",
    value: "dark",
    icon: <HugeiconsIcon icon={Moon01FreeIcons} className="w-6" />,
  },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="bg-primary/10 flex gap-2 rounded-lg p-1">
      {themes.map((currentTheme) => (
        <button
          key={currentTheme.value}
          onClick={() => setTheme(currentTheme.value)}
          className={cn(
            "bg-primary rounded-md p-1 transition-all",
            currentTheme.value === theme
              ? "bg-primary text-white"
              : "text-primary bg-[transparent]",
          )}
        >
          {currentTheme.icon}
        </button>
      ))}
    </div>
  );
}
