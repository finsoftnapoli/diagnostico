"use client";
// Menu dell'account nell'intestazione, solo per chi è collegato: email, area personale,
// area staff (se abilitato) ed "Esci".
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { signOut } from "@/lib/sign-out";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function AccountMenu() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [staff, setStaff] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = supabaseBrowser();
    const load = async (uid: string | undefined, mail: string | undefined) => {
      setEmail(mail ?? null);
      if (!uid) return setStaff(false);
      const { data } = await sb.from("staff").select("user_id").eq("user_id", uid).maybeSingle();
      setStaff(!!data);
    };
    void sb.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => load(data.session?.user.id, data.session?.user.email));
    const { data: sub } = sb.auth.onAuthStateChange((_e: AuthChangeEvent, s: Session | null) => void load(s?.user.id, s?.user.email));
    return () => sub.subscription.unsubscribe();
  }, []);

  // chiusura con clic fuori o Esc
  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", click);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", click);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  if (!email) return null;

  async function exit() {
    setBusy(true);
    await signOut();
    setOpen(false);
    setBusy(false);
    router.push("/");
    router.refresh();
  }

  const item = "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-paper";
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-muted hover:border-navy-soft hover:text-navy"
      >
        <UserRound className="size-4" aria-hidden />
        <span className="hidden sm:inline">Il mio account</span>
        <ChevronDown className="size-3.5" aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
          <p className="truncate border-b border-line px-3 py-2.5 text-xs text-muted">
            Collegato come
            <br />
            <span className="text-sm font-medium text-ink">{email}</span>
          </p>
          <Link role="menuitem" href="/area" onClick={() => setOpen(false)} className={item}>
            <LayoutDashboard className="size-4 text-navy" aria-hidden /> Area personale
          </Link>
          {staff && (
            <Link role="menuitem" href="/admin" onClick={() => setOpen(false)} className={item}>
              <ShieldCheck className="size-4 text-navy" aria-hidden /> Area staff
            </Link>
          )}
          <button role="menuitem" type="button" onClick={exit} disabled={busy} className={`${item} border-t border-line text-accent`}>
            <LogOut className="size-4" aria-hidden /> {busy ? "Uscita…" : "Esci"}
          </button>
        </div>
      )}
    </div>
  );
}
