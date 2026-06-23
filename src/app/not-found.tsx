import Link from "next/link";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo />
        </div>
      </header>

      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="font-display mt-3 text-3xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-3 text-sm text-muted">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button className="mt-8" asChild>
          <Link href="/">Go home</Link>
        </Button>
      </main>
    </div>
  );
}
