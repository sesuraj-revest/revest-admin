/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
"use client";

import {
  Building2,
  Car,
  ChevronDown,
  Menu,
  Settings,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { auth } from "@/auth";
import { useAuthStore } from "@/core/lib/store";
import { cn } from "@/core/lib/utils";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  subItems?: { label: string; href: string }[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: "Products Management",
    icon: <Building2 className="w-5 h-5" />,
    href: "/products",
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  // if (!user) return null;

  const filteredItems = MENU_ITEMS;
  const toggleSubmenu = (label: string, item: MenuItem) => {
    if (item.href) {
      router.push(item.href);
    }
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  useEffect(() => {
    async () => {
      const session = await auth();
      setUser(session?.user);
    };
  }, []);
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-sidebar-border/30 bg-gradient-to-br from-sidebar-primary/20 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/70 bg-clip-text text-transparent">
            Vendor Hub
          </h1>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {filteredItems.map((item) => (
          <div key={item.label}>
            {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button
              onClick={() => toggleSubmenu(item.label, item)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                isActive(item.href)
                  ? "bg-gradient-to-r from-sidebar-primary/80 to-sidebar-primary/40 text-sidebar-primary-foreground shadow-lg shadow-primary/30 border border-sidebar-primary/50"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 border border-transparent hover:border-sidebar-border/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "transition-transform duration-300",
                    isActive(item.href) && "scale-110"
                  )}
                >
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
              {item.subItems && (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    expandedItems.includes(item.label) && "rotate-180"
                  )}
                />
              )}
            </button>

            {item.subItems && expandedItems.includes(item.label) && (
              <div className="ml-4 mt-2 space-y-1 border-l border-sidebar-border/40 pl-3 animate-in fade-in slide-in-from-left-2 duration-200">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      "block px-3 py-2 rounded-lg text-sm transition-all duration-200",
                      isActive(subItem.href)
                        ? "bg-sidebar-primary/30 text-sidebar-foreground font-medium border border-sidebar-primary/30"
                        : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                    )}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border/30 p-4">
        <Link
          href="/dashboard/profile"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
            isActive("/dashboard/profile")
              ? "bg-gradient-to-r from-sidebar-primary/80 to-sidebar-primary/40 text-sidebar-primary-foreground shadow-lg shadow-primary/30 border border-sidebar-primary/50"
              : "text-sidebar-foreground hover:bg-sidebar-accent/60 border border-transparent hover:border-sidebar-border/50"
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 w-72 h-screen border-r border-sidebar-border/30 bg-sidebar text-sidebar-foreground">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          {/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          <aside className="fixed left-0 top-0 w-64 h-screen border-r border-sidebar-border/30 bg-sidebar text-sidebar-foreground z-40 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
