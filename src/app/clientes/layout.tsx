"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/auth-guard";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { User, FileText, ShoppingBag, Landmark, Sparkles } from "lucide-react";

export default function ClientesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Mi Resumen", href: "/clientes/resumen", icon: Landmark },
    { name: "Cuenta Corriente", href: "/clientes/cuenta-corriente", icon: FileText },
    { name: "Mis Pedidos", href: "/clientes/pedidos", icon: ShoppingBag },
    { name: "Mi Club Pacheca", href: "/clientes/club", icon: Sparkles },
    { name: "Mis Datos", href: "/clientes/perfil", icon: User },
  ];

  return (
    <AuthGuard allowedRoles={["client", "administrator", "employee"]}>
      <Navbar />
      <div className="flex-1 bg-bg-light py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Sidebar Navigation (Desktop) */}
            <aside className="hidden lg:block lg:col-span-3">
              <nav className="space-y-1 bg-white border border-border-brand rounded-lg p-4 shadow-xs">
                <div className="px-3 py-2 mb-4 border-b border-border-brand pb-3">
                  <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Portal Clientes
                  </h2>
                </div>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                        isActive
                          ? "bg-secondary text-accent"
                          : "text-text-dark hover:bg-bg-light hover:text-accent"
                      }`}
                    >
                      <Icon className={`h-4 w-4 mr-2.5 ${isActive ? "text-accent" : "text-text-muted"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Mobile Tab Bar Navigation */}
            <div className="lg:hidden mb-6">
              <nav className="flex justify-between bg-white border border-border-brand rounded-lg p-2 shadow-xs scrollbar-none overflow-x-auto whitespace-nowrap">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-[10px] font-bold rounded-md transition-colors ${
                        isActive
                          ? "bg-secondary text-accent"
                          : "text-text-dark hover:bg-bg-light"
                      }`}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Main Content Area */}
            <main className="lg:col-span-9 bg-white border border-border-brand rounded-lg p-6 sm:p-8 shadow-xs">
              {children}
            </main>

          </div>

        </div>
      </div>
      <Footer />
    </AuthGuard>
  );
}
