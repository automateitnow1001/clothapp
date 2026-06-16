"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db, Customer, LedgerEntry, Payment, mockDb } from "@/lib/db";
import { FileText, Plus, Landmark, RefreshCw, Send, CheckCircle } from "lucide-react";

export default function ClientLedgerPage() {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Payment["payment_method"]>("transferencia");
  const [receiptCode, setReceiptCode] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const loadData = () => {
    setLoading(true);
    if (user) {
      db.customers.getByProfile(user.id).then((cust) => {
        const targetCust = cust || mockDb.customers[0]; // fallback
        if (targetCust) {
          setCustomer(targetCust);
          db.ledger.listByCustomer(targetCust.id).then((entries) => {
            setLedger(entries);
            setLoading(false);
          });
        }
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleReportPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !paymentAmount || Number(paymentAmount) <= 0) return;

    try {
      await db.payments.create({
        customer_id: customer.id,
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        receipt_code: receiptCode || undefined,
        notes: paymentNotes || undefined,
      });

      // Show success
      setSuccessMsg("¡Pago informado con éxito! El staff de Pacheca revisará el comprobante a la brevedad.");
      setShowReportModal(false);
      
      // Clear form
      setPaymentAmount("");
      setReceiptCode("");
      setPaymentNotes("");

      // Hide message after 5 seconds
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 w-48 skeleton"></div>
          <div className="h-10 w-32 skeleton"></div>
        </div>
        <div className="h-64 w-full skeleton"></div>
      </div>
    );
  }

  const getEntryBadge = (type: LedgerEntry["type"]) => {
    const types: Record<string, { bg: string, label: string }> = {
      compra: { bg: "bg-red-50 text-error border-red-200", label: "Compra" },
      pago: { bg: "bg-success-bg text-success border-success/20", label: "Pago" },
      anticipo: { bg: "bg-blue-50 text-blue-600 border-blue-100", label: "Anticipo" },
      cuota: { bg: "bg-purple-50 text-purple-600 border-purple-100", label: "Cuota" },
      recargo: { bg: "bg-amber-50 text-warning border-amber-200", label: "Interés" },
      descuento: { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", label: "Descuento" },
      devolucion: { bg: "bg-teal-50 text-teal-600 border-teal-100", label: "Devolución" },
      ajuste: { bg: "bg-gray-50 text-text-muted border-gray-200", label: "Ajuste" },
      anulacion: { bg: "bg-red-50 text-red-600 border-red-100", label: "Anulado" },
    };
    
    const info = types[type] || { bg: "bg-gray-50 text-text-muted border-gray-200", label: type };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${info.bg}`}>
        {info.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-brand pb-4 gap-4">
        <div>
          <h1 className="text-lg font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
            <FileText className="h-5 w-5 mr-2 text-accent" />
            Estado de Cuenta Corriente
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Detalle cronológico de tus compras, cuotas cargadas, anticipos y pagos registrados.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadData}
            className="p-2 border border-border-brand rounded hover:bg-bg-light transition-colors text-text-muted"
            title="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Informar Pago
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-success-bg border border-success/20 rounded text-xs text-success flex items-start space-x-2">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-brand text-xs text-left">
          <thead className="bg-bg-light">
            <tr>
              <th className="px-4 py-3 font-semibold text-text-muted uppercase">Fecha</th>
              <th className="px-4 py-3 font-semibold text-text-muted uppercase">Tipo</th>
              <th className="px-4 py-3 font-semibold text-text-muted uppercase">Detalle</th>
              <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Importe</th>
              <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Saldo Acum.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-brand bg-white">
            {ledger.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  No se registran movimientos financieros en tu cuenta corriente.
                </td>
              </tr>
            ) : (
              ledger.map((entry) => {
                const isDebt = entry.amount > 0;
                const formattedAmount = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Math.abs(entry.amount));
                const formattedBalance = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(entry.balance_after);

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
                      {getEntryBadge(entry.type)}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-text-dark">
                      {entry.description}
                      {entry.due_date && (
                        <span className="block text-[10px] text-text-muted mt-0.5">
                          Vence: {new Date(entry.due_date).toLocaleDateString("es-AR")}
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-3.5 text-right font-bold whitespace-nowrap ${isDebt ? "text-error" : "text-success"}`}>
                      {isDebt ? "+" : "-"}{formattedAmount}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-text-dark whitespace-nowrap">
                      {formattedBalance}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Informar Pago Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-border-brand rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-2 flex items-center">
              <Landmark className="h-5 w-5 mr-2 text-accent" />
              Informar Transferencia o Pago
            </h3>
            <p className="text-xs text-text-muted mb-6">
              Completá los datos del pago realizado. El staff de administración verificará tu comprobante y acreditará el monto.
            </p>

            <form onSubmit={handleReportPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">
                  Monto Abonado ($) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ej. 15000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">
                  Método de Pago *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
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
                <label className="block text-xs font-semibold text-text-dark mb-1">
                  Código de Operación / Referencia
                </label>
                <input
                  type="text"
                  placeholder="Ej. MP-9824901"
                  value={receiptCode}
                  onChange={(e) => setReceiptCode(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">
                  Notas / Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Información adicional..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-border-brand mt-6">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-border-brand text-text-muted hover:bg-bg-light text-xs font-semibold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Enviar Notificación
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
