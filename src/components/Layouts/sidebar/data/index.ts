import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "GOLDPAY",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [{ title: "Overview", url: "/" }],
      },
      {
        title: "Merchants",
        icon: Icons.User,
        items: [{ title: "Merchants", url: "/merchants" }],
      },
      {
        title: "Providers",
        icon: Icons.FourCircle,
        items: [{ title: "Providers", url: "/providers" }],
      },
      {
        title: "Currencies",
        icon: Icons.Alphabet,
        items: [{ title: "Currencies", url: "/currencies" }],
      },
      {
        title: "Transactions",
        icon: Icons.Table,
        items: [{ title: "Transactions", url: "/transactions" }],
      },
      {
        title: "History",
        icon: Icons.Calendar,
        items: [{ title: "Transaction History", url: "/history" }],
      },
      {
        title: "Reconciliation",
        icon: Icons.PieChart,
        items: [{ title: "Reconciliation", url: "/reconciliation" }],
      },
      {
        title: "Settings",
        icon: Icons.User,
        items: [{ title: "Settings", url: "/pages/settings" }],
      },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      {
        title: "Authentication",
        icon: Icons.Authentication,
        items: [{ title: "Sign In", url: "/auth/sign-in" }],
      },
    ],
  },
];
