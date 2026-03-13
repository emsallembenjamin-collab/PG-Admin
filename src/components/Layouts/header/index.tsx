"use client";

import { SearchIcon } from "@/assets/icons";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";

const PAGE_COPY = {
  "/": {
    title: "Dashboard",
    subtitle: "A bird eye view on merchant, provider, and payment operations",
  },
  "/merchants": {
    title: "Merchants",
    subtitle: "Manage onboarding, status, and provider assignments",
  },
  "/providers": {
    title: "Providers",
    subtitle: "Review routing partners, priority, limits, and fees",
  },
  "/currencies": {
    title: "Currencies",
    subtitle: "Manage supported currencies and exchange rates",
  },
  "/transactions": {
    title: "Transactions",
    subtitle: "Track payment flow, sandbox runs, and live activity",
  },
  "/history": {
    title: "History",
    subtitle: "Review payment records and status changes",
  },
  "/reconciliation": {
    title: "Reconciliation",
    subtitle: "Audit settlement totals and discrepancy handling",
  },
  "/pages/settings": {
    title: "Settings",
    subtitle: "Manage your admin profile and workspace preferences",
  },
  "/profile": {
    title: "Profile",
    subtitle: "View admin account details and recent activity",
  },
} as const;

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const pathname = usePathname();
  const pageCopy =
    PAGE_COPY[pathname as keyof typeof PAGE_COPY] ?? PAGE_COPY["/"];

  return (
    <header className="sticky top-4 z-30 px-4 md:px-6 2xl:px-10">
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 rounded-[30px] border border-white/85 bg-white/88 px-4 py-4 shadow-card-2 backdrop-blur-xl dark:border-dark-3/80 dark:bg-[#08111F]/90 md:px-6">
        <button
          onClick={toggleSidebar}
          className="merchant-icon-button lg:hidden"
        >
          <MenuIcon className="size-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        {isMobile && (
          <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
            <Logo compact />
          </Link>
        )}

        <div className="max-w-[22rem] max-xl:hidden">
          <h1 className="text-[1.9rem] font-black leading-none tracking-[-0.045em] text-[#151515] dark:text-white">
            {pageCopy.title}
          </h1>
          <p className="mt-1.5 text-[13px] font-medium tracking-[-0.01em] text-[#AEA39A] dark:text-dark-6">
            {pageCopy.subtitle}
          </p>
        </div>

        <div className="hidden flex-1 items-center justify-center xl:flex">
          <div className="flex min-w-[320px] items-center justify-between gap-4 rounded-full border border-[#ECE2D5] bg-[#FCF9F3] px-4 py-2 shadow-card dark:border-dark-3 dark:bg-dark-2">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#F9ECE0] text-[12px] font-bold text-[#E58A4A]">
                A
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold tracking-[-0.02em] text-[#8B7A68] dark:text-dark-6">
                  Active merchants
                </p>
              </div>
            </div>
            <p className="shrink-0 text-[13px] font-bold tracking-[-0.03em] text-[#1E1E1E] dark:text-white">
              Live Ops
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-3 xl:flex-none">
          <div className="relative w-full max-w-[300px] xl:max-w-[270px]">
            <input
              type="search"
              placeholder="Search merchants, providers, transactions"
              className="merchant-input h-12 rounded-full border-white/70 bg-[#FCF9F3] pl-[50px] pr-5 text-[13px] font-medium shadow-card placeholder:text-[#B4A79A] dark:border-dark-3 dark:bg-dark-2"
            />

            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-[#8A7A61] max-[1015px]:size-5 dark:text-dark-6" />
          </div>

          <ThemeToggleSwitch />

          <Notification />

          <div className="shrink-0">
            <UserInfo />
          </div>
        </div>
      </div>
    </header>
  );
}
