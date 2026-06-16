"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { useCart, CartItem } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { mockDb, db } from "@/lib/db";
import {
  ShoppingBag, Trash2, ArrowLeft, ArrowRight, ShieldCheck,
  CreditCard, Percent, CheckCircle, Gift, Sparkles, Award
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    totalAmount,
    appliedCoupon,
    discountAmount,
    finalTotalAmount,
    finalAdvanceAmount,
    applyCoupon,
    removeCoupon
  } = useCart();
  const { user } = useAuth();
  
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [member, setMember] = useState<any | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);
  };

  const SHIPPING_THRESHOLD = 95000;
  const isFreeShipping = totalAmount >= SHIPPING_THRESHOLD;
  const progressPct = Math.min((totalAmount / SHIPPING_THRESHOLD) * 100, 100);
  const missingForFreeShipping = SHIPPING_THRESHOLD - totalAmount;

  // Recalculated values when coupon applied
  const remainingBalance = finalTotalAmount - finalAdvanceAmount;

  // Load loyalty member and coupons
  useEffect(() => {
    const loadLoyalty = async () => {
      if (user) {
        try {
          const m = await db.club.members.getByProfile(user.id);
          if (m) {
            setMember(m);
            const list = await db.club.coupons.listByMember(m.id);
            setAvailableCoupons(list);
          }
        } catch (e) {
          console.error("Error loading loyalty details", e);
        }
      }
    };
    loadLoyalty();
  }, [user, appliedCoupon]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = coupon.trim().toUpperCase();
    if (!code) return;

    const res = await applyCoupon(code, user?.id);
    if (res.success) {
      setCoupon("");
    } else {
      setCouponError(res.error || "Cupón inválido o vencido.");
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCoupon("");
    setCouponError(null);
  };

  const handleQuickApply = async (code: string) => {
    setCouponError(null);
    const res = await applyCoupon(code, user?.id);
    if (!res.success) {
      setCouponError(res.error || "Error al aplicar el cupón.");
    }
  };

  const handleRedeem = async (rewardId: string) => {
    if (!member) return;
    const reward = mockDb.club_rewards.find(r => r.id === rewardId);
    if (!reward) return;

    const confirmed = window.confirm(`¿Querés utilizar ${reward.points_required} puntos para obtener "${reward.name}"?`);
    if (!confirmed) return;

    try {
      const res = await db.club.rewards.redeem(member.id, rewardId);
      if (res) {
        // Refresh local states
        const updatedMember = await db.club.members.get(member.id);
        setMember(updatedMember);
        const list = await db.club.coupons.listByMember(member.id);
        setAvailableCoupons(list);
        
        // Auto apply the generated coupon
        await applyCoupon(res.coupon.code, user?.id);
        alert(`¡Canje exitoso! Se generó y aplicó automáticamente el cupón: ${res.coupon.code}`);
      }
    } catch (err: any) {
      alert(`Error al realizar el canje: ${err.message || err}`);
    }
  };

  // Gamification variables
  const pointsToEarn = Math.floor(finalTotalAmount / 100);
  
  // Find next reward milestone
  const nextReward = member
    ? mockDb.club_rewards
        .filter(r => r.is_active && r.points_required > member.points_balance)
        .sort((a, b) => a.points_required - b.points_required)[0]
    : null;
    
  const missingPoints = nextReward ? nextReward.points_required - member.points_balance : 0;

  // Find rewards that can be redeemed right now
  const redeemableRewards = member
    ? mockDb.club_rewards.filter(r => r.is_active && r.points_required <= member.points_balance && r.stock > 0)
    : [];

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-grow bg-[#FCFAF7] text-[#111] py-20">
          <div className="max-w-4xl mx-auto px-5 text-center space-y-6">
            <div className="h-20 w-20 bg-white border border-[#EADED2] rounded-full flex items-center justify-center mx-auto text-gray-300 shadow-2xs">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-serif text-black uppercase tracking-wider">Tu Bolsa de Compras está vacía</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Todavía no agregaste ninguna prenda a tu bolsa. ¡Date una vuelta por nuestro catálogo para encontrar tus favoritos!
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
            >
              Ver el Catálogo
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-[#FCFAF7] text-[#111] py-12">
        <div className="max-w-7xl mx-auto px-5 md:px-10 space-y-8">
          
          {/* Header */}
          <div className="border-b border-[#EADED2] pb-6 text-left">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-2 block">Bolsa</span>
            <h1 className="text-3xl font-serif text-black flex items-center gap-2">
              Bolsa de Compras
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Revisá los artículos seleccionados en tu pedido antes de proceder al pago de la seña.
            </p>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-white border border-[#EADED2] p-5 rounded-sm shadow-2xs text-left space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-black">
                {isFreeShipping 
                  ? "¡Felicidades! Tenés Envío Gratis a todo el país 🚚" 
                  : `Te faltan ${formatCurrency(missingForFreeShipping)} para obtener Envío Gratis.`
                }
              </span>
              <span className="font-mono text-gray-400 font-bold">{Math.round(progressPct)}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-black h-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400">
              * El beneficio de envío gratis aplica a compras superiores a $95.000 para todo el territorio nacional.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left: Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#EADED2] rounded-sm shadow-2xs overflow-hidden">
                <div className="divide-y divide-[#EADED2]">
                  {items.map((item: CartItem) => {
                    const price = item.product.price_promo || item.product.price_final;
                    const image = mockDb.product_images.find(pi => pi.product_id === item.product.id)?.url_public || `/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp`;

                    return (
                      <div key={item.id} className="p-5 flex flex-col sm:flex-row items-center gap-5 justify-between">
                        <div className="flex items-center space-x-4 w-full sm:w-auto">
                          {/* Item Image */}
                          <div className="h-16 w-16 rounded-sm bg-[#FCFAF7] border border-[#EADED2] flex items-center justify-center overflow-hidden shrink-0">
                            <img
                              src={image}
                              alt={item.product.name_public}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          {/* Item Info */}
                          <div className="space-y-1 text-left">
                            <h4 className="font-serif text-sm text-black">{item.product.name_public}</h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                              Talle: <span className="text-black font-semibold">{item.size}</span> | Color: <span className="text-black font-semibold">{item.color}</span>
                            </p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              {formatCurrency(price)} c/u
                            </p>
                          </div>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex items-center justify-between sm:justify-end space-x-6 sm:space-x-8 w-full sm:w-auto">
                          <div className="flex items-center border border-[#EADED2] rounded-sm bg-white overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="px-2.5 py-1.5 text-xs hover:bg-[#FCFAF7] font-semibold"
                            >
                              -
                            </button>
                            <span className="px-3.5 text-xs font-bold text-black font-mono">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2.5 py-1.5 text-xs hover:bg-[#FCFAF7] font-semibold"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right whitespace-nowrap min-w-[80px]">
                            <p className="font-bold text-xs text-black font-mono">
                              {formatCurrency(price * item.quantity)}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-black transition-colors p-1"
                            title="Eliminar de la bolsa"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="bg-white border border-[#EADED2] p-5 sm:p-6 rounded-sm shadow-2xs text-left space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-black mb-3">¿Tenés un código de descuento?</h4>
                  <form onSubmit={handleApplyCoupon} className="flex gap-3 max-w-sm">
                    <input
                      type="text"
                      placeholder="Código (Ej: BIENVENIDA, PACHECA10)"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      disabled={appliedCoupon !== null}
                      className="flex-1 px-3 py-2 text-xs border border-[#EADED2] rounded-sm focus:border-black outline-none uppercase font-mono"
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="bg-black text-white px-4 py-2 text-xs uppercase tracking-wider font-bold hover:bg-neutral-800 transition-colors rounded-sm"
                      >
                        Quitar
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="bg-black text-white px-4 py-2 text-xs uppercase tracking-wider font-bold hover:bg-neutral-800 transition-colors rounded-sm"
                      >
                        Aplicar
                      </button>
                    )}
                  </form>
                  {couponError && <p className="text-[11px] text-red-600 mt-2 font-semibold">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-[11px] text-emerald-600 mt-2 font-bold flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> Cupón "{appliedCoupon.code}" aplicado con éxito ({formatCurrency(discountAmount)} de descuento).
                    </p>
                  )}
                </div>

                {/* Available customer coupons */}
                {availableCoupons.length > 0 && (
                  <div className="pt-3 border-t border-[#EADED2] space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Tus cupones disponibles del Club:</p>
                    <div className="flex flex-wrap gap-2">
                      {availableCoupons.map(c => {
                        const isCurrent = appliedCoupon?.code === c.code;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleQuickApply(c.code)}
                            disabled={appliedCoupon !== null && !isCurrent}
                            className={`text-xs py-1.5 px-3 border rounded-sm font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                              isCurrent
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                                : "bg-white hover:bg-[#FCFAF7] border-[#EADED2] text-black"
                            }`}
                          >
                            <Percent className="h-3.5 w-3.5 text-gray-400" />
                            {c.code} ({c.discount_type === "percentage" ? `${c.discount_value}%` : `$${c.discount_value}`})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Loyalty Member Points Status & Milestones */}
                {member ? (
                  <div className="pt-3 border-t border-[#EADED2] space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-black font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                        Tus Puntos Club Pacheca:
                      </span>
                      <span className="bg-black text-white px-2 py-0.5 rounded-full text-xs font-mono font-bold">{member.points_balance} pts</span>
                    </div>

                    <p className="text-[11px] text-gray-600 font-medium">
                      ✨ Con esta compra vas a ganar aproximadamente <strong className="text-black font-bold">{pointsToEarn}</strong> Puntos Pacheca.
                    </p>

                    {nextReward && (
                      <p className="text-[11px] text-gray-500">
                        🎁 Te faltan solo <strong className="text-black font-bold">{missingPoints}</strong> puntos para desbloquear un <strong>{nextReward.name}</strong>.
                      </p>
                    )}

                    {/* Quick redeem options directly from cart */}
                    {redeemableRewards.length > 0 && (
                      <div className="mt-3 space-y-1.5 bg-[#FCFAF7] border border-[#EADED2] p-3 rounded-sm">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-black flex items-center gap-1">
                          <Gift className="h-3.5 w-3.5 text-accent" /> ¡Tenés puntos para canjear antes de pagar!
                        </p>
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {redeemableRewards.map(r => (
                            <div key={r.id} className="flex justify-between items-center bg-white p-2 border border-[#EADED2] rounded-sm text-[11px]">
                              <div>
                                <span className="font-semibold text-black">{r.name}</span>
                                <span className="text-[9px] text-gray-400 block">{r.points_required} puntos</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRedeem(r.id)}
                                className="bg-black hover:bg-neutral-800 text-white text-[9px] font-bold uppercase py-1 px-2.5 rounded-sm transition-colors"
                              >
                                Canjear
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  !user && (
                    <div className="pt-3 border-t border-[#EADED2]">
                      <p className="text-[11px] text-gray-500 leading-normal">
                        ✨ ¿Querés sumar puntos con esta compra? <Link href="/acceso" className="text-black font-semibold hover:underline">Iniciá sesión o registrate</Link> y unite gratis al <strong>Club Pacheca</strong>.
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Continue shopping */}
              <div className="text-left">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-black hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Seguir Comprando
                </Link>
              </div>
            </div>

            {/* Right: Summary panel */}
            <div className="bg-white border border-[#EADED2] p-6 shadow-2xs space-y-6 text-left rounded-sm">
              <h3 className="text-xs font-bold text-black uppercase tracking-widest border-b border-[#EADED2] pb-3">
                Resumen del Pedido
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal prendas:</span>
                  <span className="font-semibold text-black font-mono">{formatCurrency(totalAmount)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1"><Percent className="h-3.5 w-3.5" /> Descuento:</span>
                    <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-[#EADED2] pt-3">
                  <span className="text-gray-500 font-bold">Total estimado:</span>
                  <span className="font-bold text-black font-mono">{formatCurrency(finalTotalAmount)}</span>
                </div>

                {/* Downpayment note */}
                <div className="p-4 bg-[#F5E6D3]/30 border border-[#EADED2] rounded-sm space-y-1.5">
                  <div className="flex justify-between font-bold text-black text-xs">
                    <span>Monto Seña (50%):</span>
                    <span className="font-mono">{formatCurrency(finalAdvanceAmount)}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    * Los pedidos de la boutique se procesan confirmando el pago de una seña inicial del 50%.
                  </p>
                </div>

                <div className="flex justify-between border-t border-[#EADED2] pt-3 font-semibold text-gray-500">
                  <span>Saldo contra entrega:</span>
                  <span className="text-black font-mono">{formatCurrency(remainingBalance)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/finalizar-pedido"
                  className="w-full flex items-center justify-center px-8 py-3.5 bg-black text-white hover:bg-neutral-800 rounded-sm text-xs font-bold transition-colors uppercase tracking-widest"
                >
                  Continuar Reserva
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>

              {/* Security alerts */}
              <div className="pt-4 border-t border-[#EADED2] space-y-4 text-[10px] text-gray-400 leading-relaxed">
                <div className="flex items-start">
                  <ShieldCheck className="h-4.5 w-4.5 mr-2 text-black shrink-0 mt-0.5" />
                  <span>
                    <strong>Reserva de Calidad:</strong> Tu pedido se unirá a la ronda de compras de la boutique, garantizando piezas exclusivas y precios óptimos.
                  </span>
                </div>
                <div className="flex items-start">
                  <CreditCard className="h-4.5 w-4.5 mr-2 text-black shrink-0 mt-0.5" />
                  <span>
                    <strong>Seña Segura:</strong> Transferencia bancaria o saldo de Mercado Pago una vez finalizado el pedido.
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
