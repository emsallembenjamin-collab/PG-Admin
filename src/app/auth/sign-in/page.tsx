import Signin from "@/components/Auth/Signin";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { GoldPayHeroScene } from "@/components/goldpay-hero-scene";
import { Logo } from "@/components/logo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Sign In",
};

export default function SignIn() {
  return (
    <>
      <Breadcrumb pageName="Admin Sign In" />

      <div className="goldpay-panel">
        <div className="flex flex-wrap items-center">
          <div className="w-full xl:w-1/2">
            <div className="w-full p-4 sm:p-12.5 xl:p-15">
              <Signin />
            </div>
          </div>

          <div className="hidden w-full p-7.5 xl:block xl:w-1/2">
            <div className="relative overflow-hidden rounded-[28px] px-12.5 pb-10 pt-12.5">
              <Link className="mb-10 inline-block" href="/">
                <Logo />
              </Link>
              <p className="mb-3 text-xl font-medium text-dark dark:text-white">
                Payment Service Admin
              </p>

              <h1 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-heading-3">
                Manage merchants and payment operations
              </h1>

              <p className="w-full max-w-[375px] font-medium text-dark-4 dark:text-dark-6">
                Sign in with an admin account to monitor providers, transactions,
                reconciliation, and notification activity.
              </p>

              <div className="mt-10">
                <GoldPayHeroScene role="admin" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
