type LogoProps = {
  compact?: boolean;
  collapsed?: boolean;
};

function LogoMark({
  size,
  collapsed = false,
}: {
  size: number;
  collapsed?: boolean;
}) {
  if (collapsed) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="goldpay-admin-compact" x1="8" y1="7" x2="30" y2="32">
            <stop stopColor="#F8D98A" />
            <stop offset="0.58" stopColor="#D7A53B" />
            <stop offset="1" stopColor="#9C6B12" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="13" fill="#151B2C" />
        <path
          d="M12.5 12.5V27.5M19.5 16.5V27.5M26.5 10.5V27.5"
          stroke="url(#goldpay-admin-compact)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M10.5 24.5L17 18L21 22L29.5 13.5"
          stroke="#FFF7E3"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldpay-admin-ring" x1="4" y1="4" x2="34" y2="36">
          <stop stopColor="#F7D774" />
          <stop offset="0.55" stopColor="#D7A53B" />
          <stop offset="1" stopColor="#9C6B12" />
        </linearGradient>
        <linearGradient id="goldpay-admin-pulse" x1="12" y1="10" x2="30" y2="28">
          <stop stopColor="#F9E7A9" />
          <stop offset="1" stopColor="#D7A53B" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="12" fill="#0F172A" />
      <path
        d="M19.5 9C13.1487 9 8 14.1487 8 20.5C8 26.8513 13.1487 32 19.5 32C23.2664 32 26.6097 30.1898 28.7045 27.3921"
        stroke="url(#goldpay-admin-ring)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M13 21H18L20.8 14L23.7 26L26 19.5H31"
        stroke="url(#goldpay-admin-pulse)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ compact = false, collapsed = false }: LogoProps) {
  return (
    <div
      className={`flex items-center gap-3 ${compact || collapsed ? "min-w-0" : "min-w-[190px]"}`}
      aria-label="GoldPay"
    >
      <LogoMark size={compact ? 34 : collapsed ? 36 : 40} collapsed={collapsed} />

      {!compact && !collapsed && (
        <div className="leading-none">
          <div className="text-[1.28rem] font-black tracking-[-0.045em]">
            <span className="bg-gradient-to-r from-[#F7D774] via-[#D7A53B] to-[#9C6B12] bg-clip-text text-transparent">
              Gold
            </span>
            <span className="text-slate-900 dark:text-white">Pay</span>
          </div>
          <div className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
            Admin Console
          </div>
        </div>
      )}
    </div>
  );
}
