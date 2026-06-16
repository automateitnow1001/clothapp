"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientesIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/clientes/resumen");
  }, [router]);

  return null;
}
