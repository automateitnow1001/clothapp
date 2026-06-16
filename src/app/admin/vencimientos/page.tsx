"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db, mockDb, Customer, LateFeeRule } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import {
  Calendar, Clock, AlertTriangle, RefreshCw, Send, DollarSign,
  CheckCircle, Plus, Info, Ban, ShieldAlert, Sparkles
} from "lucide-react";

export default function AdminVencimientosPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [lateFeeRules, setLateFeeRules] = useState<LateFeeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const allCust = await db.customers.list();
      setCustomers(allCust);
      
      // Load late fee rules
      // (late_fee_rules is in mockDb.late_fee_rules)
      setLateFeeRules(mockDb.late_fee_rules || []);
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

  // Filter customers with debit balances
  const debtorCustomers = customers.filter(c => c.balance > 0);

  const handleApplyLateFee = async (cust: Customer) => {
    const activeRule = lateFeeRules.find(r => r.is_active) || mockDb.late_fee_rules[0];
    if (!activeRule) return;

    // Calculate interest: percentage_after_due % of balance + fixed_amount_fee
    const pctFee = (cust.balance * (activeRule.percentage_after_due / 100));
    const fixedFee = activeRule.fixed_amount_fee;
    const totalFee = pctFee + fixedFee;

    try {
      // Create ledger entry
      await db.ledger.addEntry({
        customer_id: cust.id,
        type: "recargo",
        description: `Recargo por Mora: ${activeRule.name} (${activeRule.percentage_after_due}% + ${formatCurrency(fixedFee)} cargo fijo)`,
        amount: totalFee,
        created_by: user?.email || "equipo@somospacheca.com.ar",
      });

      // Update customer status to blocked
      await db.customers.update(cust.id, {
        status: "bloqueado",
      });

      setSuccessMsg(`Interés por mora de ${formatCurrency(totalFee)} aplicado con éxito a ${cust.first_name} ${cust.last_name}. Cuenta suspendida.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err) {
      console.error(err);
    }
  };

  const getWhatsAppReminderLink = (cust: Customer) => {
    const text = `Hola *${cust.first_name}*! Te escribimos de Pacheca. Queríamos avisarte que tu cuenta registra saldo vencido por *${formatCurrency(cust.balance)}*. Te solicitamos realizar el pago correspondiente a la brevedad y enviarnos el comprobante para evitar recargos por mora. Saludos!`;
    return `https://wa.me/${cust.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-brand pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-accent" />
            Control de Vencimientos & Mora
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Gestión y aplicación de punitorios por mora para cuentas con saldos vencidos.
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

      {/* Rules Information card */}
      <div className="bg-white border border-border-brand rounded-lg p-5">
        <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider mb-4 flex items-center">
          <Sparkles className="h-4.5 w-4.5 mr-2 text-accent" />
          Reglas de Recargo por Mora Activas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-left">
          {lateFeeRules.map(rule => (
            <div key={rule.id} className="border border-border-brand rounded-md p-3.5 bg-bg-light space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-text-dark">{rule.name}</span>
                <span className="bg-success-bg text-success text-[8px] font-bold border border-success/20 px-1 py-0.5 rounded">
                  Activa
                </span>
              </div>
              <p className="text-text-muted mt-2">Recargo inmediato: <strong className="text-text-dark">{rule.percentage_after_due}%</strong></p>
              <p className="text-text-muted">Gasto fijo: <strong className="text-text-dark">{formatCurrency(rule.fixed_amount_fee)}</strong></p>
              <p className="text-text-muted">Período de gracia: <strong className="text-text-dark">{rule.grace_days} días</strong></p>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue Customers List */}
      <div className="bg-white border border-border-brand rounded-lg overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border-brand bg-bg-light/50">
          <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider">
            Clientes con Saldos Deudores
          </h3>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 skeleton w-full" />
            <div className="h-6 skeleton w-full" />
          </div>
        ) : debtorCustomers.length === 0 ? (
          <div className="text-center py-12 text-xs text-text-muted">
            No se registran clientes deudores en el sistema. ¡Conducta de pago ideal!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-brand text-left text-xs">
              <thead className="bg-bg-light">
                <tr>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Cliente</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Saldo Adeudado</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Límite Crédito</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Estado</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Acciones sobre Mora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-brand bg-white">
                {debtorCustomers.map((cust) => {
                  const isOverdue = cust.status === "vencido" || cust.status === "bloqueado";
                  return (
                    <tr key={cust.id} className="hover:bg-bg-light/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <Link href={`/admin/clientes/${cust.id}`} className="font-bold text-text-dark hover:text-accent transition-colors block">
                          {cust.first_name} {cust.last_name}
                        </Link>
                        <span className="text-[10px] text-text-muted block mt-0.5">{cust.whatsapp}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-error text-sm">
                        {formatCurrency(cust.balance)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-text-muted">
                        {formatCurrency(cust.credit_limit)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          cust.status === "al_dia" ? "bg-success-bg text-success border-success/20" :
                          cust.status === "vencido" ? "bg-error-bg text-error border-error/20" :
                          cust.status === "proximo_a_vencer" ? "bg-warning-bg text-warning border-warning/20" :
                          "bg-red-100 text-red-700 border-red-200"
                        }`}>
                          {cust.status === "al_dia" ? "Al Día" :
                           cust.status === "vencido" ? "Vencido" :
                           cust.status === "proximo_a_vencer" ? "Próx. Vencer" : "Bloqueado"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApplyLateFee(cust)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded flex items-center transition-colors"
                            title="Aplicar recargo por mora estándar"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Aplicar Punitorio
                          </button>
                          
                          <a
                            href={getWhatsAppReminderLink(cust)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white rounded text-[10px] font-bold flex items-center transition-colors"
                            title="Enviar intimación de pago por WhatsApp"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Reclamar Pago
                          </a>
                        </div>
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
