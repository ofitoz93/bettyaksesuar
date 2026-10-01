"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import NewsletterForm from "./NewsletterForm";

export default function Newsletter() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!cancelled && user) setLoggedIn(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loggedIn) {
    return null;
  }

  return (
    <section className="bg-ink px-8 py-20">
      <div className="mx-auto max-w-lg text-center">
        <h2 className="font-display text-[30px] text-ivory">
          Ailemize Katılın
        </h2>
        <p className="mt-3.5 text-[14.5px] leading-relaxed text-[#C9C2B4]">
          Yeni koleksiyonlardan ilk siz haberdar olun, üyelere özel %10
          indirim kazanın.
        </p>
        <NewsletterForm />
        <p className="mt-3.5 text-[10.5px] text-[#8A8471]">
          Abone olarak Gizlilik Politikamızı kabul etmiş olursunuz.
        </p>
      </div>
    </section>
  );
}
