"use client";

import { useEffect } from "react";

import { gqlRequest, UnauthorizedError } from "@/lib/graphql";
import type { SessionUser } from "@/lib/types";
import { useAuthStore } from "@/store/auth.store";

export function AuthBootstrap(): null {
  const setAuth = useAuthStore((state) => state.setAuth);
  const resetAuth = useAuthStore((state) => state.resetAuth);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession(): Promise<void> {
      try {
        const data = await gqlRequest<{ me: SessionUser | null }>(
          `query { me { id email role } }`
        );
        if (cancelled) return;
        if (data.me) {
          setAuth(data.me);
        } else {
          resetAuth();
        }
      } catch (error) {
        if (!cancelled) {
          if (!(error instanceof UnauthorizedError)) {
            resetAuth();
          }
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [resetAuth, setAuth, setHydrated]);

  return null;
}
