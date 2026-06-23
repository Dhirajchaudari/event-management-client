"use client";

import { ArrowLeft, KeyRound, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { LoginHero } from "@/components/auth/LoginHero";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { PageLoader } from "@/components/layout/PageLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getDashboardPathForRole,
  getPortalLabel,
  getRegisterRoleForPortal,
  roleMatchesPortal,
  type LoginPortal
} from "@/lib/auth-routing";
import { gqlRequest, UnauthorizedError } from "@/lib/graphql";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { pushToast } from "@/store/toast.store";

const PORTALS: LoginPortal[] = ["organizer", "attendee", "admin"];

type AuthMode = "login" | "register" | "reset-password";

const PORTAL_COPY: Record<
  LoginPortal,
  { title: string; subtitle: string; showRegister: boolean }
> = {
  organizer: {
    title: "Organizer sign in",
    subtitle: "Submit events for admin approval and manage your submitted lineup.",
    showRegister: true
  },
  attendee: {
    title: "Attendee sign in",
    subtitle: "Access the sessions you registered for and track your schedule.",
    showRegister: true
  },
  admin: {
    title: "Admin sign in",
    subtitle: "Review submissions, approve events, and manage the full catalog.",
    showRegister: false
  }
};

const MODE_META: Record<
  AuthMode,
  { eyebrow: string; title: string; subtitle: string; icon: typeof LogIn }
