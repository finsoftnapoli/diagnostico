"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/sign-out";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await signOut();
        router.push("/");
        router.refresh();
      }}
      className="inline-flex items-center gap-1 underline text-navy-soft disabled:opacity-60"
    >
      <LogOut className="size-3.5" aria-hidden /> {busy ? "Uscita…" : "Esci"}
    </button>
  );
}
