"use client";

import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { useId, useState } from "react";

type PropsType = {
  label: string;
  items: { value: string; label: string }[];
  prefixIcon?: React.ReactNode;
  className?: string;
} & (
  | { placeholder?: string; defaultValue: string }
  | { placeholder: string; defaultValue?: string }
);

export function Select({
  items,
  label,
  defaultValue,
  placeholder,
  prefixIcon,
  className,
}: PropsType) {
  const id = useId();

  const [isOptionSelected, setIsOptionSelected] = useState(false);

  return (
    <div className={cn("space-y-3", className)}>
      <label
        htmlFor={id}
        className="merchant-label"
      >
        {label}
      </label>

      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7A61] dark:text-dark-6">
            {prefixIcon}
          </div>
        )}

        <select
          id={id}
          defaultValue={defaultValue || ""}
          onChange={() => setIsOptionSelected(true)}
          className={cn(
            "merchant-select [&>option]:text-dark-5 dark:[&>option]:text-dark-6",
            isOptionSelected && "text-dark dark:text-white",
            prefixIcon && "pl-11.5",
          )}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <ChevronUpIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-180 text-[#8A7A61] dark:text-dark-6" />
      </div>
    </div>
  );
}
