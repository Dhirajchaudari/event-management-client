"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { ProfileDialog } from "@/components/auth/ProfileDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { gqlRequest } from "@/lib/graphql";
import { getInitials } from "@/lib/format";
import { getDashboardPathForRole } from "@/lib/auth-routing";
import { normalizeUserRole } from "@/lib/types";
import { useAuthStore } from "@/store/auth.store";
import { pushToast } from "@/store/toast.store";
import { PageLoader } from "@/components/layout/PageLoader";
import { BrandLogo } from "@/components/layout/BrandLogo";

interface AppShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, subtitle, actions, children }: AppShellProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthStore((state) => state.hydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const email = useAuthStore((state) => state.email);
  const role = useAuthStore((state) => state.role);
  const resetAuth = useAuthStore((state) => state.resetAuth);
  const activeRole = normalizeUserRole(role);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (activeRole === "attendee" && pathname.startsWith("/events")) {
      router.replace("/my-events");
      return;
    }

    if (activeRole !== "attendee" && pathname.startsWith("/my-events")) {
      router.replace("/events");
    }
  }, [hydrated, isAuthenticated, router, activeRole, pathname]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    if (window.location.hash !== "#insights") return;

    const target = document.getElementById("insights");
    if (!target) return;

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [pathname]);

  function openInsights(): void {
    const dashboardPath = getDashboardPathForRole(role);
    if (pathname === dashboardPath) {
      document.getElementById("insights")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    router.push(`${dashboardPath}#insights`);
  }

  async function handleLogout(): Promise<void> {
    try {
      await gqlRequest(`mutation { logout }`);
    } catch {
      // best-effort
    }
    resetAuth();
    pushToast("Signed out", "info");
    router.replace("/login");
  }

  if (!hydrated || !isAuthenticated) {
    return <PageLoader label="Preparing your workspace" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="noise-overlay absolute inset-0 opacity-[0.18]" />
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="secondary" className="gap-3 pl-2 pr-3">
                <Avatar className="h-8 w-8 rounded-xl">
                  <AvatarFallback>{getInitials(email.split("@")[0] ?? "U")}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[160px] truncate text-left sm:block">{email}</span>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-[220px] rounded-2xl border border-border/80 bg-surface p-2 shadow-2xl"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{email}</p>
                  <Badge variant={activeRole === "admin" ? "admin" : "muted"} className="mt-2">
                    {activeRole}
                  </Badge>
                </div>
                <Separator className="my-1" />
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted outline-none hover:bg-background hover:text-foreground"
                  onSelect={() => {
                    setProfileOpen(true);
                  }}
                >
                  <UserRound className="h-4 w-4" />
                  Profile
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted outline-none hover:bg-background hover:text-foreground"
                  onSelect={() => {
                    openInsights();
                  }}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Event insights
                </DropdownMenu.Item>
                <Separator className="my-1" />
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-danger outline-none hover:bg-danger/10"
                  onSelect={() => {
                    void handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      <main className="relative mx-auto max-w-[88rem] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Dashboard</p>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            {subtitle ? <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p> : null}
          </div>
          {actions}
        </div>
        {children}
      </main>

      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        email={email}
        role={activeRole}
      />
    </div>
  );
}
