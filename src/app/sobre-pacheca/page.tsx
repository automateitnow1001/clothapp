"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { MapPin, Clock, MessageCircle, ArrowRight, Star } from "lucide-react";

const WHATSAPP = "+5493584377860";
const INSTAGRAM = "pacheca.almacen";
const ADDRESS = "Int. José Frouté 265, General Deheza, Córdoba";
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Int.+José+Frouté+265,+General+Deheza,+Córdoba,+Argentina";
const MAPS_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3358.6085!2d-63.7833!3d-33.0000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDAwJzAwLjAiUyA2M8KwNDYnNTkuOSJX!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar";

export default function SobrePachecaPage() {
  const waUrl = `https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent("Hola Pacheca! Vengo de ver su historia y me gustaría conocer más sobre la colección.")}`;

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-[#FCFAF7] text-[#111]">

        {/* ─── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative py-24 bg-black text-white overflow-hidden">
          {/* background watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
            <img src="/images/isologo.png" alt="" className="w-[500px] object-contain" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto text-center px-5">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-semibold mb-4 block">Somos Pacheca</span>
            <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight mb-6">
              Moda con Alma y Propósito <br />
              <span className="italic font-light text-white/70">Desde 2015</span>
            </h1>
            <p className="text-sm text-white/60 max-w-2xl mx-auto leading-relaxed">
              Descubrí quiénes somos, qué nos mueve y cómo trabajamos cada día para ofrecerte prendas delicadas, modernas y atemporales.
            </p>
          </div>
        </section>

        {/* ─── NUESTRA HISTORIA ─────────────────────────────────────────────── */}
        <section className="py-20 max-w-7xl mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Nuestra Historia</p>
              <h2 className="text-3xl md:text-4xl font-serif text-black leading-tight">
                De un sueño a tu <span className="italic font-light">guardarropas</span>
              </h2>
              <div className="h-0.5 w-12 bg-black" />
              <p className="text-sm text-gray-600 leading-relaxed">
                Pacheca comenzó en el año 2015 con una pequeña selección de prendas y un gran sueño: crear un espacio donde la moda sea sinónimo de expresión personal, comodidad y delicadeza. A lo largo de los años nos transformamos y adaptamos, pero nuestra esencia sigue intacta.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Seleccionamos cada textil, cada corte y cada prenda con una curaduría detallada. Entendemos que cada prenda que vestís cuenta una historia sobre quién sos. Por eso nos especializamos en indumentaria versátil que podés llevar del trabajo a una salida especial sin perder tu estilo único.
              </p>
              <blockquote className="border-l-2 border-black pl-4 text-sm text-gray-700 italic font-medium leading-relaxed">
                "Buscamos que te sientas segura, cómoda y auténtica en cada ocasión. Pacheca es moda real para mujeres reales."
              </blockquote>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors group"
                >
                  Ver Catálogo <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-black text-black px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-colors"
                >
                  Escribinos
                </a>
              </div>
            </div>

            {/* Visual Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                  <img src="/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp" alt="Colección Pacheca 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="aspect-square overflow-hidden bg-neutral-100">
                  <img src="/images/dsc01952-84e7f3aec48512c8b417781783150678-1024-1024.webp" alt="Detalle prenda Pacheca" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="aspect-square overflow-hidden bg-neutral-100">
                  <img src="/images/dsc03925-c363c606814907f35d17794751993895-1024-1024.webp" alt="Modelo Pacheca" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                  <img src="/images/img_3025-6de489edea28fd44c917477681715009-1024-1024.jpg" alt="Colección Pacheca 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CEO / LA DUEÑA ──────────────────────────────────────────────────── */}
        <section className="py-20 bg-[#f0ece8]">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Photo */}
              <div className="relative">
                <div className="aspect-[4/5] overflow-hidden bg-neutral-200 max-w-md mx-auto lg:mx-0">
                  <img
                    src="/images/ceo.png"
                    alt="Maria Virginia Recosta — Fundadora de Pacheca"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 lg:right-auto lg:-left-4 bg-black text-white px-5 py-4 shadow-lg">
                  <p className="font-bold text-sm">Desde 2015</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider">General Deheza, Cba.</p>
                </div>
                {/* Stars */}
                <div className="absolute top-4 left-4 flex space-x-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-white text-white drop-shadow" />
                  ))}
                </div>
              </div>

              {/* Text */}
              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">Detrás de Pacheca</p>
                <h2 className="text-3xl md:text-4xl font-serif text-black leading-tight">
                  Maria Virginia <span className="italic font-light">Recosta</span>
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Fundadora & Directora de Pacheca</p>
                <div className="h-0.5 w-12 bg-black" />

                <p className="text-sm text-gray-700 leading-relaxed">
                  Detrás de cada prenda que encontrás en Pacheca hay una persona con pasión, criterio y amor por la moda: <strong>Maria Virginia Recosta</strong>. Desde el primer día, ella se encarga de recorrer proveedores, seleccionar las mejores telas y tendencias, y asegurarse de que cada pieza que llega al local sea digna del nombre Pacheca.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Su visión siempre fue clara: que cada mujer que entre a Pacheca se vaya sintiéndose <em>cómoda, segura y feliz vistiendo a la moda</em>. Para eso trabaja incansablemente eligiendo los talles justos, los cortes favorecedores y los materiales de calidad que hacen que una prenda se sienta tan bien como se ve.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Más de 9 años de trayectoria la respaldan. Y con cada nueva colección, reafirma su compromiso con las mujeres de General Deheza y de todo el país: que vestirse bien es un derecho de todas, en cualquier talle.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
                  {[
                    { n: "+10 años", l: "De experiencia" },
                    { n: "+500", l: "Clientas felices" },
                    { n: "100%", l: "Curación propia" },
                  ].map((s) => (
                    <div key={s.l} className="text-center">
                      <p className="font-serif text-2xl text-black">{s.n}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.l}</p>
                    </div>
                  ))}
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> Contactar a Virginia
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── VALORES ──────────────────────────────────────────────────────── */}
        <section className="py-20 bg-white border-t border-[#EADED2]">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <div className="text-center max-w-xl mx-auto mb-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">Lo que nos define</p>
              <h2 className="text-2xl md:text-3xl font-serif text-black">Nuestros <span className="italic font-light">Valores</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: "✨", title: "Calidad Seleccionada", desc: "No vendemos ropa en serie. Curamos minuciosamente cada prenda priorizando telas nobles, terminaciones prolijas y la durabilidad de cada textil en tu guardarropas." },
                { icon: "🌸", title: "Atención Singular", desc: "Creemos en el asesoramiento humano. Queremos ayudarte a encontrar la prenda que mejor se adapte a tu silueta, tus gustos y tu estilo de vida." },
                { icon: "💫", title: "Elegancia Cotidiana", desc: "Diseñamos y elegimos prendas con una impronta moderna pero atemporal. Creemos en un estilo que se siente fresco y elegante sin esfuerzo." },
              ].map((v) => (
                <div key={v.title} className="border border-[#EADED2] p-8 text-center space-y-4 hover:shadow-md transition-shadow bg-[#FCFAF7] group">
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{v.icon}</div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black">{v.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── DIRECCIÓN + MAPA ─────────────────────────────────────────────── */}
        <section className="py-20 bg-[#FCFAF7]">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <div className="text-center mb-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">Encontranos</p>
              <h2 className="text-2xl md:text-3xl font-serif text-black">Visitá nuestro <span className="italic font-light">local</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {/* Info Cards */}
              <div className="space-y-5">
                {/* Dirección */}
                <div className="bg-white border border-[#EADED2] p-6 flex items-start gap-4 shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-black mb-1">Dirección</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{ADDRESS}</p>
                    <a
                      href={MAPS_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold uppercase tracking-wider text-black hover:text-gray-500 transition-colors"
                    >
                      Cómo llegar <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Horarios */}
                <div className="bg-white border border-[#EADED2] p-6 flex items-start gap-4 shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-black mb-2">Horarios de atención</h3>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm text-gray-700 border-b border-gray-100 pb-1.5">
                        <span className="font-medium">Mañana</span>
                        <span className="font-mono text-[13px]">9 a 12 hs</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-700 pt-0.5">
                        <span className="font-medium">Tarde</span>
                        <span className="font-mono text-[13px]">16.30 a 20 hs</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-3">Lunes a Sábados · Cerrado domingos</p>
                  </div>
                </div>

                {/* Contacto */}
                <div className="bg-white border border-[#EADED2] p-6 flex items-start gap-4 shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-black" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-black mb-1">Contacto</h3>
                    <a
                      href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition-colors"
                    >
                      <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                      +54 9 3584 37-7860
                    </a>
                    <a
                      href={`https://instagram.com/${INSTAGRAM}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                      @{INSTAGRAM}
                    </a>
                  </div>
                </div>

                {/* CTA */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Consultarnos por WhatsApp
                </a>
              </div>

              {/* Local Photo Card */}
              <div className="overflow-hidden border border-[#EADED2] shadow-sm bg-white">
                <div className="bg-black text-white px-5 py-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#F5E6D3]" />
                  <span className="text-[11px] uppercase tracking-widest font-bold">Nuestro Local</span>
                </div>
                <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                  <img
                    src="/images/local.png"
                    alt="Boutique Pacheca"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="bg-[#faf8f6] px-5 py-3.5 border-t border-[#EADED2] text-center">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Te invitamos a probarte tus prendas favoritas</span>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="overflow-hidden border border-[#EADED2] shadow-sm">
                <div className="bg-black text-white px-5 py-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-white/60" />
                  <span className="text-[11px] uppercase tracking-widest font-bold">{ADDRESS}</span>
                </div>
                <div className="relative aspect-[4/3] w-full bg-gray-100">
                  <iframe
                    title="Pacheca — General Deheza"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110022.8!2d-63.7833!3d-33.0573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95ca35b40e97ea3d%3A0x8f13abf2b07e74c9!2sGeneral%20Deheza%2C%20C%C3%B3rdoba!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar"
                    width="100%"
                    height="100%"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0, filter: "grayscale(20%) contrast(1.05)" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="bg-[#faf8f6] px-5 py-3 flex justify-between items-center border-t border-[#EADED2]">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">General Deheza, Córdoba, Argentina</span>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold uppercase tracking-wider text-black hover:text-gray-500 transition-colors"
                  >
                    Abrir en Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
