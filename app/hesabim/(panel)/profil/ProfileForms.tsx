"use client";

import { useActionState, useState } from "react";
import {
  changeMyEmail,
  changeMyPassword,
  updateMyProfile,
  type AccountFormState,
} from "@/app/hesabim/actions";

const initialState: AccountFormState = {};
const inputClass =
  "w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink";

export default function ProfileForms({
  fullName,
  phone,
  email,
}: {
  fullName: string;
  phone: string;
  email: string;
}) {
  return (
    <div className="flex flex-col divide-y divide-line border border-line bg-white">
      <PersonalInfoSection fullName={fullName} phone={phone} />
      <EmailSection email={email} />
      <PasswordSection />
    </div>
  );
}

// Medusa'daki gibi: her bölüm kapalıyken mevcut değeri gösterir, "Düzenle" ile açılır
function Section({
  title,
  summary,
  children,
  open,
  onToggle,
}: {
  title: string;
  summary: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.14em] text-ink-soft uppercase">{title}</div>
          {!open && <div className="mt-1 text-sm break-words">{summary}</div>}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 text-xs text-ink-soft underline hover:text-ink"
        >
          {open ? "Vazgeç" : "Düzenle"}
        </button>
      </div>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function FormMessage({ state }: { state: AccountFormState }) {
  if (state.error) return <p className="text-xs text-status-red-fg">{state.error}</p>;
  if (state.success) return <p className="text-xs text-status-green-fg">{state.success}</p>;
  return null;
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-ink px-6 py-2.5 text-xs font-medium tracking-[0.12em] text-ivory uppercase hover:bg-gold-deep disabled:opacity-50"
    >
      {pending ? "Kaydediliyor..." : label}
    </button>
  );
}

function PersonalInfoSection({ fullName, phone }: { fullName: string; phone: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (prev: AccountFormState, formData: FormData) => {
      const result = await updateMyProfile(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    initialState,
  );

  return (
    <Section
      title="Ad Soyad ve Telefon"
      open={open}
      onToggle={() => setOpen((v) => !v)}
      summary={
        <>
          {fullName || <span className="text-ink-faint">Ad soyad eklenmemiş</span>}
          <span className="mx-2 text-ink-faint">·</span>
          {phone || <span className="text-ink-faint">Telefon eklenmemiş</span>}
          {state.success && (
            <span className="ml-3 text-xs text-status-green-fg">{state.success}</span>
          )}
        </>
      }
    >
      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Ad Soyad</label>
            <input name="fullName" required defaultValue={fullName} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Telefon</label>
            <input
              name="phone"
              type="tel"
              defaultValue={phone}
              placeholder="05xx xxx xx xx"
              className={inputClass}
            />
          </div>
        </div>
        <FormMessage state={state} />
        <div>
          <SubmitButton pending={pending} label="Kaydet" />
        </div>
      </form>
    </Section>
  );
}

function EmailSection({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(changeMyEmail, initialState);

  return (
    <Section title="E-posta" open={open} onToggle={() => setOpen((v) => !v)} summary={email}>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Yeni e-posta adresi</label>
          <input name="email" type="email" required defaultValue={email} className={inputClass} />
          <p className="mt-1.5 text-[11px] text-ink-faint">
            Güvenliğiniz için yeni adresinize bir onay bağlantısı gönderilir. Bağlantıya
            tıklayana kadar mevcut adresiniz geçerli kalır.
          </p>
        </div>
        <FormMessage state={state} />
        <div>
          <SubmitButton pending={pending} label="Onay Bağlantısı Gönder" />
        </div>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (prev: AccountFormState, formData: FormData) => {
      const result = await changeMyPassword(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    initialState,
  );

  return (
    <Section
      title="Şifre"
      open={open}
      onToggle={() => setOpen((v) => !v)}
      summary={
        <>
          <span className="tracking-[0.3em]">••••••••</span>
          {state.success && (
            <span className="ml-3 text-xs text-status-green-fg">{state.success}</span>
          )}
        </>
      }
    >
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Mevcut şifre</label>
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Yeni şifre</label>
            <input
              name="newPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">
              Yeni şifre (tekrar)
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
        </div>
        <FormMessage state={state} />
        <div>
          <SubmitButton pending={pending} label="Şifreyi Değiştir" />
        </div>
      </form>
    </Section>
  );
}
