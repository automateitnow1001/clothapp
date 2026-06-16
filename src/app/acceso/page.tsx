"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Mail, AlertTriangle, KeyRound, CreditCard, ChevronRight, User, UserPlus, CheckCircle2 } from "lucide-react";

export default function AccessPage() {
  const { login, user, role } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"email" | "register">("email");
  const router = useRouter();

  // If already logged in, redirect
  React.useEffect(() => {
    if (user && role) {
      if (role === "client") {
        router.push("/clientes/resumen");
      } else {
        router.push("/admin/dashboard");
      }
    }
  }, [user, role, router]);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    if (!email || !password) {
      setError("Por favor, ingresá tu correo y contraseña.");
      setIsSubmitting(false);
      return;
    }
    const res = await login(email, password);
    if (!res.success) setError(res.error || "Ocurrió un error.");
    setIsSubmitting(false);
  };



  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    if (!email || !password || !firstName || !lastName) {
      setError("Por favor, completá todos los campos.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { isSupabaseConfigured, supabase, db, mockDb } = await import("@/lib/db");

      if (isSupabaseConfigured && supabase) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: password,
        });

        if (signUpError) {
          setError(signUpError.message);
          setIsSubmitting(false);
          return;
        }

        const authUser = signUpData.user;
        if (!authUser) {
          setError("Error al registrar el usuario en Auth.");
          setIsSubmitting(false);
          return;
        }

        const { error: profileError } = await supabase.from("profiles").insert({
          id: authUser.id,
          email: email.trim().toLowerCase(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          avatar_url: null,
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }

        await db.userRoles.setRole(authUser.id, "client");
      } else {
        // Mock DB
        const newProfile = {
          id: `p_${Date.now()}`,
          email: email.trim().toLowerCase(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          avatar_url: null,
          whatsapp: "",
          password: password,
          created_at: new Date().toISOString(),
        };
        mockDb.profiles.push(newProfile);
        mockDb.user_roles.push({ id: `ur_${Date.now()}`, user_id: newProfile.id, role: "client" });
      }

      setSuccessMsg("¡Registro exitoso! Ya podés ingresar con tu correo y contraseña.");
      setMode("email");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Error al registrarse.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-bg-light">
        <div className="max-w-md w-full space-y-6 bg-white p-8 border border-border-brand rounded-lg shadow-sm">
          <div>
            <div className="mx-auto h-12 w-12 rounded-full bg-secondary text-accent flex items-center justify-center">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-center text-xl font-bold font-display text-text-dark tracking-wide uppercase">
              Acceso Seguro Pacheca
            </h2>
            <p className="mt-2 text-center text-xs text-text-muted">
              Ingresá con tus credenciales o vinculá tu cuenta de la tienda física con tu DNI.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex border border-border-brand rounded-md overflow-hidden text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => { setMode("email"); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors ${
                mode === "email" ? "bg-primary text-white" : "bg-white text-text-muted hover:bg-bg-light"
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Ingresar
            </button>
            <button
              onClick={() => { setMode("register"); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 flex items-center justify-center gap-2 transition-colors ${
                mode === "register" ? "bg-primary text-white" : "bg-white text-text-muted hover:bg-bg-light"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" /> Registrarse
            </button>
          </div>

          {error && (
            <div className="p-3 bg-error-bg border border-red-200 rounded text-xs text-error flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-success-bg border border-green-200 rounded text-xs text-success flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === "email" && (
            <form className="space-y-4" onSubmit={handleSubmitEmail}>
              <div>
                <label htmlFor="email-address" className="block text-xs font-semibold text-text-dark mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    required
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-border-brand rounded-md text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password-input" className="block text-xs font-semibold text-text-dark">
                    Contraseña
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("Funcionalidad de recuperación de contraseña próximamente."); }} className="text-[10px] text-text-muted hover:text-primary transition-colors underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <input
                    id="password-input"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-border-brand rounded-md text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-xs text-xs font-bold text-white bg-primary hover:bg-accent focus:outline-none transition-colors"
              >
                {isSubmitting ? "Comprobando..." : "Ingresar"}
              </button>
            </form>
          )}

          {mode === "register" && (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first-name" className="block text-xs font-semibold text-text-dark mb-1">
                    Nombre
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    required
                    placeholder="Juan"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-border-brand rounded-md text-xs focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-xs font-semibold text-text-dark mb-1">
                    Apellido
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    required
                    placeholder="Pérez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-border-brand rounded-md text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-text-dark mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-border-brand rounded-md text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-text-dark mb-1">
                  Crear Contraseña
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <input
                    id="reg-password"
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-border-brand rounded-md text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-xs text-xs font-bold text-white bg-primary hover:bg-accent focus:outline-none transition-colors"
              >
                {isSubmitting ? "Registrando..." : "Crear Cuenta"}
              </button>
            </form>
          )}



        </div>
      </main>
      <Footer />
    </>
  );
}
