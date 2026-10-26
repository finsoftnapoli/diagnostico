import { Compass, Database, Factory, Landmark, Leaf, Lightbulb, Megaphone, Users, type LucideIcon } from "lucide-react";
import type { AreaCode } from "./types";

export const AREA_ICON: Record<AreaCode, LucideIcon> = {
  STR: Compass,
  FIN: Landmark,
  MKT: Megaphone,
  PER: Users,
  OPS: Factory,
  DIG: Database,
  INN: Lightbulb,
  SOS: Leaf,
};

export const AREA_SHORT: Record<AreaCode, string> = {
  STR: "Strategia",
  FIN: "Finanza",
  MKT: "Vendite",
  PER: "Persone",
  OPS: "Operations",
  DIG: "Digitale",
  INN: "Innovazione",
  SOS: "Sostenibilità",
};

export function AreaIcon({ code, className = "size-5" }: { code: AreaCode; className?: string }) {
  const Icon = AREA_ICON[code];
  return <Icon className={className} aria-hidden strokeWidth={1.75} />;
}
