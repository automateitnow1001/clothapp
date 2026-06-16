"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db, mockDb, Payment, Customer } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import {
  CreditCard, CheckCircle, XCircle, Clock, Search, Filter,
  RefreshCw, FileText, Check, X, AlertCircle
} from "lucide-react";

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await db.payments.list();
      setPayments(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (id: string, approve: boolean) => {
    setActioningId(id);
    try {
      await db.payments.verify(id, approve, user?.id || "admin");
      setSuccessMsg(approve ? "Pago verificado y acreditado con éxito en la cuenta corriente." : "Comprobante de pago rechazado.");
      loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
  };

  const filteredPayments = payments.filter((pay) => {
    const customer = mockDb.customers.find(c => c.id === pay.customer_id);
    const fullName = customer ? `${customer.first_name} ${customer.last_name}`.toLowerCase() : "";
    const receipt = (pay.receipt_code || "").toLowerCase();
    
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || receipt.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || pay.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-brand pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-accent" />
            Validación de Pagos & Transferencias
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Revisión de comprobantes informados por clientes. Al aprobarse, los saldos se deducen automáticamente de sus cuentas corrientes.
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

      {/* Filter and Search Bar */}
      <div className="bg-white border border-border-brand rounded-lg p-4 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por cliente o código de referencia..."
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
            <option value="pending">Pendientes de Revisión</option>
            <option value="approved">Aprobados / Verificados</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-border-brand rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 skeleton w-full" />
            <div className="h-6 skeleton w-full" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 text-xs text-text-muted">
            No se registran comprobantes de pago para los criterios indicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-brand text-left text-xs">
              <thead className="bg-bg-light">
                <tr>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Cliente</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Fecha Informado</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Método</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Referencia / Cód</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Notas / Observaciones</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Monto</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Estado</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-brand bg-white">
                {filteredPayments.map((pay) => {
                  const customer = mockDb.customers.find(c => c.id === pay.customer_id);
                  const isPending = pay.status === "pending";

                  return (
                    <tr key={pay.id} className="hover:bg-bg-light/30 transition-colors">
                      <td className="px-4 py-3.5">
                        {customer ? (
                          <Link href={`/admin/clientes/${customer.id}`} className="font-bold text-text-dark hover:text-accent transition-colors">
                            {customer.first_name} {customer.last_name}
                          </Link>
                        ) : (
                          <span className="text-text-muted">Cliente Desconocido</span>
                        )}
                        {pay.order_id && (
                          <span className="block text-[9px] text-text-muted mt-0.5">Asociado a Pedido</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-text-muted whitespace-nowrap">
                        {new Date(pay.payment_date).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-text-dark capitalize">
                        {pay.payment_method}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-text-muted font-bold">
                        {pay.receipt_code || "Sin ref"}
                      </td>
                      <td className="px-4 py-3.5 text-text-muted italic max-w-xs truncate" title={pay.notes}>
                        {pay.notes || "-"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-success text-sm whitespace-nowrap">
                        {formatCurrency(pay.amount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          pay.status === "approved"
                            ? "bg-success-bg text-success border-success/20"
                            : pay.status === "rejected"
                            ? "bg-red-50 text-error border-red-200"
                            : "bg-amber-50 text-warning border-amber-200"
                        }`}>
                          {pay.status === "approved" ? "Aprobado" : pay.status === "rejected" ? "Rechazado" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {isPending ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleVerify(pay.id, true)}
                              disabled={actioningId !== null}
                              className="p-1.5 bg-success-bg text-success border border-success/20 rounded hover:bg-success hover:text-white transition-colors"
                              title="Aprobar e imputar saldo"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleVerify(pay.id, false)}
                              disabled={actioningId !== null}
                              className="p-1.5 bg-red-50 text-error border border-red-100 rounded hover:bg-error hover:text-white transition-colors"
                              title="Rechazar comprobante"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-text-muted">Verificado</span>
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
    </div>
  );
}
