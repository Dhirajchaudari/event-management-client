"use client";

import { ArrowLeft, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPortalLabel, type LoginPortal } from "@/lib/auth-routing";
import { cn } from "@/lib/utils";

const PORTALS: LoginPortal[] = ["organizer", "attendee", "admin"];

type AuthMode = "login" | "register" | "reset-password";

interface PortalCopy {
  title: string;
  subtitle: string;
  showRegister: boolean;
}

interface ModeMeta {
  eyebrow: string;
  title: string;
  subtitle: string;
}

interface LoginFormPanelProps {
  portal: LoginPortal;
  setPortal: (portal: LoginPortal) => void;
  mode: AuthMode;
  switchMode: (mode: AuthMode) => void;
  portalCopy: PortalCopy;
  modeMeta: ModeMeta;
  ModeIcon: LucideIcon;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  loading: boolean;
  onLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  onRegister: (event: React.FormEvent<HTMLFormElement>) => void;
  onResetPassword: (event: React.FormEvent<HTMLFormElement>) => void;
  idPrefix?: string;
}

export function LoginFormPanel({
  portal,
  setPortal,
  mode,
  switchMode,
  portalCopy,
  modeMeta,
  ModeIcon,
  email,
  setEmail,
  password,
  setPassword,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  onLogin,
  onRegister,
  onResetPassword,
  idPrefix = ""
}: LoginFormPanelProps): React.JSX.Element {
  const fieldId = (name: string): string => `${idPrefix}${name}`;

  return (
    <div className="rounded-2xl border border-border/50 bg-background/20 p-6 backdrop-blur-sm sm:p-8">
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
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-border/50 bg-background/30 p-1.5">
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
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{modeMeta.eyebrow}</p>
          <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
            {mode === "login" ? portalCopy.title : modeMeta.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {mode === "login" ? portalCopy.subtitle : modeMeta.subtitle}
          </p>
        </div>
      </div>

      {mode !== "reset-password" && portalCopy.showRegister ? (
        <div className="mt-6 flex rounded-xl border border-border/50 bg-background/30 p-1">
          <button
            type="button"
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
              mode === "login"
                ? "bg-surface/80 text-foreground shadow-sm"
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
                ? "bg-surface/80 text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            )}
            onClick={() => switchMode("register")}
          >
            Create account
          </button>
        </div>
      ) : null}

      {mode === "login" ? (
        <form className="mt-7 space-y-5" onSubmit={onLogin}>
          <div className="space-y-2">
            <Label htmlFor={fieldId("email")}>Email</Label>
            <Input
              id={fieldId("email")}
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
              <Label htmlFor={fieldId("password")}>Password</Label>
              <button
                type="button"
                onClick={() => switchMode("reset-password")}
                className="text-xs font-medium text-accent transition hover:brightness-110"
              >
                Forgot password?
              </button>
            </div>
            <Input
              id={fieldId("password")}
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
        <form className="mt-7 space-y-5" onSubmit={onRegister}>
          <div className="space-y-2">
            <Label htmlFor={fieldId("register-email")}>Email</Label>
            <Input
              id={fieldId("register-email")}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@clinic.org"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={fieldId("register-password")}>Password</Label>
            <Input
              id={fieldId("register-password")}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Please wait..." : `Create ${getPortalLabel(portal).toLowerCase()} account`}
          </Button>
        </form>
      ) : null}

      {mode === "reset-password" ? (
        <form className="mt-7 space-y-5" onSubmit={onResetPassword}>
          <div className="space-y-2">
            <Label htmlFor={fieldId("reset-email")}>Email</Label>
            <Input
              id={fieldId("reset-email")}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@clinic.org"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={fieldId("current-password")}>Current password</Label>
            <Input
              id={fieldId("current-password")}
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={fieldId("new-password")}>New password</Label>
            <Input
              id={fieldId("new-password")}
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={fieldId("confirm-password")}>Confirm new password</Label>
            <Input
              id={fieldId("confirm-password")}
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
  );
}
