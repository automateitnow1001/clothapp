"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SharedNavbar from "@/components/navbar";
import {
  Truck, CreditCard,
  RotateCcw, Headphones, MapPin, ChevronLeft, ChevronRight,
  ArrowRight, Heart, Star, MessageCircle, Search, User, ShoppingBag,
  ChevronDown, CheckCircle2, Clock, Bell
} from "lucide-react";

// Icono personalizado de Instagram
const Instagram = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// ─── DATOS DE DEMO ────────────────────────────────────────────────────────────
const WHATSAPP = "+5493584377860";
const WHATSAPP_DISPLAY = "+54 9 3584 37-7860";
const INSTAGRAM = "pacheca.almacen";

const heroSlides = [
  {
    image: "/images/1.png",
    alt: "Colección Pacheca 1",
  },
  {
    image: "/images/2.png",
    alt: "Colección Pacheca 2",
  },
  {
    image: "/images/3.png",
    alt: "Colección Pacheca 3",
  },
];

const featuredProducts = [
  { id: "p1", name: "Conjunto Basic Oversize", price: 89900, image: "/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp", colors: ["#7B243B", "#D6A1A7", "#8B5E4B"], slug: "conjunto-basic-oversize", tag: "Nuevo" },
  { id: "p2", name: "Conjunto Hoodie Soft", price: 112500, image: "/images/img_3025-6de489edea28fd44c917477681715009-1024-1024.jpg", colors: ["#8B5E4B", "#F5E6D3", "#111"], slug: "conjunto-hoodie-soft", tag: "Nuevo" },
  { id: "p3", name: "Conjunto Comfort Zip", price: 98000, image: "/images/dsc01952-84e7f3aec48512c8b417781783150678-1024-1024.webp", colors: ["#111", "#7A7A7A", "#fff"], slug: "conjunto-comfort-zip", tag: "Nuevo" },
  { id: "p4", name: "Conjunto Relax Fit", price: 94500, image: "/images/dsc03925-c363c606814907f35d17794751993895-1024-1024.webp", colors: ["#8B5E4B", "#D6A1A7", "#EADED2"], slug: "conjunto-relax-fit", tag: "" },
  { id: "p5", name: "Blusa Cruzada Satin", price: 67000, image: "/images/dsc01870-1f89992ba76d29839d17772984042794-1024-1024.webp", colors: ["#165B33", "#0B3C23"], slug: "blusa-cruzada-satin", tag: "Promo" },
  { id: "p6", name: "Conjunto Cozy Lounge", price: 102000, image: "/images/dsc03925-c363c606814907f35d17794751993895-1024-1024.webp", colors: ["#8B5E4B", "#EADED2", "#F5E6D3"], slug: "conjunto-cozy-lounge", tag: "" },
];

const categories = [
  { name: "Para todos los días", icon: "☀️", filter: "casual", img: "/images/dsc01870-1f89992ba76d29839d17772984042794-1024-1024.webp" },
  { name: "Para trabajar", icon: "💼", filter: "trabajo", img: "/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp" },
  { name: "Para salir", icon: "✨", filter: "salida", img: "/images/img_3025-6de489edea28fd44c917477681715009-1024-1024.jpg" },
  { name: "Conjuntos", icon: "👗", filter: "conjuntos", img: "/images/dsc01952-84e7f3aec48512c8b417781783150678-1024-1024.webp" },
  { name: "Talles especiales", icon: "🌸", filter: "talles-especiales", img: "/images/dsc03925-c363c606814907f35d17794751993895-1024-1024.webp" },
  { name: "Abrigos", icon: "🧥", filter: "abrigos", img: "/images/dsc01870-1f89992ba76d29839d17772984042794-1024-1024.webp" },
];

const reviewsDemo = [
  { name: "Valentina M.", rating: 5, comment: "Encontré el talle que nunca encuentro en ningún lado. La atención fue increíble. ¡Volvería mil veces!", product: "Conjunto Basic Oversize" },
  { name: "Luciana R.", rating: 5, comment: "Me encanta Pacheca. Siempre tienen novedades y me ayudaron a elegir el talle perfecto sin que me sienta incómoda.", product: "Blusa Cruzada Satin" },
  { name: "Camila F.", rating: 5, comment: "Llegó antes de lo esperado y la calidad es muy buena. El diseño es exactamente como en las fotos.", product: "Conjunto Hoodie Soft" },
  { name: "Sofía G.", rating: 4, comment: "Muy lindo el look que me armaron. Las telas son de calidad y el talle me quedó re bien según la guía.", product: "Conjunto Comfort Zip" },
];

