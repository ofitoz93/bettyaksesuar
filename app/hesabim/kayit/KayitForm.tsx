"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { customerRegister, type AuthState } from "@/app/hesabim/actions";

const initialState: AuthState = {};

export default function KayitForm() {
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") ?? "";
  const [state, formAction, pending] = useActionState(customerRegister, initialState);

  if (state.info) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <div className="mb-3 text-2xl text-gold-deep">✓</div>
        <h1 className="font-display mb-3 text-2xl">Hemen Hemen Tamam</h1>
        <p className="text-sm text-ink-soft">{state.info}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-8 text-center">
        <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
          HESABIM
        </div>
        <h1 className="font-display mt-2.5 text-[28px]">Üye Ol</h1>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Ad Soyad</label>
          <input
            name="fullName"
            required
            autoComplete="name"
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">E-posta</label>
          <input
            type="email"
            name="email"
            required
            defaultValue={prefillEmail}
            autoComplete="email"
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Telefon (opsiyonel)</label>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Şifre</label>
          <input
            type="password"
            name="password"
            required
            autoComplete="new-password"
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Şifre (Tekrar)</label>
          <input
            type="password"
            name="passwordConfirm"
            required
            autoComplete="new-password"
            className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
          />
        </div>

        {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
        >
          {pending ? "Kaydediliyor..." : "Üye Ol"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-soft">
        Zaten hesabınız var mı?{" "}
        <Link href="/hesabim/giris" className="text-ink hover:text-gold-deep">
          Giriş Yapın
        </Link>
      </p>
    </div>
  );
}
