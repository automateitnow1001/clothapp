"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { User, Save, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminProfilePage() {
  const { user, role, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    avatar_url: "",
    whatsapp: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        avatar_url: user.avatar_url || "",
        whatsapp: user.whatsapp || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);

    try {
      await updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        avatar_url: form.avatar_url,
        whatsapp: form.whatsapp,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar los datos de perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-text-dark font-display uppercase tracking-wider">Mi Perfil de Trabajo</h1>
        <p className="text-xs text-text-muted mt-1">
          Configurá tus datos personales de contacto y tu foto de perfil visible en el panel.
        </p>
      </div>

      {saved && (
        <div className="bg-success-bg border border-success/15 p-4 rounded-md text-xs text-success flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>¡Tus datos de perfil laboral han sido actualizados con éxito!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white border border-border-brand rounded-lg p-5 sm:p-6 shadow-2xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3 flex items-center">
              <User className="h-4.5 w-4.5 mr-2 text-accent" />
              Editar Información Personal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Apellido</label>
                <input
                  type="text"
                  required
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">Correo Electrónico (Login)</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">Número de WhatsApp Personal</label>
              <input
                type="text"
                placeholder="Ej. 5493584377860"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full text-xs"
              />
              <p className="text-[10px] text-text-muted mt-1">Con prefijo de país, sin espacios ni símbolos (+).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Foto de Perfil (URL)</label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/avatar.jpg"
                  value={form.avatar_url}
                  onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Subir Archivo de Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm({ ...form, avatar_url: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-sm file:border-0 file:text-[10px] file:font-semibold file:bg-secondary file:text-primary hover:file:bg-[#EADED2] cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center px-4 py-2.5 bg-primary text-white hover:bg-accent rounded text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Perfil"}
              </button>
            </div>
          </form>
        </div>

        {/* Visual Preview Column */}
        <div className="bg-white border border-border-brand rounded-lg p-5 text-center shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3">
            Vista Previa de Ficha
          </h3>
          <div className="flex flex-col items-center py-4">
            {form.avatar_url ? (
              <img
                src={form.avatar_url}
                alt="Avatar"
                className="h-28 w-28 rounded-full object-cover border-2 border-accent shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                }}
              />
            ) : (
              <div className="h-28 w-28 rounded-full bg-bg-light border border-border-brand flex items-center justify-center text-text-muted text-3xl font-bold uppercase shadow-inner">
                {form.first_name?.[0] || "U"}
              </div>
            )}
            <h4 className="mt-4 font-bold text-text-dark text-sm">
              {form.first_name} {form.last_name}
            </h4>
            <span className="mt-1 px-2.5 py-0.5 rounded bg-secondary text-primary font-bold text-[9px] uppercase tracking-wider">
              {role === "administrator" ? "Administradora" : "Empleada Staff"}
            </span>
            <p className="mt-2 text-xs text-text-muted truncate max-w-full px-2">{form.email}</p>
            {form.whatsapp && (
              <p className="mt-1 text-[11px] text-text-dark font-medium">WhatsApp: {form.whatsapp}</p>
            )}
          </div>

          <div className="bg-bg-light border border-border-brand rounded p-3 text-[10px] text-text-muted text-left leading-relaxed flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <span>
              Cualquier cambio de datos de acceso (email) requerirá ingresar con la nueva dirección en tu próximo inicio de sesión.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
