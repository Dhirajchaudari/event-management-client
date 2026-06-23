"use client";

import { KeyRound, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { LoginFormPanel } from "@/components/auth/LoginFormPanel";
import { LoginHero } from "@/components/auth/LoginHero";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { PageLoader } from "@/components/layout/PageLoader";
import {
  getDashboardPathForRole,
  getPortalLabel,
  getRegisterRoleForPortal,
  roleMatchesPortal,
  type LoginPortal
} from "@/lib/auth-routing";
import { gqlRequest, UnauthorizedError } from "@/lib/graphql";
import type { SessionUser } from "@/lib/types";
import { useAuthStore } from "@/store/auth.store";
import { pushToast } from "@/store/toast.store";

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

function LoginAside({
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
}: {
  portal: LoginPortal;
  setPortal: (portal: LoginPortal) => void;
  mode: AuthMode;
  switchMode: (mode: AuthMode) => void;
  portalCopy: (typeof PORTAL_COPY)[LoginPortal];
  modeMeta: (typeof MODE_META)[AuthMode];
  ModeIcon: (typeof MODE_META)[AuthMode]["icon"];
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
}): React.JSX.Element {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal/25 bg-teal/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-teal">
        Secure access
      </div>

      <LoginFormPanel
        portal={portal}
        setPortal={setPortal}
        mode={mode}
        switchMode={switchMode}
        portalCopy={portalCopy}
        modeMeta={modeMeta}
        ModeIcon={ModeIcon}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        loading={loading}
        onLogin={onLogin}
        onRegister={onRegister}
        onResetPassword={onResetPassword}
        idPrefix={idPrefix}
      />

      <p className="mt-5 text-center text-xs leading-relaxed text-muted/90">
        By continuing, you agree to use this workspace for event management and registration only.
      </p>
    </div>
  );
}

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

  const formProps = {
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
    loading
  };

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

        <section className="relative hidden min-h-screen overflow-hidden lg:flex lg:items-center lg:justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(94,234,212,0.1),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(232,165,75,0.1),transparent_34%),linear-gradient(165deg,#0b0b12_0%,#11111b_48%,#0d0d14_100%)]" />
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.22]" />
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-border/80 to-transparent" />

          <div className="relative flex w-full items-center justify-center px-10 py-16 xl:px-14">
            <LoginAside
              {...formProps}
              onLogin={(event) => void handleLogin(event)}
              onRegister={(event) => void handleRegister(event)}
              onResetPassword={(event) => void handleResetPassword(event)}
            />
          </div>

          <p className="absolute bottom-10 left-1/2 w-full max-w-md -translate-x-1/2 px-6 text-center text-xs uppercase tracking-[0.24em] text-muted/80 xl:bottom-14">
            Secure sign-in · Onference Event Studio
          </p>
        </section>

        <section className="relative flex min-h-screen flex-col lg:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(94,234,212,0.1),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(232,165,75,0.1),transparent_34%),linear-gradient(165deg,#0b0b12_0%,#11111b_48%,#0d0d14_100%)]" />
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.22]" />

          <div className="relative flex min-h-screen flex-col items-center justify-center p-6 sm:p-10">
            <div className="absolute left-6 top-8 sm:left-10 sm:top-10">
              <BrandLogo />
            </div>
            <div className="w-full py-8">
              <LoginAside
                {...formProps}
                idPrefix="mobile-"
                onLogin={(event) => void handleLogin(event)}
                onRegister={(event) => void handleRegister(event)}
                onResetPassword={(event) => void handleResetPassword(event)}
              />
            </div>
            <p className="absolute bottom-8 left-1/2 w-full max-w-md -translate-x-1/2 px-6 text-center text-xs uppercase tracking-[0.24em] text-muted/80 sm:bottom-10">
              Secure sign-in · Onference Event Studio
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
