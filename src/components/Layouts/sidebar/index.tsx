"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, isCollapsed, toggleSidebar } =
    useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));

    // Uncomment the following line to enable multiple expanded items
    // setExpandedItems((prev) =>
    //   prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    // );
  };

  useEffect(() => {
    // Keep collapsible open, when it's subpage is active
    NAV_DATA.some((section) => {
      return section.items.some((item) => {
        return item.items.some((subItem) => {
          if (subItem.url === pathname) {
            if (!expandedItems.includes(item.title)) {
              toggleExpanded(item.title);
            }

            // Break the loop
            return true;
          }
        });
      });
    });
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "overflow-hidden border-r border-white/70 bg-white/55 backdrop-blur-xl transition-[width] duration-200 ease-linear dark:border-dark-3/80 dark:bg-[#08111F]/80",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isMobile
            ? isOpen
              ? "w-[290px]"
              : "w-0"
            : isCollapsed
              ? "w-[96px]"
              : "w-[290px]",
        )}
        aria-label="Main navigation"
        aria-hidden={isMobile ? !isOpen : false}
        inert={isMobile ? !isOpen : false}
      >
        <div className="flex h-full flex-col px-4 py-6">
          <div
            className={cn(
              "rounded-[26px] border border-white/80 bg-white/80 py-4 shadow-card dark:border-dark-3 dark:bg-dark/80",
              isCollapsed
                ? "flex flex-col items-center gap-3 px-2"
                : "relative px-4",
            )}
          >
            <Link
              href={"/"}
              onClick={() => isMobile && toggleSidebar()}
              className={cn(
                "block px-0 py-2.5 min-[850px]:py-0",
                isCollapsed && "flex justify-center",
              )}
            >
              <Logo compact={isMobile} collapsed={!isMobile && isCollapsed} />
            </Link>

            <button
              onClick={toggleSidebar}
              className={cn(
                "merchant-icon-button size-9 text-right",
                !isCollapsed &&
                  "absolute right-3 top-1/2 -translate-y-1/2",
              )}
            >
              <span className="sr-only">
                {isMobile
                  ? "Close Menu"
                  : isCollapsed
                    ? "Expand sidebar"
                    : "Collapse sidebar"}
              </span>

              <ArrowLeftIcon
                className={cn(
                  "ml-auto size-5 transition-transform",
                  isCollapsed && !isMobile && "rotate-180",
                )}
              />
            </button>
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-1 min-[850px]:mt-8">
            {NAV_DATA.map((section) => (
              <div key={section.label} className="mb-6">
                {!isCollapsed && (
                  <h2 className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8A7A61] dark:text-dark-6">
                    {section.label}
                  </h2>
                )}

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.title}>
                        {item.items.length > 1 ? (
                          <div>
                            <MenuItem
                              isActive={item.items.some(
                                ({ url }) => url === pathname,
                              )}
                              onClick={() => toggleExpanded(item.title)}
                              title={item.title}
                              className={cn(isCollapsed && "justify-center px-0")}
                            >
                              <item.icon
                                className="size-5 shrink-0"
                                aria-hidden="true"
                              />

                              {!isCollapsed && <span>{item.title}</span>}

                              {!isCollapsed && (
                                <ChevronUp
                                  className={cn(
                                    "ml-auto rotate-180 transition-transform duration-200",
                                    expandedItems.includes(item.title) &&
                                      "rotate-0",
                                  )}
                                  aria-hidden="true"
                                />
                              )}
                            </MenuItem>

                            {!isCollapsed && expandedItems.includes(item.title) && (
                              <ul
                                className="ml-4 mr-0 space-y-1.5 pb-3 pl-6 pr-0 pt-2"
                                role="menu"
                              >
                                {item.items.map((subItem) => (
                                  <li key={subItem.title} role="none">
                                    <MenuItem
                                      as="link"
                                      href={subItem.url}
                                      isActive={pathname === subItem.url}
                                      className="py-2 text-[13px]"
                                      title={subItem.title}
                                    >
                                      <span>{subItem.title}</span>
                                    </MenuItem>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          (() => {
                            const href =
                              item.items.length === 1
                                ? item.items[0].url
                                : "url" in item
                                ? item.url + ""
                                : "/" +
                                  item.title.toLowerCase().split(" ").join("-");

                            return (
                              <MenuItem
                                className={cn(
                                  "flex items-center gap-3 py-3",
                                  isCollapsed && "justify-center px-0",
                                )}
                                as="link"
                                href={href}
                                isActive={pathname === href}
                                title={item.title}
                              >
                                <item.icon
                                  className="size-5 shrink-0"
                                  aria-hidden="true"
                                />

                                {!isCollapsed && <span>{item.title}</span>}
                              </MenuItem>
                            );
                          })()
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
