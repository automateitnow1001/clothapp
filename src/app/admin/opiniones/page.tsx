"use client";

import React, { useState } from "react";
import { Star, Check, Trash2, Eye, EyeOff, MessageCircle, User, Filter } from "lucide-react";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  product_name?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const mockReviews: Review[] = [
  {
    id: "r1",
    customer_name: "Belén L.",
    rating: 5,
    comment: "Amé el conjunto! La calidad de la tela es increíble, suave y sin arrugas. El talle M me quedó perfecto.",
    product_name: "Remera Básica Zoe",
    status: "approved",
    created_at: "2026-06-10T14:23:00Z",
  },
  {
    id: "r2",
    customer_name: "Camila G.",
    rating: 4,
    comment: "Muy linda la blusa, el color es igual a la foto. Le saco una estrella solo porque tardó 2 semanas más de lo esperado.",
    product_name: "Blusa de Lino Mía",
    status: "approved",
    created_at: "2026-06-08T10:11:00Z",
  },
  {
    id: "r3",
    customer_name: "Martina D.",
    rating: 5,
    comment: "Excelente atención! Me ayudaron con el talle por WhatsApp y el sweater quedó perfecto. Lo recomiendo 100%.",
    product_name: "Sweater Olivia Nube",
    status: "pending",
    created_at: "2026-06-13T19:45:00Z",
  },
  {
    id: "r4",
    customer_name: "Valentina R.",
    rating: 3,
    comment: "El producto es lindo pero el color en persona es un poco más oscuro que en la foto. Igual me quedo con él.",
    product_name: "Top Lencero Encaje",
    status: "pending",
    created_at: "2026-06-12T08:30:00Z",
  },
  {
    id: "r5",
    customer_name: "Sofía T.",
    rating: 5,
    comment: "Ya es la cuarta vez que compro en Pacheca y siempre quedo súper conforme. Las prendas son de una calidad impecable!",
    status: "approved",
    created_at: "2026-06-05T16:00:00Z",
  },
];

export default function AdminOpinionesPage() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const approve = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
  };

  const reject = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
  };

  const remove = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const filtered = reviews.filter(r => filter === "all" || r.status === filter);

  const statusBadge = (status: Review["status"]) => {
    const map = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-red-50 text-red-600 border-red-200",
    };
    const labels = { pending: "Pendiente", approved: "Aprobada", rejected: "Rechazada" };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded ${map[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-dark uppercase tracking-wide">Opiniones de Clientas</h1>
          <p className="text-xs text-text-muted mt-1">Moderación de reseñas públicas del catálogo</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-semibold">{reviews.filter(r => r.status === "pending").length} pendientes</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border rounded transition-colors ${
              filter === f ? "bg-primary text-white border-primary" : "bg-white text-text-muted border-border-brand hover:border-text-dark"
            }`}
          >
            {f === "all" ? "Todas" : f === "pending" ? "Pendientes" : f === "approved" ? "Aprobadas" : "Rechazadas"}
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white border border-border-brand rounded-lg text-xs text-text-muted">
            No hay opiniones en esta categoría.
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="bg-white border border-border-brand rounded-lg p-5 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                    {r.customer_name[0]}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-text-dark">{r.customer_name}</span>
                      {statusBadge(r.status)}
                    </div>
                    {r.product_name && (
                      <p className="text-[10px] text-text-muted">
                        Sobre: <span className="font-semibold text-text-dark">{r.product_name}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.status === "pending" && (
                    <>
                      <button
                        onClick={() => approve(r.id)}
                        title="Aprobar"
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-bold hover:bg-emerald-100 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Aprobar
                      </button>
                      <button
                        onClick={() => reject(r.id)}
                        title="Rechazar"
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-bold hover:bg-red-100 transition-colors"
                      >
                        <EyeOff className="h-3.5 w-3.5" /> Rechazar
                      </button>
                    </>
                  )}
                  {r.status === "approved" && (
                    <button
                      onClick={() => reject(r.id)}
                      title="Despublicar"
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-text-muted border border-border-brand rounded text-xs font-bold hover:bg-bg-light transition-colors"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Despublicar
                    </button>
                  )}
                  {r.status === "rejected" && (
                    <button
                      onClick={() => approve(r.id)}
                      title="Republish"
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> Republicar
                    </button>
                  )}
                  <button
                    onClick={() => remove(r.id)}
                    title="Eliminar"
                    className="p-1.5 text-text-muted hover:text-error rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed bg-bg-light px-4 py-3 rounded border-l-2 border-border-brand italic">
                "{r.comment}"
              </p>

              <p className="text-[10px] text-text-muted">
                {new Date(r.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
