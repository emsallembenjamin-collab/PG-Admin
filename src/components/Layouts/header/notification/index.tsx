"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { goldpayApi, type AppNotification } from "@/lib/goldpay-api";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { BellIcon } from "./icons";

const categoryLabel: Record<string, string> = {
  system: "System",
  account: "Account",
  security: "Security",
  transaction: "Transaction",
  reconciliation: "Reconciliation",
  webhook: "Webhook",
};

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await goldpayApi.notifications.listAdmin({ limit: 20 });
      setItems(res.data);
      setUnreadCount(res.unreadCount);
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (notificationId: number) => {
    try {
      await goldpayApi.notifications.markReadAdmin(notificationId);
      setItems((current) =>
        current.map((item) =>
          item.id === notificationId
            ? { ...item, is_read: true, read_at: new Date().toISOString() }
            : item
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      // ignore and keep local state
    }
  };

  const markAllRead = async () => {
    try {
      await goldpayApi.notifications.markAllReadAdmin();
      setItems((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at ?? new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch {
      // ignore and keep local state
    }
  };

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
        if (open) {
          loadNotifications();
        }
      }}
    >
      <DropdownTrigger
        className="merchant-icon-button rounded-full"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-white dark:ring-dark-3",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="min-[350px]:min-w-[20rem] rounded-[24px] border border-white/80 bg-white/95 px-3.5 py-3 shadow-card-2 backdrop-blur-xl dark:border-dark-3 dark:bg-gray-dark"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
              {unreadCount} new
            </span>
          )}
        </div>

        <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
          {!loading && items.length === 0 && (
            <li className="rounded-[18px] px-2 py-3 text-sm text-dark-5 dark:text-dark-6">
              No notifications
            </li>
          )}
          {items.map((item) => (
            <li key={item.id} role="menuitem">
              <button
                type="button"
                onClick={() => markRead(item.id)}
                className={cn(
                  "flex w-full flex-col items-start gap-1 rounded-lg px-2 py-2 text-left outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3",
                  !item.is_read && "bg-blue-light-5/40 dark:bg-dark-2"
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <strong className="block text-sm font-medium text-dark dark:text-white">
                    {item.title}
                  </strong>
                  <span className="text-[10px] uppercase tracking-wide text-primary">
                    {categoryLabel[item.category] ?? item.category}
                  </span>
                </div>
                <span className="text-sm font-medium text-dark-5 dark:text-dark-6">
                  {item.message}
                </span>
                <span className="text-xs text-dark-4 dark:text-dark-6">
                  {formatTimestamp(item.created_at)}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => {
            markAllRead();
            setIsOpen(false);
          }}
          className="block rounded-full border border-primary/20 bg-white p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
        >
          Mark all as read
        </button>
      </DropdownContent>
    </Dropdown>
  );
}
