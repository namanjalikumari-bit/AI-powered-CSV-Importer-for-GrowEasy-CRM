"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav } from "./sidebar-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        <div className="sticky top-0 h-screen">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-6">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />
          <ThemeToggle />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
