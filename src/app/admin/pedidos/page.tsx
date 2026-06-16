"use client";

import React, { useState, useEffect } from "react";
import { db, mockDb, Order, Customer } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import {
  ShoppingCart, RefreshCw, Eye, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, FileText, Check, X, Clipboard,
  Send, Package, ShieldCheck
} from "lucide-react";

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, any[]>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await db.orders.list();
      // Sort orders by date newest first
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(list);

      const custs = await db.customers.list();
      setCustomers(custs);

      // Load items for each order
      const itemsMap: Record<string, any[]> = {};
      for (const o of list) {
        const items = await db.orders.getItems(o.id);
        const itemsWithProducts = items.map(it => ({
          ...it,
          product: mockDb.products.find(p => p.id === it.product_id) || null
        }));
        itemsMap[o.id] = itemsWithProducts;
      }
      setOrderItemsMap(itemsMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, internalStatus: Order["status_internal"], publicStatus: Order["status_public"]) => {
    try {
      await db.orders.updateStatus(id, internalStatus, publicStatus);
      setSuccessMsg(`Estado del pedido actualizado con éxito a: ${publicStatus.toUpperCase()}`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
  };

  const getInternalStatusBadge = (status: Order["status_internal"]) => {
    const states = {
      borrador: { bg: "bg-gray-100 text-text-muted border-gray-200", label: "Borrador" },
      reservado: { bg: "bg-blue-50 text-blue-600 border-blue-200", label: "Reservado (Señado)" },
      esperando_minimo: { bg: "bg-amber-50 text-warning border-amber-200", label: "Esperando Mínimo" },
      ronda_cerrada: { bg: "bg-purple-50 text-purple-600 border-purple-200", label: "Ronda Cerrada" },
      pendiente_de_pago: { bg: "bg-red-50 text-error border-red-200", label: "Impago" },
      pedido_al_proveedor: { bg: "bg-indigo-50 text-indigo-600 border-indigo-200", label: "Pedido a Fábrica" },
      recibido_parcial: { bg: "bg-pink-50 text-pink-600 border-pink-200", label: "Recibido Parcial" },
      recibido: { bg: "bg-success-bg text-success border-success/20", label: "Recibido" },
      listo_para_retirar: { bg: "bg-success-bg text-success border-success/20", label: "Listo Retiro" },
      enviado: { bg: "bg-success-bg text-success border-success/20", label: "Despachado" },
      entregado: { bg: "bg-success-bg text-success border-success/20", label: "Entregado" },
      cancelado: { bg: "bg-red-50 text-error border-red-200", label: "Cancelado" },
      reintegrado: { bg: "bg-gray-100 text-text-muted border-gray-200", label: "Reintegrado" },
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
            <ShoppingCart className="h-5 w-5 mr-2 text-accent" />
            Consola de Pedidos de Clientes
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Visualización integral de reservas de clientes. Imputación de estados internos y control de acreditación de señas.
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
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Orders list */}
      <div className="space-y-4 text-left">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-20 skeleton w-full" />
            <div className="h-20 skeleton w-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-xs text-text-muted border border-dashed border-border-brand rounded-lg">
            No se registran pedidos en la base de datos de Pacheca.
          </div>
        ) : (
          orders.map((ord) => {
            const customer = customers.find(c => c.id === ord.customer_id);
            const isExpanded = expandedOrderId === ord.id;
            const items = orderItemsMap[ord.id] || [];

            return (
              <div
                key={ord.id}
                className="bg-white border border-border-brand rounded-lg shadow-2xs overflow-hidden"
              >
                {/* Order Summary Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-bg-light/35 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="font-bold text-xs text-text-dark">{ord.code_public}</span>
                      <span className="text-[10px] text-text-muted font-medium">| {customer ? `${customer.first_name} ${customer.last_name}` : "Cliente Desconocido"}</span>
                      {getInternalStatusBadge(ord.status_internal)}
                    </div>
                    <p className="text-[10px] text-text-muted">Recibido el: {new Date(ord.created_at).toLocaleDateString("es-AR")} | Vía: {ord.delivery_method.replace("_", " ")}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-[9px] text-text-muted uppercase tracking-wider">Monto Total</p>
                      <p className="font-bold text-text-dark text-xs">{formatCurrency(ord.total_amount)}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] text-text-muted uppercase tracking-wider">Seña Cobrada</p>
                      <p className="font-bold text-success text-xs">{formatCurrency(ord.advance_amount)}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] text-text-muted uppercase tracking-wider">Saldo Pendiente</p>
                      <p className={`font-bold text-xs ${ord.remaining_balance > 0 ? "text-error" : "text-text-dark"}`}>
                        {formatCurrency(ord.remaining_balance)}
                      </p>
                    </div>

                    <div className="text-text-muted pl-2">
                      {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Action Menu & Item list */}
                {isExpanded && (
                  <div className="bg-bg-light border-t border-border-brand p-5 space-y-5">
                    
                    {/* Status Management Bar */}
                    <div className="flex flex-wrap gap-3 items-center justify-between bg-white border border-border-brand p-3 rounded-md">
                      <div className="flex flex-wrap gap-2 items-center text-xs">
                        <span className="font-bold text-text-muted uppercase text-[10px]">Actualizar Estado Interno & Público:</span>
                        
                        {ord.status_internal === "borrador" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "reservado", "reserva_recibida")}
                            className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded font-semibold text-[10px]"
                          >
                            Señar / Confirmar Reserva
                          </button>
                        )}

                        {ord.status_internal === "reservado" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "esperando_minimo", "pendiente_de_confirmacion")}
                            className="px-2 py-1 bg-amber-50 text-warning border border-warning/20 rounded font-semibold text-[10px]"
                          >
                            Pasar a Compra Mayorista
                          </button>
                        )}

                        {ord.status_internal === "esperando_minimo" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "pedido_al_proveedor", "pedido_confirmado")}
                            className="px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded font-semibold text-[10px]"
                          >
                            Informar Pedido a Fábrica
                          </button>
                        )}

                        {ord.status_internal === "pedido_al_proveedor" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "recibido", "recibido_en_pacheca")}
                            className="px-2 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded font-semibold text-[10px]"
                          >
                            Recibir Mercadería en Local
                          </button>
                        )}

                        {ord.status_internal === "recibido" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "listo_para_retirar", "listo_para_retirar")}
                            className="px-2 py-1 bg-success-bg text-success border border-success/20 rounded font-semibold text-[10px]"
                          >
                            Marcar Listo para Retirar
                          </button>
                        )}

                        {ord.status_internal === "listo_para_retirar" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "entregado", "entregado")}
                            className="px-2 py-1 bg-success text-white rounded font-semibold text-[10px] hover:bg-success/90"
                          >
                            Registrar Entregado Completo
                          </button>
                        )}

                        {ord.status_internal !== "entregado" && ord.status_internal !== "cancelado" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "cancelado", "cancelado")}
                            className="px-2 py-1 bg-red-50 text-error border border-red-200 rounded font-semibold text-[10px]"
                          >
                            Cancelar Pedido
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Items Table */}
                    <div className="bg-white border border-border-brand rounded-lg overflow-hidden shadow-3xs p-4 space-y-3">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-brand pb-2">
                        Prendas en el Pedido
                      </h4>

                      <div className="divide-y divide-border-brand">
                        {items.map((it, idx) => (
                          <div key={idx} className="py-3 flex justify-between items-center text-xs">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-bg-light border border-border-brand rounded flex items-center justify-center text-text-muted overflow-hidden shrink-0">
                                <img
                                  src={mockDb.product_images.find(pi => pi.product_id === it.product_id)?.url_public || `/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp`}
                                  alt={it.product?.name_public}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-text-dark">{it.product?.name_public || "Artículo"}</p>
                                <p className="text-[10px] text-text-muted mt-0.5">
                                  Talle: <span className="font-semibold">{it.size}</span> | Color: <span className="font-semibold">{it.color}</span> | SKU Pacheca: {it.product?.code_public}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-text-dark">
                                {it.quantity} x {formatCurrency(it.price_unit_final)}
                              </p>
                              <p className="text-[10px] text-text-muted mt-0.5">
                                Costo mayorista: {formatCurrency(it.price_unit_cost * it.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address details */}
                    <div className="flex flex-col sm:flex-row justify-between text-xs text-text-muted pt-2 border-t border-border-brand/40 gap-2">
                      <p><strong>Método:</strong> {ord.delivery_method.replace("_", " ")}</p>
                      {ord.shipping_address && (
                        <p><strong>Dirección:</strong> {ord.shipping_address}</p>
                      )}
                      {ord.customer_notes && (
                        <p className="italic">Observaciones: &quot;{ord.customer_notes}&quot;</p>
                      )}
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
