"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db, Customer, mockDb } from "@/lib/db";
import { User, Save, CheckCircle } from "lucide-react";

export default function ClientProfilePage() {
  const { user, updateProfile } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    avatar_url: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      db.customers.getByProfile(user.id).then((cust) => {
        const target = cust || mockDb.customers[0];
        if (target) {
          setCustomer(target);
          setForm({
            first_name: user.first_name || target.first_name || "",
            last_name: user.last_name || target.last_name || "",
            avatar_url: user.avatar_url || "",
            phone: target.phone || "",
            whatsapp: target.whatsapp || user.whatsapp || "",
            email: user.email || target.email || "",
            address: target.address || "",
          });
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !user) return;
    setSaving(true);
    
    // Update user profile in AuthContext
    await updateProfile({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      avatar_url: form.avatar_url,
      whatsapp: form.whatsapp,
    });

    // Update customer in database
    await db.customers.update(customer.id, {
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      whatsapp: form.whatsapp,
      email: form.email,
      address: form.address,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 skeleton" />
        <div className="h-64 skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border-brand pb-4">
        <h1 className="text-lg font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
          <User className="h-5 w-5 mr-2 text-accent" />
          Mis Datos Personales
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Actualizá tu información de contacto, foto de perfil y credenciales de acceso.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-success-bg border border-success/20 rounded text-xs text-success flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>¡Datos actualizados correctamente!</span>
        </div>
      )}

      {customer && (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Foto de Perfil (URL)</label>
                <input
                  type="url"
                  value={form.avatar_url}
                  onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                  placeholder="https://ejemplo.com/foto.jpg"
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
                  className="w-full text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-sm file:border-0 file:text-[10px] file:font-semibold file:bg-secondary file:text-accent hover:file:bg-bg-light cursor-pointer"
                />
              </div>
            </div>
            {form.avatar_url && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-[10px] text-text-muted">Vista previa:</span>
                <img src={form.avatar_url} alt="Vista previa" className="h-8 w-8 rounded-full object-cover border border-border-brand" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
            {customer.dni && (
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  DNI (No editable)
                </label>
                <div className="px-3 py-2 bg-bg-light border border-border-brand rounded text-xs text-text-dark font-medium">
                  {customer.dni}
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Estado de Cuenta (No editable)
              </label>
              <div className="px-3 py-2 bg-bg-light border border-border-brand rounded text-xs">
                <span className={`font-bold ${
                  customer.status === "al_dia" ? "text-success" :
                  customer.status === "vencido" || customer.status === "bloqueado" ? "text-error" :
                  "text-warning"
                }`}>
                  {customer.status === "al_dia" ? "Al Día" :
                   customer.status === "proximo_a_vencer" ? "Próximo a Vencer" :
                   customer.status === "vencido" ? "Vencido" : "Bloqueado"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">Teléfono</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Ej. 1150493820"
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">WhatsApp</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="Ej. 5493584377860"
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">Dirección de Envío</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Calle, número, localidad"
                className="w-full text-xs"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center w-full sm:w-auto px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-accent transition-colors"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
