"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { MessageCircle, Heart, Star, Sparkles, Send } from "lucide-react";

export default function AsesoramientoPage() {
  const [nombre, setNombre] = useState("");
  const [ocasion, setOcasion] = useState("casual");
  const [detalles, setDetalles] = useState("");
  const [busto, setBusto] = useState("");
  const [cintura, setCintura] = useState("");
  const [cadera, setCadera] = useState("");

  const WHATSAPP = "+5493584377860";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let msg = `Hola Pacheca! Me gustaría recibir asesoramiento personalizado de estilo y talles.\n\n`;
    msg += `*Mis Datos:*\n`;
    msg += `- Nombre: ${nombre}\n`;
    msg += `- Ocasión o Estilo: ${ocasion.toUpperCase()}\n`;
    
    if (busto || cintura || cadera) {
      msg += `\n*Medidas para referencia:*\n`;
      if (busto) msg += `- Busto: ${busto} cm\n`;
      if (cintura) msg += `- Cintura: ${cintura} cm\n`;
      if (cadera) msg += `- Cadera: ${cadera} cm\n`;
    }

    if (detalles) {
      msg += `\n*Detalles / Consultas:*\n${detalles}\n`;
    }

    const waUrl = `https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-[#FCFAF7] text-[#111] py-16 md:py-24 text-left">
        <div className="max-w-3xl mx-auto px-5">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-3 block">Estilo Singular</span>
            <h1 className="text-3xl md:text-4xl font-serif text-black">Asesoramiento Personalizado</h1>
            <div className="h-0.5 w-12 bg-black mx-auto mt-4 mb-4"></div>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Queremos que cada prenda que lleves de Pacheca se sienta hecha a tu medida. Completá tus preferencias y te ayudaremos a armar tu conjunto ideal o elegir tu talle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Visual info */}
            <div className="space-y-6">
              <div className="border border-[#EADED2] p-6 bg-white space-y-4 rounded-sm shadow-2xs">
                <div className="h-10 w-10 rounded-full bg-[#FCFAF7] border border-[#EADED2] flex items-center justify-center text-black">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">¿Cómo funciona?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Completás el formulario de asesoramiento con la ocasión que buscás (trabajo, evento, diario) y opcionalmente tus medidas de contorno.
                </p>
              </div>

              <div className="border border-[#EADED2] p-6 bg-white space-y-4 rounded-sm shadow-2xs">
                <div className="h-10 w-10 rounded-full bg-[#FCFAF7] border border-[#EADED2] flex items-center justify-center text-black">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">Atención Inmediata</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  El formulario abrirá una conversación en nuestro WhatsApp donde te pasaremos fotos de opciones recomendadas y coordinaremos medidas específicas.
                </p>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="md:col-span-2 bg-white border border-[#EADED2] p-8 shadow-2xs rounded-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-black border-b border-[#EADED2] pb-3 mb-6">
                Contanos sobre vos
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Nombre */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider font-bold text-black">¿Cuál es tu nombre?</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FCFAF7] border border-[#EADED2] focus:border-black outline-none transition-colors rounded-sm"
                  />
                </div>

                {/* Ocasion */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider font-bold text-black">¿Para qué ocasión buscás vestirte?</label>
                  <select
                    value={ocasion}
                    onChange={(e) => setOcasion(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FCFAF7] border border-[#EADED2] focus:border-black outline-none transition-colors rounded-sm font-semibold uppercase tracking-wider text-[10px]"
                  >
                    <option value="casual">Uso diario / Casual</option>
                    <option value="trabajo">Oficina / Trabajo / Formal</option>
                    <option value="salida">Salida especial / Evento / Cocktail</option>
                    <option value="regalo">Para hacer un Regalo</option>
                  </select>
                </div>

                {/* Medidas (Opcionales) */}
                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-wider font-bold text-black">Medidas de Referencia <span className="text-gray-400 font-normal">(Opcional)</span></label>
                  <p className="text-[10px] text-gray-400">Si agregás tus centímetros aproximados, te ayudamos a asegurar el talle exacto.</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="number"
                      placeholder="Busto (cm)"
                      value={busto}
                      onChange={(e) => setBusto(e.target.value)}
                      className="px-3 py-2 text-xs bg-[#FCFAF7] border border-[#EADED2] focus:border-black outline-none rounded-sm font-mono"
                    />
                    <input
                      type="number"
                      placeholder="Cintura (cm)"
                      value={cintura}
                      onChange={(e) => setCintura(e.target.value)}
                      className="px-3 py-2 text-xs bg-[#FCFAF7] border border-[#EADED2] focus:border-black outline-none rounded-sm font-mono"
                    />
                    <input
                      type="number"
                      placeholder="Cadera (cm)"
                      value={cadera}
                      onChange={(e) => setCadera(e.target.value)}
                      className="px-3 py-2 text-xs bg-[#FCFAF7] border border-[#EADED2] focus:border-black outline-none rounded-sm font-mono"
                    />
                  </div>
                </div>

                {/* Comentarios o prendas de interes */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider font-bold text-black">¿Qué prendas o estilos te gustan de nuestra colección?</label>
                  <textarea
                    rows={4}
                    value={detalles}
                    onChange={(e) => setDetalles(e.target.value)}
                    placeholder="Ej: Busco un pantalón sastrero de lino fresco, o tengo dudas de si el talle M me va a quedar cómodo..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FCFAF7] border border-[#EADED2] focus:border-black outline-none transition-colors rounded-sm"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 rounded-sm"
                >
                  <MessageCircle className="h-4.5 w-4.5" /> Enviar por WhatsApp
                </button>

              </form>
            </div>

          </div>

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
