"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db, mockDb, Customer, Payment, LedgerEntry } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import {
  Users, Search, Plus, Filter, Wallet, Phone, Send, Edit,
  CheckCircle, AlertTriangle, ShieldAlert, Landmark, DollarSign,
  X, Check, Info, Trash2
} from "lucide-react";

export default function AdminCustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form states
  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    last_name: "",
    dni: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    credit_limit: 100000,
    notes: "",
    labelsRaw: "mayorista",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "transferencia" as Payment["payment_method"],
    receipt_code: "",
    notes: "",
  });

  const [purchaseForm, setPurchaseForm] = useState({
    amount: "",
    description: "",
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadCustomers = async () => {
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
    loadCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const labels = newCustomer.labelsRaw
        .split(",")
        .map((l) => l.trim().toLowerCase())
        .filter((l) => l !== "");

      await db.customers.create({
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name,
        dni: newCustomer.dni || undefined,
        phone: newCustomer.phone || undefined,
        whatsapp: newCustomer.whatsapp,
        email: newCustomer.email || undefined,
        address: newCustomer.address || undefined,
        credit_limit: Number(newCustomer.credit_limit),
        balance: 0.00,
        status: "al_dia",
        notes: newCustomer.notes || undefined,
        labels,
        created_by: user?.email || "equipo@somospacheca.com.ar",
      });

      setSuccessMsg("Cliente creado con éxito en el fichero.");
      setShowCreateModal(false);
      
      // Reset form
      setNewCustomer({
        first_name: "",
        last_name: "",
        dni: "",
        phone: "",
        whatsapp: "",
        email: "",
        address: "",
        credit_limit: 100000,
        notes: "",
        labelsRaw: "mayorista",
      });

      loadCustomers();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !paymentForm.amount || Number(paymentForm.amount) <= 0) return;

    try {
      // 1. Create a payment in pending
      const pay = await db.payments.create({
        customer_id: selectedCustomer.id,
        amount: Number(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        payment_date: new Date().toISOString(),
        receipt_code: paymentForm.receipt_code || undefined,
        notes: paymentForm.notes || undefined,
      });

      // 2. Automatically verify it (since we are admin)
      await db.payments.verify(pay.id, true, user?.email || "equipo@somospacheca.com.ar");

      setSuccessMsg(`Pago de ${formatCurrency(Number(paymentForm.amount))} registrado y acreditado en la cuenta corriente.`);
      setShowPaymentModal(false);
      setPaymentForm({
        amount: "",
        payment_method: "transferencia",
        receipt_code: "",
        notes: "",
      });

      loadCustomers();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !purchaseForm.amount || Number(purchaseForm.amount) <= 0 || !purchaseForm.description) return;

    try {
      await db.ledger.addEntry({
        customer_id: selectedCustomer.id,
        type: "compra",
        description: purchaseForm.description,
        amount: Number(purchaseForm.amount),
        created_by: user?.email || "equipo@somospacheca.com.ar",
      });

      setSuccessMsg(`Compra de ${formatCurrency(Number(purchaseForm.amount))} cargada con éxito en la cuenta corriente.`);
      setShowPurchaseModal(false);
      setPurchaseForm({
        amount: "",
        description: "",
      });

      loadCustomers();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const getWhatsAppReminderLink = (cust: Customer) => {
    const text = `Hola *${cust.first_name}*! Te escribimos de Pacheca. Queríamos recordarte que tenés un saldo pendiente en tu cuenta corriente de *${formatCurrency(cust.balance)}*. Podés revisar los detalles de tu cuenta ingresando al portal con tu email: *${cust.email || ""}*. Muchas gracias!`;
    return `https://wa.me/${cust.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
  };

  const getUniqueLabels = () => {
    const labels = new Set<string>();
    customers.forEach((c) => c.labels.forEach((l) => labels.add(l)));
    return Array.from(labels);
  };

  // Filtering logic
  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    const dni = (c.dni || "").toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || dni.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesLabel = labelFilter === "all" || c.labels.includes(labelFilter);

    return matchesSearch && matchesStatus && matchesLabel;
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-brand pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
            <Users className="h-5 w-5 mr-2 text-accent" />
            Fichero de Clientes
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Visualización y gestión completa de clientes, cuentas corrientes, límites de crédito y notificaciones por WhatsApp.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Nuevo Cliente
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-success-bg border border-success/20 rounded text-xs text-success flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-border-brand rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="h-3.5 w-3.5 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white py-1"
            >
              <option value="all">Todos los Estados</option>
              <option value="al_dia">Al Día</option>
              <option value="proximo_a_vencer">Próx. Vencer</option>
              <option value="vencido">Vencidos</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>

          {/* Label Filter */}
          <select
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value)}
            className="text-xs bg-white py-1"
          >
            <option value="all">Todas las Etiquetas</option>
            {getUniqueLabels().map((label) => (
              <option key={label} value={label}>
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Customers Table */}
      <div className="bg-white border border-border-brand rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 skeleton w-full" />
            <div className="h-6 skeleton w-full" />
            <div className="h-6 skeleton w-full" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-xs text-text-muted">
            No se encontraron clientes que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-brand text-left text-xs">
              <thead className="bg-bg-light">
                <tr>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Cliente</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Contacto</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Límite Crédito</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Saldo Deudor</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Estado</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-brand bg-white">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-bg-light/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div>
                        <Link href={`/admin/clientes/${cust.id}`} className="font-bold text-text-dark hover:text-accent transition-colors block">
                          {cust.first_name} {cust.last_name}
                        </Link>
                        <span className="text-[10px] text-text-muted block mt-0.5">DNI: {cust.dni || "No informado"}</span>
                        {cust.created_by && (
                          <span className="text-[9px] text-text-muted block mt-0.5">Cargado por: {cust.created_by}</span>
                        )}
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {cust.labels.map((lbl) => (
                            <span key={lbl} className="bg-secondary/50 text-text-muted text-[8px] px-1 rounded font-medium border border-border-brand">
                              {lbl}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <span className="flex items-center text-text-dark">
                          <Phone className="h-3 w-3 mr-1 text-text-muted" />
                          {cust.whatsapp}
                        </span>
                        <span className="text-[10px] text-text-muted block">{cust.email || "Sin email"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">
                      {formatCurrency(cust.credit_limit)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-text-dark">
                      <span className={cust.balance > 0 ? "text-error" : "text-text-muted"}>
                        {formatCurrency(cust.balance)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(cust.status)}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        
                        <Link
                          href={`/admin/clientes/${cust.id}`}
                          className="p-1 border border-border-brand rounded hover:bg-bg-light text-text-muted hover:text-text-dark"
                          title="Ficha completa"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </Link>

                        <button
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setShowPaymentModal(true);
                          }}
                          className="px-2 py-1 bg-success-bg text-success border border-success/20 rounded hover:bg-success hover:text-white transition-colors text-[10px] font-semibold flex items-center"
                          title="Registrar Pago"
                        >
                          <Landmark className="h-3 w-3 mr-1" />
                          Cobrar
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setShowPurchaseModal(true);
                          }}
                          className="px-2 py-1 bg-amber-50 text-warning border border-warning/20 rounded hover:bg-warning hover:text-white transition-colors text-[10px] font-semibold flex items-center"
                          title="Cargar Compra"
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Vender
                        </button>

                        {cust.balance > 0 && (
                          <a
                            href={getWhatsAppReminderLink(cust)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded hover:bg-emerald-600 hover:text-white transition-colors"
                            title="Recordatorio de Pago WhatsApp"
                          >
                            <Send className="h-3 w-3" />
                          </a>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE CUSTOMER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-border-brand rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-dark"
            >
              <X className="h-4 w-4" />
            </button>
            
            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-2 flex items-center">
              <Users className="h-5 w-5 mr-2 text-accent" />
              Nuevo Registro de Cliente
            </h3>
            <p className="text-xs text-text-muted mb-6">
              Creá un nuevo registro de cuenta corriente en la base de datos de Pacheca.
            </p>

            <form onSubmit={handleCreateCustomer} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">DNI</label>
                  <input
                    type="text"
                    value={newCustomer.dni}
                    onChange={(e) => setNewCustomer({ ...newCustomer, dni: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Límite de Crédito ($) *</label>
                  <input
                    type="number"
                    required
                    value={newCustomer.credit_limit}
                    onChange={(e) => setNewCustomer({ ...newCustomer, credit_limit: Number(e.target.value) })}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">WhatsApp (con código de país) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 5491150493820"
                  value={newCustomer.whatsapp}
                  onChange={(e) => setNewCustomer({ ...newCustomer, whatsapp: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Teléfono Alternativo</label>
                <input
                  type="text"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Dirección Postal</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Etiquetas (separadas por coma)</label>
                <input
                  type="text"
                  value={newCustomer.labelsRaw}
                  onChange={(e) => setNewCustomer({ ...newCustomer, labelsRaw: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
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
                  className="flex items-center px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors"
                >
                  Crear Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER PAYMENT MODAL */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-border-brand rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-dark"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-2 flex items-center">
              <Landmark className="h-5 w-5 mr-2 text-success" />
              Abonar Cuenta Corriente
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Registrar pago para: <strong className="text-text-dark">{selectedCustomer.first_name} {selectedCustomer.last_name}</strong>
            </p>
            <div className="mb-6 p-3 bg-bg-light border border-border-brand rounded text-xs flex justify-between">
              <span className="text-text-muted">Saldo deudor actual:</span>
              <strong className="text-error font-bold">{formatCurrency(selectedCustomer.balance)}</strong>
            </div>

            <form onSubmit={handleRegisterPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Monto Cobrado ($) *</label>
                <input
                  type="number"
                  required
                  placeholder="Ej. 10000"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Método de Cobro *</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}
                  className="w-full text-xs bg-white"
                >
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="efectivo">Efectivo entregado</option>
                  <option value="tarjeta_debito">Tarjeta de Débito</option>
                  <option value="otro">Otro medio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Código de Transacción / Ref</label>
                <input
                  type="text"
                  placeholder="Ej. TX-984210"
                  value={paymentForm.receipt_code}
                  onChange={(e) => setPaymentForm({ ...paymentForm, receipt_code: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Notas Administrativas</label>
                <textarea
                  rows={2}
                  placeholder="Información adicional sobre la transacción..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-border-brand mt-6">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-border-brand text-text-muted hover:bg-bg-light text-xs font-semibold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-success text-white text-xs font-semibold rounded hover:bg-success/90 transition-colors"
                >
                  Acreditar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER MANUAL PURCHASE MODAL */}
      {showPurchaseModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-border-brand rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-dark"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-2 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-warning" />
              Cargar Compra o Deuda Manual
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Cargar saldo deudor para: <strong className="text-text-dark">{selectedCustomer.first_name} {selectedCustomer.last_name}</strong>
            </p>
            <div className="mb-6 p-3 bg-bg-light border border-border-brand rounded text-xs flex justify-between">
              <span className="text-text-muted">Crédito Disponible:</span>
              <strong className="text-success font-bold">
                {formatCurrency(Math.max(0, selectedCustomer.credit_limit - selectedCustomer.balance))}
              </strong>
            </div>

            <form onSubmit={handleRegisterPurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Monto de la Compra ($) *</label>
                <input
                  type="number"
                  required
                  placeholder="Ej. 12500"
                  value={purchaseForm.amount}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Detalle / Concepto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Compra manual de prendas en local"
                  value={purchaseForm.description}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, description: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-border-brand mt-6">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 border border-border-brand text-text-muted hover:bg-bg-light text-xs font-semibold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors"
                >
                  Cargar Deuda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
