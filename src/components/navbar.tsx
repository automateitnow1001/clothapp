"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, Search, Menu, X, User, LayoutDashboard, LogOut, Heart } from "lucide-react";

function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const msgs = [
    "🚚 Envíos gratis a todo el país a partir de $95.000",
    "💳 3 cuotas sin interés con todas las tarjetas",
    "🌸 Talles grandes y especiales | +10 años acompañándote",
  ];
  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % msgs.length), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-black text-[#F5E6D3] text-[10px] py-2 px-4 text-center tracking-widest font-semibold uppercase overflow-hidden min-h-[32px] flex items-center justify-center">
      <span key={current} className="transition-all duration-500">{msgs[current]}</span>
    </div>
  );
}

export default function Navbar() {
  const { user, role, logout, isAdmin, isEmployee } = useAuth();
  const { totalItemsCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-50 bg-white border-b border-border-brand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Logo (Exactly as is, un-deformed, original colors) */}
          <div className="flex-1 flex justify-center md:justify-start">
            <Link href="/" className="flex items-center">
              <img
                src="/images/logofull.png"
                alt="PACHECA"
                className="h-10 md:h-12 w-auto object-contain"
                style={{ maxHeight: "48px" }}
              />
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
            <Link href="/" className="text-text-dark hover:text-accent transition-colors">
              Inicio
            </Link>
            <Link href="/catalogo" className="text-text-dark hover:text-accent transition-colors">
              Indumentaria
            </Link>
            <Link href="/telas" className="text-text-dark hover:text-accent transition-colors">
              Telas
            </Link>
            <Link href="/club-pacheca" className="text-text-dark hover:text-accent transition-colors">
              Club Pacheca
            </Link>
            <Link href="/sobre-pacheca" className="text-text-dark hover:text-accent transition-colors">
              Sobre Nosotros
            </Link>
            <Link href="/preguntas-frecuentes" className="text-text-dark hover:text-accent transition-colors">
              Preguntas Frecuentes
            </Link>
          </nav>

          {/* Search bar & Action Icons */}
          <div className="flex items-center space-x-4">
            
            {/* Search Form (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative">
              <input
                type="text"
                placeholder="Buscar prendas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 xl:w-64 py-1.5 pl-3 pr-8 text-xs bg-bg-light rounded-full border border-border-brand focus:w-60 xl:focus:w-72 focus:border-accent transition-all"
              />
              <button type="submit" className="absolute right-2.5 text-text-muted hover:text-accent" aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Auth Menu Dropdown */}
            <div className="relative group">
              {user ? (
                <div className="flex items-center space-x-1 cursor-pointer">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.first_name}
                      className="h-8 w-8 rounded-full border border-accent object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-xs uppercase">
                      {user.first_name[0]}
                    </div>
                  )}
                  <span className="hidden md:inline text-xs text-text-muted font-medium hover:text-primary max-w-[80px] truncate">
                    {user.first_name}
                  </span>
                </div>
              ) : (
                <Link
                  href="/acceso"
                  className="p-2 text-text-muted hover:text-accent transition-colors flex items-center space-x-1"
                  title="Acceso Clientes"
                >
                  <User className="h-5.5 w-5.5" />
                  <span className="hidden md:inline text-xs font-semibold">Acceso</span>
                </Link>
              )}

              {/* Dropdown Menu */}
              {user && (
                <div className="absolute right-0 w-48 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50">
                  <div className="py-1 bg-white border border-border-brand rounded-md shadow-lg">
                    <div className="px-4 py-2 border-b border-border-brand">
                      <p className="text-xs font-bold text-text-dark truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-[10px] text-text-muted truncate">{user.email}</p>
                    </div>

                    {isEmployee && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center px-4 py-2 text-xs text-text-dark hover:bg-bg-light"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2 text-accent" />
                        Panel Admin
                      </Link>
                    )}

                    <Link
                      href="/clientes/resumen"
                      className="flex items-center px-4 py-2 text-xs text-text-dark hover:bg-bg-light"
                    >
                      <User className="h-4 w-4 mr-2 text-accent" />
                      Mi Portal Cliente
                    </Link>

                    <button
                      onClick={logout}
                      className="w-full flex items-center px-4 py-2 text-xs text-error hover:bg-error-bg text-left border-t border-border-brand"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Favorites Link */}
            <Link
              href="/favoritos"
              className="p-2 text-text-muted hover:text-accent transition-colors hidden sm:block"
              title="Favoritos"
            >
              <Heart className="h-5.5 w-5.5" />
            </Link>

            {/* Shopping Cart Icon */}
            <Link
              href="/carrito"
              className="p-2 text-text-muted hover:text-accent relative transition-colors"
              title="Carrito de Compras"
            >
              <ShoppingBag className="h-5.5 w-5.5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-accent rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {totalItemsCount}
                </span>
              )}
            </Link>

          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-border-brand bg-white px-4 pt-2 pb-4 space-y-2">
          {/* Search bar mobile */}
          <form onSubmit={handleSearchSubmit} className="flex items-center relative mb-4">
            <input
              type="text"
              placeholder="Buscar prendas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-3 pr-8 text-xs bg-bg-light rounded-full border border-border-brand"
            />
            <button type="submit" className="absolute right-3 text-text-muted" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
          </form>

          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-text-dark hover:bg-bg-light"
          >
            Inicio
          </Link>
          <Link
            href="/catalogo"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-text-dark hover:bg-bg-light"
          >
            Indumentaria
          </Link>
          <Link
            href="/telas"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-text-dark hover:bg-bg-light"
          >
            Telas
          </Link>
          <Link
            href="/club-pacheca"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-text-dark hover:bg-bg-light"
          >
            Club Pacheca
          </Link>
          <Link
            href="/sobre-pacheca"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-text-dark hover:bg-bg-light"
          >
            Sobre Nosotros
          </Link>
          <Link
            href="/preguntas-frecuentes"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-text-dark hover:bg-bg-light"
          >
            Preguntas Frecuentes
          </Link>
          <Link
            href="/favoritos"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-text-dark hover:bg-bg-light"
          >
            Favoritos
          </Link>

          {/* Role actions inside mobile drawer */}
          {!user ? (
            <Link
              href="/acceso"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 mt-4 text-center rounded-md text-sm font-semibold text-white bg-primary hover:bg-accent"
            >
              Iniciar Sesión
            </Link>
          ) : (
            <div className="pt-4 border-t border-border-brand space-y-1">
              <p className="px-3 text-xs font-bold text-text-muted">
                Hola, {user.first_name}
              </p>
              {isEmployee && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-accent hover:bg-bg-light"
                >
                  Panel Administrativo
                </Link>
              )}
              <Link
                href="/clientes/resumen"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-text-dark hover:bg-bg-light"
              >
                Mi Portal Cliente
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-sm font-medium text-error hover:bg-error-bg"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
    </>
  );
}
