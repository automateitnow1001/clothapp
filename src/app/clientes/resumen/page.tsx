"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db, Customer } from "@/lib/db";
import { Landmark, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, TrendingUp, Clock } from "lucide-react";

export default function ClientSummaryPage() {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      db.customers.getByProfile(user.id).then((cust) => {
        if (cust) {
          setCustomer(cust);
        } else {
          // If admin logs in, show a fallback mock customer for testing
          db.customers.list().then((list) => {
            if (list.length > 0) setCustomer(list[0]);
          });
        }
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 skeleton"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 skeleton"></div>
          <div className="h-28 skeleton"></div>
          <div className="h-28 skeleton"></div>
        </div>
        <div className="h-32 skeleton"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-text-muted">No se encontró una ficha de cliente activa para esta cuenta.</p>
      </div>
    );
  }

  // Calculate fields
  const formattedBalance = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(customer.balance);
  const formattedLimit = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(customer.credit_limit);
  const availableCredit = Math.max(0, customer.credit_limit - customer.balance);
  const formattedAvailable = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(availableCredit);
  
  // Status definitions
  const statusStyles = {
    al_dia: {
      bg: "bg-success-bg text-success border-success/20",
      label: "Al Día",
      icon: CheckCircle,
      desc: "¡Tu cuenta está impecable! Gracias por mantenerte al día.",
    },
    proximo_a_vencer: {
      bg: "bg-warning-bg text-warning border-warning/20",
      label: "Próximo a Vencer",
      icon: Clock,
      desc: "Tenés saldos pendientes por vencer esta semana. Te sugerimos realizar el pago.",
    },
    vencido: {
      bg: "bg-error-bg text-error border-error/20",
      label: "Vencido",
      icon: AlertTriangle,
      desc: "Registramos deudas vencidas en tu cuenta corriente. Por favor, cancelá tus saldos para evitar recargos por mora.",
    },
    bloqueado: {
      bg: "bg-red-100 text-red-700 border-red-200",
      label: "Bloqueado",
      icon: ShieldAlert,
      desc: "Tu cuenta se encuentra suspendida temporalmente para nuevas compras por mora prolongada.",
    },
  };

  const statusInfo = statusStyles[customer.status] || statusStyles.al_dia;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div>
        <h1 className="text-lg font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-accent" />
          Hola, {customer.first_name}!
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Te damos la bienvenida a tu portal personal de Pacheca. Aquí podés revisar tus saldos y pedidos.
        </p>
      </div>

      {/* Financial Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Current Balance */}
        <div className="p-5 border border-border-brand rounded-lg bg-bg-light">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Saldo Pendiente / Deuda
          </p>
          <p className="text-xl font-bold text-text-dark mt-2">{formattedBalance}</p>
          <p className="text-[10px] text-text-muted mt-1">
            Total acumulado en tu cuenta corriente.
          </p>
        </div>

        {/* Available Credit */}
        <div className="p-5 border border-border-brand rounded-lg bg-bg-light">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Crédito Disponible
          </p>
          <p className="text-xl font-bold text-success mt-2">{formattedAvailable}</p>
          <p className="text-[10px] text-text-muted mt-1">
            Límite máximo asignado: {formattedLimit}
          </p>
        </div>

        {/* Account Status Badge */}
        <div className={`p-5 border rounded-lg ${statusInfo.bg} flex flex-col justify-between`}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-85">
              Estado de la Cuenta
            </p>
            <div className="flex items-center mt-2">
              <StatusIcon className="h-5 w-5 mr-1.5 shrink-0" />
              <span className="text-sm font-bold">{statusInfo.label}</span>
            </div>
          </div>
          <p className="text-[9px] mt-2 leading-relaxed opacity-90">{statusInfo.desc}</p>
        </div>

      </div>

      {/* Due Date Alert if status requires it */}
      {customer.status !== "al_dia" && (
        <div className="p-4 bg-warning-bg border border-warning/20 rounded-md text-xs text-warning flex items-start space-x-3">
          <Clock className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-text-dark">Recordatorio de Vencimientos</h4>
            <p className="text-text-muted mt-1 leading-relaxed">
              Recordá que podés abonar tus saldos mediante transferencia bancaria o en efectivo en nuestro local. Una vez realizado el pago, comunicate por WhatsApp adjuntando el comprobante para acelerar la acreditación.
            </p>
          </div>
        </div>
      )}

      {/* General Information */}
      <div className="border border-border-brand rounded-lg p-5">
        <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-accent" />
          ¿Cómo saldar tu cuenta corriente?
        </h3>
        <div className="mt-4 space-y-3 text-xs text-text-muted leading-relaxed">
          <p>
            1. <strong>Transferencia Bancaria:</strong> Realizá la transferencia a nuestro CBU/Alias (solicitá los datos actualizados a administración).
          </p>
          <p>
            2. <strong>Efectivo:</strong> Podés abonar de forma presencial en nuestra boutique.
          </p>
          <p>
            3. <strong>Acreditación:</strong> Los pagos pueden demorar hasta 24 horas hábiles en acreditarse mientras el staff verifica la transferencia bancaria.
          </p>
        </div>
      </div>

    </div>
  );
}
