import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import Link from "next/link";
import { PersonalInfoForm } from "./_components/personal-info";
import { UploadPhotoForm } from "./_components/upload-photo";

export const metadata: Metadata = {
  title: "Settings Page",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <Breadcrumb pageName="Settings" />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Link href="/merchants" className="merchant-card p-5 transition hover:border-primary/30">
          <p className="text-sm font-medium text-[#8A7A61] dark:text-dark-6">
            System Resource
          </p>
          <h3 className="mt-2 text-xl font-bold text-dark dark:text-white">
            Merchants
          </h3>
          <p className="mt-2 text-sm text-dark-6">
            Add, review, and update merchant records.
          </p>
        </Link>

        <Link href="/providers" className="merchant-card p-5 transition hover:border-primary/30">
          <p className="text-sm font-medium text-[#8A7A61] dark:text-dark-6">
            System Resource
          </p>
          <h3 className="mt-2 text-xl font-bold text-dark dark:text-white">
            Providers
          </h3>
          <p className="mt-2 text-sm text-dark-6">
            Manage provider routing, status, limits, and fees.
          </p>
        </Link>

        <Link href="/currencies" className="merchant-card p-5 transition hover:border-primary/30">
          <p className="text-sm font-medium text-[#8A7A61] dark:text-dark-6">
            System Resource
          </p>
          <h3 className="mt-2 text-xl font-bold text-dark dark:text-white">
            Currencies & Rates
          </h3>
          <p className="mt-2 text-sm text-dark-6">
            Add currencies and maintain exchange rates.
          </p>
        </Link>

        <Link href="/fees" className="merchant-card p-5 transition hover:border-primary/30">
          <p className="text-sm font-medium text-[#8A7A61] dark:text-dark-6">
            System Resource
          </p>
          <h3 className="mt-2 text-xl font-bold text-dark dark:text-white">
            Transaction Fees
          </h3>
          <p className="mt-2 text-sm text-dark-6">
            Configure platform fee percentages for deposits and withdrawals.
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-6 xl:gap-8">
        <div className="col-span-5 xl:col-span-3">
          <PersonalInfoForm />
        </div>
        <div className="col-span-5 xl:col-span-2">
          <UploadPhotoForm />
        </div>
      </div>
    </div>
  );
};

