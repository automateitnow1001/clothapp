import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, CreditCard } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border-brand text-text-dark mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <img
              src="/images/logofull.png"
              alt="PACHECA"
              className="h-8 w-auto object-contain"
            />
            <p className="text-xs text-text-muted leading-relaxed">
              PACHECA es una boutique de indumentaria femenina diseñada para ofrecerte prendas modernas, delicadas y de alta calidad. Compras minoristas y ventas por encargo agrupadas con precios inteligentes.
            </p>
            <div className="flex space-x-3 text-text-muted">
              <a href="https://instagram.com/pacheca.almacen" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Customer Service Links */}
          <div>
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider mb-4">
              Atención al Cliente
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/sobre-pacheca" className="text-text-muted hover:text-accent transition-colors">
                  Sobre Pacheca
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className="text-text-muted hover:text-accent transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-text-muted hover:text-accent transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-text-muted hover:text-accent transition-colors">
                  Políticas de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access Portals */}
          <div>
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider mb-4">
              Accesos Rápidos
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/catalogo" className="text-text-muted hover:text-accent transition-colors">
                  Ver Todo el Catálogo
                </Link>
              </li>
              <li>
                <Link href="/club-pacheca" className="text-text-muted hover:text-accent transition-colors">
                  Club Pacheca
                </Link>
              </li>
              <li>
                <Link href="/clientes/resumen" className="text-text-muted hover:text-accent transition-colors">
                  Portal de Clientes
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="text-text-muted hover:text-accent transition-colors">
                  Panel Administrativo (Interno)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider mb-4">
              Contacto
            </h3>
            <ul className="space-y-3 text-xs text-text-muted">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 text-accent shrink-0 mt-0.5" />
                <span>Int. José Frouté 265, General Deheza, Córdoba</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-accent shrink-0" />
                <a href="https://wa.me/5493584377860" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">
                  +54 9 3584 37-7860
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-accent shrink-0" />
                <span>contacto@somospacheca.com.ar</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-8 border-t border-border-brand flex flex-col md:flex-row justify-between items-center text-xs text-text-muted">
          <p>&copy; {new Date().getFullYear()} Somos Pacheca. Todos los derechos reservados.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="flex items-center text-[10px]">
              <CreditCard className="h-4 w-4 mr-1 text-accent" />
              Medios de Pago: Transferencia, Efectivo, Mercado Pago
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