const faqs = [
  { q: "¿Cómo elijo mi talle?", a: "Usá nuestra guía de talles disponible en cada producto. Si tenés dudas, consultanos por WhatsApp y te ayudamos a elegir el más adecuado para vos." },
  { q: "¿Cómo realizo un pedido?", a: "Elegís tus prendas, las agregás al carrito, completás el formulario de pedido y abonás el anticipo del 50% vía transferencia bancaria." },
  { q: "¿Cuánto demora?", a: "Una vez confirmado tu pedido, estimamos entre 1 y 3 semanas para que llegue al local, dependiendo de la disponibilidad de cada modelo." },
  { q: "¿Puedo retirar en el local?", a: "¡Sí! Podés retirar tu pedido directamente en nuestro local de General Deheza. Te avisamos cuando esté listo." },
  { q: "¿Realizan envíos?", a: "Sí, enviamos a todo el país. Envío gratis en compras superiores a $95.000." },
  { q: "¿Cómo hago un cambio?", a: "Tenés hasta 30 días para realizar cambios. El producto debe estar sin uso, con etiquetas y en perfecto estado." },
  { q: "¿Qué medios de pago aceptan?", a: "Aceptamos transferencia bancaria, Mercado Pago, tarjetas de crédito y débito. Consultanos por cuotas sin interés." },
];

const orderSteps = [
  { n: "01", title: "Elegí tu prenda", desc: "Explorá el catálogo y encontrá ese look que te enamoró." },
  { n: "02", title: "Seleccioná talle y color", desc: "Usá nuestra guía de talles para elegir la opción perfecta para vos." },
  { n: "03", title: "Confirmá tu pedido", desc: "Abonás el 50% de anticipo para confirmar tu reserva." },
  { n: "04", title: "Seguí el estado", desc: "Accedé a tu cuenta para ver el progreso de tu pedido en tiempo real." },
  { n: "05", title: "Retirá o recibís", desc: "Te avisamos cuando está listo para retirar o coordinamos el envío." },
];

// ─── COMPONENTES INTERNOS ─────────────────────────────────────────────────────

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
    <div className="bg-black text-white text-[11px] py-2.5 px-4 text-center tracking-widest font-semibold uppercase overflow-hidden">
      <span key={current} style={{ animation: "fadeInUp 0.5s ease" }}>{msgs[current]}</span>
    </div>
  );
}

