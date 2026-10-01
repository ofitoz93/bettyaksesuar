"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AccountLink() {
  const [href, setHref] = useState("/hesabim/giris");

  useEffect(() => {
    let cancelled = false;
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!cancelled && user) setHref("/hesabim");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link href={href} aria-label="Hesabım">
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
      >
        <path d="M20 21c0-3.9-3.6-7-8-7s-8 3.1-8 7" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </Link>
  );
}
