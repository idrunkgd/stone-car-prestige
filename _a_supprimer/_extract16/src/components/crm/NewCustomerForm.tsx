"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createCustomerAction } from "@/app/app/clients/actions";

export function NewCustomerForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [f, setF] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const valid = f.firstName.trim() && f.lastName.trim() && f.phone.trim();

  function submit() {
    if (!valid || pending) return;
    start(async () => {
      await createCustomerAction({
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        phone: f.phone.trim(),
        email: f.email.trim() || undefined,
        company: f.company.trim() || undefined,
      });
      router.push("/app/clients");
      router.refresh();
    });
  }

  return (
    <Card className="max-w-xl">
      <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
        <Input label="Prénom *" value={f.firstName} onChange={set("firstName")} placeholder="Jean" />
        <Input label="Nom *" value={f.lastName} onChange={set("lastName")} placeholder="Dupont" />
      </div>
      <Input label="Téléphone *" value={f.phone} onChange={set("phone")} placeholder="0499 12 34 56" />
      <Input label="Email" type="email" value={f.email} onChange={set("email")} placeholder="jean@example.be" />
      <Input label="Société (facultatif)" value={f.company} onChange={set("company")} placeholder="" />

      <Button
        fullWidth
        size="lg"
        disabled={!valid || pending}
        className={!valid || pending ? "mt-4 cursor-not-allowed opacity-40" : "mt-4"}
        onClick={submit}
      >
        <Check size={18} /> {pending ? "Enregistrement…" : "Enregistrer le client"}
      </Button>
      <p className="mt-2 text-center text-[11px] text-ink-faint">
        * champs obligatoires
      </p>
    </Card>
  );
}
