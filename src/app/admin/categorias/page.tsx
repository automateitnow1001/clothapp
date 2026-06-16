"use client";

import React, { useState, useEffect } from "react";
import { db, mockDb, Category } from "@/lib/db";
import { Tag, Plus, Edit, Trash2, RefreshCw, X, Check, CheckCircle } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Action states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form states
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await db.categories.list();
      setCategories(list);
      
      const prods = await db.products.list();
      setProducts(prods);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;
    
    try {
      await db.categories.create({
        name: newCategory.name,
        slug: newCategory.slug || newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: newCategory.description || undefined,
      });

      setSuccessMsg("Categoría creada con éxito.");
      setShowCreateModal(false);
      setNewCategory({ name: "", slug: "", description: "" });
      loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !selectedCategory.name) return;

    try {
      await db.categories.update(selectedCategory.id, {
        name: selectedCategory.name,
        slug: selectedCategory.slug || selectedCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: selectedCategory.description,
      });

      setSuccessMsg("Categoría actualizada con éxito.");
      setShowEditModal(false);
      setSelectedCategory(null);
      loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría? Los productos asociados quedarán sin categoría vinculada.")) return;
    try {
      await db.categories.delete(id);
      setSuccessMsg("Categoría eliminada.");
      loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-brand pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
            <Tag className="h-5 w-5 mr-2 text-accent" />
            Categorías del Catálogo
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Administración de categorías principales y secundarias de Pacheca para organizar el catálogo público de la tienda.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Nueva Categoría
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-success-bg border border-success/20 rounded text-xs text-success flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 skeleton" />
          <div className="h-28 skeleton" />
          <div className="h-28 skeleton" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-xs text-text-muted border border-dashed border-border-brand rounded-lg">
          No hay categorías creadas todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            // Count products in this category
            const count = products.filter(p => p.category_id === cat.id).length;
            
            return (
              <div key={cat.id} className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs flex flex-col justify-between hover-card">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-text-dark text-sm uppercase tracking-wider">{cat.name}</span>
                    <span className="bg-bg-light border border-border-brand text-text-muted text-[10px] font-semibold px-2 py-0.5 rounded">
                      {count} {count === 1 ? "Producto" : "Productos"}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed min-h-[40px]">
                    {cat.description || "Sin descripción proporcionada."}
                  </p>
                  <span className="text-[10px] text-text-muted font-mono block mt-2">Slug: {cat.slug}</span>
                </div>

                <div className="flex justify-end space-x-2 border-t border-border-brand mt-4 pt-3">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowEditModal(true);
                    }}
                    className="p-1 border border-border-brand text-text-muted hover:text-text-dark rounded transition-colors"
                    title="Editar categoría"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1 border border-red-200 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-border-brand rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowCreateModal(false)} className="absolute right-4 top-4 text-text-muted hover:text-text-dark">
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-2 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-accent" />
              Nueva Categoría
            </h3>
            <p className="text-xs text-text-muted mb-6">Añadí una nueva sección al catálogo público.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Camperas"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Slug URL (Neutral)</label>
                <input
                  type="text"
                  placeholder="Ej. camperas"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  className="w-full text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Descripción comercial visible para los clientes..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-border-brand mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-border-brand text-text-muted hover:bg-bg-light text-xs font-semibold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-border-brand rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowEditModal(false)} className="absolute right-4 top-4 text-text-muted hover:text-text-dark">
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-2 flex items-center">
              <Edit className="h-5 w-5 mr-2 text-accent" />
              Editar Categoría
            </h3>
            <p className="text-xs text-text-muted mb-6">Actualizá los detalles de la categoría.</p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Slug URL (Neutral)</label>
                <input
                  type="text"
                  value={selectedCategory.slug}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, slug: e.target.value })}
                  className="w-full text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={selectedCategory.description || ""}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-border-brand mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-border-brand text-text-muted hover:bg-bg-light text-xs font-semibold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
