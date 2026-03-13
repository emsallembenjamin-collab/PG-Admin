type GoldPayHeroSceneProps = {
  role: "admin" | "merchant";
};

const roleCopy = {
  admin: {
    badge: "Ops Control",
    headline: "Merchant and provider intelligence",
    body: "Live visibility across routing, settlements, reconciliation, and operational risk.",
    metricA: "99.94%",
    metricALabel: "Success rate",
    metricB: "24/7",
    metricBLabel: "Monitoring",
  },
  merchant: {
    badge: "Live Payment Flow",
    headline: "Transaction visibility in motion",
    body: "Track collections, provider health, payout movement, and webhook updates in one place.",
    metricA: "8.2s",
    metricALabel: "Avg update time",
    metricB: "3 channels",
    metricBLabel: "Active routes",
  },
} as const;

export function GoldPayHeroScene({ role }: GoldPayHeroSceneProps) {
  const copy = roleCopy[role];

  return (
    <div className="relative h-[280px] overflow-hidden rounded-[28px] border border-stroke/80 bg-white/75 p-6 shadow-2 backdrop-blur-xl dark:border-dark-3/80 dark:bg-[#08111F]/80">
      <div className="absolute inset-0 goldpay-mesh opacity-90" />
      <div className="goldpay-orb animate-goldpay-pulse left-[-2rem] top-[-2rem] h-28 w-28 bg-brand-gold/20 dark:bg-brand-gold/15" />
      <div className="goldpay-orb animate-goldpay-drift bottom-[-1rem] right-[-1rem] h-32 w-32 bg-primary/15 dark:bg-primary/20" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="max-w-[18rem]">
          <span className="inline-flex rounded-full border border-brand-gold/40 bg-brand-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-dark-2 dark:text-yellow-light">
            {copy.badge}
          </span>
          <h3 className="mt-4 text-xl font-bold text-dark dark:text-white">
            {copy.headline}
          </h3>
          <p className="mt-2 text-sm leading-6 text-dark-4 dark:text-dark-6">
            {copy.body}
          </p>
        </div>

        <div className="absolute inset-y-0 right-0 hidden w-[52%] xl:block">
          <div className="absolute left-10 right-8 top-7 rounded-[24px] border border-stroke/80 bg-white/70 p-4 shadow-card backdrop-blur dark:border-dark-3/70 dark:bg-dark-2/60">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-dark-4 dark:text-dark-6">
                  GoldPay Signal
                </div>
                <div className="mt-1 text-sm font-semibold text-dark dark:text-white">
                  Stable payment activity
                </div>
              </div>
              <div className="rounded-full bg-brand-gold/15 px-2.5 py-1 text-xs font-semibold text-yellow-dark-2 dark:text-yellow-light">
                Healthy
              </div>
            </div>

            <svg
              viewBox="0 0 300 120"
              className="h-[120px] w-full"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M0 96C30 90 45 58 72 58C101 58 115 93 144 93C171 93 184 34 214 34C241 34 256 72 284 72C291 72 295 70 300 67"
                stroke="url(#goldpayLinePrimary)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M0 104C31 104 45 78 73 78C98 78 117 106 143 106C173 106 182 58 213 58C241 58 254 93 281 93C289 93 295 91 300 88"
                stroke="url(#goldpayLineSecondary)"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.95"
              />
              <defs>
                <linearGradient id="goldpayLinePrimary" x1="0" y1="0" x2="300" y2="0">
                  <stop stopColor="#183B6B" />
                  <stop offset="1" stopColor="#4A82BA" />
                </linearGradient>
                <linearGradient id="goldpayLineSecondary" x1="0" y1="0" x2="300" y2="0">
                  <stop stopColor="#D7A53B" />
                  <stop offset="1" stopColor="#F7D774" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="absolute bottom-7 left-12 right-10 grid grid-cols-2 gap-3">
            <div className="animate-goldpay-float rounded-2xl border border-stroke/80 bg-white/78 p-4 shadow-card backdrop-blur dark:border-dark-3/70 dark:bg-dark-2/72">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-dark-4 dark:text-dark-6">
                {copy.metricALabel}
              </div>
              <div className="mt-1 text-2xl font-bold text-dark dark:text-white">
                {copy.metricA}
              </div>
            </div>

            <div className="animate-goldpay-drift rounded-2xl border border-primary/20 bg-primary/10 p-4 shadow-card backdrop-blur dark:bg-primary/15">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                {copy.metricBLabel}
              </div>
              <div className="mt-1 text-2xl font-bold text-primary dark:text-white">
                {copy.metricB}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
