"use client";

import { AuthGate } from "@/components/Auth/auth-gate";
import { AuthProvider } from "@/contexts/auth-context";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <AuthProvider>
        <SidebarProvider>
          <AuthGate>{children}</AuthGate>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
