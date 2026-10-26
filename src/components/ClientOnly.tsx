"use client";

// Carica questionario e risultati solo nel browser: leggono la bozza salvata localmente.
import dynamic from "next/dynamic";

const loading = () => <div className="mx-auto max-w-3xl px-4 py-16 text-muted">Caricamento…</div>;

export const WizardClient = dynamic(() => import("./Wizard"), { ssr: false, loading });
export const ResultsClient = dynamic(() => import("./ResultsView"), { ssr: false, loading });
export const LoginClient = dynamic(() => import("./Login"), { ssr: false, loading });
export const InviteClient = dynamic(() => import("./Invite"), { ssr: false, loading });
