"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { LoginHero } from "@/components/auth/LoginHero";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { PageLoader } from "@/components/layout/PageLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gqlRequest, UnauthorizedError } from "@/lib/graphql";
import type { SessionUser } from "@/lib/types";
import { useAuthStore } from "@/store/auth.store";
import { pushToast } from "@/store/toast.store";

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace("/events");
    }
  }, [hydrated, isAuthenticated, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await gqlRequest<{ loginWithPassword: SessionUser }>(
        `mutation Login($input: LoginInput!) {
          loginWithPassword(input: $input) { id email role }
        }`,
        { input: { email, password } }
      );
      setAuth(data.loginWithPassword);
      pushToast("Welcome back", "success");
      router.replace("/events");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return;
      }
      const message = error instanceof Error ? error.message : "Login failed";
      pushToast(message, "error");
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
      <div className="grid min-h-screen lg:grid-cols-[48%_1fr]">
        <LoginHero />
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <BrandLogo />
            </div>
            <div className="rounded-[2rem] border border-border/70 bg-surface/60 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Sign in</p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-foreground">
                Enter your studio
              </h2>
              <p className="mt-2 text-sm text-muted">
                Use your admin credentials to manage the conference lineup.
              </p>

              <form className="mt-8 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@orbitalops.net"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                  {loading ? "Signing in..." : "Continue"}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
