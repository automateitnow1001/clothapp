"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { db, SizeGuide } from "@/lib/db";
import { Ruler, MessageCircle, ArrowRight, ShieldCheck, Info } from "lucide-react";

export default function BuscadorTallePage() {
  const [busto, setBusto] = useState(90);
  const [cintura, setCintura] = useState(72);
  const [cadera, setCadera] = useState(98);

  const [talleSuperior, setTalleSuperior] = useState("M");
  const [talleInferior, setTalleInferior] = useState("M");
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>([]);

  const WHATSAPP = "+5493584377860";

  // Load size guides from database
  useEffect(() => {
    const loadGuides = async () => {
      try {
        const list = await db.sizeGuides.list();
        setSizeGuides(list);
      } catch (e) {
        console.error(e);
      }
    };
    loadGuides();
  }, []);

  // Calculate size on changes
  useEffect(() => {
    if (sizeGuides.length === 0) {
      // Fallback static calculation
      if (busto < 85) setTalleSuperior("XS");
      else if (busto >= 85 && busto < 92) setTalleSuperior("S");
      else if (busto >= 92 && busto < 99) setTalleSuperior("M");
      else if (busto >= 99 && busto < 106) setTalleSuperior("L");
      else if (busto >= 106 && busto < 113) setTalleSuperior("XL");
      else if (busto >= 113 && busto < 120) setTalleSuperior("XXL");
      else setTalleSuperior("Talles Especiales (3XL+)");

      const waistScore = (cintura - 60) / 8;
      const hipScore = (cadera - 88) / 8;
      const avgScore = (waistScore + hipScore) / 2;

      if (avgScore < 0.5) setTalleInferior("34 (XS)");
      else if (avgScore >= 0.5 && avgScore < 1.5) setTalleInferior("36 (S)");
      else if (avgScore >= 1.5 && avgScore < 2.5) setTalleInferior("38 (M)");
      else if (avgScore >= 2.5 && avgScore < 3.5) setTalleInferior("40 (L)");
      else if (avgScore >= 3.5 && avgScore < 4.5) setTalleInferior("42 (XL)");
      else if (avgScore >= 4.5 && avgScore < 5.5) setTalleInferior("44 (XXL)");
      else if (avgScore >= 5.5 && avgScore < 6.5) setTalleInferior("46 (3XL)");
      else setTalleInferior("Talles Especiales (48+)");
      return;
    }

    // Dynamic top calculation based on database ranges
    const topMatch = sizeGuides.find(sg => busto >= sg.bust_min && busto <= sg.bust_max);
    if (topMatch) {
      setTalleSuperior(topMatch.size);
    } else {
      if (busto < 78) setTalleSuperior("XS");
      else setTalleSuperior("Talles Especiales (3XL+)");
    }

    // Dynamic bottom calculation based on database ranges
    const waistMatch = sizeGuides.find(sg => cintura >= sg.waist_min && cintura <= sg.waist_max);
    const hipMatch = sizeGuides.find(sg => cadera >= sg.hip_min && cadera <= sg.hip_max);

    if (waistMatch && hipMatch) {
      setTalleInferior(waistMatch.size === hipMatch.size ? waistMatch.size : `${waistMatch.size} / ${hipMatch.size}`);
    } else if (waistMatch) {
      setTalleInferior(waistMatch.size);
    } else if (hipMatch) {
      setTalleInferior(hipMatch.size);
    } else {
      if (cintura < 58 || cadera < 84) setTalleInferior("XS");
      else setTalleInferior("Talles Especiales (XXL+)");
    }

  }, [busto, cintura, cadera, sizeGuides]);

  const getWhatsAppLink = () => {
    const text = `Hola Pacheca! Usé el Buscador de Talles de la web con mis medidas (Busto: ${busto}cm, Cintura: ${cintura}cm, Cadera: ${cadera}cm) y quería recibir asesoramiento personalizado sobre qué talle me conviene en la nueva colección.`;
    return `https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-[#FCFAF7] text-[#111] py-16 md:py-24 text-left">
        <div className="max-w-4xl mx-auto px-5">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-3 block">Herramienta Interactiva</span>
            <h1 className="text-3xl md:text-4xl font-serif text-black">Buscador de Talles</h1>
            <div className="h-0.5 w-12 bg-black mx-auto mt-4 mb-4"></div>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Ingresá tus medidas en centímetros deslizando los controles y nuestro recomendador te sugerirá tus talles sugeridos para prendas superiores e inferiores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            
            {/* Left Column: Input Sliders */}
            <div className="bg-white border border-[#EADED2] p-8 shadow-2xs space-y-8 rounded-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-black border-b border-[#EADED2] pb-3 flex items-center gap-2">
                <Ruler className="h-4 w-4" /> Ingresá tus Medidas
              </h3>

              {/* Busto */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="uppercase tracking-wider text-black">Busto</span>
                  <span className="font-mono text-sm bg-[#FCFAF7] border border-[#EADED2] px-2.5 py-1 rounded-sm">{busto} cm</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="135"
                  value={busto}
                  onChange={(e) => setBusto(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer bg-gray-200 h-1.5 rounded-lg"
                />
                <p className="text-[10px] text-gray-400">Medí el contorno pasando por el punto más saliente del pecho.</p>
              </div>

              {/* Cintura */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="uppercase tracking-wider text-black">Cintura</span>
                  <span className="font-mono text-sm bg-[#FCFAF7] border border-[#EADED2] px-2.5 py-1 rounded-sm">{cintura} cm</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="125"
                  value={cintura}
                  onChange={(e) => setCintura(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer bg-gray-200 h-1.5 rounded-lg"
                />
                <p className="text-[10px] text-gray-400">Medí la parte más estrecha del torso, justo encima del ombligo.</p>
              </div>

              {/* Cadera */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="uppercase tracking-wider text-black">Cadera</span>
                  <span className="font-mono text-sm bg-[#FCFAF7] border border-[#EADED2] px-2.5 py-1 rounded-sm">{cadera} cm</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="145"
                  value={cadera}
                  onChange={(e) => setCadera(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer bg-gray-200 h-1.5 rounded-lg"
                />
                <p className="text-[10px] text-gray-400">Medí el contorno a la altura de la parte más ancha de la cadera.</p>
              </div>
            </div>

            {/* Right Column: Suggested Sizes */}
            <div className="bg-black text-[#F5E6D3] p-8 flex flex-col justify-between rounded-sm shadow-2xs space-y-6">
              
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white border-b border-gray-800 pb-3">
                  Tus talles sugeridos
                </h3>

                {/* Suggested Top */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Prendas Superiores</span>
                  <p className="text-xs text-gray-400">(Remeras, Tops, Sweaters, Camisas)</p>
                  <p className="text-3xl font-serif text-white pt-1">{talleSuperior}</p>
                </div>

                {/* Suggested Bottom */}
                <div className="space-y-1 pt-4 border-t border-gray-900">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Prendas Inferiores</span>
                  <p className="text-xs text-gray-400">(Jeans, Pantalones, Shorts, Minis)</p>
                  <p className="text-3xl font-serif text-white pt-1">{talleInferior}</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-900">
                <div className="flex items-start gap-2 text-[10px] text-gray-400 leading-relaxed">
                  <Info className="h-4 w-4 text-[#C8A27C] shrink-0 mt-0.5" />
                  <span>* Esta sugerencia es orientativa. El calce puede variar según el textil, corte y elasticidad de cada modelo.</span>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/catalogo"
                    className="bg-[#F5E6D3] text-black text-center py-3 text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center justify-center gap-2"
                  >
                    Ver Catálogo <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-[#F5E6D3] text-[#F5E6D3] hover:bg-[#F5E6D3] hover:text-black text-center py-3 text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4.5 w-4.5" /> Confirmar Talle por WhatsApp
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* Guarantee / Info Section */}
          <div className="mt-16 bg-white border border-[#EADED2] p-8 rounded-sm text-center max-w-xl mx-auto shadow-2xs space-y-4">
            <div className="flex justify-center text-2xl">✨</div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-black">Acompañamiento Pacheca</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Trabajamos con moldería real pensada para cuerpos reales y gran parte de nuestros diseños están desarrollados en géneros elastizados y adaptables para asegurar confort y elegancia.
            </p>
          </div>

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
