"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Eye, Heart } from "lucide-react";
import { usePathname } from "next/navigation";

interface SocialProofEvent {
  name: string;
  city: string;
  action: string;
  product: string;
  type: "purchase" | "viewing" | "favorite";
  timeAgo: string;
}

const NAMES = [
  "María Teresa", "Valentina", "Luciana", "Camila", "Sofía",
  "Florencia", "Daniela", "Agustina", "Carolina", "Romina",
  "Natalia", "Vanesa", "Paola", "Micaela", "Julieta",
  "Antonella", "Jimena", "Sabrina", "Verónica", "Lorena",
];

const CITIES = [
  "General Deheza", "Villa María", "Córdoba", "Río Cuarto",
  "San Francisco", "Bell Ville", "Alta Gracia", "Mendoza",
  "Rosario", "Buenos Aires", "La Plata", "Mar del Plata",
  "Tucumán", "Salta", "Neuquén", "Santa Fe",
];

const PRODUCTS = [
  "Conjunto Basic Oversize",
  "Conjunto Hoodie Soft",
  "Conjunto Comfort Zip",
  "Conjunto Relax Fit",
  "Blusa Cruzada Satin",
  "Conjunto Cozy Lounge",
  "Pantalón de Jean",
  "Blusa Floral Verano",
  "Chaleco Acolchado",
  "Conjunto Deportivo",
  "Vestido Casual Midi",
  "Falda Midi Raso",
  "Buzo Oversized",
  "Campera Liviana",
  "Top Cruzado",
  "Remera Algodón Premium",
];

const EVENTS: Array<Omit<SocialProofEvent, "name" | "city" | "product" | "timeAgo">> = [
  { action: "acaba de comprar", type: "purchase" },
  { action: "acaba de comprar", type: "purchase" },
  { action: "acaba de comprar", type: "purchase" },
  { action: "está a punto de comprar", type: "purchase" },
  { action: "está mirando", type: "viewing" },
  { action: "guardó en favoritos", type: "favorite" },
  { action: "realizó un pedido de", type: "purchase" },
  { action: "acaba de reservar", type: "purchase" },
];

const TIME_AGO = [
  "hace un momento", "hace 2 min", "hace 3 min",
  "hace 5 min", "justo ahora", "hace 1 min",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEvent(): SocialProofEvent {
  const template = randomFrom(EVENTS);
  return {
    name: randomFrom(NAMES),
    city: randomFrom(CITIES),
    action: template.action,
    product: randomFrom(PRODUCTS),
    type: template.type,
    timeAgo: randomFrom(TIME_AGO),
  };
}

export default function SocialProofToast() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<SocialProofEvent | null>(null);
  const [exiting, setExiting] = useState(false);

  const showToast = useCallback(() => {
    const event = generateEvent();
    setCurrent(event);
    setExiting(false);
    setVisible(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setExiting(true);
      setTimeout(() => setVisible(false), 400);
    }, 5000);
  }, []);

  useEffect(() => {
    if (pathname && pathname.startsWith("/admin")) {
      return;
    }
    // Show first toast after 8 seconds
    const initial = setTimeout(showToast, 8000);

    // Then repeat every 60 seconds
    const interval = setInterval(showToast, 60000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [showToast, pathname]);

  if (pathname && pathname.startsWith("/admin")) return null;
  if (!visible || !current) return null;

  const Icon = current.type === "purchase"
    ? ShoppingBag
    : current.type === "viewing"
    ? Eye
    : Heart;

  const iconColor = current.type === "purchase"
    ? "text-green-600"
    : current.type === "viewing"
    ? "text-blue-500"
    : "text-rose-500";

  return (
    <div
      className={`fixed bottom-24 left-4 z-50 max-w-[280px] sm:max-w-[320px] transition-all duration-400 ${
        exiting
          ? "opacity-0 translate-y-2 pointer-events-none"
          : "opacity-100 translate-y-0"
      }`}
      style={{
        animation: exiting ? undefined : "socialProofIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
    >
      <style>{`
        @keyframes socialProofIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="bg-white border border-gray-100 shadow-xl rounded-none overflow-hidden flex items-start gap-0">
        {/* Left accent bar */}
        <div className={`w-1 self-stretch shrink-0 ${
          current.type === "purchase" ? "bg-green-500" :
          current.type === "viewing" ? "bg-blue-400" : "bg-rose-400"
        }`} />

        <div className="flex items-start gap-3 px-4 py-3 flex-1">
          {/* Icon */}
          <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
            current.type === "purchase" ? "bg-green-50" :
            current.type === "viewing" ? "bg-blue-50" : "bg-rose-50"
          }`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-gray-800 leading-snug">
              <span className="font-bold">{current.name}</span>
              {" "}de{" "}
              <span className="font-semibold">{current.city}</span>
              {" "}{current.action}{" "}
              <span className="font-bold text-black italic">{current.product}</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
              {current.timeAgo} · Pacheca
            </p>
          </div>

          {/* Close */}
          <button
            onClick={() => { setExiting(true); setTimeout(() => setVisible(false), 400); }}
            className="text-gray-300 hover:text-gray-500 transition-colors shrink-0 -mt-0.5 -mr-1"
            aria-label="Cerrar"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Pacheca logo strip */}
      <div className="bg-black/5 border-t border-gray-100 px-4 py-1 flex items-center gap-1.5">
        <img src="/images/isologo.png" alt="" className="h-3.5 w-3.5 object-contain opacity-40" />
        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-medium">pacheca.almacen</span>
      </div>
    </div>
  );
}
