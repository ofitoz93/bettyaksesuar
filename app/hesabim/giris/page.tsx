"use client";

import Link from "next/link";
import { useActionState } from "react";
import { customerLogin, type AuthState } from "@/app/hesabim/actions";

const initialState: AuthState = {};

export default function GirisPage() {
  const [state, formAction, pending] = useActionState(customerLogin, initialState);

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-8 text-center">
        <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
          HESABIM
        </div>
        <h1 className="font-display mt-2.5 text-[28px]">Giriş Yap</h1>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">E-posta</label>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Şifre</label>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
          />
        </div>

        {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
        >
          {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-soft">
        Hesabınız yok mu?{" "}
        <Link href="/hesabim/kayit" className="text-ink hover:text-gold-deep">
          Üye Olun
        </Link>
      </p>
    </div>
  );
}
