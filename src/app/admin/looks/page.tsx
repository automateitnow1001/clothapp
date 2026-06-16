"use client";

import React, { useState, useEffect } from "react";
import { db, Product, CuratedLook } from "@/lib/db";
import { Plus, Trash2, Edit2, Save, X, Sparkles, Image, CheckSquare, Square, Tag } from "lucide-react";

export default function AdminLooksPage() {
  const [looks, setLooks] = useState<CuratedLook[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & forms
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const looksList = await db.looks.list();
      setLooks(looksList);

      const prods = await db.products.list();
      setProducts(prods.filter(p => p.status === "published"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setImageUrl("/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp");
    setSelectedProductIds([]);
    setTagsInput("");
    setShowForm(true);
  };

  const openEdit = (look: CuratedLook) => {
    setEditingId(look.id);
    setName(look.name);
    setDescription(look.description);
    setImageUrl(look.image_url);
    setSelectedProductIds(look.product_ids || []);
    setTagsInput(look.tags ? look.tags.join(", ") : "");
    setShowForm(true);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagsInput
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(t => t !== "");

    try {
      if (editingId) {
        await db.looks.update(editingId, {
          name,
          description,
          image_url: imageUrl,
          product_ids: selectedProductIds,
          tags
        });
        setSuccessMsg("Look actualizado correctamente.");
      } else {
        await db.looks.create({
          name,
          description,
          image_url: imageUrl,
          product_ids: selectedProductIds,
          tags
        });
        setSuccessMsg("Nuevo look creado correctamente.");
      }
      setShowForm(false);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás segura de que deseas eliminar este look?")) return;
    try {
      await db.looks.delete(id);
      setSuccessMsg("Look eliminado correctamente.");
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-3 border-b border-border-brand pb-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark uppercase tracking-wide flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-accent" />
            Curaduría de Looks
          </h1>
          <p className="text-xs text-text-muted mt-1">Creá y asociá conjuntos sugeridos para la tienda pública</p>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" /> Nuevo Look
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700">
          {successMsg}
        </div>
      )}

      {showForm ? (
        /* Edit/Create Form */
        <div className="bg-white border border-border-brand rounded-lg p-6 max-w-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-border-brand pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-dark">
              {editingId ? "Editar Look Curado" : "Nuevo Look Curado"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-dark">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Nombre del Look *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Look Casual Otoño"
                  className="w-full px-3 py-2 text-xs border border-border-brand rounded focus:border-accent outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Ruta de Imagen *</label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="Ej. /images/dsc00472..."
                  className="w-full px-3 py-2 text-xs border border-border-brand rounded focus:border-accent outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Descripción o Tips de Estilo</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explicá cómo combinar las prendas y para qué ocasión va..."
                className="w-full px-3 py-2 text-xs border border-border-brand rounded focus:border-accent outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Etiquetas de Estilo <span className="text-gray-400 font-normal">(separadas por coma)</span></label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="Ej: casual, comodo, invierno"
                className="w-full px-3 py-2 text-xs border border-border-brand rounded focus:border-accent outline-none"
              />
            </div>

            {/* Products selection */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted block">Seleccionar prendas del Look</label>
              <p className="text-[10px] text-text-muted">Hacé clic en las prendas que componen este conjunto completo.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-border-brand p-3 rounded bg-bg-light">
                {products.map(p => {
                  const isChecked = selectedProductIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p.id)}
                      className={`flex items-center gap-3 p-2.5 rounded text-left border transition-colors ${
                        isChecked 
                          ? "bg-white border-accent text-text-dark font-semibold" 
                          : "bg-white border-border-brand text-text-muted hover:border-text-muted"
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-accent shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-300 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs truncate">{p.name_public}</p>
                        <p className="text-[9px] text-gray-400 font-mono mt-0.5">PAC: {p.code_public}</p>
                      </div>
                    </button>
                  );
                })}
                {products.length === 0 && (
                  <p className="text-[10px] text-text-muted col-span-2 py-4 text-center">Cargando catálogo...</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-border-brand">
              <button 
                type="submit" 
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-accent transition-colors"
              >
                <Save className="h-3.5 w-3.5" /> Guardar Look
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="px-4 py-2 border border-border-brand text-text-muted text-xs font-bold uppercase tracking-wider rounded hover:bg-bg-light transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Looks Grid list */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <>
              <div className="h-64 skeleton rounded-lg" />
              <div className="h-64 skeleton rounded-lg" />
            </>
          ) : looks.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white border border-border-brand rounded-lg text-xs text-text-muted">
              No hay looks curados configurados. Hacé clic en "Nuevo Look" para añadir el primero.
            </div>
          ) : (
            looks.map(look => {
              const matchedProducts = products.filter(p => look.product_ids?.includes(p.id));
              return (
                <div key={look.id} className="bg-white border border-border-brand rounded-lg p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="h-24 w-20 bg-bg-light border border-border-brand rounded overflow-hidden shrink-0">
                        {look.image_url ? (
                          <img src={look.image_url} alt={look.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-300">
                            <Image className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h3 className="text-sm font-bold text-text-dark truncate">{look.name}</h3>
                        <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">{look.description}</p>
                      </div>
                    </div>

                    {/* Associated products list */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-text-muted block">Prendas Vinculadas ({matchedProducts.length})</span>
                      <div className="flex flex-wrap gap-1">
                        {matchedProducts.map(p => (
                          <span key={p.id} className="bg-bg-light border border-border-brand px-2 py-0.5 rounded text-[10px] text-text-muted font-mono font-medium">
                            {p.code_public}
                          </span>
                        ))}
                        {matchedProducts.length === 0 && (
                          <span className="text-[10px] text-gray-400 italic">Ningún producto seleccionado</span>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {look.tags && look.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {look.tags.map(t => (
                          <span key={t} className="inline-flex items-center gap-1 bg-[#F5E6D3]/40 border border-[#EADED2] text-xs px-2 py-0.5 rounded text-text-dark lowercase">
                            <Tag className="h-2.5 w-2.5 text-accent" /> {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end pt-5 mt-4 border-t border-border-brand">
                    <button
                      onClick={() => openEdit(look)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-border-brand text-text-muted text-xs font-bold rounded hover:bg-bg-light transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(look.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-bold hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Eliminar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
