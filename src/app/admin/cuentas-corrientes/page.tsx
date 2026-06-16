"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db, mockDb, Customer } from "@/lib/db";
import {
  Wallet, Search, Landmark, RefreshCw, AlertCircle, FileText, CheckCircle,
  MessageSquare, Bell, Settings, Send, History, Check, X
} from "lucide-react";

export default function AdminCuentasCorrientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"balances" | "automatizaciones">("balances");

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Automatizaciones state
  const [automaticDebtActive, setAutomaticDebtActive] = useState(true);
  const [automaticExpiryActive, setAutomaticExpiryActive] = useState(true);
  const [logs, setLogs] = useState([
    { id: "1", date: "2026-06-14 09:00:00", customer: "Camila Gómez", type: "Vencimiento Próximo", balance: 112500, status: "Enviado", detail: "Aviso de cuenta por vencer en 7 días" },
    { id: "2", date: "2026-06-10 10:15:30", customer: "Valentina Rodríguez", type: "Mora Mensual (Días 5-10)", balance: 94500, status: "Enviado", detail: "Solicitud mensual de regularización de deuda" },
    { id: "3", date: "2026-06-08 09:00:00", customer: "Florencia Silva", type: "Mora Mensual (Días 5-10)", balance: 67000, status: "Enviado", detail: "Solicitud mensual de regularización de deuda" },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await db.customers.list();
      setCustomers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
  };

  // Calculations
  const totalReceivables = customers.reduce((sum, c) => sum + Number(c.balance), 0);
  const totalOverdue = customers
    .filter(c => c.status === "vencido" || c.status === "bloqueado")
    .reduce((sum, c) => sum + Number(c.balance), 0);
  
  const activeLimit = customers.reduce((sum, c) => sum + Number(c.credit_limit), 0);

  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Customer["status"]) => {
    const states = {
      al_dia: { bg: "bg-success-bg text-success border-success/20", label: "Al Día" },
      proximo_a_vencer: { bg: "bg-warning-bg text-warning border-warning/20", label: "Próx. Vencer" },
      vencido: { bg: "bg-error-bg text-error border-error/20", label: "Vencido" },
      bloqueado: { bg: "bg-red-100 text-red-700 border-red-200", label: "Bloqueado" },
    };

    const info = states[status] || { bg: "bg-gray-50 text-text-muted border-gray-200", label: status };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${info.bg}`}>
        {info.label}
      </span>
    );
  };

  const getWhatsAppManualLink = (cust: Customer) => {
    const text = `Esto es un mensaje para solicitar regularizar su deuda en pacheca, se aplican recargos por mora diarios, etc, su deuda es de ${formatCurrency(cust.balance)} al dia de la fecha. Gracias! Team Pacheca <3`;
    const cleanPhone = cust.whatsapp ? cust.whatsapp.replace(/\D/g, "") : "5493584377860";
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const triggerDebtSim = () => {
    const debtors = customers.filter(c => Number(c.balance) > 0);
    if (debtors.length === 0) {
      alert("No hay clientes con saldo deudor pendiente en este momento.");
      return;
    }
    
    const newLogs = debtors.map((d, index) => ({
      id: `new_debt_${Date.now()}_${index}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      customer: `${d.first_name} ${d.last_name}`,
      type: "Mora Mensual (Días 5-10)",
      balance: Number(d.balance),
      status: "Enviado",
      detail: "Solicitud de regularización de deuda mensual"
    }));

    setLogs(prev => [...newLogs, ...prev]);
    alert(`¡Simulación exitosa! Se enviaron los recordatorios automáticos de regularización de deuda a ${debtors.length} clientes de forma simulada.`);
  };

  const triggerExpirySim = () => {
    const expiring = customers.filter(c => c.status === "proximo_a_vencer" && Number(c.balance) > 0);
    if (expiring.length === 0) {
      alert("No hay clientes próximos a vencer con deudas en este momento.");
      return;
    }

    const newLogs = expiring.map((d, index) => ({
      id: `new_exp_${Date.now()}_${index}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      customer: `${d.first_name} ${d.last_name}`,
      type: "Vencimiento Próximo",
      balance: Number(d.balance),
      status: "Enviado",
      detail: "Aviso de cuenta corriente por vencer en 7 días (Recordatorio cada 2 días)"
    }));

    setLogs(prev => [...newLogs, ...prev]);
    alert(`¡Simulación exitosa! Se enviaron recordatorios de vencimiento próximo a ${expiring.length} clientes de forma simulada.`);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-brand pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
            <Wallet className="h-5 w-5 mr-2 text-accent" />
            Control de Cuentas Corrientes
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Resumen global de deudas de clientes, saldos de cartera y estado de cobranzas.
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

      {/* Tabs */}
      <div className="flex border-b border-border-brand">
        <button
          onClick={() => setActiveTab("balances")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "balances"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          Resumen & Saldos
        </button>
        <button
          onClick={() => setActiveTab("automatizaciones")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center ${
            activeTab === "automatizaciones"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          <Bell className="h-3.5 w-3.5 mr-1.5" />
          Alertas y Automatizaciones
        </button>
      </div>

      {activeTab === "balances" ? (
        <>
          {/* Financial Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 border border-border-brand rounded-lg shadow-2xs">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Cartera Activa (CC)</p>
              <p className="text-xl font-bold text-text-dark mt-2">{formatCurrency(totalReceivables)}</p>
              <p className="text-[10px] text-text-muted mt-1">Suma de deudas de todos los clientes.</p>
            </div>

            <div className="bg-white p-5 border border-border-brand rounded-lg shadow-2xs">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Cartera en Mora Vencida</p>
              <p className="text-xl font-bold text-error mt-2">{formatCurrency(totalOverdue)}</p>
              <p className="text-[10px] text-text-muted mt-1">Saldos de clientes bloqueados/vencidos.</p>
            </div>

            <div className="bg-white p-5 border border-border-brand rounded-lg shadow-2xs">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Límite Total Concedido</p>
              <p className="text-xl font-bold text-text-dark mt-2">{formatCurrency(activeLimit)}</p>
              <p className="text-[10px] text-text-muted mt-1">Cupo máximo de deudas habilitado.</p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white border border-border-brand rounded-lg p-4 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 text-xs"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white py-1.5"
              >
                <option value="all">Todos los Estados</option>
                <option value="al_dia">Al Día</option>
                <option value="proximo_a_vencer">Próx. Vencer</option>
                <option value="vencido">Vencido</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>
          </div>

          {/* Balances List Table */}
          <div className="bg-white border border-border-brand rounded-lg overflow-hidden shadow-2xs">
            {loading ? (
              <div className="p-8 space-y-4">
                <div className="h-6 skeleton w-full" />
                <div className="h-6 skeleton w-full" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-muted">
                No se registran saldos para los filtros seleccionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-brand text-left text-xs">
                  <thead className="bg-bg-light">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-text-muted uppercase">Cliente</th>
                      <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Límite Autorizado</th>
                      <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Cupo Utilizado %</th>
                      <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Crédito Disponible</th>
                      <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Saldo Deudor</th>
                      <th className="px-4 py-3 font-semibold text-text-muted uppercase">Estado</th>
                      <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-brand bg-white">
                    {filteredCustomers.map((cust) => {
                      const balance = Number(cust.balance);
                      const limit = Number(cust.credit_limit);
                      const usagePct = limit > 0 ? Math.min(100, Math.round((balance / limit) * 100)) : 0;
                      const available = Math.max(0, limit - balance);

                      return (
                        <tr key={cust.id} className="hover:bg-bg-light/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <Link href={`/admin/clientes/${cust.id}`} className="font-bold text-text-dark hover:text-accent transition-colors">
                              {cust.first_name} {cust.last_name}
                            </Link>
                            <span className="block text-[10px] text-text-muted mt-0.5">{cust.whatsapp}</span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold text-text-muted">
                            {formatCurrency(limit)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <span className="font-semibold text-text-dark">{usagePct}%</span>
                              <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    usagePct >= 90 ? "bg-error" : usagePct >= 50 ? "bg-warning" : "bg-success"
                                  }`}
                                  style={{ width: `${usagePct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold text-success">
                            {formatCurrency(available)}
                          </td>
                          <td className={`px-4 py-3.5 text-right font-bold text-base ${balance > 0 ? "text-error" : "text-text-muted"}`}>
                            {formatCurrency(balance)}
                          </td>
                          <td className="px-4 py-3.5">
                            {getStatusBadge(cust.status)}
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                            <Link
                              href={`/admin/clientes/${cust.id}`}
                              className="inline-flex items-center px-2.5 py-1.5 border border-border-brand rounded text-[10px] font-bold text-text-muted hover:bg-bg-light hover:text-text-dark transition-colors"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Historial
                            </Link>
                            {balance > 0 && (
                              <a
                                href={getWhatsAppManualLink(cust)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center px-2.5 py-1.5 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Cobrar
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Configuration and triggers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rule 1: Mora Mensual */}
            <div className="bg-white border border-border-brand rounded-lg p-5 space-y-4 shadow-2xs">
              <div className="flex items-start justify-between border-b border-border-brand pb-3">
                <div>
                  <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider flex items-center">
                    <Send className="h-4 w-4 mr-2 text-accent" />
                    Recordatorio Mensual de Deuda (Días 5 al 10)
                  </h3>
                  <p className="text-[11px] text-text-muted mt-1">
                    Envío automatizado masivo todos los meses del 5 al 10.
                  </p>
                </div>
                <button
                  onClick={() => setAutomaticDebtActive(!automaticDebtActive)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                    automaticDebtActive 
                      ? "bg-success-bg text-success border-success/20 hover:bg-success-bg/85" 
                      : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  }`}
                >
                  {automaticDebtActive ? "✓ Activo" : "✕ Inactivo"}
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-text-dark">Frecuencia:</span> Diaria, entre las 09:00 hs y las 11:00 hs.
                </div>
                <div>
                  <span className="font-semibold text-text-dark">Filtro de Clientes:</span> Todo cliente con saldo deudor actual &gt; $0.
                </div>
                <div>
                  <span className="font-semibold text-text-dark block mb-1">Plantilla de Mensaje Enviada:</span>
                  <div className="p-3 bg-bg-light border border-border-brand rounded text-text-muted italic leading-relaxed text-[11px]">
                    "esto es un mensaje automatico por favor solicitamos regularizar su deuda en pacheca, se aplican recargos por mora diarios, etc, su deuda es de $<b>{"{monto}"}</b> al dia de la fecha. Gracias! Team Pacheca &lt;3"
                  </div>
                </div>

                <div className="pt-2 flex space-x-2">
                  <button
                    onClick={triggerDebtSim}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Simular Envío Masivo Ahora
                  </button>
                </div>
              </div>
            </div>

            {/* Rule 2: Pre-vencimiento */}
            <div className="bg-white border border-border-brand rounded-lg p-5 space-y-4 shadow-2xs">
              <div className="flex items-start justify-between border-b border-border-brand pb-3">
                <div>
                  <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-accent" />
                    Avisos Preventivos de Vencimiento
                  </h3>
                  <p className="text-[11px] text-text-muted mt-1">
                    Notifica a clientes con vencimiento menor a 7 días, repitiéndose cada 2 días.
                  </p>
                </div>
                <button
                  onClick={() => setAutomaticExpiryActive(!automaticExpiryActive)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                    automaticExpiryActive 
                      ? "bg-success-bg text-success border-success/20 hover:bg-success-bg/85" 
                      : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  }`}
                >
                  {automaticExpiryActive ? "✓ Activo" : "✕ Inactivo"}
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-text-dark">Regla de Envío:</span> Se activa 1 semana (7 días) antes del vencimiento. Re-notifica cada 48 horas.
                </div>
                <div>
                  <span className="font-semibold text-text-dark block mb-1">Plantilla de Mensaje Enviada:</span>
                  <div className="p-3 bg-bg-light border border-border-brand rounded text-text-muted italic leading-relaxed text-[11px]">
                    "Hola <b>{"{nombre}"}</b>! Tu cuenta corriente en Pacheca está próxima a vencer y presentará recargos por mora en caso de retraso. Solicitamos regularizar tu saldo de $<b>{"{monto}"}</b>. Gracias! Team Pacheca"
                  </div>
                </div>

                <div className="pt-2 flex space-x-2">
                  <button
                    onClick={triggerExpirySim}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
                  >
                    <Bell className="h-3.5 w-3.5 mr-1.5" />
                    Simular Envío Vencimientos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity log */}
          <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3 flex items-center">
              <History className="h-4.5 w-4.5 mr-2 text-accent" />
              Historial de Notificaciones (Simulado)
            </h3>
            
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {logs.map(l => (
                <div key={l.id} className="p-3 bg-bg-light border border-border-brand rounded text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono text-text-muted">{l.date}</span>
                    <span className="bg-success-bg text-success px-1.5 py-0.5 rounded font-bold uppercase text-[8px]">
                      {l.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-text-dark">{l.customer}</span>
                    <p className="text-[10px] text-text-muted mt-0.5">{l.detail}</p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] pt-1 border-t border-border-brand/40 text-text-muted">
                    <span>{l.type}</span>
                    <span className="font-bold text-text-dark">{formatCurrency(l.balance)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