function Navbar({ totalItemsCount, user }: { totalItemsCount: number; user: unknown }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white/97 backdrop-blur-sm border-b border-gray-100 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/images/logofull.png" alt="Pacheca" className="h-10 w-auto object-contain" />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center space-x-7 text-[11px] font-bold uppercase tracking-widest">
          <Link href="/" className="text-black border-b-2 border-black pb-0.5">Inicio</Link>
          <Link href="/catalogo" className="text-gray-500 hover:text-black transition-colors">Catálogo</Link>
          <Link href="/catalogo?new=true" className="text-gray-500 hover:text-black transition-colors">Nuevos Ingresos</Link>
          <Link href="/catalogo?promo=true" className="text-gray-500 hover:text-black transition-colors">Promociones</Link>
          <Link href="/catalogo?filter=talles-especiales" className="text-gray-500 hover:text-black transition-colors">Talles Especiales</Link>
          <Link href="#contacto" className="text-gray-500 hover:text-black transition-colors">Contacto</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4 text-gray-700">
          <Link href="/catalogo" className="hover:text-black transition-colors hidden sm:block" title="Buscar">
            <Search className="h-5 w-5" />
          </Link>
          <Link href="/favoritos" className="hover:text-black transition-colors hidden sm:block" title="Favoritos">
            <Heart className="h-5 w-5" />
          </Link>
          <Link href={user ? "/clientes/resumen" : "/acceso"} className="hover:text-black transition-colors" title="Mi Cuenta">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/carrito" className="relative hover:text-black transition-colors" title="Bolsa">
            <ShoppingBag className="h-5 w-5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </Link>
          {/* Mobile menu toggle */}
          <button
            className="md:hidden flex flex-col space-y-1 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <span className={`block w-5 h-0.5 bg-black transition-transform ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block w-5 h-0.5 bg-black transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-black transition-transform ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white py-4 px-5 flex flex-col space-y-3 text-[12px] font-bold uppercase tracking-widest text-gray-700">
          <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-black">Inicio</Link>
          <Link href="/catalogo" onClick={() => setMenuOpen(false)} className="hover:text-black">Catálogo</Link>
          <Link href="/catalogo?new=true" onClick={() => setMenuOpen(false)} className="hover:text-black">Nuevos Ingresos</Link>
          <Link href="/catalogo?promo=true" onClick={() => setMenuOpen(false)} className="hover:text-black">Promociones</Link>
          <Link href="/catalogo?filter=talles-especiales" onClick={() => setMenuOpen(false)} className="hover:text-black">Talles Especiales</Link>
          <Link href="/favoritos" onClick={() => setMenuOpen(false)} className="hover:text-black">Favoritos</Link>
          <Link href="/acceso" onClick={() => setMenuOpen(false)} className="hover:text-black">Mi Cuenta</Link>
        </div>
      )}
    </header>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function PachecaHomePage() {

  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Hero auto-slide
  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((c) => (c + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Load favorites
  useEffect(() => {
    const saved = localStorage.getItem("pacheca_favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem("pacheca_favorites", JSON.stringify(next));
      return next;
    });
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

  const waUrl = (msg: string) =>
    `https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#111]">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .hero-text { animation: slideIn 0.9s ease forwards; }
        .section-fade { animation: fadeInUp 0.7s ease forwards; }
      `}</style>

      {/* 2. Header (shared navbar with announcement bar) */}
      <SharedNavbar />

      {/* 3. HERO BANNER — Foto + difuminado + logo P grande */}
      <section className="relative min-h-[92vh] md:min-h-[88vh] flex items-center overflow-hidden bg-[#1a1a1a]">
        {/* Slides con crossfade */}
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === currentSlide ? 1 : 0 }}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover object-top"
              style={{ filter: "brightness(0.55)" }}
            />
            {/* Gradient overlay — más fuerte a la izquierda para texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ))}

        {/* Logo P watermark — grande centrado */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/images/isologo.png"
            alt=""
            className="w-64 md:w-96 lg:w-[480px] opacity-[0.07] object-contain select-none"
          />
        </div>

        {/* Contenido */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full py-24 md:py-0">
          <div className="max-w-xl hero-text">
            {/* Eyebrow */}
            <div className="flex items-center space-x-2 mb-5">
              <span className="h-px w-8 bg-white/50" />
              <span className="text-white/60 text-[10px] uppercase tracking-[0.25em] font-semibold">General Deheza · Córdoba · +10 años</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white leading-[1.1] tracking-tight mb-6">
              Moda que te <br />
              <span className="italic font-light">acompaña</span><br />
              todos los días.
            </h1>

            {/* Body */}
            <p className="text-white/75 text-sm leading-relaxed mb-3 max-w-md">
              Somos Pacheca, tu almacén de ropa de confianza para vestirte en cada momento, desde tus días más casuales hasta esos eventos especiales.
            </p>
            <p className="text-white/75 text-sm leading-relaxed mb-8 max-w-md">
              Nos destacamos por ofrecer prendas modernas en talles grandes y especiales, con la mejor atención y un acompañamiento cercano desde 2015.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="bg-white/10 border border-white/20 text-white/80 text-[10px] uppercase tracking-wider px-3 py-1 backdrop-blur-sm">Talles grandes y especiales</span>
              <span className="bg-white/10 border border-white/20 text-white/80 text-[10px] uppercase tracking-wider px-3 py-1 backdrop-blur-sm">+10 años acompañándote</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/catalogo"
                className="bg-white text-black px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all duration-200 inline-flex items-center gap-2 group"
              >
                Ver catálogo
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/catalogo?new=true"
                className="border border-white/50 text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest hover:border-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Nuevos ingresos
              </Link>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-white" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>

        {/* Arrow navigation */}
        <button
          onClick={() => setCurrentSlide((c) => (c - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((c) => (c + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </section>

      {/* 4. Beneficios rápidos */}
      <section className="bg-[#faf8f6] border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: Truck, title: "Envío gratis", sub: "En compras +$95.000" },
            { icon: CreditCard, title: "3 cuotas sin interés", sub: "Con todas las tarjetas" },
            { icon: RotateCcw, title: "Cambios fáciles", sub: "Hasta 30 días" },
            { icon: Headphones, title: "Asesoramiento", sub: "Estamos para ayudarte" },
          ].map((b, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs shrink-0">
                <b.icon className="h-4.5 w-4.5 text-gray-700" />
              </div>
              <div>
                <p className="font-bold text-[11px] uppercase tracking-wider text-black">{b.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Categorías por ocasión */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Colecciones</p>
              <h2 className="text-2xl sm:text-3xl font-serif text-black">Encontrá tu look para <span className="italic font-light">cada ocasión</span></h2>
            </div>
            <Link href="/catalogo" className="hidden md:flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors">
              Ver todo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.filter}
                href={`/catalogo?filter=${cat.filter}`}
                className="group relative overflow-hidden bg-gray-50 aspect-square rounded-none hover:shadow-md transition-shadow"
              >
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-[11px] uppercase tracking-wider leading-tight">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Nuevos ingresos */}
      <section className="py-16 bg-[#f9f7f5]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Lo último</p>
              <h2 className="text-2xl sm:text-3xl font-serif text-black">Nuevos <span className="italic font-light">ingresos</span></h2>
            </div>
            <Link href="/catalogo?new=true" className="hidden md:flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors">
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
            {featuredProducts.slice(0, 3).map((p) => (
              <div key={p.id} className="group bg-white border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                  <Link href={`/producto/${p.slug}`}>
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                  </Link>
                  {p.tag && (
                    <span className="absolute top-3 left-3 bg-black text-white text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold">{p.tag}</span>
                  )}
                  <button
                    onClick={() => toggleFavorite(p.id)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    title="Guardar favorito"
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(p.id) ? "fill-black text-black" : "text-gray-400"}`} />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex space-x-1.5 mb-2">
                    {p.colors.map((c, i) => (
                      <span key={i} className="h-3 w-3 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <Link href={`/producto/${p.slug}`} className="block font-semibold text-[12px] text-gray-900 hover:text-gray-600 transition-colors mb-1">{p.name}</Link>
                  <p className="text-[12px] font-bold text-black font-mono">{fmt(p.price)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/catalogo?new=true" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider border-b-2 border-black pb-0.5">
              Ver todos los ingresos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 13. Pacheca desde 2015 (Reubicado abajo de Nuevos Ingresos) */}
      <section className="py-20 bg-[#f0ece8]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Nuestra historia</p>
            <h2 className="text-3xl sm:text-4xl font-serif text-black leading-tight">Pacheca <span className="italic font-light">desde 2015</span></h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Desde 2015 acompañamos a mujeres reales a encontrar prendas cómodas, modernas y pensadas para cada ocasión. Creemos que vestirse bien también es sentirse cómoda, segura y representada.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              En Pacheca te ofrecemos una atención cercana, talles grandes y especiales, variedad de estilos y asesoramiento para que encuentres ese look que realmente va con vos.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/sobre-pacheca" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-black/85 transition-colors">
                Conocé Pacheca
              </Link>
              <a
                href={waUrl("Hola! Quiero saber cómo comprar en Pacheca.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-black text-black px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-black/5 transition-colors"
              >
                Escribinos
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-gray-100">
              <img src="/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp" alt="Pacheca desde 2015" className="w-full h-full object-cover" />
            </div>
            {/* Badge */}
            <div className="absolute -bottom-4 -left-4 bg-black text-white px-5 py-4 shadow-md">
              <p className="font-bold text-sm">+10 años</p>
              <p className="text-[10px] text-white/70 uppercase tracking-wider">Acompañándote</p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Opiniones de clientas (Reubicado abajo de Historia) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Testimonios</p>
            <h2 className="text-2xl sm:text-3xl font-serif text-black">Lo que dicen nuestras <span className="italic font-light">clientas</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {reviewsDemo.map((r, i) => (
              <div key={i} className="bg-[#faf8f6] border border-gray-100 p-6 space-y-3">
                <div className="flex space-x-0.5">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-black text-black" />
                  ))}
                </div>
                <p className="text-[12px] text-gray-700 leading-relaxed italic">&ldquo;{r.comment}&rdquo;</p>
                <div className="pt-1 border-t border-gray-100">
                  <p className="font-bold text-[11px] text-black">{r.name}</p>
                  <p className="text-[10px] text-gray-400">{r.product}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner Club Pacheca */}
      <section className="py-16 bg-[#faf8f6] border-t border-b border-[#f0ece8]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="bg-white border border-border-brand rounded-2xl p-8 md:p-12 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            {/* Background Isologo circular logo decoration */}
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none hidden md:block">
              <img src="/images/isologo.png" alt="" className="h-full w-auto object-contain object-right" />
            </div>

            <div className="space-y-4 max-w-xl relative z-10">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent/10 text-accent border border-accent/20">
                NUEVO: CLUB PACHECA
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-black leading-tight">
                Tus compras ahora <br className="hidden sm:block" />
                tienen <span className="italic font-light">recompensa</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Sumate gratis al Club Pacheca, acumulá puntos y obtené descuentos, regalos y beneficios exclusivos. Por cada compra sumás puntos que podés canjear en tu próximo pedido, y si recomendás a tus amigas ¡ambas reciben descuentos especiales!
              </p>
            </div>

            <div className="shrink-0 relative z-10 w-full sm:w-auto">
              <Link
                href="/club-pacheca"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm rounded-lg"
              >
                Conocer Club Pacheca
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Elegidas para vos */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Selección especial</p>
            <h2 className="text-2xl sm:text-3xl font-serif text-black">Elegidas <span className="italic font-light">para vos</span></h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredProducts.map((p) => (
              <div key={p.id} className="group space-y-3">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <Link href={`/producto/${p.slug}`}>
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                  </Link>
                  <button
                    onClick={() => toggleFavorite(p.id)}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className={`h-3.5 w-3.5 ${favorites.includes(p.id) ? "fill-black text-black" : "text-gray-400"}`} />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <div className="flex space-x-1">
                    {p.colors.map((c, i) => (
                      <span key={i} className="h-2.5 w-2.5 rounded-full border border-gray-100" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <Link href={`/producto/${p.slug}`} className="block font-semibold text-[11px] text-gray-800 hover:text-black transition-colors leading-tight">{p.name}</Link>
                  <p className="text-[11px] font-bold text-black font-mono">{fmt(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Talles grandes y especiales */}
      <section className="py-16 bg-[#f0ece8] overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none hidden md:block">
          <img src="/images/isologo.png" alt="" className="h-full w-auto object-contain object-right" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3">Para todas</p>
            <h2 className="text-3xl sm:text-4xl font-serif text-black mb-5 leading-tight">
              Talles grandes <br /><span className="italic font-light">y especiales</span>
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-8 max-w-md">
              Creemos que todas las mujeres merecen encontrar su talle. Por eso trabajamos con una amplia gama que incluye talles especiales, siempre con los mismos diseños modernos y materiales de calidad.
            </p>
            <Link
              href="/catalogo?filter=talles-especiales"
              className="inline-flex items-center gap-2 bg-black text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-widest hover:bg-black/85 transition-colors group"
            >
              Explorar talles especiales
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Armá tu look — teaser */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="grid grid-cols-2 gap-3">
            <div className="aspect-[3/4] overflow-hidden bg-gray-50">
              <img src="/images/dsc01870-1f89992ba76d29839d17772984042794-1024-1024.webp" alt="Look 1" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[3/4] overflow-hidden bg-gray-50 mt-6">
              <img src="/images/dsc01952-84e7f3aec48512c8b417781783150678-1024-1024.webp" alt="Look 2" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="space-y-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Combinaciones</p>
            <h2 className="text-3xl font-serif text-black leading-tight">Armá tu <span className="italic font-light">look</span></h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Descubrí combinaciones de prendas listas para usar. Cada look fue pensado para que puedas armar un estilo completo con facilidad, ya sea para el trabajo, una salida o el día a día.
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 bg-black text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-widest hover:bg-black/85 transition-colors group"
            >
              Explorar looks
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Pedí tu prenda favorita */}
      <section className="py-16 bg-[#f9f7f5]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Así funciona</p>
            <h2 className="text-2xl sm:text-3xl font-serif text-black mb-3">Pedí la prenda que <span className="italic font-light">más te guste</span></h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">Elegí tu prenda favorita y recibila en nuestro local. Amplia variedad de talles, colores y modelos al alcance de un clic.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {orderSteps.map((s, i) => (
              <div key={i} className="text-center space-y-3 relative">
                {i < orderSteps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+20px)] right-0 h-px bg-gray-200" />
                )}
                <div className="h-10 w-10 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center mx-auto relative z-10">{s.n}</div>
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-black">{s.title}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/catalogo" className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest hover:bg-black/85 transition-colors group">
              Empezar a explorar
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Asesoramiento personalizado */}
      <section className="py-16 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-end pr-12">
          <img src="/images/isologo.png" alt="" className="h-80 w-auto object-contain" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Personalizado</p>
            <h2 className="text-2xl sm:text-3xl font-serif">Te ayudamos a encontrar <span className="italic font-light">tu look</span></h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Contanos qué buscás, tu talle y ocasión y te recomendamos las prendas ideales para vos. Atención cercana y personalizada, como si estuvieras en el local.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href={waUrl("Hola! Quiero asesoramiento para encontrar mi look ideal.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 text-[11px] font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Consultarnos
            </a>
            <Link href="/catalogo" className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* Las secciones de opiniones e historia se movieron de aquí para arriba */}

      {/* 14. FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Dudas frecuentes</p>
            <h2 className="text-2xl sm:text-3xl font-serif text-black">Preguntas <span className="italic font-light">frecuentes</span></h2>
          </div>
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, i) => (
              <div key={i} className="py-4">
                <button
                  className="w-full flex items-center justify-between text-left gap-4 group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-[13px] text-black group-hover:text-gray-600 transition-colors">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <p className="mt-3 text-[13px] text-gray-600 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/preguntas-frecuentes" className="text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors border-b border-gray-300 pb-0.5">
              Ver todas las preguntas
            </Link>
          </div>
        </div>
      </section>

      {/* 15. Información del local */}
      <section id="contacto" className="py-16 bg-[#faf8f6] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-black" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider">Nuestro local</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Int. José Frouté 265<br />
              General Deheza, Córdoba
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Int.+José+Frouté+265,+General+Deheza,+Córdoba,+Argentina"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-black hover:text-gray-600 transition-colors"
            >
              Cómo llegar <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center">
              <Clock className="h-5 w-5 text-black" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider">Horarios</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-medium text-black">Mañana:</span> 9 a 12 hs<br />
              <span className="font-medium text-black">Tarde:</span> 16.30 a 20 hs<br />
              <span className="text-gray-400 text-xs">Lunes a Sábados</span>
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-black" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider">Contacto</h3>
            <div className="space-y-2">
              <a
                href={waUrl("Hola Pacheca!")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition-colors"
              >
                <span className="text-green-600">●</span> {WHATSAPP_DISPLAY}
              </a>
              <a
                href={`https://instagram.com/${INSTAGRAM}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition-colors"
              >
                <Instagram className="h-4 w-4" /> @{INSTAGRAM}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 16. Instagram */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Redes sociales</p>
            <h2 className="text-2xl font-serif text-black">Seguinos en <span className="italic font-light">Instagram</span></h2>
            <p className="text-sm text-gray-500 mt-2">@{INSTAGRAM}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              "/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp",
              "/images/img_3025-6de489edea28fd44c917477681715009-1024-1024.jpg",
              "/images/dsc01952-84e7f3aec48512c8b417781783150678-1024-1024.webp",
              "/images/dsc03925-c363c606814907f35d17794751993895-1024-1024.webp",
              "/images/dsc01870-1f89992ba76d29839d17772984042794-1024-1024.webp",
              "/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp",
            ].map((src, i) => (
              <a
                key={i}
                href={`https://instagram.com/${INSTAGRAM}`}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden bg-gray-50"
              >
                <img src={src} alt={`Instagram ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Instagram className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-7">
            <a
              href={`https://instagram.com/${INSTAGRAM}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-widest hover:bg-black/85 transition-colors"
            >
              <Instagram className="h-4 w-4" />
              Ver Instagram
            </a>
          </div>
        </div>
      </section>

      {/* 17. Newsletter */}
      <section className="py-16 bg-[#f0ece8]">
        <div className="max-w-xl mx-auto px-6 text-center space-y-5">
          <Bell className="h-8 w-8 text-black mx-auto" />
          <h2 className="text-2xl font-serif text-black">Recibí novedades de <span className="italic font-light">Pacheca</span></h2>
          <p className="text-sm text-gray-600">Nuevos ingresos, promociones y talles especiales directamente en tu correo.</p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-green-700 font-semibold text-sm">
              <CheckCircle2 className="h-5 w-5" /> ¡Gracias! Quedaste suscripta.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubscribed(true);
              }}
              className="flex gap-2 max-w-sm mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="flex-1 border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
              />
              <button
                type="submit"
                className="bg-black text-white px-5 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-black/85 transition-colors whitespace-nowrap"
              >
                Suscribirme
              </button>
            </form>
          )}
          <p className="text-[10px] text-gray-400">Sin spam. Podés darte de baja cuando quieras.</p>
        </div>
      </section>

      {/* 18. Footer */}
      <footer className="bg-black text-white py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-white/10">
          {/* Logo */}
          <div className="col-span-1 space-y-4">
            <img src="/images/logofull.png" alt="Pacheca" className="h-12 w-auto object-contain brightness-0 invert" />
            <p className="text-white/50 text-[11px] leading-relaxed">Tu almacén de ropa de confianza desde 2015. +10 años acompañándote.</p>
            <div className="flex space-x-3">
              <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={waUrl("Hola Pacheca!")} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Compra */}
          <div className="space-y-3">
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-white/50">Compra</h4>
            <ul className="space-y-2 text-[12px] text-white/60">
              <li><Link href="/catalogo" className="hover:text-white transition-colors">Catálogo</Link></li>
              <li><Link href="/catalogo?new=true" className="hover:text-white transition-colors">Nuevos ingresos</Link></li>
              <li><Link href="/catalogo?promo=true" className="hover:text-white transition-colors">Promociones</Link></li>
              <li><Link href="/catalogo?filter=talles-especiales" className="hover:text-white transition-colors">Talles especiales</Link></li>
            </ul>
          </div>

          {/* Ayuda */}
          <div className="space-y-3">
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-white/50">Ayuda</h4>
            <ul className="space-y-2 text-[12px] text-white/60">
              <li><Link href="/preguntas-frecuentes" className="hover:text-white transition-colors">Preguntas frecuentes</Link></li>
              <li><Link href="#contacto" className="hover:text-white transition-colors">Envíos</Link></li>
              <li><Link href="#contacto" className="hover:text-white transition-colors">Cambios y devoluciones</Link></li>
              <li><Link href="#contacto" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Pacheca */}
          <div className="space-y-3">
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-white/50">Pacheca</h4>
            <ul className="space-y-2 text-[12px] text-white/60">
              <li><Link href="/sobre-pacheca" className="hover:text-white transition-colors">Sobre nosotras</Link></li>
              <li><Link href="/favoritos" className="hover:text-white transition-colors">Mis favoritos</Link></li>
              <li><Link href="/clientes/resumen" className="hover:text-white transition-colors">Mi cuenta</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-3">
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-white/50">¿Necesitás ayuda?</h4>
            <a href={waUrl("Hola Pacheca!")} target="_blank" rel="noreferrer" className="block text-[12px] text-white/60 hover:text-white transition-colors">
              {WHATSAPP_DISPLAY}
            </a>
            <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" className="block text-[12px] text-white/60 hover:text-white transition-colors">
              @{INSTAGRAM}
            </a>
            <p className="text-[11px] text-white/30">General Deheza, Córdoba</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 pt-8 text-[10px] text-white/30">
          <p>© 2024 Pacheca. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white/60 transition-colors">Términos y condiciones</Link>
            <Link href="#" className="hover:text-white/60 transition-colors">Política de privacidad</Link>
          </div>
        </div>
      </footer>

      {/* WhatsApp flotante */}
      <a
        href={waUrl("Hola! Quiero consultar sobre las prendas de Pacheca.")}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:bg-[#20b858] transition-colors"
        title="Contactar por WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
