"use client";
// Riquadro di caricamento: clic per scegliere il file oppure trascinamento dal computer.
import { useEffect, useRef, useState } from "react";

type Props = {
  onFile: (file: File | undefined) => void;
  disabled?: boolean;
  accept?: string;
  className?: string;
  /** Classi aggiunte mentre un file è trascinato sopra il riquadro. */
  activeClassName?: string;
  children: React.ReactNode;
};

const hasFiles = (e: React.DragEvent | DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

export default function FileDrop({ onFile, disabled, accept = "application/pdf", className = "", activeClassName = "", children }: Props) {
  const [over, setOver] = useState(false);
  const depth = useRef(0);

  // Un file lasciato fuori dal riquadro non deve aprirsi nel browser e far uscire dalla pagina.
  useEffect(() => {
    const block = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  return (
    <label
      className={`relative ${className} ${over ? activeClassName : ""}`}
      onDragEnter={(e) => {
        if (disabled || !hasFiles(e)) return;
        e.preventDefault();
        depth.current += 1;
        setOver(true);
      }}
      onDragOver={(e) => {
        if (disabled || !hasFiles(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (!depth.current) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        depth.current = 0;
        setOver(false);
        if (!disabled) onFile(e.dataTransfer.files?.[0]);
      }}
    >
      {children}
      {over && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-navy text-sm font-semibold text-white">
          Rilascia qui il PDF
        </span>
      )}
      <input
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </label>
  );
}
