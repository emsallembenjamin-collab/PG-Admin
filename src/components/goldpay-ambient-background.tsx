type GoldPayAmbientBackgroundProps = {
  variant?: "shell" | "hero";
};

export function GoldPayAmbientBackground({
  variant = "shell",
}: GoldPayAmbientBackgroundProps) {
  const shell = variant === "shell";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        shell ? "goldpay-mesh opacity-90" : "goldpay-mesh opacity-100"
      }`}
    >
      <div className="goldpay-orb animate-goldpay-drift left-[-8rem] top-[-6rem] h-56 w-56 bg-brand-gold/20 dark:bg-brand-gold/15" />
      <div className="goldpay-orb animate-goldpay-pulse right-[6%] top-[8%] h-52 w-52 bg-primary/15 dark:bg-primary/20" />
      <div className="goldpay-orb animate-goldpay-float bottom-[-5rem] left-[18%] h-48 w-48 bg-blue-light-3/20 dark:bg-blue-light-2/10" />
      <div className="goldpay-orb animate-goldpay-drift bottom-[8%] right-[12%] h-36 w-36 bg-yellow-light/25 dark:bg-yellow-dark/10" />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
      <div className="absolute inset-y-0 left-[18%] hidden w-px bg-gradient-to-b from-transparent via-brand-gold/20 to-transparent lg:block" />
      <div className="absolute inset-y-0 right-[15%] hidden w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent xl:block" />
    </div>
  );
}
