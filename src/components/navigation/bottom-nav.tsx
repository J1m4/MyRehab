"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, MessageSquare, Timer, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const role = (session.user as any)?.role;

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      label: "Timers",
      href: "/timers",
      icon: Timer,
    },
    {
      label: "Account",
      href: "/account",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 h-16 md:h-20 flex items-center justify-around px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
              isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <item.icon className={cn("h-5 w-5 md:h-6 md:w-6", isActive && "stroke-[2.5px]")} />
            <span className="text-[10px] md:text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
