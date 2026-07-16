"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  BookOpen, 
  Brain, 
  Compass, 
  LayoutDashboard, 
  User, 
  Menu, 
  X,
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navLinks = [
    { label: "Dashboard", href: "/student", icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "My Courses", href: "/student/courses", icon: <BookOpen className="h-5 w-5" /> },
    { label: "AI Tools", href: "/student/ai-tools", icon: <Brain className="h-5 w-5" /> },
    { label: "Bookmarks", href: "/student/courses?filter=bookmarked", icon: <Bookmark className="h-5 w-5" /> },
    { label: "My Profile", href: "/student/profile", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950/20">
      {/* Mobile Sidebar Toggle */}
      <div className="fixed bottom-4 left-4 z-40 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-all"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Panel (Desktop & Mobile) */}
      <AnimatePresence>
        {(sidebarOpen || typeof window !== "undefined" && window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed inset-y-16 left-0 z-30 flex w-64 flex-col border-r bg-background/90 backdrop-blur-md px-4 py-6 dark:border-slate-800 md:sticky md:h-[calc(100vh-4rem)] md:z-10",
              sidebarOpen ? "block" : "hidden md:flex"
            )}
          >
            {/* Nav list */}
            <nav className="flex-1 space-y-1.5 text-left">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/student" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-foreground"
                    )}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Mini Widget */}
            {session?.user && (
              <div className="mt-auto border-t pt-4 dark:border-slate-800 flex items-center gap-3">
                {session.user.image || (session.user as any).avatar ? (
                  <img
                    src={session.user.image || (session.user as any).avatar}
                    alt={session.user.name || "User"}
                    className="h-10 w-10 rounded-full border bg-slate-50 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div className="flex flex-col text-left truncate">
                  <span className="text-sm font-bold truncate leading-none">{session.user.name}</span>
                  <span className="text-xs text-muted-foreground truncate mt-1">{session.user.email}</span>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="mx-auto max-w-5xl space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
