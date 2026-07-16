"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  FolderTree, 
  FileText, 
  Menu, 
  X,
  Settings,
  HelpCircle,
  Award,
  Sparkles,
  Layers,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const user = session?.user ?? null;

  const adminLinks = [
    { label: "Dashboard", href: "/admin", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Courses", href: "/admin/courses", icon: <BookOpen className="h-5 w-5" /> },
    { label: "Categories", href: "/admin/categories", icon: <FolderTree className="h-5 w-5" /> },
    { label: "Lessons", href: "/admin/lessons", icon: <Video className="h-5 w-5" /> },
    { label: "Quizzes", href: "/admin/quizzes", icon: <HelpCircle className="h-5 w-5" /> },
    { label: "Assignments", href: "/admin/assignments", icon: <FileText className="h-5 w-5" /> },
    { label: "Students", href: "/admin/students", icon: <Users className="h-5 w-5" /> },
    { label: "Enrollments", href: "/admin/enrollments", icon: <Layers className="h-5 w-5" /> },
    { label: "Certificates", href: "/admin/certificates", icon: <Award className="h-5 w-5" /> },
    { label: "AI Tools", href: "/admin/ai-tools", icon: <Sparkles className="h-5 w-5" /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950/20">
      {/* Mobile Sidebar Toggle Button */}
      <div className="fixed bottom-4 left-4 z-40 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-all"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Panel (Conditionally rendered, animated, client-only) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-black md:hidden"
            />
            
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-16 left-0 z-30 flex w-64 flex-col border-r bg-background/90 backdrop-blur-md px-4 py-6 dark:border-slate-800 md:hidden"
            >
              <nav className="flex-1 space-y-1.5 text-left overflow-y-auto pr-1 scrollbar-thin">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-4 mb-2 block">
                  Control deck
                </span>
                {adminLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary dark:bg-primary/25"
                          : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-foreground"
                      )}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Profile display */}
              {user && (
                <div className="mt-auto border-t pt-4 dark:border-slate-800 flex items-center gap-3 shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0">
                    A
                  </div>
                  <div className="flex flex-col text-left truncate">
                    <span className="text-sm font-bold truncate leading-none">{user.name}</span>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1.5">
                      {user.role || "ADMIN"}
                    </span>
                  </div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Panel (Unconditionally rendered, hidden on mobile via CSS) */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background/90 backdrop-blur-md px-4 py-6 dark:border-slate-800 sticky h-[calc(100vh-4rem)] top-16 z-10">
        <nav className="flex-1 space-y-1.5 text-left overflow-y-auto pr-1 scrollbar-thin">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-4 mb-2 block">
            Control deck
          </span>
          {adminLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/25"
                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-foreground"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Profile display */}
        {session?.user && (
          <div className="mt-auto border-t pt-4 dark:border-slate-800 flex items-center gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0">
              A
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="text-sm font-bold truncate leading-none">{user.name}</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1.5">
                {user.role || "ADMIN"}
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="mx-auto max-w-5xl space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
