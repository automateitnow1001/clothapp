"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, mockDb, Customer, LedgerEntry, Order, Payment } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import {
  User, ArrowLeft, Wallet, ShoppingBag, Landmark, Edit,
  ShieldAlert, CheckCircle, AlertTriangle, Send, Phone,
  FileText, Calendar, Plus, RefreshCw, X, HelpCircle, Ban, Undo
} from "lucide-react";

export default function AdminCustomerDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cuenta" | "pedidos" | "pagos" | "editar">("cuenta");

  // Edit / Action states
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    dni: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    credit_limit: 0,
    notes: "",
    labelsRaw: "",
  });

  const [status, setStatus] = useState<Customer["status"]>("al_dia");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [cancelModalEntry, setCancelModalEntry] = useState<LedgerEntry | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const cust = await db.customers.get(id);
      if (cust) {
        setCustomer(cust);
        setStatus(cust.status);
        setEditForm({
          first_name: cust.first_name,
          last_name: cust.last_name,
          dni: cust.dni || "",
          phone: cust.phone || "",
          whatsapp: cust.whatsapp,
          email: cust.email || "",
          address: cust.address || "",
          credit_limit: cust.credit_limit,
          notes: cust.notes || "",
          labelsRaw: cust.labels.join(", "),
        });

        // Load related tables
        const ledgerList = await db.ledger.listByCustomer(cust.id);
        setLedger(ledgerList);

        const ordersList = await db.orders.listByCustomer(cust.id);
        setOrders(ordersList);

        const paymentsList = await db.payments.listByCustomer(cust.id);
        setPayments(paymentsList);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setIsSavingProfile(true);
    try {
      const labels = editForm.labelsRaw
        .split(",")
        .map((l) => l.trim().toLowerCase())
        .filter((l) => l !== "");

      await db.customers.update(customer.id, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        dni: editForm.dni || undefined,
        phone: editForm.phone || undefined,
        whatsapp: editForm.whatsapp,
        email: editForm.email || undefined,
        address: editForm.address || undefined,
        credit_limit: Number(editForm.credit_limit),
        notes: editForm.notes || undefined,
        labels,
        status,
        updated_by: user?.email || "equipo@somospacheca.com.ar",
      });

      setSuccessMsg("Ficha de cliente y límites de crédito actualizados.");
      loadData();
      setIsSavingProfile(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
      setIsSavingProfile(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!customer) return;
    const nextStatus = status === "bloqueado" ? "al_dia" : "bloqueado";
    try {
      await db.customers.update(customer.id, { 
        status: nextStatus,
        updated_by: user?.email || "equipo@somospacheca.com.ar",
      });
      setSuccessMsg(nextStatus === "bloqueado" ? "Cuenta de cliente suspendida/bloqueada." : "Cuenta de cliente desbloqueada.");
      loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelLedgerEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !cancelModalEntry || !cancelReason) return;
    try {
      await db.ledger.cancelEntry(cancelModalEntry.id, cancelReason, user?.email || "equipo@somospacheca.com.ar");
      setSuccessMsg("Movimiento anulado mediante asiento compensador contable.");
      setCancelModalEntry(null);
      setCancelReason("");
      loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
  };

  const getStatusBadge = (statusVal: Customer["status"]) => {
    const states = {
      al_dia: { bg: "bg-success-bg text-success border-success/20", label: "Al Día" },
      proximo_a_vencer: { bg: "bg-warning-bg text-warning border-warning/20", label: "Próx. Vencer" },
      vencido: { bg: "bg-error-bg text-error border-error/20", label: "Vencido" },
      bloqueado: { bg: "bg-red-100 text-red-700 border-red-200", label: "Bloqueado" },
    };

    const info = states[statusVal] || { bg: "bg-gray-50 text-text-muted border-gray-200", label: statusVal };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${info.bg}`}>
        {info.label}
      </span>
    );
  };

  const getLedgerTypeBadge = (type: LedgerEntry["type"]) => {
    const types: Record<string, { bg: string, label: string }> = {
      compra: { bg: "bg-red-50 text-error border-red-200", label: "Compra" },
      pago: { bg: "bg-success-bg text-success border-success/20", label: "Pago" },
      anticipo: { bg: "bg-blue-50 text-blue-600 border-blue-100", label: "Anticipo" },
      cuota: { bg: "bg-purple-50 text-purple-600 border-purple-100", label: "Cuota" },
      recargo: { bg: "bg-amber-50 text-warning border-amber-200", label: "Interés" },
      descuento: { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", label: "Descuento" },
      devolucion: { bg: "bg-teal-50 text-teal-600 border-teal-100", label: "Devolución" },
      ajuste: { bg: "bg-gray-50 text-text-muted border-gray-200", label: "Ajuste" },
      anulacion: { bg: "bg-red-50 text-red-600 border-red-100", label: "Anulante" },
    };
    
    const info = types[type] || { bg: "bg-gray-50 text-text-muted border-gray-200", label: type };
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${info.bg}`}>
        {info.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 skeleton" />
          <div className="h-6 w-32 skeleton" />
        </div>
        <div className="h-32 w-full skeleton" />
        <div className="h-64 w-full skeleton" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-xs text-text-muted mb-4">No se encontró el cliente en el sistema.</p>
        <button onClick={() => router.push("/admin/clientes")} className="text-xs font-bold text-accent">
          ← Volver a Clientes
        </button>
      </div>
    );
  }

  const availableCredit = Math.max(0, customer.credit_limit - customer.balance);

  return (
    <div className="space-y-6">
      
      {/* Back to list */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-xs font-semibold text-text-muted hover:text-text-dark transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Volver Atrás
      </button>

      {successMsg && (
        <div className="p-4 bg-success-bg border border-success/20 rounded text-xs text-success flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Customer Header card */}
      <div className="bg-white border border-border-brand rounded-lg p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-lg font-bold uppercase shrink-0">
              {customer.first_name[0]}{customer.last_name[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg font-bold font-display text-text-dark">{customer.first_name} {customer.last_name}</h2>
                {getStatusBadge(customer.status)}
              </div>
              <p className="text-xs text-text-muted mt-1">DNI: {customer.dni || "N/A"} | WhatsApp: {customer.whatsapp}</p>
              {customer.created_by && (
                <p className="text-[10px] text-text-muted mt-0.5">
                  Cargado por: <span className="font-semibold">{customer.created_by}</span>
                  {customer.updated_by && <> | Modificado por: <span className="font-semibold">{customer.updated_by}</span></>}
                </p>
              )}
              <div className="flex gap-1 mt-2">
                {customer.labels.map(lbl => (
                  <span key={lbl} className="bg-secondary/40 text-text-muted text-[8px] px-1 rounded border border-border-brand">
                    {lbl}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={handleToggleBlock}
              className={`flex-1 md:flex-none flex items-center justify-center px-4 py-2 border rounded text-xs font-semibold transition-colors ${
                status === "bloqueado"
                  ? "bg-success-bg text-success border-success/20 hover:bg-success hover:text-white"
                  : "bg-red-50 text-red-700 border-red-200 hover:bg-red-600 hover:text-white"
              }`}
            >
              <Ban className="h-3.5 w-3.5 mr-1.5" />
              {status === "bloqueado" ? "Desbloquear Cuenta" : "Bloquear / Suspender"}
            </button>
            <button
              onClick={loadData}
              className="px-3 py-2 border border-border-brand rounded text-text-muted hover:bg-bg-light"
              title="Recargar datos"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Balance metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-brand mt-6 pt-6 text-xs text-left">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Saldo en Cuenta Corriente</p>
            <p className={`text-lg font-bold mt-1 ${customer.balance > 0 ? "text-error" : "text-success"}`}>
              {formatCurrency(customer.balance)}
            </p>
            <p className="text-[9px] text-text-muted mt-0.5">Monto total adeudado.</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Límite de Crédito Asignado</p>
            <p className="text-lg font-bold text-text-dark mt-1">
              {formatCurrency(customer.credit_limit)}
            </p>
            <p className="text-[9px] text-text-muted mt-0.5">Crédito corriente máximo autorizado.</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Crédito Disponible</p>
            <p className="text-lg font-bold text-success mt-1">
              {formatCurrency(availableCredit)}
            </p>
            <p className="text-[9px] text-text-muted mt-0.5">Restante disponible para reservas.</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border-brand">
        <button
          onClick={() => setActiveTab("cuenta")}
          className={`flex items-center px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === "cuenta"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          <Wallet className="h-4 w-4 mr-2" />
          Cuenta Corriente
        </button>
        <button
          onClick={() => setActiveTab("pedidos")}
          className={`flex items-center px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === "pedidos"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Pedidos
        </button>
        <button
          onClick={() => setActiveTab("pagos")}
          className={`flex items-center px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === "pagos"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          <Landmark className="h-4 w-4 mr-2" />
          Comprobantes de Pago
        </button>
        <button
          onClick={() => setActiveTab("editar")}
          className={`flex items-center px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === "editar"
              ? "border-accent text-accent"
              : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar Perfil
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        
        {/* T1: Cuenta Corriente (Ledger History) */}
        {activeTab === "cuenta" && (
          <div className="bg-white border border-border-brand rounded-lg overflow-hidden shadow-2xs p-5">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider mb-4 flex items-center">
              <FileText className="h-4.5 w-4.5 mr-2 text-accent" />
              Historial de Cuenta Corriente
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-brand text-xs text-left">
                <thead className="bg-bg-light">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase">Fecha</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase">Tipo</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase">Detalle</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase">Auditoría</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Importe</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Saldo Acumulado</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-brand bg-white">
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                        No se registran movimientos en esta cuenta corriente.
                      </td>
                    </tr>
                  ) : (
                    ledger.map((entry) => {
                      const isDebt = entry.amount > 0;
                      const formattedAmount = formatCurrency(Math.abs(entry.amount));
                      const formattedBalance = formatCurrency(entry.balance_after);

                      return (
                        <tr key={entry.id} className={entry.status === "anulado" ? "opacity-45 line-through" : ""}>
                          <td className="px-4 py-3.5 text-text-muted whitespace-nowrap">
                            {new Date(entry.entry_date).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {getLedgerTypeBadge(entry.type)}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-text-dark">
                            {entry.description}
                            {entry.reason_for_edit && (
                              <span className="block text-[10px] text-error font-semibold mt-0.5">
                                Motivo anulación: &quot;{entry.reason_for_edit}&quot;
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-text-muted whitespace-nowrap">
                            {entry.created_by || "sistema"}
                          </td>
                          <td className={`px-4 py-3.5 text-right font-bold whitespace-nowrap ${isDebt ? "text-error" : "text-success"}`}>
                            {isDebt ? "+" : "-"}{formattedAmount}
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold text-text-dark whitespace-nowrap">
                            {formattedBalance}
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            {entry.status !== "anulado" && entry.type !== "anulacion" && (
                              <button
                                onClick={() => setCancelModalEntry(entry)}
                                className="p-1 border border-red-200 rounded hover:bg-red-50 text-red-500 hover:text-red-700 inline-flex items-center text-[10px] font-bold"
                                title="Anular transacción"
                              >
                                <Undo className="h-3 w-3 mr-0.5" />
                                Anular
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* T2: Pedidos */}
        {activeTab === "pedidos" && (
          <div className="bg-white border border-border-brand rounded-lg overflow-hidden shadow-2xs p-5">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider mb-4 flex items-center">
              <ShoppingBag className="h-4.5 w-4.5 mr-2 text-accent" />
              Pedidos del Cliente
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-brand text-xs text-left">
                <thead className="bg-bg-light">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase">Nro Pedido</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase">Fecha Creación</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase">Estado Público</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Seña</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Monto Total</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-brand bg-white">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                        El cliente no cuenta con pedidos registrados.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="px-4 py-3.5 font-bold text-text-dark">
                          {ord.code_public}
                        </td>
                        <td className="px-4 py-3.5 text-text-muted whitespace-nowrap">
                          {new Date(ord.created_at).toLocaleDateString("es-AR")}
                        </td>
                        <td className="px-4 py-3.5 font-semibold">
                          <span className="bg-bg-light px-2 py-0.5 border border-border-brand rounded text-[10px] text-text-dark">
                            {ord.status_public}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-success">
                          {formatCurrency(ord.advance_amount)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-text-dark">
                          {formatCurrency(ord.total_amount)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {/* Future link to admin orders page */}
                          <span className="text-[10px] text-text-muted font-medium">Ver en Pedidos</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* T3: Comprobantes de Pago */}
        {activeTab === "pagos" && (
          <div className="bg-white border border-border-brand rounded-lg overflow-hidden shadow-2xs p-5">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider mb-4 flex items-center">
              <Landmark className="h-4.5 w-4.5 mr-2 text-accent" />
              Comprobantes de Pago Registrados
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-brand text-xs text-left">
                <thead className="bg-bg-light">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase">ID Transacción</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase">Fecha Informado</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase">Método</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase">Ref / Comp</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Monto</th>
                    <th className="px-4 py-3 font-semibold text-text-muted uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-brand bg-white">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                        No se registran comprobantes informados para este cliente.
                      </td>
                    </tr>
                  ) : (
                    payments.map((pay) => (
                      <tr key={pay.id}>
                        <td className="px-4 py-3.5 text-[10px] text-text-muted font-mono whitespace-nowrap">
                          #{pay.id.substring(0, 8)}
                        </td>
                        <td className="px-4 py-3.5 text-text-muted whitespace-nowrap">
                          {new Date(pay.payment_date).toLocaleDateString("es-AR")}
                        </td>
                        <td className="px-4 py-3.5 text-text-dark font-medium capitalize">
                          {pay.payment_method}
                        </td>
                        <td className="px-4 py-3.5 text-text-muted font-bold">
                          {pay.receipt_code || "Sin código"}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-success">
                          {formatCurrency(pay.amount)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            pay.status === "approved"
                              ? "bg-success-bg text-success border-success/20"
                              : pay.status === "rejected"
                              ? "bg-red-50 text-error border-red-200"
                              : "bg-amber-50 text-warning border-amber-200"
                          }`}>
                            {pay.status === "approved" ? "Verificado" : pay.status === "rejected" ? "Rechazado" : "Pendiente"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* T4: Editar Perfil */}
        {activeTab === "editar" && (
          <div className="bg-white border border-border-brand rounded-lg shadow-2xs p-5">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider mb-6 flex items-center border-b border-border-brand pb-3">
              <Edit className="h-4.5 w-4.5 mr-2 text-accent" />
              Modificar Ficha de Cliente
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">DNI</label>
                  <input
                    type="text"
                    value={editForm.dni}
                    onChange={(e) => setEditForm({ ...editForm, dni: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Límite de Crédito ($) *</label>
                  <input
                    type="number"
                    required
                    value={editForm.credit_limit}
                    onChange={(e) => setEditForm({ ...editForm, credit_limit: Number(e.target.value) })}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">WhatsApp (con código de país) *</label>
                <input
                  type="text"
                  required
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Teléfono Alternativo</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Dirección Postal de Envío</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Etiquetas (separadas por coma)</label>
                <input
                  type="text"
                  value={editForm.labelsRaw}
                  onChange={(e) => setEditForm({ ...editForm, labelsRaw: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Estado de Cuenta</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs bg-white"
                >
                  <option value="al_dia">Al Día</option>
                  <option value="proximo_a_vencer">Próximo a Vencer</option>
                  <option value="vencido">Vencido</option>
                  <option value="bloqueado">Bloqueado / Suspendido</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Observaciones</label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="pt-4 border-t border-border-brand">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {isSavingProfile ? "Guardando..." : "Guardar Ficha de Cliente"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* CANCEL ENTRY MODAL */}
      {cancelModalEntry && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-border-brand rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setCancelModalEntry(null);
                setCancelReason("");
              }}
              className="absolute right-4 top-4 text-text-muted hover:text-text-dark"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-2 flex items-center">
              <Undo className="h-5 w-5 mr-2 text-error" />
              Anulación de Transacción
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Estás a punto de anular el movimiento seleccionado. Esta acción es irrevocable y se realiza conforme al principio de inmutabilidad financiera (se creará un asiento de anulación compensatorio).
            </p>

            <div className="p-3 bg-bg-light border border-border-brand rounded text-xs mb-6 space-y-1">
              <p><strong>Detalle original:</strong> {cancelModalEntry.description}</p>
              <p><strong>Monto original:</strong> {formatCurrency(cancelModalEntry.amount)}</p>
            </div>

            <form onSubmit={handleCancelLedgerEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">
                  Motivo o Justificación de la Anulación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Doble imputación de reserva / Error de tipeo..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-border-brand">
                <button
                  type="button"
                  onClick={() => {
                    setCancelModalEntry(null);
                    setCancelReason("");
                  }}
                  className="px-4 py-2 border border-border-brand text-text-muted hover:bg-bg-light text-xs font-semibold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded"
                >
                  Anular Transacción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
