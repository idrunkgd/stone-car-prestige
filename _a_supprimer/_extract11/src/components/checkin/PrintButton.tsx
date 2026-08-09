"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Déclenche l'impression navigateur → « Enregistrer au format PDF ». */
export function PrintButton() {
  return (
    <Button variant="ghost" onClick={() => window.print()} className="print:hidden">
      <Printer size={16} /> Imprimer / PDF
    </Button>
  );
}
