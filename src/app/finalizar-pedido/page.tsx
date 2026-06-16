"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { db, mockDb, Order, OrderItem } from "@/lib/db";
import {
  ShoppingBag, CheckCircle, Clock, ArrowLeft, ArrowRight, ShieldCheck,
  CreditCard, Landmark, Send, X, Clipboard, Phone, Percent
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    totalAmount,
    advanceAmount,
    clearCart,
    appliedCoupon,
    discountAmount,
    finalTotalAmount,
    finalAdvanceAmount
  } = useCart();
  const { user } = useAuth();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<Order["delivery_method"]>("retiro_local");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Success state
  const [orderCreated, setOrderCreated] = useState<Order | null>(null);
  
  // Payment reporting states (on success screen)
  const [reportedPayment, setReportedPayment] = useState(false);
  const [receiptCode, setReceiptCode] = useState("");
  const [payNotes, setPayNotes] = useState("");

  useEffect(() => {
    const loadCustomer = async () => {
      setLoading(true);
      if (user) {
        try {
          const cust = await db.customers.getByProfile(user.id);
          const target = cust || mockDb.customers[0]; // fallback
          if (target) {
            setCustomer(target);
            setFirstName(target.first_name);
            setLastName(target.last_name);
            setWhatsapp(target.whatsapp);
            setShippingAddress(target.address || "");
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        // Guest mode fallback
        const target = mockDb.customers[0];
        setCustomer(target);
        setFirstName(target.first_name);
        setLastName(target.last_name);
        setWhatsapp(target.whatsapp);
        setShippingAddress(target.address || "");
      }
      setLoading(false);
    };
    loadCustomer();
  }, [user]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;
    if (!termsAccepted) {
      alert("Debés aceptar los Términos y Condiciones para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderCode = `PAC-PED-${Date.now().toString().substring(7)}`;
      const targetCustomer = customer || mockDb.customers[0];

      // Prepare order items
      const orderItems = items.map((item) => {
        const variant = mockDb.product_variants.find(
          v => v.product_id === item.product.id && v.size === item.size && v.color === item.color
        );
        return {
          product_id: item.product.id,
          variant_id: variant?.id || null,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price_unit_cost: item.product.cost_total || item.product.price_original || 0,
          price_unit_final: item.product.price_promo || item.product.price_final,
        };
      });

      // Create Order
      const result = await db.orders.create({
        customer_id: targetCustomer.id,
        code_public: orderCode,
        total_amount: finalTotalAmount,
        advance_amount: finalAdvanceAmount,
        remaining_balance: finalTotalAmount - finalAdvanceAmount,
        delivery_method: deliveryMethod,
        shipping_address: deliveryMethod !== "retiro_local" ? shippingAddress : undefined,
        customer_notes: notes || undefined,
        status_internal: "borrador",
        status_public: "reserva_recibida",
      }, orderItems);

      const createdOrder = result.order;

      // Add Ledger Entry for customer purchase debt (compra type)
      await db.ledger.addEntry({
        customer_id: targetCustomer.id,
        type: "compra",
        description: `Reserva de productos - Pedido ${createdOrder.code_public}`,
        amount: finalTotalAmount,
        reference_id: createdOrder.id,
        created_by: user?.id || "client",
      });

      // Apply coupon details if applied
      if (appliedCoupon) {
        const cp = mockDb.coupons.find(c => c.code.toUpperCase() === appliedCoupon.code.toUpperCase());
        if (cp) {
          cp.is_used = true;
          cp.used_order_id = createdOrder.id;
          cp.used_at = new Date().toISOString();
        }
      }

      // Add point transaction in "pendiente" status
      if (user) {
        const member = mockDb.club_members.find(m => m.profile_id === user.id);
        if (member) {
          const pointsToEarn = Math.floor(finalTotalAmount / 100);
          let earnAmount = pointsToEarn;
          let isBirthdayMonth = false;

          if (member.birthday) {
            const birthMonth = new Date(member.birthday).getMonth();
            const currentMonth = new Date().getMonth();
            if (birthMonth === currentMonth) {
              isBirthdayMonth = true;
              earnAmount = pointsToEarn * mockDb.club_config.points_birthday_multiplier;
            }
          }

          mockDb.point_transactions.push({
            id: `pt_${Date.now()}_pur`,
            member_id: member.id,
            amount: earnAmount,
            action_type: "purchase",
            status: "pendiente",
            order_id: createdOrder.id,
            description: `Compra realizada (Pedido ${createdOrder.code_public})${isBirthdayMonth ? " [Puntos Dobles Cumpleaños]" : ""}`,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + mockDb.club_config.points_expiry_days * 24 * 3600 * 1000).toISOString()
          });

          mockDb.club_notifications.push({
            id: `not_${Date.now()}_pur_p`,
            member_id: member.id,
            title: "Puntos pendientes de acreditación ⏳",
            message: `Sumaste aproximadamente ${earnAmount} Puntos Pacheca (en estado pendiente) por tu pedido ${createdOrder.code_public}. Se acreditarán cuando confirmemos tu pago.`,
            created_at: new Date().toISOString(),
            is_read: false
          });
        }
      }

      // Update referral to "compra_pendiente" if this friend was referred
      if (user) {
        const referral = mockDb.referrals.find(r => r.friend_profile_id === user.id && r.status === "registrado");
        if (referral) {
          referral.status = "compra_pendiente";
          referral.order_id = createdOrder.id;
        }
      }

      setOrderCreated(createdOrder);
      clearCart();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportSeña = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCreated || !customer) return;

    try {
      // Create payment in pending
      await db.payments.create({
        customer_id: customer.id,
        order_id: orderCreated.id,
        amount: orderCreated.advance_amount,
        payment_method: "transferencia",
        payment_date: new Date().toISOString(),
        receipt_code: receiptCode || undefined,
        notes: payNotes || undefined,
      });

      setReportedPayment(true);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <div className="h-6 w-32 skeleton" />
        <div className="h-64 w-full skeleton" />
      </div>
    );
  }

  // Success Screen
  if (orderCreated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-left">
        <div className="border border-border-brand bg-white rounded-lg p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center space-x-3 text-success">
            <CheckCircle className="h-8 w-8 shrink-0" />
            <div>
              <h2 className="text-lg font-bold font-display uppercase tracking-wider">¡Reserva Recibida con éxito!</h2>
              <p className="text-xs text-text-muted">Pedido código: <strong>{orderCreated.code_public}</strong></p>
            </div>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Tu reserva fue registrada en nuestra base de datos. Para que el staff de Pacheca pueda consolidar la ronda de compra con el proveedor, debés abonar la seña obligatoria de <strong>{formatCurrency(orderCreated.advance_amount)}</strong> (50% del total).
          </p>

          {/* Bank details info */}
          <div className="p-4 bg-bg-light border border-border-brand rounded-md space-y-2.5 text-xs text-text-dark">
            <h4 className="font-bold text-accent uppercase tracking-wider text-[10px]">Cuentas de Pacheca para Depósito</h4>
            <div className="space-y-1">
              <p><strong>Banco:</strong> Banco Galicia</p>
              <p><strong>Alias:</strong> pacheca.moda.ar</p>
              <p><strong>CBU:</strong> 0070298391823901928349</p>
              <p><strong>Titular:</strong> Gabriela Costa</p>
            </div>
            <div className="pt-2 border-t border-border-brand/60 flex items-center space-x-1.5 text-text-muted">
              <Clipboard className="h-4 w-4" />
              <span className="text-[10px]">Copiá los datos para realizar la transferencia bancaria.</span>
            </div>
          </div>

          {/* Form to report payment immediately */}
          {!reportedPayment ? (
            <form onSubmit={handleReportSeña} className="border-t border-border-brand pt-6 space-y-4">
              <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider">
                Informar Pago de Seña de forma Inmediata
              </h3>
              <p className="text-[11px] text-text-muted leading-normal">
                Si ya realizaste la transferencia bancaria o Mercado Pago, podés adjuntar la referencia aquí para que administración lo verifique rápidamente.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Referencia / Operación Cód</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. MP-129482"
                    value={receiptCode}
                    onChange={(e) => setReceiptCode(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Monto de Seña Abonado ($)</label>
                  <div className="px-3 py-2 bg-bg-light border border-border-brand rounded text-xs font-bold text-text-dark">
                    {formatCurrency(orderCreated.advance_amount)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Observaciones del Pago</label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales sobre el comprobante..."
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-2.5 bg-primary text-white hover:bg-accent rounded text-xs font-semibold transition-colors uppercase tracking-wider"
              >
                <Send className="h-3.5 w-3.5 mr-2" />
                Enviar Notificación de Pago
              </button>
            </form>
          ) : (
            <div className="p-4 bg-success-bg border border-success/20 rounded text-xs text-success flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">¡Pago de Seña Informado con Éxito!</p>
                <p className="text-[10px] opacity-90 mt-0.5">Administración verificará el movimiento en menos de 24 horas hábiles.</p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border-brand flex justify-between items-center text-xs">
            <button
              onClick={() => router.push("/clientes/pedidos")}
              className="text-accent font-semibold hover:text-accent-hover transition-colors"
            >
              Ir a Mis Pedidos →
            </button>
            <button
              onClick={() => router.push("/catalogo")}
              className="px-4 py-2 border border-border-brand hover:bg-bg-light font-semibold rounded text-text-muted transition-colors"
            >
              Volver al Catálogo
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => router.push("/carrito")}
        className="flex items-center text-xs font-semibold text-text-muted hover:text-text-dark transition-colors border-b border-border-brand pb-4 w-full text-left"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Volver al Carrito
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Form */}
        <form onSubmit={handleCheckout} className="lg:col-span-2 space-y-6 text-left">
          <div className="bg-white border border-border-brand rounded-lg p-5 sm:p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3">
              Detalles de Contacto & Entrega
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Apellido *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">WhatsApp de Contacto *</label>
              <input
                type="text"
                required
                placeholder="Ej. 5491122334455"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">Método de Entrega *</label>
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value as any)}
                className="w-full text-xs bg-white"
              >
                <option value="retiro_local">Retiro por Local Pacheca (Villa María)</option>
                <option value="envio_domicilio">Envío a Domicilio (Villa María / Zonas Aledañas)</option>
                <option value="envio_correo">Envío por Correo Argentino (Nacional)</option>
              </select>
            </div>

            {deliveryMethod !== "retiro_local" && (
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Dirección de Envío Completa *</label>
                <input
                  type="text"
                  required
                  placeholder="Calle, número, departamento, localidad, código postal"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">Notas / Observaciones del Pedido</label>
              <textarea
                rows={2}
                placeholder="Indicaciones adicionales de entrega..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start space-x-2.5 text-xs text-text-muted cursor-pointer hover:text-text-dark">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 mt-0.5 accent-accent"
                />
                <span className="leading-relaxed select-none">
                  Acepto los <strong>Términos y Condiciones de Pacheca</strong>. Comprendo que los artículos se reservan en el marco de una compra grupal con seña obligatoria del 50%, y que los tiempos de entrega dependen de la consolidación de la ronda.
                </span>
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white hover:bg-accent rounded text-xs font-bold transition-colors uppercase tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? "Procesando..." : "Confirmar Reserva de Pedido"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </form>

        {/* Right Cart Summary Sidebar */}
        <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-6 text-left">
          <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3 flex items-center">
            <ShoppingBag className="h-4.5 w-4.5 mr-2 text-accent" />
            Detalle de Bolsa
          </h3>

          <div className="divide-y divide-border-brand max-h-52 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-text-dark">{item.product.name_public}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Talle: {item.size} | Color: {item.color}</p>
                </div>
                <span className="font-semibold text-text-dark">
                  {item.quantity} x {formatCurrency(item.product.price_promo || item.product.price_final)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border-brand pt-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Subtotal prendas:</span>
              <span className="font-semibold text-text-dark font-mono">{formatCurrency(totalAmount)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span className="flex items-center gap-1"><Percent className="h-3.5 w-3.5" /> Descuento:</span>
                <span className="font-mono">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between border-t border-border-brand pt-2 font-bold text-text-dark">
              <span>Total Estimado:</span>
              <span>{formatCurrency(finalTotalAmount)}</span>
            </div>
            
            <div className="p-3 bg-success-bg border border-success/15 rounded flex justify-between text-success font-bold">
              <span>Seña Mínima (50%):</span>
              <span>{formatCurrency(finalAdvanceAmount)}</span>
            </div>

            <div className="flex justify-between text-[11px] text-text-muted">
              <span>Saldo contra entrega:</span>
              <span>{formatCurrency(finalTotalAmount - finalAdvanceAmount)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
