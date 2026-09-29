import { Suspense } from "react";
import KayitForm from "./KayitForm";

export default function KayitPage() {
  return (
    <Suspense fallback={null}>
      <KayitForm />
    </Suspense>
  );
}
