"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, Users, Wallet, Package, Tag, Truck, Upload,
  RotateCcw, ShoppingCart, CreditCard, Calendar, BarChart2,
  ClipboardList, Settings, Menu, X, LogOut, ChevronRight,
  Sparkles, Ruler, MessageSquare, HelpCircle, User
} from "lucide-react";

const navGroups = [
  {
    label: "Principal",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Mi Perfil", href: "/admin/perfil", icon: User },
      { name: "Mis Cobros y Horarios", href: "/admin/cobros", icon: Calendar },
    ],
  },
  {
    label: "Clientes",
    items: [
      { name: "Fichero de Clientes", href: "/admin/clientes", icon: Users },
      { name: "Cuentas Corrientes", href: "/admin/cuentas-corrientes", icon: Wallet },
      { name: "Club Pacheca", href: "/admin/club-pacheca", icon: Sparkles },
      { name: "Pagos", href: "/admin/pagos", icon: CreditCard },
      { name: "Vencimientos", href: "/admin/vencimientos", icon: Calendar },
    ],
  },
  {
    label: "Productos & Catálogo",
    items: [
      { name: "Productos", href: "/admin/productos", icon: Package },
      { name: "Categorías", href: "/admin/categorias", icon: Tag },
      { name: "Importación y Sinc", href: "/admin/importaciones", icon: Upload },
    ],
  },
  {
    label: "Contenidos & Ayuda",
    items: [
      { name: "Opiniones / Reseñas", href: "/admin/opiniones", icon: MessageSquare },
      { name: "Preguntas Frecuentes", href: "/admin/faqs", icon: HelpCircle },
    ],
  },
  {
    label: "Proveedores & Compras",
    items: [
      { name: "Proveedores", href: "/admin/proveedores", icon: Truck },
      { name: "Pedidos a Proveedores", href: "/admin/pedidos", icon: ShoppingCart },
    ],
  },
  {
    label: "Reportes & Sistema",
    items: [
      { name: "Reportes", href: "/admin/reportes", icon: BarChart2 },
      { name: "Auditoría", href: "/admin/auditoria", icon: ClipboardList },
      { name: "Configuración", href: "/admin/configuracion", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportTask, setSupportTask] = useState("");

  return (
    <AuthGuard allowedRoles={["administrator", "employee"]}>
      <div className="flex h-screen bg-bg-light overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111] text-white flex flex-col transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}>
          
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
            <img src="/images/logofull.png" alt="PACHECA" className="h-7 w-auto brightness-0 invert" />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="px-2 mb-1 text-[9px] font-bold uppercase tracking-widest text-white/30">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center px-3 py-2 text-xs rounded-md transition-colors font-medium ${
                          isActive
                            ? "bg-accent text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2.5 shrink-0" />
                        {item.name}
                        {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="px-3 py-4 border-t border-white/10">
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                {user?.first_name?.[0] || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-[10px] text-white/50 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="bg-white border-b border-border-brand px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-text-muted hover:text-primary rounded-md"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Panel Admin</p>
                <p className="text-xs font-bold text-text-dark hidden sm:block">Somos Pacheca</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/" className="text-xs text-text-muted hover:text-accent transition-colors">
                Ver Tienda →
              </Link>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
            {children}
          </main>
        </div>
      </div>

      {/* Floating Orange Support Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowSupportModal(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <HelpCircle className="h-4.5 w-4.5 shrink-0" />
          CONTACTAR A GABI (soporte)
        </button>
      </div>

      {/* Support Input Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fade-in">
          <div className="bg-white border border-border-brand rounded-lg shadow-xl max-w-md w-full p-6 relative text-left">
            <button
              onClick={() => {
                setShowSupportModal(false);
                setSupportTask("");
              }}
              className="absolute right-4 top-4 text-text-muted hover:text-text-dark"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-2 flex items-center font-display">
              <span className="h-2 w-2 rounded-full bg-orange-500 mr-2.5 animate-pulse" />
              Soporte con Gabi
            </h3>
            <p className="text-[11px] text-text-muted mb-4">
              Contale a Gabi qué tarea estás intentando realizar para que te asista. Se enviará junto con el link de la pantalla actual.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const currentUrl = window.location.href;
                const message = `Hola Gabi! Te están solicitando ayuda para realizar la tarea: "${supportTask}" en la sección: ${currentUrl}`;
                const encoded = encodeURIComponent(message);
                window.open(`https://wa.me/5493585142731?text=${encoded}`, "_blank");
                setShowSupportModal(false);
                setSupportTask("");
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">
                  ¿Qué tarea estás realizando?
                </label>
                <textarea
                  required
                  rows={3}
                  value={supportTask}
                  onChange={(e) => setSupportTask(e.target.value)}
                  placeholder="Ej. No logro subir un nuevo producto sastrero, o modificar el saldo de la cuenta corriente de..."
                  className="w-full text-xs p-2.5 bg-[#FCFAF7] border border-border-brand rounded-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-border-brand">
                <button
                  type="button"
                  onClick={() => {
                    setShowSupportModal(false);
                    setSupportTask("");
                  }}
                  className="px-4 py-2 border border-border-brand text-text-muted hover:bg-bg-light text-xs font-semibold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded uppercase tracking-wider transition-colors"
                >
                  Enviar a Gabi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
