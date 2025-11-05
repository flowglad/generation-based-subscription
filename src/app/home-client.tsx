'use client';

import { Button } from '@/components/ui/button';

export function HomeClient() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-foreground">
            Next.js Starter
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            A starter template with BetterAuth and Flowglad
          </p>
        </div>
      </main>
    </div>
  );
}


