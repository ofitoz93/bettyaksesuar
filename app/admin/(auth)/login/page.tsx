"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-display text-[27px] tracking-[0.28em]">
            VERASTONE
          </div>
          <div className="mt-0.5 text-[9px] tracking-[0.42em] text-gold-deep">
            YÖNETİM PANELİ
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
              E-posta
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
              Şifre
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </div>

          {state.error && (
            <p className="text-xs text-status-red-fg">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
          >
            {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </main>
  );
}
