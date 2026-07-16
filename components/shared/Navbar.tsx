"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { Compass, LayoutDashboard, LogOut, Menu, User as UserIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

function getSessionUser(session: Session | null | undefined) {
  return session?.user ?? null;
}

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const user = getSessionUser(session);

  const menuItems = [
    { label: "Features", href: "/#features", publicOnly: true },
    { label: "Pricing", href: "/#pricing", publicOnly: true },
    { label: "FAQ", href: "/#faq", publicOnly: true },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const isDashboard = pathname.startsWith("/student") || pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md dark:border-slate-800">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
            <Compass className="h-5 w-5" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
            EduPilot AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map(
            (item) =>
              (!session || !item.publicOnly) && (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )
          )}
        </nav>

        {/* Right side buttons */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          {status === "loading" ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <Link href={user.role === "ADMIN" ? "/admin" : "/student"}>
                <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l dark:border-slate-800">
                {user.image || (user as any).avatar ? (
                  <img
                    src={user.image || (user as any).avatar}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full border bg-slate-100 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-primary/10 text-primary">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold leading-none max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {user.role?.toLowerCase()}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-background px-4 py-4 md:hidden dark:border-slate-800"
          >
            <div className="flex flex-col gap-4">
              {menuItems.map(
                (item) =>
                  (!session || !item.publicOnly) && (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  )
              )}

              {user ? (
                <div className="flex flex-col gap-3 pt-3 border-t dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    {user.image || (user as any).avatar ? (
                      <img
                        src={user.image || (user as any).avatar}
                        alt={user.name || "User"}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserIcon className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold">{user.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {user.role?.toLowerCase()}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={user.role === "ADMIN" ? "/admin" : "/student"}
                    onClick={() => setIsOpen(false)}
                    className="w-full"
                  >
                    <Button size="sm" variant="outline" className="w-full flex items-center justify-center gap-1.5">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t dark:border-slate-800">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="gradient" className="w-full">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
