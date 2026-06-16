"use client";

import React, { useState, useEffect } from "react";
import { db, SizeGuide } from "@/lib/db";
import { Ruler, Plus, Edit2, Trash2, Save, X, Info } from "lucide-react";

export default function AdminTallesPage() {
  const [guides, setGuides] = useState<SizeGuide[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [size, setSize] = useState("");
  const [bustMin, setBustMin] = useState(80);
  const [bustMax, setBustMax] = useState(90);
  const [waistMin, setWaistMin] = useState(60);
  const [waistMax, setWaistMax] = useState(70);
  const [hipMin, setHipMin] = useState(90);
  const [hipMax, setHipMax] = useState(100);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await db.sizeGuides.list();
      setGuides(list);
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
    setSize("");
    setBustMin(80);
    setBustMax(90);
    setWaistMin(60);
    setWaistMax(70);
    setHipMin(90);
    setHipMax(100);
    setShowForm(true);
  };

  const openEdit = (guide: SizeGuide) => {
    setEditingId(guide.id);
    setSize(guide.size);
    setBustMin(guide.bust_min);
    setBustMax(guide.bust_max);
    setWaistMin(guide.waist_min);
    setWaistMax(guide.waist_max);
    setHipMin(guide.hip_min);
    setHipMax(guide.hip_max);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!size.trim()) return;

    try {
      if (editingId) {
        await db.sizeGuides.update(editingId, {
          size: size.toUpperCase(),
          bust_min: Number(bustMin),
          bust_max: Number(bustMax),
          waist_min: Number(waistMin),
          waist_max: Number(waistMax),
          hip_min: Number(hipMin),
          hip_max: Number(hipMax),
        });
        setSuccessMsg(`Talle ${size.toUpperCase()} actualizado.`);
      } else {
        await db.sizeGuides.create({
          size: size.toUpperCase(),
          bust_min: Number(bustMin),
          bust_max: Number(bustMax),
          waist_min: Number(waistMin),
          waist_max: Number(waistMax),
          hip_min: Number(hipMin),
          hip_max: Number(hipMax),
        });
        setSuccessMsg(`Talle ${size.toUpperCase()} creado.`);
      }
      setShowForm(false);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Deseas eliminar esta regla de talle?")) return;
    try {
      await db.sizeGuides.delete(id);
      setSuccessMsg("Talle eliminado del recomendador.");
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
            <Ruler className="h-5 w-5 mr-2 text-accent" />
            Configuración de Talles (Guías)
          </h1>
          <p className="text-xs text-text-muted mt-1">Configurá las medidas de busto, cintura y cadera para el recomendador interactivo y catálogo</p>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" /> Nuevo Talle
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700">
          {successMsg}
        </div>
      )}

      {showForm ? (
        /* Form */
        <div className="bg-white border border-border-brand rounded-lg p-6 max-w-lg space-y-6">
          <div className="flex justify-between items-center border-b border-border-brand pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-dark">
              {editingId ? "Editar Medidas de Talle" : "Configurar Nuevo Talle"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-dark">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Talle (Letra/Número) *</label>
              <input
                type="text"
                required
                value={size}
                onChange={e => setSize(e.target.value)}
                placeholder="Ej. S, M, L, XL, 38, 40..."
                className="w-full px-3 py-2 text-xs border border-border-brand rounded focus:border-accent outline-none font-bold uppercase font-mono"
              />
            </div>

            <div className="border border-border-brand rounded p-4 bg-bg-light space-y-4">
              <span className="text-[9px] uppercase tracking-widest font-bold text-text-muted block">Medidas de Contornos (cm)</span>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Busto */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Busto Mínimo</label>
                  <input
                    type="number"
                    required
                    value={bustMin}
                    onChange={e => setBustMin(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-border-brand rounded font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Busto Máximo</label>
                  <input
                    type="number"
                    required
                    value={bustMax}
                    onChange={e => setBustMax(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-border-brand rounded font-mono"
                  />
                </div>

                {/* Cintura */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Cintura Mínima</label>
                  <input
                    type="number"
                    required
                    value={waistMin}
                    onChange={e => setWaistMin(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-border-brand rounded font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Cintura Máxima</label>
                  <input
                    type="number"
                    required
                    value={waistMax}
                    onChange={e => setWaistMax(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-border-brand rounded font-mono"
                  />
                </div>

                {/* Cadera */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Cadera Mínima</label>
                  <input
                    type="number"
                    required
                    value={hipMin}
                    onChange={e => setHipMin(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-border-brand rounded font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase">Cadera Máxima</label>
                  <input
                    type="number"
                    required
                    value={hipMax}
                    onChange={e => setHipMax(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-border-brand rounded font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-border-brand">
              <button 
                type="submit" 
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-accent transition-colors"
              >
                <Save className="h-3.5 w-3.5" /> Guardar Talle
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
        /* List */
        <div className="bg-white border border-border-brand rounded-lg overflow-hidden shadow-2xs">
          <div className="p-4 bg-bg-light border-b border-border-brand flex items-start gap-2 text-xs text-text-muted">
            <Info className="h-4.5 w-4.5 text-accent shrink-0 mt-0.5" />
            <p>
              Estos rangos definen qué talle sugerirle a un cliente cuando usa el Buscador de Talles y qué medidas mostrar en la Guía de Talles desplegada desde los detalles de cada producto en la tienda.
            </p>
          </div>

          {loading ? (
            <div className="p-8 space-y-3">
              <div className="h-6 skeleton w-full" />
              <div className="h-6 skeleton w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs divide-y divide-border-brand">
                <thead className="bg-bg-light uppercase tracking-wider text-[10px] text-text-muted font-bold">
                  <tr>
                    <th className="px-5 py-3">Talle</th>
                    <th className="px-5 py-3">Busto (Contorno)</th>
                    <th className="px-5 py-3">Cintura (Contorno)</th>
                    <th className="px-5 py-3">Cadera (Contorno)</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-brand bg-white font-medium text-text-dark">
                  {guides.map(guide => (
                    <tr key={guide.id} className="hover:bg-bg-light/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="bg-primary text-white font-bold font-mono px-3 py-1 text-xs rounded">
                          {guide.size}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        {guide.bust_min} - {guide.bust_max} cm
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        {guide.waist_min} - {guide.waist_max} cm
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        {guide.hip_min} - {guide.hip_max} cm
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(guide)}
                            className="p-1.5 border border-border-brand text-text-muted hover:text-accent rounded transition-colors bg-white hover:bg-bg-light"
                            title="Editar"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(guide.id)}
                            className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded transition-colors bg-white"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {guides.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                        No hay talles configurados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
