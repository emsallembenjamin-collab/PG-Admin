import { cva, VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap text-center font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white shadow-card",
        green: "bg-green text-white shadow-card",
        dark: "bg-dark text-white shadow-card dark:bg-white/10",
        outlinePrimary: "border border-primary/20 bg-white text-primary shadow-card",
        outlineGreen: "border border-green/20 bg-white text-green shadow-card",
        outlineDark:
          "border border-[#E8DED0] bg-white text-dark shadow-card dark:border-white/25 dark:bg-dark-2 dark:text-white",
      },
      shape: {
        default: "rounded-full",
        rounded: "rounded-2xl",
        full: "rounded-full",
      },
      size: {
        default: "px-5 py-2.5",
        small: "px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    label: string;
    icon?: React.ReactNode;
  };

export function Button({
  label,
  icon,
  variant,
  shape,
  size,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, shape, size, className })}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}
