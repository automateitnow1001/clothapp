"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { db, mockDb, Order, Customer, PurchaseRound, Payment, Product, AuditLog } from "@/lib/db";
import {
  TrendingUp, Wallet, AlertTriangle, RefreshCw, Clock, ArrowRight,
  TrendingDown, CheckCircle2, Package, Users, Activity, FileText, Eye, MapPin, Monitor
} from "lucide-react";

// Simulated visitor pages/sections
const VISITOR_PAGES = [
  "/catalogo", "/catalogo?cat=jeans", "/catalogo?cat=sweaters",
  "/producto/calza-luisina", "/producto/jean-enora", "/producto/buzo-samira",
  "/club-pacheca", "/telas", "/sobre-pacheca",
  "/carrito", "/favoritos", "/finalizar-pedido"
];

const VISITOR_CITIES = [
  "San Francisco (Cba.)", "Córdoba Capital", "Buenos Aires", "Río Cuarto",
  "Villa María", "La Falda", "Carlos Paz", "Bell Ville", "Cosquín", "Alta Gracia"
];

interface LiveVisitor {
  id: string;
  city: string;
  page: string;
  device: "móvil" | "escritorio";
  since: number; // seconds on site
}

function generateVisitors(): LiveVisitor[] {
  const count = Math.floor(Math.random() * 6) + 1;
  return Array.from({ length: count }, (_, i) => ({
    id: `v${i}_${Date.now()}`,
    city: VISITOR_CITIES[Math.floor(Math.random() * VISITOR_CITIES.length)],
    page: VISITOR_PAGES[Math.floor(Math.random() * VISITOR_PAGES.length)],
    device: Math.random() > 0.4 ? "móvil" : "escritorio",
    since: Math.floor(Math.random() * 300) + 10,
  }));
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySales: 0,
    monthSales: 0,
    outstandingDebt: 0,
    overdueCount: 0,
    activeRoundsCount: 0,
    outOfStockCount: 0,
  });

  const [activeRounds, setActiveRounds] = useState<PurchaseRound[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

  // Live visitors state
  const [liveVisitors, setLiveVisitors] = useState<LiveVisitor[]>([]);
  const visitorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const allOrders = await db.orders.list ? await db.orders.list() : mockDb.orders;
      const allCustomers = await db.customers.list ? await db.customers.list() : mockDb.customers;
      const allRounds = await db.purchaseRounds.list ? await db.purchaseRounds.list() : mockDb.purchase_rounds;
      const allPayments = await db.payments.list ? await db.payments.list() : mockDb.payments;
      const allProducts = await db.products.list ? await db.products.list() : mockDb.products;
      const allLogs = await db.audit.list ? await db.audit.list() : mockDb.audit_logs;

      // Calculations
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Today sales (only non-cancelled orders)
      const todaySales = allOrders
        .filter(o => o.status_internal !== "cancelado" && new Date(o.created_at) >= today)
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      // Month sales (only non-cancelled orders)
      const monthSales = allOrders
        .filter(o => o.status_internal !== "cancelado" && new Date(o.created_at) >= firstOfMonth)
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      // Outstanding customer debt
      const outstandingDebt = allCustomers.reduce((sum, c) => sum + Number(c.balance || 0), 0);

      // Overdue/blocked customers count
      const overdueCount = allCustomers.filter(c => c.status === "vencido" || c.status === "bloqueado").length;

      // Active purchase rounds count
      const activeRoundsFiltered = allRounds.filter(r => r.status === "abierta" || r.status === "minimo_alcanzado");
      const activeRoundsCount = activeRoundsFiltered.length;

      // Out of stock or low stock (less than 5 units total)
      const lowStockList = allProducts.filter(p => p.stock_total < 5 || p.availability === "agotado");
      const outOfStockCount = lowStockList.length;

      setStats({
        todaySales,
        monthSales,
        outstandingDebt,
        overdueCount,
        activeRoundsCount,
        outOfStockCount,
      });

      setActiveRounds(activeRoundsFiltered);
      setPendingPayments(allPayments.filter(p => p.status === "pending").slice(0, 5));
      setLowStockProducts(lowStockList.slice(0, 5));
      setRecentLogs(allLogs.slice(0, 5));
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Initialize live visitors
    setLiveVisitors(generateVisitors());

    // Update visitors every 8 seconds to simulate live changes
    visitorTimerRef.current = setInterval(() => {
      setLiveVisitors(prev => {
        // 30% chance to add a visitor, 20% chance to remove one, else update page
        const rand = Math.random();
        if (rand < 0.30 && prev.length < 12) {
          const city = VISITOR_CITIES[Math.floor(Math.random() * VISITOR_CITIES.length)];
          const page = VISITOR_PAGES[Math.floor(Math.random() * VISITOR_PAGES.length)];
          return [...prev, {
            id: `v${Date.now()}`,
            city,
            page,
            device: Math.random() > 0.4 ? "móvil" : "escritorio",
            since: 0,
          }];
        } else if (rand < 0.50 && prev.length > 1) {
          return prev.slice(1);
        } else {
          return prev.map(v => ({
            ...v,
            since: v.since + 8,
            page: Math.random() > 0.7 ? VISITOR_PAGES[Math.floor(Math.random() * VISITOR_PAGES.length)] : v.page,
          }));
        }
      });
    }, 8000);

    return () => {
      if (visitorTimerRef.current) clearInterval(visitorTimerRef.current);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
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
    return 100; // fallback if sin_minimo
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-7 w-48 skeleton" />
          <div className="h-9 w-28 skeleton" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 skeleton" />
          <div className="h-24 skeleton" />
          <div className="h-24 skeleton" />
          <div className="h-24 skeleton" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 lg:col-span-2 skeleton" />
          <div className="h-64 skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border-brand pb-4">
        <div>
          <h1 className="text-xl font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
            <Activity className="h-5 w-5 mr-2 text-accent animate-pulse-slow" />
            Dashboard de Control
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Resumen en tiempo real del estado de ventas, cuentas corrientes y rondas de compra de Pacheca.
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

      {/* Live Visitors Banner */}
      <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 border border-emerald-700/40 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h3 className="text-xs font-bold text-emerald-100 uppercase tracking-widest flex items-center gap-2">
              <Eye className="h-3.5 w-3.5" />
              Visitantes Online Ahora
            </h3>
          </div>
          <span className="text-xl font-bold text-white tabular-nums">{liveVisitors.length}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
          {liveVisitors.map((visitor) => (
            <div key={visitor.id} className="flex items-center gap-2 bg-emerald-900/60 rounded-md px-3 py-2 border border-emerald-700/30">
              <Monitor className="h-3 w-3 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                  <p className="text-[10px] font-semibold text-emerald-100 truncate">{visitor.city}</p>
                </div>
                <p className="text-[9px] text-emerald-400 truncate">{visitor.page}</p>
                <p className="text-[8px] text-emerald-600">{visitor.device} · {Math.floor(visitor.since / 60)}m {visitor.since % 60}s</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-emerald-700 mt-2 text-right">Datos simulados · Actualización cada 8s</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Sales */}
        <div className="bg-white p-5 border border-border-brand rounded-lg shadow-2xs hover-card">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ventas de Hoy</p>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <p className="text-lg font-bold text-text-dark mt-2">{formatCurrency(stats.todaySales)}</p>
          <p className="text-[10px] text-text-muted mt-1">Pedidos recibidos hoy.</p>
        </div>

        {/* Month Sales */}
        <div className="bg-white p-5 border border-border-brand rounded-lg shadow-2xs hover-card">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ventas del Mes</p>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <p className="text-lg font-bold text-text-dark mt-2">{formatCurrency(stats.monthSales)}</p>
          <p className="text-[10px] text-text-muted mt-1">Pedidos de este período mensual.</p>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-5 border border-border-brand rounded-lg shadow-2xs hover-card">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Saldo por Cobrar (CC)</p>
            <Wallet className="h-4 w-4 text-accent" />
          </div>
          <p className="text-lg font-bold text-text-dark mt-2">{formatCurrency(stats.outstandingDebt)}</p>
          <p className="text-[10px] text-text-muted mt-1">Capital pendiente en cuentas corrientes.</p>
        </div>

        {/* Overdue/Blocked clients */}
        <div className={`p-5 border rounded-lg shadow-2xs hover-card ${
          stats.overdueCount > 0 ? "bg-error-bg border-error/20" : "bg-white border-border-brand"
        }`}>
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Clientes en Mora</p>
            <AlertTriangle className={`h-4 w-4 ${stats.overdueCount > 0 ? "text-error" : "text-text-muted"}`} />
          </div>
          <p className={`text-lg font-bold mt-2 ${stats.overdueCount > 0 ? "text-error" : "text-text-dark"}`}>
            {stats.overdueCount} {stats.overdueCount === 1 ? "Cliente" : "Clientes"}
          </p>
          <p className="text-[10px] text-text-muted mt-1">Con estado vencido o bloqueado.</p>
        </div>
      </div>

      {/* Main sections grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rondas de Compra Activas */}
        <div className="lg:col-span-2 bg-white border border-border-brand rounded-lg shadow-2xs p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-border-brand pb-3">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider flex items-center">
              <Clock className="h-4 w-4 mr-2 text-accent" />
              Rondas de Compra Activas
            </h3>
            <Link href="/admin/rondas" className="text-[10px] font-semibold text-accent hover:text-accent-hover flex items-center">
              Ver todas <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRounds.length === 0 ? (
              <div className="col-span-2 text-center py-6 text-xs text-text-muted">
                No hay rondas de compra abiertas en este momento.
              </div>
            ) : (
              activeRounds.map((round) => {
                const supplier = mockDb.suppliers.find(s => s.id === round.supplier_id);
                const progress = getRoundProgress(round);
                return (
                  <div key={round.id} className="border border-border-brand rounded-md p-4 bg-bg-light space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-text-dark uppercase">{supplier?.name || "Proveedor"}</p>
                        <p className="text-[9px] text-text-muted mt-0.5">{round.code_round}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        round.status === "minimo_alcanzado" 
                          ? "bg-success-bg text-success border-success/20" 
                          : "bg-amber-50 text-warning border-amber-200"
                      }`}>
                        {round.status === "minimo_alcanzado" ? "Mínimo OK" : "Buscando Mínimo"}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-text-muted">
                        <span>Progreso General</span>
                        <span className="font-bold text-text-dark">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress >= 100 ? "bg-success" : "bg-accent"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                      <div>
                        <p className="text-text-muted">Acumulado ($):</p>
                        <p className="font-semibold text-text-dark">{formatCurrency(round.accumulated_cost)}</p>
                        {round.minimum_amount > 0 && (
                          <p className="text-[8px] text-text-muted">Mínimo: {formatCurrency(round.minimum_amount)}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-text-muted">Prendas:</p>
                        <p className="font-semibold text-text-dark">{round.accumulated_items} uds.</p>
                        {round.minimum_items > 0 && (
                          <p className="text-[8px] text-text-muted">Mínimo: {round.minimum_items} uds.</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagos Pendientes de Aprobación */}
        <div className="bg-white border border-border-brand rounded-lg shadow-2xs p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-border-brand pb-3">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-accent" />
              Pagos por Validar
            </h3>
            <Link href="/admin/pagos" className="text-[10px] font-semibold text-accent hover:text-accent-hover flex items-center">
              Gestionar <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingPayments.length === 0 ? (
              <div className="text-center py-8 text-xs text-text-muted">
                No hay transferencias o pagos pendientes de verificación.
              </div>
            ) : (
              pendingPayments.map((pay) => {
                const customer = mockDb.customers.find(c => c.id === pay.customer_id);
                return (
                  <div key={pay.id} className="flex justify-between items-center p-2.5 border border-border-brand rounded-md hover:bg-bg-light transition-colors text-xs">
                    <div>
                      <p className="font-bold text-text-dark">
                        {customer?.first_name} {customer?.last_name || "Cliente"}
                      </p>
                      <p className="text-[9px] text-text-muted mt-0.5">
                        {new Date(pay.payment_date).toLocaleDateString("es-AR")} | Ref: {pay.receipt_code || "Sin código"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">{formatCurrency(pay.amount)}</p>
                      <span className="text-[9px] text-text-muted uppercase font-medium">{pay.payment_method}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Secondary section: low stock and logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Productos sin Stock o bajo stock */}
        <div className="bg-white border border-border-brand rounded-lg shadow-2xs p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-border-brand pb-3">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider flex items-center">
              <Package className="h-4 w-4 mr-2 text-accent" />
              Bajo Stock / Agotados
            </h3>
            <Link href="/admin/productos" className="text-[10px] font-semibold text-accent hover:text-accent-hover flex items-center">
              Ir a Productos <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-2">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted">
                Todos los productos cuentan con niveles de stock saludables.
              </div>
            ) : (
              lowStockProducts.map((prod) => (
                <div key={prod.id} className="flex justify-between items-center p-2 border border-border-brand rounded-md text-xs">
                  <div>
                    <p className="font-bold text-text-dark">{prod.name_public}</p>
                    <p className="text-[9px] text-text-muted">Cód Pacheca: {prod.code_public}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    prod.stock_total === 0 
                      ? "bg-error-bg text-error border-error/20" 
                      : "bg-amber-50 text-warning border-amber-200"
                  }`}>
                    {prod.stock_total === 0 ? "Agotado" : `${prod.stock_total} uds.`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Auditoría / Registro de Actividad */}
        <div className="bg-white border border-border-brand rounded-lg shadow-2xs p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-border-brand pb-3">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider flex items-center">
              <FileText className="h-4 w-4 mr-2 text-accent" />
              Actividad Reciente
            </h3>
            <Link href="/admin/auditoria" className="text-[10px] font-semibold text-accent hover:text-accent-hover flex items-center">
              Ver registro completo <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted">
                No hay registros de auditoría recientes.
              </div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="text-xs border-b border-border-brand/50 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-text-dark uppercase text-[9px] tracking-wider bg-bg-light px-1.5 py-0.5 rounded border border-border-brand">
                      {log.action_type}
                    </span>
                    <span className="text-[9px] text-text-muted">
                      {new Date(log.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-text-muted mt-1 leading-normal">
                    {log.user_email ? <strong className="text-text-dark font-medium">{log.user_email}: </strong> : null}
                    Modificó {log.entity_name} {log.reason ? `(${log.reason})` : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
