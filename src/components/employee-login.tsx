"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Lock, AlertTriangle, User } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

interface EmployeeLoginProps {
  email: string;
  name: string;
  avatarUrl?: string;
}

export default function EmployeeLogin({ email, name, avatarUrl }: EmployeeLoginProps) {
  const { user, role, login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user && role && role !== "client") {
      router.push("/admin/dashboard");
    }
  }, [user, role, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const expectedPassword = email.split("@")[0] + ".pacheca"; // e.g. virginia.pacheca, paola.pacheca, yamila.pacheca
    const isGeneric = password === "equipo.pacheca" || password === "pacheca123";
    if (password !== expectedPassword && !isGeneric) {
      setError("Contraseña incorrecta. Por favor intente de nuevo.");
      setIsSubmitting(false);
      return;
    }

    const res = await login(email);
    if (!res.success) {
      setError(res.error || "Ocurrió un error.");
    } else {
      router.push("/admin/dashboard");
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-20 px-4 bg-black relative overflow-hidden text-white min-h-[80vh]">
        {/* Background blurring watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none">
          <img src="/images/isologo.png" alt="" className="w-80 object-contain" />
        </div>
        
        <div className="max-w-md w-full space-y-6 bg-[#111]/90 backdrop-blur-md p-8 border border-white/10 rounded-md shadow-2xl relative z-10 text-left">
          <div className="text-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="mx-auto h-20 w-20 rounded-full object-cover border-2 border-[#F5E6D3] mb-4" />
            ) : (
              <div className="mx-auto h-16 w-16 rounded-full bg-white/10 text-[#F5E6D3] flex items-center justify-center mb-4">
                <User className="h-8 w-8" />
              </div>
            )}
            <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wider">
              {name}
            </h2>
            <p className="text-[11px] text-white/50 uppercase tracking-widest mt-1">
              Panel de Administración Pacheca
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/40 border border-red-500/30 rounded text-xs text-red-200 flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                Usuario / Email
              </label>
              <div className="px-3 py-2 bg-white/5 border border-white/10 rounded text-xs text-white/60">
                {email}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#F5E6D3] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#F5E6D3] hover:bg-white text-black text-xs font-bold uppercase tracking-widest transition-colors rounded-sm shadow-sm"
            >
              {isSubmitting ? "Accediendo..." : "Ingresar"}
            </button>
          </form>

          <p className="text-[9px] text-center text-white/30 pt-2">
            Solo personal autorizado. Su dirección IP y accesos son auditados.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
