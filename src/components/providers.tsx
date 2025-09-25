"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { ConvexClientProvider } from "./providers/convex-client-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
      <ConvexClientProvider >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
    </ConvexClientProvider>

  );
}