> = {
  login: {
    eyebrow: "Welcome back",
    title: "Sign in to continue",
    subtitle: "Choose your portal and enter your credentials.",
    icon: LogIn
  },
  register: {
    eyebrow: "Get started",
    title: "Create your account",
    subtitle: "Set up access in under a minute.",
    icon: UserPlus
  },
  "reset-password": {
    eyebrow: "Account security",
    title: "Update your password",
    subtitle: "Enter your current password, then choose a new one.",
    icon: KeyRound
  }
};

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [portal, setPortal] = useState<LoginPortal>("organizer");
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const portalCopy = PORTAL_COPY[portal];
  const modeMeta = MODE_META[mode];
  const ModeIcon = modeMeta.icon;

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      const role = useAuthStore.getState().role;
      router.replace(getDashboardPathForRole(role));
    }
  }, [hydrated, isAuthenticated, router]);

  function resetPasswordFields(): void {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function switchMode(next: AuthMode): void {
    setMode(next);
    if (next !== "reset-password") {
      resetPasswordFields();
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await gqlRequest<{ loginWithPassword: SessionUser }>(
        `mutation Login($input: LoginInput!) {
          loginWithPassword(input: $input) { id email role }
        }`,
        { input: { email, password } }
      );

      if (!roleMatchesPortal(data.loginWithPassword.role, portal)) {
        pushToast(`This account is not an ${getPortalLabel(portal).toLowerCase()} account`, "error");
        return;
      }

      setAuth(data.loginWithPassword);
      pushToast("Welcome back", "success");
      router.replace(getDashboardPathForRole(data.loginWithPassword.role));
    } catch (error) {
      if (error instanceof UnauthorizedError) return;
      pushToast(error instanceof Error ? error.message : "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const registerRole = getRegisterRoleForPortal(portal);
    if (!registerRole) return;

    setLoading(true);
    try {
      const data = await gqlRequest<{ register: SessionUser }>(
        `mutation Register($input: RegisterInput!) {
          register(input: $input) { id email role }
        }`,
        { input: { email, password, role: registerRole } }
      );

      setAuth(data.register);
      pushToast("Account created", "success");
      router.replace(getDashboardPathForRole(data.register.role));
    } catch (error) {
      if (error instanceof UnauthorizedError) return;
      pushToast(error instanceof Error ? error.message : "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      pushToast("New passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      await gqlRequest<{ changePassword: boolean }>(
        `mutation ChangePassword($input: ChangePasswordInput!) {
          changePassword(input: $input)
        }`,
        {
          input: {
            email,
            currentPassword,
            newPassword
          }
        }
      );

      pushToast("Password updated. You can sign in now.", "success");
      setPassword("");
      resetPasswordFields();
      switchMode("login");
    } catch (error) {
      if (error instanceof UnauthorizedError) return;
      pushToast(error instanceof Error ? error.message : "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) {
    return <PageLoader label="Checking session" />;
  }

  if (isAuthenticated) {
    return <PageLoader label="Redirecting" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        <LoginHero />

        <section className="relative flex min-h-screen flex-col">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(94,234,212,0.08),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(232,165,75,0.08),transparent_30%)]" />
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.12]" />

          <div className="relative flex flex-1 flex-col px-6 py-8 sm:px-10 lg:px-12 xl:px-16">
            <div className="mb-8 lg:hidden">
              <BrandLogo />
            </div>

            <div className="flex flex-1 items-center justify-center py-6">
              <div className="w-full max-w-lg">
                <div className="rounded-[2rem] border border-border/70 bg-surface/75 p-7 shadow-[0_28px_80px_-36px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-8">
                  {mode === "reset-password" ? (
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="mb-5 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to sign in
                    </button>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-border/70 bg-background/50 p-1.5">
                      {PORTALS.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setPortal(item);
                            switchMode("login");
                          }}
                          className={cn(
                            "rounded-xl px-2 py-2.5 text-xs font-medium transition sm:text-sm",
                            portal === item
                              ? "bg-accent text-accent-foreground shadow-sm"
                              : "text-muted hover:bg-background/80 hover:text-foreground"
                          )}
                        >
                          {getPortalLabel(item)}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
                      <ModeIcon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                        {modeMeta.eyebrow}
                      </p>
                      <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        {mode === "login" ? portalCopy.title : modeMeta.title}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {mode === "login" ? portalCopy.subtitle : modeMeta.subtitle}
                      </p>
                    </div>
                  </div>

                  {mode !== "reset-password" && portalCopy.showRegister ? (
                    <div className="mt-6 flex rounded-xl border border-border/70 bg-background/40 p-1">
                      <button
                        type="button"
                        className={cn(
                          "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                          mode === "login"
                            ? "bg-surface text-foreground shadow-sm"
                            : "text-muted hover:text-foreground"
                        )}
                        onClick={() => switchMode("login")}
                      >
                        Sign in
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                          mode === "register"
                            ? "bg-surface text-foreground shadow-sm"
                            : "text-muted hover:text-foreground"
                        )}
                        onClick={() => switchMode("register")}
                      >
                        Create account
                      </button>
                    </div>
                  ) : null}

                  {mode === "login" ? (
                    <form className="mt-7 space-y-5" onSubmit={(event) => void handleLogin(event)}>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder={portal === "admin" ? "admin@orbitalops.net" : "you@clinic.org"}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <Label htmlFor="password">Password</Label>
                          <button
                            type="button"
                            onClick={() => switchMode("reset-password")}
                            className="text-xs font-medium text-accent transition hover:brightness-110"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? "Please wait..." : `Continue as ${getPortalLabel(portal).toLowerCase()}`}
                      </Button>
                    </form>
                  ) : null}

                  {mode === "register" ? (
                    <form className="mt-7 space-y-5" onSubmit={(event) => void handleRegister(event)}>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="you@clinic.org"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          autoComplete="new-password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading
                          ? "Please wait..."
                          : `Create ${getPortalLabel(portal).toLowerCase()} account`}
                      </Button>
                    </form>
                  ) : null}

                  {mode === "reset-password" ? (
                    <form
                      className="mt-7 space-y-5"
                      onSubmit={(event) => void handleResetPassword(event)}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="you@clinic.org"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          autoComplete="current-password"
                          value={currentPassword}
                          onChange={(event) => setCurrentPassword(event.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm new password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? "Updating..." : "Update password"}
                      </Button>
                    </form>
                  ) : null}
                </div>

                <p className="mt-6 text-center text-xs text-muted">
                  By continuing, you agree to use this workspace for event management and registration only.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
