"use client";

import { GoldPayAmbientBackground } from "@/components/goldpay-ambient-background";
import { Header } from "@/components/Layouts/header";
import { Sidebar } from "@/components/Layouts/sidebar";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

function isAuthRoute(pathname: string | null) {
  return pathname?.startsWith("/auth") ?? false;
}

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  if (isAuthRoute(pathname)) {
    return (
      <div className="goldpay-shell min-h-screen">
        <GoldPayAmbientBackground variant="hero" />
        <main className="relative z-10 mx-auto w-full max-w-[1500px] p-4 md:p-6 2xl:px-10 2xl:py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="goldpay-shell flex min-h-screen text-slate-900 dark:text-white">
      <GoldPayAmbientBackground />
      <Sidebar />

      <div className="relative z-10 flex w-full flex-col bg-transparent">
        <Header />

        <main className="isolate mx-auto w-full max-w-[1500px] overflow-hidden p-4 md:p-6 2xl:px-10 2xl:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
