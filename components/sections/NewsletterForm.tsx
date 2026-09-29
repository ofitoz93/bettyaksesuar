"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewsletterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/hesabim/kayit?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-7 flex border border-[#56503F]">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresiniz"
        className="flex-1 bg-transparent px-[18px] py-[15px] text-[13.5px] text-ivory outline-none placeholder:text-[#8A8471]"
      />
      <button
        type="submit"
        className="border-none bg-white px-[26px] py-[15px] text-xs font-medium tracking-[0.14em] text-ink uppercase transition-colors hover:bg-gold hover:text-white"
      >
        Abone Ol
      </button>
    </form>
  );
}
