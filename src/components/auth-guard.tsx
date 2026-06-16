"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ShieldAlert } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: ("administrator" | "employee" | "client")[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/acceso");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs text-text-muted font-medium">Cargando perfil seguro...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const hasAccess = role && allowedRoles.includes(role);

  if (!hasAccess) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-error-bg rounded-lg shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-error-bg text-error mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-2">
          Acceso Restringido
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Tu cuenta ({user.email}) no tiene permisos suficientes para ver esta sección. Por favor, contactá al administrador si creés que esto es un error.
        </p>
        <button
          onClick={() => router.push(role === "client" ? "/clientes/resumen" : "/")}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors"
        >
          Volver a un lugar seguro
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
