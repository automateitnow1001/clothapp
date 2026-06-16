"use client";

import React, { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2, Save, X } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  is_published: boolean;
}

const initialFaqs: FAQ[] = [
  { id: "f1", question: "¿Cómo elijo mi talle?", answer: "En la página de cada producto encontrarás un enlace a nuestra Guía de Talles con las medidas correspondientes. Si tenés dudas, podés contactarnos por WhatsApp.", category: "Talles", order: 1, is_published: true },
  { id: "f2", question: "¿Cómo realizo un pedido?", answer: "Navegá por nuestro catálogo, seleccioná el talle y color deseados y agregalas a la bolsa de compras. Confirmás abonando el 50% de anticipo.", category: "Pedidos", order: 2, is_published: true },
  { id: "f3", question: "¿Cuánto demora en llegar mi pedido?", answer: "El tiempo estimado de entrega para prendas a pedido es de 1 a 3 semanas según el modelo y disponibilidad.", category: "Envíos", order: 3, is_published: true },
  { id: "f4", question: "¿Realizan envíos a todo el país?", answer: "Sí, enviamos a todas las provincias. El envío es gratuito en compras superiores a $95.000.", category: "Envíos", order: 4, is_published: true },
  { id: "f5", question: "¿Cómo realizo un cambio?", answer: "Tenés hasta 30 días para realizar cambios. La prenda debe estar sin uso y con su etiqueta original.", category: "Cambios", order: 5, is_published: true },
  { id: "f6", question: "¿Qué medios de pago aceptan?", answer: "Aceptamos transferencias bancarias, Mercado Pago y tarjetas de crédito con 3 cuotas sin interés.", category: "Pagos", order: 6, is_published: true },
];

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [editCat, setEditCat] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [newCat, setNewCat] = useState("General");

  const startEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditQ(faq.question);
    setEditA(faq.answer);
    setEditCat(faq.category);
  };

  const saveEdit = (id: string) => {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, question: editQ, answer: editA, category: editCat } : f));
    setEditingId(null);
  };

  const togglePublish = (id: string) => {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, is_published: !f.is_published } : f));
  };

  const removeFaq = (id: string) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  const addFaq = () => {
    if (!newQ.trim() || !newA.trim()) return;
    const newFaq: FAQ = {
      id: `f_${Date.now()}`,
      question: newQ,
      answer: newA,
      category: newCat,
      order: faqs.length + 1,
      is_published: true,
    };
    setFaqs(prev => [...prev, newFaq]);
    setNewQ("");
    setNewA("");
    setNewCat("General");
    setShowNewForm(false);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[index - 1]] = [newFaqs[index - 1], newFaqs[index]];
    setFaqs(newFaqs);
  };

  const moveDown = (index: number) => {
    if (index === faqs.length - 1) return;
    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];
    setFaqs(newFaqs);
  };

  const categories = Array.from(new Set(faqs.map(f => f.category)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-dark uppercase tracking-wide">Preguntas Frecuentes</h1>
          <p className="text-xs text-text-muted mt-1">Administrá las preguntas frecuentes del sitio público</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-accent transition-colors"
        >
          <Plus className="h-4 w-4" /> Nueva Pregunta
        </button>
      </div>

      {/* New FAQ Form */}
      {showNewForm && (
        <div className="bg-white border border-border-brand rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-dark border-b border-border-brand pb-2">Nueva Pregunta Frecuente</h3>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Pregunta</label>
            <input
              type="text"
              value={newQ}
              onChange={e => setNewQ(e.target.value)}
              placeholder="¿Cuál es la pregunta?"
              className="w-full px-3 py-2 text-xs border border-border-brand rounded focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Respuesta</label>
            <textarea
              rows={3}
              value={newA}
              onChange={e => setNewA(e.target.value)}
              placeholder="Respuesta completa..."
              className="w-full px-3 py-2 text-xs border border-border-brand rounded focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Categoría</label>
            <input
              type="text"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              placeholder="Ej: Talles, Envíos, Pagos..."
              list="cat-list"
              className="w-full px-3 py-2 text-xs border border-border-brand rounded focus:border-accent outline-none"
            />
            <datalist id="cat-list">
              {categories.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="flex gap-3">
            <button onClick={addFaq} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-accent transition-colors">
              <Save className="h-3.5 w-3.5" /> Guardar
            </button>
            <button onClick={() => setShowNewForm(false)} className="px-4 py-2 border border-border-brand text-text-muted text-xs font-bold uppercase tracking-wider rounded hover:bg-bg-light transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* FAQ list grouped by category */}
      {categories.map(cat => (
        <div key={cat} className="space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-text-muted border-b border-border-brand pb-1">{cat}</h2>
          {faqs.filter(f => f.category === cat).map((faq, i, arr) => {
            const globalIndex = faqs.indexOf(faq);
            return (
              <div key={faq.id} className={`bg-white border rounded-lg p-4 space-y-3 ${faq.is_published ? "border-border-brand" : "border-dashed border-gray-300 opacity-60"}`}>
                {editingId === faq.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editQ}
                      onChange={e => setEditQ(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-border-brand rounded focus:border-accent outline-none font-semibold"
                    />
                    <textarea
                      rows={3}
                      value={editA}
                      onChange={e => setEditA(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-border-brand rounded focus:border-accent outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(faq.id)} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded hover:bg-accent transition-colors">
                        <Save className="h-3.5 w-3.5" /> Guardar
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1.5 border border-border-brand text-text-muted text-xs font-bold rounded hover:bg-bg-light transition-colors">
                        <X className="h-3.5 w-3.5" /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-xs font-bold text-text-dark flex-1">{faq.question}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => moveUp(globalIndex)} className="p-1 text-text-muted hover:text-text-dark" title="Subir">
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button onClick={() => moveDown(globalIndex)} className="p-1 text-text-muted hover:text-text-dark" title="Bajar">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button onClick={() => startEdit(faq)} className="p-1 text-text-muted hover:text-accent" title="Editar">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => togglePublish(faq.id)}
                          className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded transition-colors ${
                            faq.is_published
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              : "bg-gray-50 text-text-muted border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                          }`}
                        >
                          {faq.is_published ? "Publicada" : "Oculta"}
                        </button>
                        <button onClick={() => removeFaq(faq.id)} className="p-1 text-text-muted hover:text-error" title="Eliminar">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">{faq.answer}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
