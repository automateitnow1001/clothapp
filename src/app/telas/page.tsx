"use client";

import React, { useState, useRef, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { db } from "@/lib/db";
import {
  Search, MessageCircle, Ruler,
  Calculator, Bot, Send, X, Layers, Scissors, Sparkles
} from "lucide-react";

// ─── DATA ──────────────────────────────────────────────────────────────────────
const WHATSAPP = "+5493584377860";
const ROLL_WIDTH_M = 1.5; // metros — ancho fijo del rollo

interface Fabric {
  id: string;
  name: string;
  category: string;
  uses: string[];
  description: string;
  pricePerMeter: number;
  colors: string[];
  emoji: string;
  care: string;
  img: string;
}

const FABRICS: Fabric[] = [
  // ── LISOS / BÁSICOS
  { id: "tul", name: "Tul", category: "Lisos y Base", uses: ["vestidos", "velos", "decoración", "tutús"], description: "Tejido de red muy fino y suave, ideal para capas decorativas en vestidos, velos de novia y disfraz.", pricePerMeter: 2800, colors: ["#fff", "#f9a8d4", "#a5b4fc", "#fef08a", "#000"], emoji: "🕸️", care: "Lavar a mano con agua fría.", img: "/images/fabric-tul.jpg" },
  { id: "raso", name: "Raso / Satén", category: "Lisos y Base", uses: ["vestidos de noche", "blusas", "lencería", "ropa interior"], description: "Tela de superficie lisa y brillante, con caída elegante. Ideal para prendas de gala y ropa interior.", pricePerMeter: 4200, colors: ["#fff", "#000", "#dc2626", "#1e40af", "#15803d", "#fcd34d"], emoji: "✨", care: "Lavar a mano con detergente suave.", img: "/images/fabric-raso.jpg" },
  { id: "mecanico", name: "Mecánico", category: "Lisos y Base", uses: ["ropa deportiva", "trajes de baño", "buzos", "leggings"], description: "Tela sintética elástica de alta resistencia. Excelente para ropa deportiva y trajes de baño por su durabilidad.", pricePerMeter: 3500, colors: ["#000", "#1e40af", "#dc2626", "#15803d", "#f97316", "#a855f7"], emoji: "⚙️", care: "Lavar a máquina en frío.", img: "/images/fabric-mecanico.jpg" },
  { id: "guata", name: "Guata / Guatón", category: "Relleno y Acolchados", uses: ["acolchados", "chalecos", "capas intermedias", "artesanías"], description: "Material esponjoso usado como relleno en acolchados, chalecos y proyectos artesanales. Brinda abrigo sin peso excesivo.", pricePerMeter: 1900, colors: ["#fff", "#f5f0e8"], emoji: "🧸", care: "Secar sin torcer ni escurrir.", img: "/images/fabric-guata.jpg" },
  { id: "arpillera", name: "Arpillera / Yute", category: "Rústicos y Naturales", uses: ["bolsas", "decoración rústica", "macetas", "artesanías"], description: "Tejido de fibra natural rústica, muy popular en decoración de hogar, manualidades y packaging ecológico.", pricePerMeter: 1500, colors: ["#c2a16e", "#8B7355"], emoji: "🌿", care: "No lavar, limpiar en seco.", img: "/images/fabric-arpillera.jpg" },
  { id: "algodon", name: "Algodón Liso", category: "Lisos y Base", uses: ["remeras", "ropa de cama", "delantales", "pijamas"], description: "Tela natural suave y transpirable, ideal para prendas de uso diario. Fácil de trabajar y muy versátil.", pricePerMeter: 2200, colors: ["#fff", "#000", "#fef3c7", "#ddd6fe", "#bbf7d0", "#fecaca"], emoji: "🌾", care: "Lavar a máquina hasta 40°C.", img: "/images/fabric-algodon.jpg" },
  { id: "viscosa", name: "Viscosa / Rayón", category: "Lisos y Base", uses: ["vestidos de verano", "blusas", "camisas", "forros"], description: "Fibra semisintética con caída suave similar a la seda. Fresca y cómoda para épocas de calor.", pricePerMeter: 3100, colors: ["#fff", "#000", "#fbbf24", "#10b981", "#8b5cf6", "#ef4444"], emoji: "🌊", care: "Lavar a mano o ciclo delicado.", img: "/images/fabric-viscosa.jpg" },
  { id: "lino", name: "Lino", category: "Naturales y Verano", uses: ["pantalones", "camisas de verano", "vestidos", "manteles"], description: "Tejido natural de gran transpirabilidad. Ideal para looks de verano con un toque natural y fresco.", pricePerMeter: 3800, colors: ["#f5f0dc", "#c2a16e", "#fff", "#000", "#6b7280"], emoji: "☀️", care: "Lavar a máquina en frío.", img: "/images/fabric-lino.jpg" },
  { id: "jean", name: "Jean / Denim", category: "Resistentes", uses: ["pantalones", "faldas", "camperas", "accesorios"], description: "Tejido de algodón resistente y duradero. Clásico del guardarropas occidental, versátil y durable.", pricePerMeter: 4500, colors: ["#1d4ed8", "#93c5fd", "#000", "#6b7280", "#fff"], emoji: "👖", care: "Lavar al revés a baja temperatura.", img: "/images/fabric-jean.jpg" },

  // ── ESTAMPADOS
  { id: "mecanico-estampado", name: "Mecánico Estampado", category: "Estampados", uses:["trajes de baño", "ropa deportiva", "tops"], description: "Mecánico con estampados vibrantes y modernos. Resistente al cloro y al sol, ideal para temporada de baño.", pricePerMeter: 4200, colors: ["#ec4899", "#f97316", "#06b6d4", "#8b5cf6", "#10b981"], emoji: "🎨", care: "Lavar a máquina en frío, sin centrifugado.", img: "/images/fabric-mecanico-estampado.jpg" },
  { id: "algodon-estampado", name: "Algodón Estampado", category: "Estampados", uses: ["vestidos", "delantales", "bolsas de tela", "patchwork"], description: "Algodón con estampados florales, geométricos o abstractos. Perfecto para proyectos creativos y prendas veraniegas.", pricePerMeter: 2800, colors: ["#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#fb923c"], emoji: "🌸", care: "Lavar a máquina hasta 40°C.", img: "/images/fabric-algodon-estampado.jpg" },
  { id: "viscosa-estampada", name: "Viscosa Estampada", category: "Estampados", uses: ["vestidos de verano", "blusas", "faldas midi"], description: "Viscosa con patrones contemporáneos. Cae de forma elegante, perfecta para looks de temporada calurosa.", pricePerMeter: 3600, colors: ["#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"], emoji: "🦋", care: "Lavar a mano o ciclo delicado.", img: "/images/fabric-viscosa-estampada.jpg" },
  { id: "poplin-estampado", name: "Popelín Estampado", category: "Estampados", uses: ["camisas", "vestidos", "niños"], description: "Tela de tacto liso con estampados clásicos a cuadros, rayas o florales. Muy popular en camisería.", pricePerMeter: 2500, colors: ["#fff", "#93c5fd", "#fca5a5", "#6ee7b7", "#fcd34d"], emoji: "🏵️", care: "Lavar a máquina hasta 30°C.", img: "/images/fabric-poplin.jpg" },
  { id: "lycra-estampada", name: "Lycra Estampada", category: "Estampados", uses: ["leggings", "shorts deportivos", "tops", "bodys"], description: "Tela elástica de cuatro vías con estampados. Alta elasticidad y recuperación, ideal para ropa ajustada.", pricePerMeter: 5200, colors: ["#000", "#ec4899", "#3b82f6", "#22c55e", "#f97316"], emoji: "🌈", care: "Lavar a mano o ciclo delicado en frío.", img: "/images/fabric-lycra.jpg" },

  // ── ESPECIALES
  { id: "tela-neoprene", name: "Neoprene / Scuba", category: "Especiales y Formales", uses: ["sacos", "faldas estructuradas", "vestidos formales"], description: "Tela gruesa con textura suave que mantiene su forma. Ideal para prendas formales con volumen controlado.", pricePerMeter: 5500, colors: ["#000", "#1e3a5f", "#7f1d1d", "#14532d", "#fff"], emoji: "🎭", care: "Lavar a mano con agua fría.", img: "/images/fabric-neoprene.jpg" },
  { id: "encaje", name: "Encaje", category: "Especiales y Formales", uses: ["vestidos de fiesta", "lencería", "overlay de novia", "accesorios"], description: "Tejido bordado de gran delicadeza. Perfecto como overlay en vestidos de fiesta, lencería y accesorios nupciales.", pricePerMeter: 6800, colors: ["#fff", "#fef3c7", "#f9a8d4", "#000", "#e2e8f0"], emoji: "🌺", care: "Lavar a mano con mucho cuidado.", img: "/images/fabric-encaje.jpg" },
  { id: "terciopelo", name: "Terciopelo", category: "Especiales y Formales", uses: ["blazers", "vestidos de noche", "tapizado", "accesorios"], description: "Tela de pelo corto y suave con efecto visual luxuoso. Muy utilizada en colecciones otoño-invierno.", pricePerMeter: 7200, colors: ["#7f1d1d", "#1e3a5f", "#000", "#14532d", "#4c1d95"], emoji: "👑", care: "Secar en plano, no retorcer.", img: "/images/fabric-terciopelo.jpg" },
  { id: "gasa", name: "Gasa / Chiffon", category: "Lisos y Base", uses: ["vestidos de noche", "pañuelos", "capas decorativas", "blusas"], description: "Tela muy liviana y transparente con caída fluida. Ideal para prendas etéreas y capas decorativas.", pricePerMeter: 3900, colors: ["#fff", "#fecdd3", "#bfdbfe", "#d9f99d", "#fde68a", "#f5d0fe"], emoji: "🌬️", care: "Lavar a mano con agua fría.", img: "/images/fabric-gasa.jpg" },
  { id: "polar", name: "Polar / Plush", category: "Abrigo", uses: ["buzos", "chalecos", "mantas", "ropa de bebé"], description: "Tela sintética suave y calentita. Perfecta para ropa de abrigo y accesorios de invierno. Muy fácil de trabajar.", pricePerMeter: 3300, colors: ["#000", "#fff", "#6b7280", "#1e3a5f", "#7f1d1d", "#fbbf24"], emoji: "🧣", care: "Lavar a máquina en frío.", img: "/images/fabric-polar.jpg" },
  { id: "gabardina", name: "Gabardina", category: "Resistentes", uses: ["tapados", "impermeables", "pantalones de vestir", "sacos"], description: "Tela resistente con diagonal visible. Clásica en sastrería para confeccionar pantalones de vestir, sacos y tapados.", pricePerMeter: 4800, colors: ["#000", "#1e3a5f", "#78350f", "#6b7280", "#fff"], emoji: "🧥", care: "Lavar a máquina con centrifugado suave.", img: "/images/fabric-gabardina.jpg" },
];

const CATEGORIES = ["Todas", ...Array.from(new Set(FABRICS.map((f) => f.category)))];

// ─── PROJECT CALCULATOR DATA ────────────────────────────────────────────────
interface ProjectTemplate {
  name: string;
  emoji: string;
  steps: string[];
  formula: (length: number, width?: number, height?: number) => number;
}

const PROJECT_TEMPLATES: Record<string, ProjectTemplate> = {
  almohada: {
    name: "Almohada", emoji: "🛏️",
    steps: ["Ingresá el largo de la almohada (cm)", "Ingresá el ancho (cm)"],
    formula: (largo, ancho = 50) => Math.ceil(((largo + 4) * 2 / 100) * 10) / 10,
  },
  bolsa: {
    name: "Bolsa / Tote", emoji: "👜",
    steps: ["Ingresá el alto de la bolsa (cm)", "Ingresá el ancho (cm)"],
    formula: (alto, ancho = 40) => Math.ceil(((alto * 2 + ancho + 20) / 100) * 10) / 10,
  },
  cortina: {
    name: "Cortina", emoji: "🏠",
    steps: ["Ingresá el alto de la ventana (cm)", "Ingresá el ancho (cm)"],
    formula: (alto, ancho = 120) => {
      const paneles = Math.ceil((ancho * 1.8) / (ROLL_WIDTH_M * 100));
      return Math.ceil(paneles * (alto + 20) / 100 * 10) / 10;
    },
  },
  falda: {
    name: "Falda / Saya", emoji: "👗",
    steps: ["Ingresá el largo de la falda (cm)"],
    formula: (largo) => Math.ceil(((largo + 10) / 100) * 10) / 10,
  },
  camisa: {
    name: "Camisa / Blusa", emoji: "👚",
    steps: ["Ingresá el largo de torso (cm)"],
    formula: (largo) => Math.ceil(((largo * 2.5) / 100) * 10) / 10,
  },
  mantel: {
    name: "Mantel", emoji: "🍽️",
    steps: ["Ingresá el largo de la mesa (cm)", "Ingresá el ancho (cm)"],
    formula: (largo, ancho = 90) => Math.ceil(((largo + 40) / 100) * 10) / 10,
  },
};

// ─── CHATBOT MESSAGES ───────────────────────────────────────────────────────
interface ChatMessage {
  role: "bot" | "user";
  text: string;
}

function getProjectReply(userMsg: string): string {
  const msg = userMsg.toLowerCase();
  if (msg.includes("almoha") || msg.includes("cojin") || msg.includes("cojín")) {
    return "🛏️ Para una **almohada estándar (50×70 cm)** necesitás aproximadamente **1.5 m** de tela. Considerando el ancho del rollo de 1.5m, con 1 metro tenés para hacer las dos caras si recortás bien.\n\n¿Querés calcular un tamaño diferente con el Cotizador?";
  }
  if (msg.includes("bolsa") || msg.includes("tote") || msg.includes("cartera")) {
    return "👜 Para una **bolsa tote estándar (40×35 cm)** necesitás aproximadamente **1 m** de tela. El ancho del rollo es de 1.5m, así que podés sacar varias piezas del mismo metro.\n\n¿Querés saber cuánto necesitás para tu tamaño exacto?";
  }
  if (msg.includes("cortina")) {
    return "🏠 Para **cortinas**, el cálculo depende del tamaño de tu ventana. Generalmente se usa 1.5× a 2× el ancho de la ventana. El rollo tiene 1.5m de ancho.\n\nEjemplo: ventana 120×220cm → necesitás aprox. **4-5 metros** de tela.\n\n¡Usá el Cotizador arriba para tu medida exacta!";
  }
  if (msg.includes("vestido") || msg.includes("falda") || msg.includes("saya")) {
    return "👗 Para un **vestido simple** necesitás entre 2 y 3 metros dependiendo de tu talle y el modelo. Para una **falda midi** alcanza con 1 a 1.5 metros.\n\nEl rollo tiene 1.5m de ancho, así que con 2 metros tenés bastante para trabajar.";
  }
  if (msg.includes("camisa") || msg.includes("blusa") || msg.includes("remera")) {
    return "👚 Para una **blusa o camisa** necesitás entre 1.5 y 2 metros de tela (depende del talle y estilo). El ancho del rollo es 1.5m, ideal para cortar el frente y espalda de una sola vez.";
  }
  if (msg.includes("mantel")) {
    return "🍽️ Para un **mantel de mesa** de 6 personas (180×90cm) necesitás aprox. **2.2 metros** de tela. El rollo de 1.5m de ancho te permite hacerlo sin costura central.";
  }
  if (msg.includes("precio") || msg.includes("cuanto cuesta") || msg.includes("cuánto cuesta")) {
    return "💰 Los precios varían según la tela. Van desde **$1.500/m** (arpillera) hasta **$7.200/m** (terciopelo).\n\nPodés ver los precios en el catálogo y usar el Cotizador para calcular el total según tus metros.";
  }
  if (msg.includes("hola") || msg.includes("buenas") || msg.includes("buendia")) {
    return "¡Hola! 👋 Soy el asistente de telas de Pacheca. Podés preguntarme:\n\n• ¿Cuánta tela necesito para...?\n• ¿Qué tela conviene para...?\n• ¿Cuánto cuesta...?\n\n¡Escribime lo que necesitás crear y te oriento!";
  }
  if (msg.includes("que tela") || msg.includes("qué tela") || msg.includes("cual tela") || msg.includes("cuál tela")) {
    if (msg.includes("playa") || msg.includes("baño") || msg.includes("natacion") || msg.includes("natación")) {
      return "🏖️ Para **traje de baño** o ropa de playa, lo mejor es el **Mecánico** o **Lycra Estampada**: son elásticos, resistentes al cloro y al sol, y no se deforman con el agua.";
    }
    if (msg.includes("sport") || msg.includes("deportiv") || msg.includes("gym")) {
      return "💪 Para **ropa deportiva**, te recomendamos **Mecánico** o **Lycra Estampada**. Tienen alta elasticidad, transpiran bien y resisten el movimiento. ¡Son ideales para gym y actividades al aire libre!";
    }
    if (msg.includes("fiesta") || msg.includes("noche") || msg.includes("gala")) {
      return "✨ Para **ropa de fiesta o gala**, las mejores opciones son:\n• **Raso/Satén** → elegante y con caída perfecta\n• **Encaje** → sofisticado y delicado\n• **Terciopelo** → lujoso para otoño-invierno\n• **Gasa/Chiffon** → ligero y etéreo";
    }
    return "🧵 Para orientarte mejor, ¿podés decirme qué querés confeccionar? Por ejemplo: ropa de baño, vestido de fiesta, pantalón, cortina, bolsa, etc.";
  }
  return "🤔 Entiendo que querés información sobre telas. ¿Podés contarme qué proyecto tenés en mente?\n\nPor ejemplo: *\"Quiero hacer cortinas para una ventana de 120cm\"* o *\"Necesito tela para un traje de baño\"*.\n\n¡O escribinos directo por WhatsApp y te ayudamos personalmente! 💬";
}

// ─── FABRIC CARD ────────────────────────────────────────────────────────────
function FabricCard({ fabric }: { fabric: Fabric }) {
  const [showDetail, setShowDetail] = useState(false);
  const waMsg = encodeURIComponent(`Hola Pacheca! Me interesa la tela ${fabric.name}. ¿Tienen disponibilidad y podrían decirme el precio por metro?`);

  return (
    <div className="bg-white border border-gray-100 hover:shadow-md transition-all duration-300 group">
      {/* Image placeholder with emoji */}
      <div className="relative aspect-square bg-gradient-to-br from-[#f5f0e8] to-[#e8e0d5] flex items-center justify-center overflow-hidden">
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{fabric.emoji}</span>
        <div className="absolute top-3 left-3">
          <span className="bg-black text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
            {fabric.category}
          </span>
        </div>
        {/* Color swatches */}
        <div className="absolute bottom-3 left-3 flex space-x-1">
          {fabric.colors.slice(0, 5).map((c, i) => (
            <span key={i} className="h-4 w-4 rounded-full border border-white/60 shadow-sm" style={{ backgroundColor: c }} title={c} />
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-gray-900 leading-tight">{fabric.name}</h3>
          <span className="font-mono text-sm font-bold text-black whitespace-nowrap shrink-0">
            ${fabric.pricePerMeter.toLocaleString("es-AR")}/m
          </span>
        </div>

        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{fabric.description}</p>

        {/* Uses tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {fabric.uses.slice(0, 3).map((u) => (
            <span key={u} className="bg-[#f5f0e8] text-[9px] text-gray-600 px-2 py-0.5 uppercase tracking-wider font-medium">
              {u}
            </span>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="flex-1 border border-black text-black text-[10px] font-bold uppercase tracking-wider py-2 hover:bg-black hover:text-white transition-colors"
          >
            {showDetail ? "Cerrar" : "Ver más"}
          </button>
          <a
            href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${waMsg}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider py-2 text-center hover:bg-black/80 transition-colors"
          >
            Consultar
          </a>
        </div>

        {showDetail && (
          <div className="border-t border-gray-100 pt-3 mt-2 space-y-2 text-[11px] text-gray-600">
            <p><strong className="text-black">Cuidados:</strong> {fabric.care}</p>
            <p><strong className="text-black">Usos:</strong> {fabric.uses.join(", ")}</p>
            <p><strong className="text-black">Ancho del rollo:</strong> {ROLL_WIDTH_M} metros</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CALCULATOR ─────────────────────────────────────────────────────────────
function FabricCalculator() {
  const [project, setProject] = useState<string>("");
  const [dim1, setDim1] = useState("");
  const [dim2, setDim2] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [fabricId, setFabricId] = useState("");
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

  const template = project ? PROJECT_TEMPLATES[project] : null;
  const selectedFabric = FABRICS.find((f) => f.id === fabricId);

  function calculate() {
    if (!template || !dim1) return;
    const d1 = parseFloat(dim1);
    const d2 = parseFloat(dim2 || "0");
    const meters = template.formula(d1, d2);
    setResult(meters);
    if (selectedFabric) {
      setTotalPrice(Math.ceil(meters * selectedFabric.pricePerMeter));
    } else {
      setTotalPrice(null);
    }
  }

  const waMsg = encodeURIComponent(
    `Hola Pacheca! Calculé que necesito ${result}m de tela${selectedFabric ? ` (${selectedFabric.name})` : ""} para mi proyecto de ${template?.name}. ¿Tienen disponibilidad?`
  );

  return (
    <div className="bg-white border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-black">Cotizador por Centímetros</h3>
          <p className="text-[11px] text-gray-500">Ancho del rollo: <strong className="text-black">{ROLL_WIDTH_M} metros</strong></p>
        </div>
      </div>

      {/* Step 1: Project */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
          1. ¿Qué querés crear?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(PROJECT_TEMPLATES).map(([key, tmpl]) => (
            <button
              key={key}
              onClick={() => { setProject(key); setResult(null); setDim1(""); setDim2(""); }}
              className={`flex items-center gap-2 px-3 py-2.5 border text-[11px] font-medium transition-colors ${
                project === key ? "bg-black text-white border-black" : "border-gray-200 text-gray-700 hover:border-black"
              }`}
            >
              <span className="text-base">{tmpl.emoji}</span>
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Dimensions */}
      {template && (
        <div className="space-y-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
            2. Medidas (en centímetros)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">{template.steps[0]}</label>
              <input
                type="number"
                value={dim1}
                onChange={(e) => setDim1(e.target.value)}
                placeholder="Ej: 220"
                className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
              />
            </div>
            {template.steps[1] && (
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">{template.steps[1]}</label>
                <input
                  type="number"
                  value={dim2}
                  onChange={(e) => setDim2(e.target.value)}
                  placeholder="Ej: 120"
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Choose Fabric (optional) */}
      {template && dim1 && (
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
            3. ¿Qué tela? <span className="font-normal text-gray-400">(opcional, para ver precio total)</span>
          </label>
          <select
            value={fabricId}
            onChange={(e) => setFabricId(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black bg-white"
          >
            <option value="">— Elegí una tela —</option>
            {FABRICS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.emoji} {f.name} — ${f.pricePerMeter.toLocaleString("es-AR")}/m
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Calculate Button */}
      {template && dim1 && (
        <button
          onClick={calculate}
          className="w-full bg-black text-white py-3.5 text-[11px] font-bold uppercase tracking-widest hover:bg-black/85 transition-colors flex items-center justify-center gap-2"
        >
          <Ruler className="h-4 w-4" />
          Calcular metros necesarios
        </button>
      )}

      {/* Result */}
      {result !== null && (
        <div className="bg-[#f5f0e8] border border-[#e0d5c5] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-black" />
            <h4 className="font-bold text-sm text-black uppercase tracking-wider">Resultado</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Metros de tela</p>
              <p className="text-3xl font-serif text-black font-bold">{result}m</p>
            </div>
            {totalPrice !== null && selectedFabric && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Precio estimado</p>
                <p className="text-3xl font-serif text-black font-bold">
                  ${totalPrice.toLocaleString("es-AR")}
                </p>
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            ✅ Ancho del rollo considerado: <strong>{ROLL_WIDTH_M}m</strong>. El precio es orientativo, puede variar según stock y cantidad.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${waMsg}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-black text-white py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-black/80 transition-colors w-full"
          >
            <MessageCircle className="h-4 w-4" />
            Confirmar pedido por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

// ─── CHATBOT ─────────────────────────────────────────────────────────────────
function FabricChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "¡Hola! 👋 Soy el asistente de telas de Pacheca. Contame qué necesitás crear y te ayudo a elegir la tela y cantidad correcta.\n\n¿Qué proyecto tenés en mente?" },
  ]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setTimeout(() => {
      const reply = getProjectReply(userMsg);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    }, 600);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-full bg-[#111] text-white flex items-center justify-center shadow-lg hover:bg-black/80 transition-colors"
        title="Asistente de telas"
      >
        <Bot className="h-6 w-6" />
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white border border-gray-200 shadow-2xl flex flex-col" style={{ height: "480px", borderRadius: 0 }}>
          {/* Header */}
          <div className="bg-black text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Asistente de Telas</p>
                <p className="text-[9px] text-white/50">Pacheca · General Deheza</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2.5 text-[12px] leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-black text-white"
                      : "bg-[#f5f0e8] text-gray-800 border border-[#e0d5c5]"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Shortcuts */}
          <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto shrink-0">
            {["Almohada", "Cortinas", "Bolsa", "Vestido"].map((q) => (
              <button
                key={q}
                onClick={() => { setInput(`¿Cuánta tela necesito para una ${q.toLowerCase()}?`); }}
                className="whitespace-nowrap text-[9px] uppercase tracking-wider font-bold bg-gray-100 text-gray-600 px-2.5 py-1.5 hover:bg-black hover:text-white transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Escribí tu consulta..."
              className="flex-1 border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black"
            />
            <button
              onClick={sendMessage}
              className="bg-black text-white px-3 py-2 hover:bg-black/80 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* WA footer */}
          <div className="border-t border-gray-100 px-3 py-2 shrink-0">
            <a
              href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent("Hola Pacheca! Tengo una consulta sobre telas.")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 hover:text-black transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 text-green-500" />
              Hablar con una persona real por WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function TelasPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [activeUse, setActiveUse] = useState("Todas");
  const [showCalc, setShowCalc] = useState(false);
  const [dbFabrics, setDbFabrics] = useState<Fabric[]>([]);

  useEffect(() => {
    db.products.list().then((list) => {
      const fabricProducts = list.filter(
        (p: any) => p.product_type === "telas" || p.category_id === "c9" || p.category_id === "c10" || p.category_id === "c11"
      );
      
      const mapped: Fabric[] = fabricProducts.map((p: any) => ({
        id: p.id,
        name: p.name_public,
        category: p.category_id === "c9" ? "Lisos y Base" : p.category_id === "c10" ? "Estampados" : "Rústicos y Naturales",
        uses: p.tags || ["costura", "confección"],
        description: p.description_public || p.description_original || "",
        pricePerMeter: p.price_final,
        colors: p.colors || ["#fff", "#000"],
        emoji: "🧵",
        care: "Lavar con agua fría.",
        img: p.images?.[0] || "/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp",
      }));
      setDbFabrics(mapped);
    });
  }, []);

  const allFabrics = [...FABRICS, ...dbFabrics];

  const filtered = allFabrics.filter((f) => {
    const matchCat = activeCategory === "Todas" || f.category === activeCategory;
    const matchUse = activeUse === "Todas" || f.uses.some((u) => u.toLowerCase().includes(activeUse.toLowerCase()));
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase()) || f.uses.some((u) => u.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchUse && matchSearch;
  });

  const waMsg = encodeURIComponent("Hola Pacheca! Estoy buscando una tela y no encuentro la que necesito. ¿Me pueden asesorar?");

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-[#FCFAF7] text-[#111]">

        {/* ─── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative py-20 md:py-28 bg-black text-white overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none flex items-center justify-end pr-10">
            <img src="/images/isologo.png" alt="" className="h-full object-contain" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10">
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center gap-2">
                <Layers className="h-3 w-3" /> Sección de Telas
              </p>
              <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight mb-5">
                Telas para cada <br /><span className="italic font-light text-white/70">creación</span>
              </h1>
              <p className="text-sm text-white/60 leading-relaxed max-w-xl mb-8">
                Encontrá la tela ideal para tu proyecto. Desde lisos clásicos hasta estampados modernos, tenemos una selección amplia para costura, confección y manualidades. El ancho del rollo es de <strong className="text-white">1.5 metros</strong>.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowCalc(!showCalc)}
                  className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
                >
                  <Calculator className="h-4 w-4" />
                  Cotizador de tela
                </button>
                <a
                  href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${waMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Asesoramiento por WA
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CALCULATOR (toggled) ─────────────────────────────────────────── */}
        {showCalc && (
          <section className="py-12 bg-[#f0ece8] border-b border-[#ddd5c8]">
            <div className="max-w-3xl mx-auto px-5 md:px-10">
              <FabricCalculator />
            </div>
          </section>
        )}

        {/* ─── WHATSAPP NOTICE ─────────────────────────────────────────────── */}
        <section className="bg-[#f5f0e8] border-b border-[#ddd5c8] py-5">
          <div className="max-w-7xl mx-auto px-5 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-green-600 shrink-0" />
              <p className="text-sm text-gray-700 font-medium">
                ¿No encontrás la tela que buscás?{" "}
                <span className="text-gray-500">Escribinos y te asesoramos.</span>
              </p>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Consultanos por WhatsApp
            </a>
          </div>
        </section>

        {/* ─── FILTERS ──────────────────────────────────────────────────────── */}
        <section className="sticky top-[64px] z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-5 md:px-10 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar telas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 focus:outline-none focus:border-black bg-white"
              />
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                    activeCategory === cat ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:border-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CATALOG ──────────────────────────────────────────────────────── */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                {filtered.length} tela{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => setShowCalc(true)}
                className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors border-b border-gray-300 pb-0.5"
              >
                <Ruler className="h-3.5 w-3.5" />
                Cotizador por cm
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24 space-y-4">
                <p className="text-4xl">🧵</p>
                <p className="text-sm text-gray-500">No encontramos telas con esos criterios.</p>
                <button
                  onClick={() => { setSearch(""); setActiveCategory("Todas"); setActiveUse("Todas"); }}
                  className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filtered.map((f) => (
                  <FabricCard key={f.id} fabric={f} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── INLINE CALCULATOR (always visible at bottom) ─────────────────── */}
        <section className="py-16 bg-[#f0ece8] border-t border-[#ddd5c8]">
          <div className="max-w-3xl mx-auto px-5 md:px-10">
            <div className="text-center mb-10">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-3">Calculá tu proyecto</p>
              <h2 className="text-2xl md:text-3xl font-serif text-black">
                Cotizador de <span className="italic font-light">tela por centímetros</span>
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                El ancho del rollo es de <strong className="text-black">1.5 metros</strong>. Ingresá las medidas de tu proyecto y calculamos los metros que necesitás.
              </p>
            </div>
            <FabricCalculator />
          </div>
        </section>

        {/* ─── WA CTA FOOTER ────────────────────────────────────────────────── */}
        <section className="py-16 bg-black text-white text-center">
          <div className="max-w-2xl mx-auto px-5 space-y-5">
            <Scissors className="h-10 w-10 text-white/30 mx-auto" />
            <h2 className="text-2xl font-serif">¿No encontrás la tela que buscás?</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Escribinos por WhatsApp y te asesoramos personalmente. Contamos con amplia variedad de géneros y podemos ayudarte a encontrar exactamente lo que necesitás para tu proyecto.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Escribinos por WhatsApp
            </a>
          </div>
        </section>

      </main>

      <Footer />
      <FabricChatbot />
      <WhatsAppButton />
    </>
  );
}
