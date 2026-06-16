"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { 
  Settings, Save, Percent, Scale, Phone, HelpCircle, 
  MessageSquare, ShieldCheck, AlertCircle, RefreshCw
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states matching DB schema
  const [markupPercent, setMarkupPercent] = useState(55);
  const [markupFixed, setMarkupFixed] = useState(0);
  const [roundingMethod, setRoundingMethod] = useState("a_100");
  
  // WhatsApp settings
  const [whatsappPhone, setWhatsappPhone] = useState("5491122334455");
  const [whatsappTemplate, setWhatsappTemplate] = useState("Hola Pacheca! Vengo de la web y quiero consultar por {product_name} (Código: {product_code})");
  const [whatsappReminder, setWhatsappReminder] = useState("Hola {customer_name}! Te escribimos desde Pacheca para recordarte que tenés una seña o saldo de cuenta pendiente por {amount} en tu Pedido {order_code}. ¿Nos confirmás la transferencia?");

  // Arrears / Late fee rules defaults
  const [gracePeriodDays, setGracePeriodDays] = useState(15);
  const [interestPercentage, setInterestPercentage] = useState(1.5);
  const [interestPeriod, setInterestPeriod] = useState("diario");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const gMarkup = await db.settings.get("general_markup");
      if (gMarkup) {
        setMarkupPercent(gMarkup.percentage || 55);
        setMarkupFixed(gMarkup.fixed || 0);
      }

      const gRound = await db.settings.get("global_rounding");
      if (gRound) {
        setRoundingMethod(gRound.method || "a_100");
      }

      const waContact = await db.settings.get("whatsapp_contact");
      if (waContact) {
        setWhatsappPhone(waContact.phone || "5491122334455");
        setWhatsappTemplate(waContact.message_template || "");
        setWhatsappReminder(waContact.reminder_template || "Hola {customer_name}! Te escribimos desde Pacheca para recordarte que tenés una seña o saldo de cuenta pendiente por {amount} en tu Pedido {order_code}. ¿Nos confirmás la transferencia?");
      }

      const mRules = await db.settings.get("mora_rules_default");
      if (mRules) {
        setGracePeriodDays(mRules.grace_period_days || 15);
        setInterestPercentage(mRules.interest_percentage || 1.5);
        setInterestPeriod(mRules.period || "diario");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    try {
      // Save General Markup
      await db.settings.set("general_markup", {
        percentage: Number(markupPercent),
        fixed: Number(markupFixed)
      });

      // Save Global Rounding
      await db.settings.set("global_rounding", {
        method: roundingMethod
      });

      // Save WhatsApp Settings
      await db.settings.set("whatsapp_contact", {
        phone: whatsappPhone,
        message_template: whatsappTemplate,
        reminder_template: whatsappReminder
      });

      // Save Default Interest Rules
      await db.settings.set("mora_rules_default", {
        grace_period_days: Number(gracePeriodDays),
        interest_percentage: Number(interestPercentage),
        period: interestPeriod
      });

      // Create Audit Log
      await db.audit.log({
        action_type: "update",
        entity_name: "settings",
        reason: "Modificación de parámetros generales de recargo, redondeo de precios, plantillas de WhatsApp y mora de cobros."
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.error(e);
      alert("Error al guardar la configuración.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-text-dark font-display uppercase tracking-wider font-bold">Configuración General</h1>
        <p className="text-xs text-text-muted mt-1">
          Ajustá márgenes generales, lógica de redondeo para catálogo público, plantillas de notificaciones de WhatsApp y reglas de mora.
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-success-bg border border-success/15 p-4 rounded-md text-xs text-success flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span>¡Parámetros de configuración administrativa guardados con éxito en la base de datos!</span>
        </div>
      )}

      {loading && !saveSuccess ? (
        <div className="space-y-6">
          <div className="h-32 skeleton w-full" />
          <div className="h-32 skeleton w-full" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main settings options */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Markup and Rounding Group */}
            <div className="bg-white border border-border-brand rounded-lg p-5 sm:p-6 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3 flex items-center">
                <Percent className="h-4 w-4 mr-2 text-accent" />
                Márgenes de Venta & Reglas de Redondeo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Margen General (%)</label>
                  <input
                    type="number"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs"
                    placeholder="Ej. 55"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Recargo base aplicado al costo mayorista de importación.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Costo Fijo Adicional General ($)</label>
                  <input
                    type="number"
                    value={markupFixed}
                    onChange={(e) => setMarkupFixed(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs"
                    placeholder="Ej. 0"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Recargo en pesos sumado luego del margen porcentual.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Criterio de Redondeo Público</label>
                <select
                  value={roundingMethod}
                  onChange={(e) => setRoundingMethod(e.target.value)}
                  className="w-full text-xs bg-white"
                >
                  <option value="sin_redondeo">Sin Redondeo (Centavos exactos)</option>
                  <option value="a_100">Redondear al $100 más cercano (Ej. $1.520 → $1.500 / $1.570 → $1.600)</option>
                  <option value="a_500">Redondear al $500 más cercano (Ej. $1.670 → $1.500 / $1.780 → $2.000)</option>
                  <option value="a_1000">Redondear al $1.000 más cercano (Ej. $1.450 → $1.000 / $1.550 → $2.000)</option>
                  <option value="terminado_900">Terminado en $900 (Ej. $1.820 → $1.900 / $1.150 → $1.900)</option>
                </select>
                <p className="text-[10px] text-text-muted mt-1">Aplica automáticamente al generar precios finales en el catálogo público.</p>
              </div>
            </div>

            {/* WhatsApp Templates Integration Group */}
            <div className="bg-white border border-border-brand rounded-lg p-5 sm:p-6 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3 flex items-center">
                <MessageSquare className="h-4.5 w-4.5 mr-2 text-accent" />
                Mensajería & WhatsApp Business
              </h3>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Número de WhatsApp de Contacto</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    className="w-full pl-9 text-xs"
                    placeholder="Ej. 5491122334455"
                  />
                </div>
                <p className="text-[10px] text-text-muted mt-1">Destinatario de las consultas comerciales del cliente.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Plantilla de Consulta del Producto</label>
                <textarea
                  rows={2}
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="w-full text-xs"
                  placeholder="Detalles sobre consulta del catálogo..."
                />
                <p className="text-[10px] text-text-muted mt-1">Variables utilizables: <code>{`{product_name}`}</code> y <code>{`{product_code}`}</code>.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Plantilla de Recordatorio de Pago / Mora</label>
                <textarea
                  rows={3}
                  value={whatsappReminder}
                  onChange={(e) => setWhatsappReminder(e.target.value)}
                  className="w-full text-xs"
                />
                <p className="text-[10px] text-text-muted mt-1">Variables utilizables: <code>{`{customer_name}`}</code>, <code>{`{amount}`}</code> y <code>{`{order_code}`}</code>.</p>
              </div>
            </div>

            {/* Interest Rates and Overdues default rules */}
            <div className="bg-white border border-border-brand rounded-lg p-5 sm:p-6 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3 flex items-center">
                <Scale className="h-4.5 w-4.5 mr-2 text-accent" />
                Intereses por Mora & Financiación
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Período de Gracia (Días)</label>
                  <input
                    type="number"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 0)}
                    className="w-full text-xs"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Días luego del vencimiento sin aplicar recargos.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Tasa de Interés (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={interestPercentage}
                    onChange={(e) => setInterestPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs"
                  />
                  <p className="text-[10px] text-text-muted mt-1">Porcentaje de mora penal.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Frecuencia del Recargo</label>
                  <select
                    value={interestPeriod}
                    onChange={(e) => setInterestPeriod(e.target.value)}
                    className="w-full text-xs bg-white"
                  >
                    <option value="diario">Tasa Diaria (Capitalizable)</option>
                    <option value="semanal">Tasa Semanal</option>
                    <option value="mensual">Tasa Mensual Fija</option>
                  </select>
                  <p className="text-[10px] text-text-muted mt-1">Intervalo de aplicación del cargo de mora.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Action sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-border-brand rounded-lg p-5 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3">
                Acciones
              </h3>
              
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-2.5 bg-primary text-white hover:bg-accent rounded text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </button>

              <button
                type="button"
                onClick={loadSettings}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-border-brand text-text-muted hover:text-text-dark rounded text-xs font-semibold transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Descartar Cambios
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-2.5 text-xs text-warning">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Advertencia de Cambios</p>
                <p className="mt-1 leading-relaxed text-[11px] opacity-90">
                  Las modificaciones de markup y redondeo afectarán los cálculos de futuros productos importados. Los productos ya existentes en catálogo mantendrán sus valores a menos que se re-importen o actualicen manualmente.
                </p>
              </div>
            </div>
          </div>

        </form>
      )}
    </div>
  );
}
