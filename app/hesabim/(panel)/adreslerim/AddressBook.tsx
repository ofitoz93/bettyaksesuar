"use client";

import { useActionState, useState, useTransition } from "react";
import {
  deleteMyAddress,
  saveMyAddress,
  setMyDefaultAddress,
  type AccountFormState,
} from "@/app/hesabim/actions";
import type { CustomerAddress } from "@/lib/data/addresses";
import TurkeyAddressFields from "@/components/address/TurkeyAddressFields";

const initialState: AccountFormState = {};
const inputClass =
  "w-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-ink";

export default function AddressBook({
  addresses,
  defaultFullName,
  defaultPhone,
}: {
  addresses: CustomerAddress[];
  defaultFullName: string;
  defaultPhone: string;
}) {
  // null: form kapalı, "new": yeni adres, aksi halde düzenlenen adresin id'si
  const [editing, setEditing] = useState<string | null>(null);
  const editingAddress = addresses.find((a) => a.id === editing) ?? null;

  if (editing) {
    return (
      <AddressForm
        key={editing}
        address={editingAddress}
        defaultFullName={defaultFullName}
        defaultPhone={defaultPhone}
        isFirst={addresses.length === 0}
        onDone={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <button
        type="button"
        onClick={() => setEditing("new")}
        className="flex min-h-[180px] flex-col items-center justify-center gap-2 border border-dashed border-line bg-white text-sm text-ink-soft hover:border-ink hover:text-ink"
      >
        <span className="text-2xl leading-none">+</span>
        Yeni Adres Ekle
      </button>

      {addresses.map((address) => (
        <AddressCard key={address.id} address={address} onEdit={() => setEditing(address.id)} />
      ))}
    </div>
  );
}

function AddressCard({ address, onEdit }: { address: CustomerAddress; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!confirm(`"${address.title}" adresini silmek istediğinize emin misiniz?`)) return;
    startTransition(async () => {
      const result = await deleteMyAddress(address.id);
      if (result.error) setError(result.error);
    });
  };

  const handleSetDefault = () => {
    startTransition(async () => {
      const result = await setMyDefaultAddress(address.id);
      if (result.error) setError(result.error);
    });
  };

  return (
    <div
      className={`flex min-h-[180px] flex-col border bg-white p-5 ${
        address.isDefault ? "border-gold-deep" : "border-line"
      } ${pending ? "opacity-50" : ""}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="text-sm font-medium">{address.title}</div>
        {address.isDefault && (
          <span className="bg-gold-tint px-2 py-0.5 text-[10px] tracking-wide text-gold-deep uppercase">
            Varsayılan
          </span>
        )}
      </div>
      <div className="flex-1 text-xs leading-relaxed text-ink-soft">
        <div className="text-ink">{address.fullName}</div>
        <div>{address.addressLine}</div>
        <div>{address.neighbourhood}</div>
        <div>
          {address.district} / {address.city}
        </div>
        <div className="mt-1">{address.phone}</div>
      </div>
      {error && <p className="mt-2 text-xs text-status-red-fg">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-3 text-xs">
        <button type="button" onClick={onEdit} disabled={pending} className="text-ink hover:text-gold-deep">
          Düzenle
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="text-ink-soft hover:text-status-red-fg"
        >
          Sil
        </button>
        {!address.isDefault && (
          <button
            type="button"
            onClick={handleSetDefault}
            disabled={pending}
            className="text-ink-soft hover:text-ink sm:ml-auto"
          >
            Varsayılan yap
          </button>
        )}
      </div>
    </div>
  );
}

function AddressForm({
  address,
  defaultFullName,
  defaultPhone,
  isFirst,
  onDone,
}: {
  address: CustomerAddress | null;
  defaultFullName: string;
  defaultPhone: string;
  isFirst: boolean;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: AccountFormState, formData: FormData) => {
      const result = await saveMyAddress(address?.id ?? null, prev, formData);
      if (result.success) onDone();
      return result;
    },
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5 border border-line bg-white p-5 sm:p-6">
      <div className="text-sm font-medium">{address ? "Adresi Düzenle" : "Yeni Adres"}</div>

      <div>
        <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Adres Başlığı</label>
        <input
          name="title"
          required
          defaultValue={address?.title ?? ""}
          placeholder="Örn: Ev, İş"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Ad Soyad</label>
          <input
            name="fullName"
            required
            defaultValue={address?.fullName ?? defaultFullName}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Telefon</label>
          <input
            name="phone"
            type="tel"
            required
            defaultValue={address?.phone ?? defaultPhone}
            className={inputClass}
          />
        </div>
      </div>

      <TurkeyAddressFields
        initialCity={address?.city}
        initialDistrict={address?.district}
        initialNeighbourhood={address?.neighbourhood}
      />

      <div>
        <label className="mb-1.5 block text-xs tracking-wide text-ink-soft">Adres</label>
        <textarea
          name="addressLine"
          required
          rows={3}
          defaultValue={address?.addressLine ?? ""}
          placeholder="Cadde/sokak, bina no, daire no, posta kodu"
          className={inputClass}
        />
      </div>

      {!isFirst && !address?.isDefault && (
        <label className="flex items-center gap-2.5 text-xs text-ink-soft">
          <input type="checkbox" name="isDefault" className="h-4 w-4" />
          Varsayılan adresim olarak ayarla
        </label>
      )}

      {state.error && <p className="text-xs text-status-red-fg">{state.error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-6 py-2.5 text-xs font-medium tracking-[0.12em] text-ivory uppercase hover:bg-gold-deep disabled:opacity-50"
        >
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-xs tracking-wide text-ink-soft uppercase hover:text-ink"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}
