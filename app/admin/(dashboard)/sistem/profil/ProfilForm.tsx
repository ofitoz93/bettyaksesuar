"use client";

import { useActionState } from "react";
import { updateProfileSettings, type ActionState } from "@/app/admin/actions";
import type { CurrentProfile } from "@/lib/data/profile";

const initialState: ActionState = {};

export default function ProfilForm({ profile }: { profile: CurrentProfile }) {
  const [state, formAction, pending] = useActionState(updateProfileSettings, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <Field label="Kullanıcı Adı">
        <input
          name="username"
          defaultValue={profile.username ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <Field label="Ad Soyad">
        <input
          name="fullName"
          required
          defaultValue={profile.fullName ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <Field label="E-posta (giriş için kullanılır)">
        <input
          name="email"
          type="email"
          required
          defaultValue={profile.email}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <Field label="Telefon">
        <input
          name="phone"
          defaultValue={profile.phone ?? ""}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>
      <Field label="Yeni Parola (değiştirmek istemiyorsanız boş bırakın)">
        <input
          name="newPassword"
          type="password"
          minLength={6}
          className="w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      </Field>

      {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}
      {state !== initialState && !state.error && !pending && (
        <p className="text-xs text-status-green-fg">Kaydedildi.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit bg-ink px-8 py-3.5 text-xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">{label}</label>
      {children}
    </div>
  );
}
