"use client";

import React, { useState, useEffect } from "react";
import { db, mockDb, PurchaseRound, Supplier } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import {
  RotateCcw, RefreshCw, ChevronDown, ChevronUp, CheckCircle2,
  AlertCircle, FileText, Send, Share2, ShieldCheck, Clipboard,
  TrendingUp, Download, Eye, Truck, Check, X
} from "lucide-react";

export default function AdminRoundsPage() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<PurchaseRound[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track open items for dynamic rendering
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);
  const [roundItemsMap, setRoundItemsMap] = useState<Record<string, any[]>>({});
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await db.purchaseRounds.list();
      setRounds(list);

      const sups = await db.suppliers.list();
      setSuppliers(sups);

      // Preload items for all rounds to have it available for calculations
      const itemsMap: Record<string, any[]> = {};
      for (const r of list) {
        const items = await db.purchaseRounds.getItems(r.id);
        itemsMap[r.id] = items;
      }
      setRoundItemsMap(itemsMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: PurchaseRound["status"]) => {
    try {
      await db.purchaseRounds.update(id, { status });
      setSuccessMsg(`Estado de la ronda de compras actualizado a: ${status.toUpperCase()}`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const getRoundProgress = (round: PurchaseRound) => {
    if (round.minimum_type === "monto_minimo" && round.minimum_amount > 0) {
      return Math.min(100, Math.round((round.accumulated_cost / round.minimum_amount) * 100));
    }
    if (round.minimum_type === "cantidad_prendas" && round.minimum_items > 0) {
      return Math.min(100, Math.round((round.accumulated_items / round.minimum_items) * 100));
    }
    if (round.minimum_type === "monto_y_cantidad") {
      const p1 = round.minimum_amount > 0 ? (round.accumulated_cost / round.minimum_amount) * 100 : 100;
      const p2 = round.minimum_items > 0 ? (round.accumulated_items / round.minimum_items) * 100 : 100;
      return Math.min(100, Math.round((p1 + p2) / 2));
    }
    return 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
  };

  // Consolidates orders grouped by product + size + color
  const getConsolidatedItems = (roundId: string) => {
    const items = roundItemsMap[roundId] || [];
    const consolidated: Record<string, {
      productName: string;
      codePublic: string;
      size: string;
      color: string;
      quantity: number;
      priceCost: number;
    }> = {};

    items.forEach((item) => {
      const oi = item.orderItem;
      const prod = item.product;
      if (!oi || !prod) return;

      const key = `${prod.id}-${oi.size}-${oi.color}`;
      if (consolidated[key]) {
        consolidated[key].quantity += oi.quantity;
      } else {
        consolidated[key] = {
          productName: prod.name_public,
          codePublic: prod.code_public,
          size: oi.size,
          color: oi.color,
          quantity: oi.quantity,
          priceCost: oi.price_unit_cost,
        };
      }
    });

    return Object.values(consolidated);
  };

  const getWhatsAppConsolidationText = (round: PurchaseRound) => {
    const supplier = suppliers.find(s => s.id === round.supplier_id);
    const items = getConsolidatedItems(round.id);
    
    let text = `*PEDIDO CONSOLIDADO PACHECA*\n`;
    text += `Ronda: *${round.code_round}* | Proveedor: *${supplier?.name}*\n`;
    text += `------------------------------------\n`;
    
    items.forEach((it, idx) => {
      text += `${idx + 1}. ${it.productName} | Talle: ${it.size} | Color: ${it.color} | *Cant: ${it.quantity} uds.*\n`;
    });

    text += `------------------------------------\n`;
    text += `Total de Prendas: *${round.accumulated_items} unidades*\n`;
    text += `Costo Estimado Compra: *${formatCurrency(round.accumulated_cost)}*\n`;

    return text;
  };

  const getStatusBadge = (status: PurchaseRound["status"]) => {
    const states = {
      abierta: { bg: "bg-amber-50 text-warning border-amber-200", label: "Abierta / Comprando" },
      minimo_alcanzado: { bg: "bg-success-bg text-success border-success/20", label: "Mínimo Alcanzado" },
      cerrada: { bg: "bg-gray-100 text-text-muted border-gray-200", label: "Cerrada" },
      pedido_realizado: { bg: "bg-blue-50 text-blue-600 border-blue-200", label: "Pedido al Proveedor" },
      enviado_por_proveedor: { bg: "bg-indigo-50 text-indigo-600 border-indigo-200", label: "En Camino" },
      recibido_parcial: { bg: "bg-purple-50 text-purple-600 border-purple-200", label: "Recibido Parcial" },
      recibido: { bg: "bg-success-bg text-success border-success/20", label: "Mercadería en Local" },
      finalizada: { bg: "bg-gray-100 text-text-muted border-gray-200", label: "Finalizada" },
      cancelada: { bg: "bg-red-50 text-error border-red-200", label: "Cancelada" },
      pendiente_de_revision: { bg: "bg-amber-50 text-warning border-amber-200", label: "Revisión Pendiente" }
    };

    const info = states[status] || { bg: "bg-gray-50 text-text-muted border-gray-200", label: status };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${info.bg}`}>
        {info.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-brand pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
            <RotateCcw className="h-5 w-5 mr-2 text-accent" />
            Consolidación y Rondas de Compra
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Gestión de compras grupales por proveedor. Seguimiento de pedidos mínimos y generación automática de planillas de compra mayorista.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center px-3 py-1.5 border border-border-brand rounded text-xs font-semibold text-text-muted hover:bg-bg-light transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Actualizar
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-success-bg border border-success/20 rounded text-xs text-success flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Rounds list */}
      <div className="space-y-4 text-left">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-24 skeleton w-full" />
            <div className="h-24 skeleton w-full" />
          </div>
        ) : rounds.length === 0 ? (
          <div className="text-center py-12 text-xs text-text-muted border border-dashed border-border-brand rounded-lg">
            No se registran rondas de compra en el historial.
          </div>
        ) : (
          rounds.map((round) => {
            const supplier = suppliers.find(s => s.id === round.supplier_id);
            const isExpanded = expandedRoundId === round.id;
            const progress = getRoundProgress(round);
            const consolidatedItems = getConsolidatedItems(round.id);
            const detailItems = roundItemsMap[round.id] || [];

            return (
              <div
                key={round.id}
                className="bg-white border border-border-brand rounded-lg shadow-2xs overflow-hidden"
              >
                {/* Round header bar */}
                <div
                  onClick={() => setExpandedRoundId(isExpanded ? null : round.id)}
                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-bg-light/35 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-sm text-text-dark uppercase">{supplier?.name || "Proveedor"}</span>
                      {getStatusBadge(round.status)}
                    </div>
                    <p className="text-[10px] text-text-muted">Cód Ronda: {round.code_round} | Abierta el: {new Date(round.opened_at).toLocaleDateString("es-AR")}</p>
                  </div>

                  <div className="flex flex-wrap md:flex-nowrap items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    
                    {/* Progress */}
                    <div className="w-40 space-y-1">
                      <div className="flex justify-between text-[9px] text-text-muted">
                        <span>Progreso Mínimo</span>
                        <span className="font-bold text-text-dark">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress >= 100 ? "bg-success" : "bg-accent"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] text-text-muted uppercase tracking-wider">Costo Acumulado</p>
                      <p className="font-bold text-text-dark text-xs">{formatCurrency(round.accumulated_cost)}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] text-text-muted uppercase tracking-wider">Total Prendas</p>
                      <p className="font-bold text-text-dark text-xs">{round.accumulated_items} uds.</p>
                    </div>

                    <div className="text-text-muted pl-2">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="bg-bg-light border-t border-border-brand p-5 space-y-6">
                    
                    {/* Action buttons bar */}
                    <div className="flex flex-wrap gap-2 justify-between items-center bg-white border border-border-brand p-3 rounded-md">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Administrar Estado:</span>
                        
                        {round.status === "abierta" && (
                          <button
                            onClick={() => handleUpdateStatus(round.id, "cerrada")}
                            className="px-2.5 py-1.5 border border-border-brand rounded text-[10px] font-semibold text-text-dark hover:bg-bg-light"
                          >
                            Cerrar Ronda
                          </button>
                        )}
                        {round.status === "cerrada" && (
                          <button
                            onClick={() => handleUpdateStatus(round.id, "pedido_realizado")}
                            className="px-2.5 py-1.5 bg-primary text-white rounded text-[10px] font-semibold hover:bg-accent"
                          >
                            Marcar Pedido Enviado a Fábrica
                          </button>
                        )}
                        {round.status === "pedido_realizado" && (
                          <button
                            onClick={() => handleUpdateStatus(round.id, "enviado_por_proveedor")}
                            className="px-2.5 py-1.5 bg-blue-600 text-white rounded text-[10px] font-semibold hover:bg-blue-700"
                          >
                            Marcar en Camino (Correo/Transporte)
                          </button>
                        )}
                        {round.status === "enviado_por_proveedor" && (
                          <button
                            onClick={() => handleUpdateStatus(round.id, "recibido")}
                            className="px-2.5 py-1.5 bg-success text-white rounded text-[10px] font-semibold hover:bg-success/90"
                          >
                            Marcar Mercadería Recibida
                          </button>
                        )}
                        {round.status === "recibido" && (
                          <button
                            onClick={() => handleUpdateStatus(round.id, "finalizada")}
                            className="px-2.5 py-1.5 border border-border-brand text-text-muted rounded text-[10px] font-semibold hover:bg-bg-light"
                          >
                            Finalizar Ronda
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(getWhatsAppConsolidationText(round));
                            alert("¡Texto de pedido consolidado copiado al portapapeles!");
                          }}
                          className="flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          <Clipboard className="h-3.5 w-3.5 mr-1" />
                          Copiar Texto WhatsApp
                        </button>
                      </div>
                    </div>

                    {/* Left & Right layout: Consolidated Items to buy vs individual orders list */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left: Consolidated Items to order */}
                      <div className="bg-white border border-border-brand rounded-lg p-4 space-y-3 shadow-3xs">
                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-brand pb-2">
                          Planilla de Compra Mayorista (Consolidado)
                        </h4>
                        
                        <div className="divide-y divide-border-brand">
                          {consolidatedItems.length === 0 ? (
                            <p className="text-xs text-text-muted py-4 text-center">No hay artículos acumulados en esta ronda.</p>
                          ) : (
                            consolidatedItems.map((it, idx) => (
                              <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-bold text-text-dark">{it.productName}</p>
                                  <p className="text-[10px] text-text-muted mt-0.5">Talle: {it.size} | Color: {it.color}</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-text-dark text-sm bg-bg-light px-2.5 py-1 border border-border-brand rounded">
                                    {it.quantity} uds.
                                  </span>
                                  <span className="block text-[9px] text-text-muted mt-1">Costo unit: {formatCurrency(it.priceCost)}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Right: Individual client orders details */}
                      <div className="bg-white border border-border-brand rounded-lg p-4 space-y-3 shadow-3xs">
                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-brand pb-2">
                          Reservas Vinculadas por Cliente
                        </h4>

                        <div className="divide-y divide-border-brand max-h-[400px] overflow-y-auto pr-1">
                          {detailItems.length === 0 ? (
                            <p className="text-xs text-text-muted py-4 text-center">No hay reservas vinculadas.</p>
                          ) : (
                            detailItems.map((item, idx) => {
                              const oi = item.orderItem;
                              const ord = item.order;
                              const cust = item.customer;
                              const prod = item.product;

                              return (
                                <div key={idx} className="py-3 text-xs space-y-1 text-left">
                                  <div className="flex justify-between font-bold">
                                    <span className="text-text-dark">{cust?.first_name} {cust?.last_name}</span>
                                    <span className="text-accent">{ord?.code_public}</span>
                                  </div>
                                  <p className="text-text-muted">
                                    {prod?.name_public} | Talle: {oi?.size} | Color: {oi?.color} | <strong>Cant: {oi?.quantity} uds.</strong>
                                  </p>
                                  <div className="flex justify-between text-[10px] text-text-muted pt-0.5">
                                    <span>Seña: {formatCurrency(ord?.advance_amount || 0)}</span>
                                    <span>Precio Venta: {formatCurrency((oi?.price_unit_final || 0) * (oi?.quantity || 0))}</span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
