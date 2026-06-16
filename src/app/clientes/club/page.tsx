"use client";
 
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db, mockDb, ClubMember, PointTransaction, Coupon, Referral } from "@/lib/db";
import { 
  Sparkles, Gift, Share2, Clipboard, Heart, 
  CheckCircle, Copy, Send, Calendar, ListFilter,
  Users, ShoppingBag, ArrowUpRight, Award, AlertCircle, Percent
} from "lucide-react";
 
export default function ClientClubPage() {
  const { user } = useAuth();
  const [member, setMember] = useState<ClubMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  
  // Lists
  const [txns, setTxns] = useState<PointTransaction[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  
  // Clipboard alert
  const [copied, setCopied] = useState(false);
 
  const fetchMemberData = async (mId: string) => {
    try {
      const txList = await db.club.transactions.listByMember(mId);
      // Sort newest first
      txList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTxns(txList);
 
      const cpList = await db.club.coupons.listByMember(mId);
      setCoupons(cpList);
 
      const refList = await db.club.referrals.listByReferrer(mId);
      setReferrals(refList);
 
      const rewList = await db.club.rewards.list();
      setRewards(rewList.filter(r => r.is_active));
    } catch (e) {
      console.error("Error loading club details", e);
    }
  };
 
  useEffect(() => {
    if (user) {
      db.club.members.getByProfile(user.id).then(async (m) => {
        if (m) {
          setMember(m);
          await fetchMemberData(m.id);
        }
        setLoading(false);
      });
    }
  }, [user]);
 
  const handleJoinClub = async () => {
    if (!user || joining) return;
    setJoining(true);
    try {
      const newM = await db.club.members.create(user.id);
      setMember(newM);
      await fetchMemberData(newM.id);
    } catch (err: any) {
      alert(err.message || "Error al inscribirse en el club.");
    } finally {
      setJoining(false);
    }
  };
 
  const handleRedeem = async (rewardId: string, rewardName: string, pointsRequired: number) => {
    if (!member) return;
    const confirmed = window.confirm(`¿Querés utilizar ${pointsRequired} puntos para obtener "${rewardName}"?`);
    if (!confirmed) return;
 
    try {
      const res = await db.club.rewards.redeem(member.id, rewardId);
      if (res) {
        // Refresh local member data
        const updatedM = await db.club.members.get(member.id);
        setMember(updatedM);
        await fetchMemberData(member.id);
        alert(`¡Canje completado con éxito! Se ha generado tu cupón: ${res.coupon.code}`);
      }
    } catch (err: any) {
      alert(`Error al canjear: ${err.message || err}`);
    }
  };
 
  const copyReferralLink = () => {
    if (!member) return;
    const link = `${window.location.origin}/?referido=${member.referral_code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
 
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);
  };
 
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 skeleton"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 skeleton"></div>
          <div className="h-28 skeleton"></div>
          <div className="h-28 skeleton"></div>
        </div>
        <div className="h-48 skeleton"></div>
      </div>
    );
  }
 
  // If not registered in Club Pacheca
  if (!member) {
    return (
      <div className="py-10 text-center space-y-6 max-w-xl mx-auto text-left">
        <div className="h-16 w-16 bg-[#F5E6D3] rounded-full flex items-center justify-center mx-auto text-black shadow-2xs">
          <Sparkles className="h-8 w-8 animate-pulse" />
        </div>
        <h2 className="text-xl font-serif text-black uppercase tracking-wider text-center">¡Sumate gratis al Club Pacheca!</h2>
        <p className="text-xs text-gray-500 leading-relaxed text-center">
          Inscribite ahora en nuestro programa de fidelización. Con solo unirte te regalamos <strong>100 puntos de bienvenida</strong>. Acumulás puntos por tus compras y recomendando amigas para desbloquear descuentos y regalos exclusivos.
        </p>
        
        <div className="bg-white border border-[#EADED2] p-4 rounded text-xs text-left space-y-3">
          <p className="font-bold text-black border-b border-[#EADED2] pb-2 uppercase tracking-wider text-[10px]">Beneficios del Club:</p>
          <ul className="space-y-2 text-gray-500">
            <li className="flex items-center gap-2">✔ 1 punto por cada $100 gastados en tus compras.</li>
            <li className="flex items-center gap-2">✔ 150 puntos por opiniones y 300 puntos por subir fotos de tus looks.</li>
            <li className="flex items-center gap-2">✔ Código de referido para regalar 5% de descuento a amigas y ganar 10% vos.</li>
            <li className="flex items-center gap-2">✔ Canje de puntos acumulados por descuentos especiales y regalos.</li>
          </ul>
        </div>
 
        <div className="text-center pt-2">
          <button
            onClick={handleJoinClub}
            disabled={joining}
            className="inline-flex items-center justify-center bg-black hover:bg-neutral-800 text-white px-10 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm shadow-sm"
          >
            {joining ? "Inscribiendo..." : "Unirme al Club Ahora"}
          </button>
        </div>
      </div>
    );
  }
 
  // Club Member states
  const referralLink = `${window.location.origin}/?referido=${member.referral_code}`;
  const whatsappMessage = `¡Hola! Te invito a conocer Pacheca 💕 Usando mi enlace recibís un 5% de descuento en tu primera compra: ${referralLink}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
 
  // Next milestone calculation
  const nextMilestone = rewards
    .filter(r => r.points_required > member.points_balance)
    .sort((a, b) => a.points_required - b.points_required)[0];
 
  const progressPercent = nextMilestone
    ? Math.min((member.points_balance / nextMilestone.points_required) * 100, 100)
    : 100;
  
  const missingPoints = nextMilestone ? nextMilestone.points_required - member.points_balance : 0;
 
  // Count referred purchases confirmed vs sent
  const friendPurchasesCount = referrals.filter(r => r.status === "beneficio_acreditado" || r.status === "compra_confirmada").length;
 
  // Calculate total pending points
  const pointsPending = txns.filter(t => t.status === "pendiente").reduce((acc, t) => acc + t.amount, 0);
 
  return (
    <div className="space-y-8 text-left">
      
      {/* Header Member Profile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-brand pb-5 gap-4">
        <div>
          <h1 className="text-lg font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
            Hola, {user?.first_name || "Clienta"}!
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Tenés <strong className="text-black">{member.points_balance} Puntos Club</strong> disponibles para canjear.
          </p>
        </div>
 
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-black text-white">
            <Award className="h-3.5 w-3.5 mr-1" /> Nivel {member.level}
          </span>
        </div>
      </div>
 
      {/* KPI Cards Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Points available card */}
        <div className="p-5 border border-border-brand rounded-lg bg-bg-light relative overflow-hidden">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Puntos Disponibles
          </p>
          <p className="text-2xl font-bold text-text-dark mt-2 font-mono">{member.points_balance}</p>
          {pointsPending > 0 ? (
            <p className="text-[9px] text-amber-600 mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {pointsPending} puntos pendientes de acreditación.
            </p>
          ) : (
            <p className="text-[9px] text-text-muted mt-1">
              Vigentes para canjear por cupones.
            </p>
          )}
        </div>
 
        {/* Next reward progress card */}
        <div className="p-5 border border-border-brand rounded-lg bg-bg-light col-span-1 sm:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-start text-[10px] font-bold uppercase text-text-muted">
            <span>Progreso al siguiente premio</span>
            {nextMilestone && (
              <span>{member.points_balance} / {nextMilestone.points_required} PTS</span>
            )}
          </div>
          
          {nextMilestone ? (
            <div className="mt-2 space-y-2">
              <div className="w-full bg-white border border-[#EADED2] h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-black h-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 font-medium">
                Te faltan solo <strong className="text-black font-bold">{missingPoints} puntos</strong> para desbloquear un <strong>{nextMilestone.name}</strong>.
              </p>
            </div>
          ) : (
            <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
              <CheckCircle className="h-4.5 w-4.5" /> ¡Desbloqueaste el nivel máximo de recompensas!
            </p>
          )}
        </div>
      </div>
 
      {/* Referral Code & WhatsApp Share Card */}
      <div className="border border-border-brand rounded-lg p-5 sm:p-6 space-y-4 bg-white shadow-2xs">
        <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3 flex items-center">
          <Share2 className="h-4.5 w-4.5 mr-2 text-accent" />
          Invitá a una amiga a Pacheca
        </h3>
        <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
          Tu amiga recibe un <strong>5% de descuento</strong> en su primera compra y vos obtenés un <strong>10% de descuento</strong> en tu próximo pedido cuando ella complete su compra de forma confirmada.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
          
          {/* Visual Referral Code */}
          <div className="md:col-span-4 p-4 border border-dashed border-[#EADED2] rounded-md bg-[#FCFAF7] text-center space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Tu Código Personal</span>
            <p className="font-mono text-base font-bold text-black tracking-widest">{member.referral_code}</p>
          </div>
 
          {/* Share links */}
          <div className="md:col-span-8 flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
            >
              <Send className="h-3.5 w-3.5 mr-2" /> Invitar por WhatsApp
            </a>
            <button
              onClick={copyReferralLink}
              className={`flex-1 inline-flex items-center justify-center px-4 py-2.5 border rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                copied 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                  : "border-[#EADED2] hover:bg-neutral-50 text-text-dark"
              }`}
            >
              <Clipboard className="h-3.5 w-3.5 mr-2" />
              {copied ? "Enlace Copiado!" : "Copiar Enlace"}
            </button>
          </div>
        </div>
 
        {/* Referral stats */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border-brand text-center text-xs">
          <div>
            <p className="text-text-muted text-[10px] uppercase">Invitaciones enviadas</p>
            <p className="font-bold text-text-dark text-base mt-0.5">{referrals.length}</p>
          </div>
          <div>
            <p className="text-text-muted text-[10px] uppercase">Amigas registradas</p>
            <p className="font-bold text-text-dark text-base mt-0.5">{referrals.filter(r => r.status === "registrado" || r.status === "compra_pendiente").length}</p>
          </div>
          <div>
            <p className="text-text-muted text-[10px] uppercase">Compras completadas</p>
            <p className="font-bold text-text-dark text-base mt-0.5">{friendPurchasesCount}</p>
          </div>
        </div>
      </div>
 
      {/* Available Coupons list */}
      <div className="border border-border-brand rounded-lg p-5">
        <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3 flex items-center">
          <Percent className="h-4 w-4 mr-2 text-accent" />
          Tus cupones de descuento disponibles
        </h3>
        {coupons.length === 0 ? (
          <p className="text-xs text-text-muted py-4">No tenés cupones de descuento activos en este momento. Canjeá tus puntos acumulados abajo.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {coupons.map((c) => (
              <div 
                key={c.id} 
                className="border border-border-brand p-4 rounded bg-[#FCFAF7] flex justify-between items-center"
              >
                <div className="space-y-1">
                  <span className="font-mono text-sm font-bold text-black tracking-wider block">{c.code}</span>
                  <span className="text-[10px] text-gray-500 block">{c.description}</span>
                  <span className="text-[9px] text-red-500 font-semibold flex items-center gap-1 pt-1">
                    <Calendar className="h-3 w-3" /> Vence el: {new Date(c.expires_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(c.code);
                    alert(`Código "${c.code}" copiado al portapapeles. ¡Aplicalo en el carrito!`);
                  }}
                  className="p-2 border border-[#EADED2] hover:bg-white text-gray-700 rounded transition-colors"
                  title="Copiar código"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
 
      {/* Rewards Redeem Section */}
      <div className="border border-border-brand rounded-lg p-5">
        <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3 flex items-center">
          <Gift className="h-4.5 w-4.5 mr-2 text-accent" />
          Premios disponibles para canjear
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 pt-4">
          {rewards.map((r) => {
            const canRedeem = member.points_balance >= r.points_required;
            return (
              <div 
                key={r.id} 
                className="border border-[#EADED2] p-5 rounded bg-white flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-black uppercase tracking-wider">{r.name}</h4>
                    <span className="bg-[#FCFAF7] border border-[#EADED2] px-2 py-0.5 rounded text-[10px] font-bold text-black font-mono">
                      {r.points_required} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed min-h-[36px]">{r.description}</p>
                </div>
                
                <button
                  onClick={() => handleRedeem(r.id, r.name, r.points_required)}
                  disabled={!canRedeem}
                  className={`w-full text-center py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors ${
                    canRedeem
                      ? "bg-black text-white hover:bg-neutral-800"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {canRedeem ? "Canjear Beneficio" : "Puntos Insuficientes"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
 
      {/* Points Transactions History Table */}
      <div className="border border-border-brand rounded-lg p-5 overflow-hidden">
        <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider border-b border-border-brand pb-3 flex items-center">
          <ListFilter className="h-4.5 w-4.5 mr-2 text-accent" />
          Historial de movimientos de puntos
        </h3>
        
        <div className="overflow-x-auto pt-4 scrollbar-none">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EADED2] text-[10px] font-bold uppercase text-text-muted">
                <th className="py-2.5">Fecha</th>
                <th>Acción</th>
                <th>Descripción</th>
                <th>Pedido</th>
                <th>Puntos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADED2] text-text-dark">
              {txns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-text-muted">No registrás movimientos de puntos todavía.</td>
                </tr>
              ) : (
                txns.map((t) => {
                  const pointsVal = t.amount > 0 ? `+${t.amount}` : `${t.amount}`;
                  const ptsColor = t.amount > 0 ? "text-success" : "text-error";
                  
                  const statusLabels: Record<string, { label: string, bg: string }> = {
                    pendiente: { label: "Pendiente", bg: "bg-amber-50 text-warning border-amber-200" },
                    acreditado: { label: "Acreditado", bg: "bg-success-bg text-success border-success/15" },
                    canjeado: { label: "Canjeado", bg: "bg-gray-50 text-text-muted border-gray-200" },
                    vencido: { label: "Vencido", bg: "bg-red-50 text-error border-red-200" },
                    cancelado: { label: "Cancelado", bg: "bg-red-50 text-error border-red-200" },
                    revertido: { label: "Revertido", bg: "bg-red-50 text-error border-red-200" },
                  };
                  
                  const stat = statusLabels[t.status] || { label: t.status, bg: "bg-gray-50 text-text-muted" };
 
                  return (
                    <tr key={t.id} className="hover:bg-bg-light transition-colors">
                      <td className="py-3 font-medium text-text-muted">
                        {new Date(t.created_at).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </td>
                      <td className="font-bold capitalize">{t.action_type === "welcome" ? "Bienvenida" : t.action_type === "purchase" ? "Compra" : t.action_type === "review" ? "Reseña" : t.action_type === "photo" ? "Foto Look" : t.action_type === "redemption" ? "Canje" : t.action_type === "referral_referrer" ? "Referido" : t.action_type}</td>
                      <td className="text-text-muted truncate max-w-xs">{t.description}</td>
                      <td className="font-mono text-gray-500">{t.order_id ? "PAC-PED-" + t.order_id.substring(2,8).toUpperCase() : "-"}</td>
                      <td className={`font-mono font-bold ${ptsColor}`}>{pointsVal} pts</td>
                      <td>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold border ${stat.bg}`}>
                          {stat.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
 
    </div>
  );
}
