"use client";
 
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { useAuth } from "@/lib/auth-context";
import { db, mockDb } from "@/lib/db";
import { 
  Sparkles, Gift, Share2, Heart, CheckCircle, 
  ChevronDown, ChevronUp, UserPlus, LogIn, Award, 
  TrendingUp, Percent, Truck, HelpCircle
} from "lucide-react";
 
export default function ClubPachecaPublicPage() {
  const { user } = useAuth();
  const router = useRouter();
 
  // States
  const [config, setConfig] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [member, setMember] = useState<any | null>(null);
  
  // Registration Form
  const [showRegModal, setShowRegModal] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
 
  // Accordion states
  const [rulesOpen, setRulesOpen] = useState<number | null>(null);
 
  useEffect(() => {
    // Load config and rewards
    db.club.config.get().then(setConfig);
    db.club.rewards.list().then(list => {
      setRewards(list.filter(r => r.is_active));
    });
 
    if (user) {
      db.club.members.getByProfile(user.id).then(setMember);
    }
  }, [user]);
 
  const toggleRule = (idx: number) => {
    setRulesOpen(rulesOpen === idx ? null : idx);
  };
 
  const handleJoinLogged = async () => {
    if (!user) return;
    try {
      const newM = await db.club.members.create(user.id);
      setMember(newM);
      setRegSuccess(true);
      setTimeout(() => {
        router.push("/clientes/club");
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Error al unirse.");
    }
  };
 
  const handleJoinGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
 
    if (!termsAccepted) {
      setRegError("Debés aceptar las condiciones del programa.");
      return;
    }
 
    try {
      const emailLower = email.trim().toLowerCase();
      
      // 1. Check if profile exists, if not create one
      let profile = await db.profiles.getByEmail(emailLower);
      if (!profile) {
        // Create profile in mockDb
        const newProf = {
          id: `p_${Date.now()}`,
          email: emailLower,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString()
        };
        mockDb.profiles.push(newProf);
        mockDb.user_roles.push({
          id: `ur_${Date.now()}`,
          user_id: newProf.id,
          role: "client"
        });
        profile = newProf;
      }
 
      // 2. Check if customer exists, if not create
      let customer = await db.customers.getByProfile(profile.id);
      if (!customer) {
        await db.customers.create({
          profile_id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          whatsapp: "549",
          balance: 0,
          credit_limit: 0,
          status: "al_dia",
          labels: ["Club"],
        });
      }
 
      // 3. Create Club Member
      const newM = await db.club.members.create(profile.id, birthday || undefined);
      
      // Save session user so they are logged in
      localStorage.setItem("pacheca_session_user", JSON.stringify(profile));
      localStorage.setItem("pacheca_session_role", "client");
      
      // Auto login in page context by reloading auth-context or doing reload
      setRegSuccess(true);
      setTimeout(() => {
        window.location.href = "/clientes/club";
      }, 2000);
    } catch (err: any) {
      setRegError(err.message || "Error al completar el registro.");
    }
  };

  const handleRedeem = (rewardId: string) => {
    router.push(`/clientes/club?redeem=${rewardId}`);
  };
 
  // Conditions list
  const rules = [
    { title: "Membresía gratuita", desc: "La inscripción y participación en el Club Pacheca es completamente gratuita para todas las clientas." },
    { title: "Puntos personales", desc: "Los puntos acumulados son personales, intransferibles y no pueden canjearse por dinero en efectivo bajo ninguna circunstancia." },
    { title: "Acreditación de puntos", desc: "Los puntos ganados por compras se registran inicialmente en estado pendiente y se acreditan de forma definitiva una vez que el pago de la seña/pedido se encuentra confirmado por el staff." },
    { title: "Devoluciones y Cancelaciones", desc: "En caso de devoluciones de prendas, cancelaciones de reservas o reembolsos, se procederá a descontar o revertir los puntos generados por dicha transacción de tu cuenta." },
    { title: "Fecha de vencimiento", desc: `Los puntos acumulados tienen una vigencia de ${config?.points_expiry_days || 365} días desde su acreditación. Transcurrido ese plazo, vencerán de forma automática.` },
    { title: "Uso de cupones de canje", desc: "Los cupones generados a partir del canje de puntos son de un único uso, tienen fecha de vencimiento configurable y no son acumulables con otros cupones de descuento vigentes, salvo indicación expresa." },
    { title: "Aprobación de fotos y reseñas", desc: "Para evitar abusos, las reseñas de productos y las fotos publicadas quedan sujetas a moderación por el staff. Una vez aprobadas, se acreditarán los puntos correspondientes de inmediato." },
    { title: "Prevención de autorreferidos", desc: "Los códigos de referido son para compartir con amigas nuevas. Queda terminantemente prohibido usar tu propio enlace o código para crear múltiples cuentas o compras simuladas desde un mismo dispositivo o datos personales coincidentes." },
  ];
 
  const pointsWelcome = config?.points_welcome || 100;
  const pointsPerReview = config?.points_per_review || 150;
  const pointsPerPhoto = config?.points_per_photo || 300;
  const pointsPerReferral = config?.points_per_referral || 500;
 
  return (
    <>
      <Navbar />
 
      <main className="bg-[#FCFAF7] text-[#111] overflow-hidden">
        
        {/* Hero Banner Section */}
        <section className="relative py-20 md:py-28 bg-[#111] text-white overflow-hidden border-b border-border-brand">
          {/* Background Image with brightness filter */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/1.png" 
              alt="Club Pacheca Background" 
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.35) blur(5px)" }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          {/* Logo P watermark — grande centrado */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <img
              src="/images/isologo.png"
              alt=""
              className="w-64 md:w-96 lg:w-[400px] opacity-[0.05] object-contain select-none"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5 text-[#F5E6D3]" /> Club Pacheca
              </span>
              <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                Comprar, compartir y disfrutar ahora tiene <span className="italic font-light text-[#F5E6D3]">recompensa</span>.
              </h1>
              <p className="text-sm md:text-base text-white/70 max-w-xl leading-relaxed">
                Sumate gratis al Club Pacheca, acumulá puntos con cada compra y obtené descuentos exclusivos, regalos sorpresas y beneficios especiales en tus pedidos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {member ? (
                  <button
                    onClick={() => router.push("/clientes/club")}
                    className="inline-flex items-center justify-center bg-[#F5E6D3] text-black hover:bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm shadow-sm"
                  >
                    <Award className="h-4 w-4 mr-2" /> Ir a mi panel del Club
                  </button>
                ) : user ? (
                  <button
                    onClick={handleJoinLogged}
                    className="inline-flex items-center justify-center bg-[#F5E6D3] text-black hover:bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm shadow-sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" /> Unirme Gratis Ahora
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowRegModal(true)}
                      className="inline-flex items-center justify-center bg-[#F5E6D3] text-black hover:bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm shadow-sm"
                    >
                      Quiero Unirme Gratis
                    </button>
                    <button
                      onClick={() => router.push("/acceso?redirect=/club-pacheca")}
                      className="inline-flex items-center justify-center border border-white/40 hover:bg-white/10 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm"
                    >
                      <LogIn className="h-4 w-4 mr-2" /> Ingresar a mi cuenta
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Visual Composition Image */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] rounded-lg overflow-hidden border border-white/10 shadow-lg bg-[#1a1a1a] p-2">
                <img 
                  src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600" 
                  alt="Moda Pacheca" 
                  className="h-full w-full object-cover rounded-md" 
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-black/80 backdrop-blur-md border border-white/10 p-5 shadow-2xl rounded-sm max-w-[220px] text-left">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/50 font-bold mb-1">
                  <Gift className="h-4 w-4 text-[#F5E6D3]" /> Beneficio
                </div>
                <p className="font-serif text-sm text-white font-bold">100 puntos gratis</p>
                <p className="text-[10px] text-white/40 mt-1">Solo por registrarte hoy y comenzar a participar.</p>
              </div>
            </div>
          </div>
        </section>
 
        {/* How it Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Paso a paso</p>
            <h2 className="text-3xl font-serif text-black mb-12">Cómo funciona el Club</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 space-y-4 rounded-lg bg-[#FCFAF7] border border-[#EADED2] relative">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">1</span>
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-black mx-auto border border-[#EADED2] mt-2">
                  <UserPlus className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-base font-bold text-black pt-2">Creá tu cuenta</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Inscribite gratis con un click. Te regalamos <strong className="text-black font-semibold">{pointsWelcome} puntos</strong> de bienvenida al instante para iniciar tu progreso.
                </p>
              </div>
 
              <div className="p-6 space-y-4 rounded-lg bg-[#FCFAF7] border border-[#EADED2] relative">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">2</span>
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-black mx-auto border border-[#EADED2] mt-2">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-base font-bold text-black pt-2">Sumá puntos</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Acumulá puntos comprando prendas en nuestra tienda, dejando reseñas verificadas, subiendo fotos vistiendo tu ropa favorita o recomendando amigas.
                </p>
              </div>
 
              <div className="p-6 space-y-4 rounded-lg bg-[#FCFAF7] border border-[#EADED2] relative">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">3</span>
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-black mx-auto border border-[#EADED2] mt-2">
                  <Gift className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-base font-bold text-black pt-2">Canjeá beneficios</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Canjeá tus puntos acumulados por cupones de descuento exclusivos del 5%, 10% o 15%, envíos gratis o accesorios sorpresa.
                </p>
              </div>
            </div>
          </div>
        </section>
 
        {/* Ways to Earn Points Section */}
        <section 
          className="relative py-20 bg-cover bg-center border-t border-b border-border-brand overflow-hidden"
          style={{ backgroundImage: "url('/images/fondo2.png')" }}
        >
          {/* Overlay to ensure readability */}
          <div className="absolute inset-0 bg-[#FCFAF7]/92 backdrop-blur-[1px] z-0" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Acumular es fácil</p>
            <h2 className="text-3xl font-serif text-black mb-12">Formas de sumar puntos</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {/* Card 1 */}
              <div className="bg-white border border-[#EADED2] p-5 rounded-sm hover:shadow-xs transition-shadow space-y-3">
                <div className="h-10 w-10 bg-[#FCFAF7] rounded-full flex items-center justify-center border border-[#EADED2]">
                  <UserPlus className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black">Crear una cuenta</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Registrate gratis y recibí un bono de bienvenida inicial.</p>
                </div>
                <span className="inline-block bg-[#FCFAF7] border border-[#EADED2] text-black font-mono font-bold text-[10px] px-2 py-0.5 uppercase">+{pointsWelcome} puntos</span>
              </div>
 
              {/* Card 2 */}
              <div className="bg-white border border-[#EADED2] p-5 rounded-sm hover:shadow-xs transition-shadow space-y-3">
                <div className="h-10 w-10 bg-[#FCFAF7] rounded-full flex items-center justify-center border border-[#EADED2]">
                  <TrendingUp className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black">Comprar productos</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Sumá puntos por cada peso gastado en tus prendas favoritas.</p>
                </div>
                <span className="inline-block bg-[#FCFAF7] border border-[#EADED2] text-black font-mono font-bold text-[10px] px-2 py-0.5 uppercase">1 punto cada $100 gastados</span>
              </div>
 
              {/* Card 3 */}
              <div className="bg-white border border-[#EADED2] p-5 rounded-sm hover:shadow-xs transition-shadow space-y-3">
                <div className="h-10 w-10 bg-[#FCFAF7] rounded-full flex items-center justify-center border border-[#EADED2]">
                  <Heart className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black">Dejar una reseña</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Danos tu opinión honesta sobre la prenda que compraste.</p>
                </div>
                <span className="inline-block bg-[#FCFAF7] border border-[#EADED2] text-black font-mono font-bold text-[10px] px-2 py-0.5 uppercase">+{pointsPerReview} puntos</span>
              </div>
 
              {/* Card 4 */}
              <div className="bg-white border border-[#EADED2] p-5 rounded-sm hover:shadow-xs transition-shadow space-y-3">
                <div className="h-10 w-10 bg-[#FCFAF7] rounded-full flex items-center justify-center border border-[#EADED2]">
                  <Sparkles className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black">Subir fotos vistiendo</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Subí una foto usando la prenda de Pacheca y mostrá tu look.</p>
                </div>
                <span className="inline-block bg-[#FCFAF7] border border-[#EADED2] text-black font-mono font-bold text-[10px] px-2 py-0.5 uppercase">+{pointsPerPhoto} puntos</span>
              </div>
 
              {/* Card 5 */}
              <div className="bg-white border border-[#EADED2] p-5 rounded-sm hover:shadow-xs transition-shadow space-y-3">
                <div className="h-10 w-10 bg-[#FCFAF7] rounded-full flex items-center justify-center border border-[#EADED2]">
                  <Share2 className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black">Recomendar una amiga</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Sumás cuando tu amiga realice su primer pedido en el local.</p>
                </div>
                <span className="inline-block bg-[#FCFAF7] border border-[#EADED2] text-black font-mono font-bold text-[10px] px-2 py-0.5 uppercase">+{pointsPerReferral} puntos</span>
              </div>
 
              {/* Card 6 */}
              <div className="bg-white border border-[#EADED2] p-5 rounded-sm hover:shadow-xs transition-shadow space-y-3">
                <div className="h-10 w-10 bg-[#FCFAF7] rounded-full flex items-center justify-center border border-[#EADED2]">
                  <Award className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black">Mes de tu cumpleaños</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Celebrá tu mes ganando el doble de puntos en todas tus compras.</p>
                </div>
                <span className="inline-block bg-[#FCFAF7] border border-[#EADED2] text-black font-mono font-bold text-[10px] px-2 py-0.5 uppercase">Puntos Dobles (2x)</span>
              </div>
            </div>
          </div>
        </section>
 
        {/* Rewards Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Elegí tu premio</p>
            <h2 className="text-3xl font-serif text-black mb-12">Premios disponibles</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {rewards.map((r) => {
                const Icon = r.benefit_type === "percentage" ? Percent : r.benefit_type === "free_shipping" ? Truck : Gift;
                return (
                  <div key={r.id} className="bg-[#FCFAF7] border border-[#EADED2] rounded-sm p-6 flex flex-col justify-between items-center text-center space-y-4 hover:scale-[1.02] transition-transform">
                    <div className="h-12 w-12 rounded-full bg-white border border-[#EADED2] flex items-center justify-center text-black">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-black">{r.name}</h3>
                      <p className="text-[11px] text-gray-400 mt-1 min-h-[48px]">{r.description}</p>
                    </div>
                    <div className="w-full pt-3 border-t border-[#EADED2]">
                      <span className="text-xs font-bold text-gray-600 block mb-2">{r.points_required} Puntos</span>
                      {member && member.points_balance >= r.points_required ? (
                        <button
                          onClick={() => handleRedeem(r.id)}
                          className="w-full bg-black text-white py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                        >
                          Canjear
                        </button>
                      ) : (
                        <span className="block text-[9px] text-gray-400 bg-gray-100 py-1.5 font-bold uppercase rounded-sm">
                          Puntos insuficientes
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
 
        {/* Referral Program Info Section */}
        <section className="relative py-20 bg-black border-t border-b border-border-brand text-left overflow-hidden">
          {/* Dark blurred background image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1522337360788-8b13edd793be?w=1200" 
              alt="Invitación de amigas" 
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.18) blur(6px)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60 z-0" />
          </div>

          {/* Floating Hearts Decorations */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <Heart className="absolute top-8 left-10 text-white/5 w-16 h-16 rotate-12" />
            <Heart className="absolute bottom-10 right-1/2 text-white/5 w-24 h-24 -rotate-12" />
            <Heart className="absolute top-1/4 right-12 text-[#F5E6D3]/10 w-20 h-20 rotate-45" />
            <Heart className="absolute bottom-6 left-1/4 text-white/10 w-12 h-12 -rotate-45" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-xs">
                <Share2 className="h-3.5 w-3.5 text-[#F5E6D3]" /> Plan de Referidos
              </span>
              <h2 className="text-3xl font-serif text-white leading-tight flex items-center gap-2">
                Invitá a una amiga a Pacheca <Heart className="h-6 w-6 text-red-500 fill-red-500 shrink-0" />
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Tu amiga recibe un <strong className="text-[#F5E6D3] font-semibold">5% de descuento</strong> en su primera compra y vos obtenés un <strong className="text-[#F5E6D3] font-semibold">10% de descuento</strong> para tu próximo pedido cuando ella complete y pague su compra.
              </p>
              <div className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-sm flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-white/60 leading-relaxed">
                  Para acreditar el descuento de referidos, la compra de la amiga debe ser una compra confirmada, superar el monto mínimo establecido y corresponder a una clienta nueva registrada.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (member) {
                      router.push("/clientes/club");
                    } else {
                      setShowRegModal(true);
                    }
                  }}
                  className="bg-[#F5E6D3] hover:bg-white text-black px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors rounded-sm shadow-sm"
                >
                  {member ? "Obtener mi código de referido" : "Inscribirme para referir"}
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-white/10 shadow-lg bg-[#1a1a1a] p-2">
                <img 
                  src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600" 
                  alt="Amigas con Pacheca" 
                  className="h-full w-full object-cover rounded-md" 
                />
              </div>
            </div>
          </div>
        </section>
 
        {/* Conditions accordion Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Legales y reglas</p>
              <h2 className="text-3xl font-serif text-black">Reglas del Programa</h2>
            </div>
            
            <div className="divide-y divide-[#EADED2] border-t border-b border-[#EADED2] text-left">
              {rules.map((rule, idx) => {
                const isOpen = rulesOpen === idx;
                return (
                  <div key={idx} className="py-4">
                    <button
                      onClick={() => toggleRule(idx)}
                      className="w-full flex justify-between items-center text-xs font-bold text-black uppercase tracking-wider outline-none text-left py-2"
                    >
                      <span>{rule.title}</span>
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {isOpen && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed pt-1 pb-2">
                        {rule.desc}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
 
      </main>
 
      {/* Registration Modal Dialog for Guest Users */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EADED2] rounded-md max-w-md w-full p-6 space-y-5 shadow-xl text-left relative">
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              ✕
            </button>
 
            {regSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-black uppercase tracking-wider">¡Bienvenida al Club! 🎉</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Tu cuenta fue creada con éxito. Te acreditamos <strong>{pointsWelcome} puntos</strong> de bienvenida. Redirigiendo a tu panel personal...
                </p>
              </div>
            ) : (
              <form onSubmit={handleJoinGuest} className="space-y-4">
                <div>
                  <h3 className="font-serif text-lg text-black uppercase tracking-wider">Registrate en el Club Pacheca</h3>
                  <p className="text-[11px] text-gray-400 mt-1">Inscribite gratis y empezá a sumar puntos con tus compras.</p>
                </div>
 
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Gabriela"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full text-xs p-2 border border-[#EADED2] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Apellido *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Costa"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full text-xs p-2 border border-[#EADED2] outline-none"
                    />
                  </div>
                </div>
 
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2 border border-[#EADED2] outline-none"
                  />
                </div>
 
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Cumpleaños (Opcional)</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full text-xs p-2 border border-[#EADED2] outline-none bg-white"
                  />
                  <span className="text-[9px] text-gray-400 mt-1 block">* Para recibir puntos dobles en tu mes de cumpleaños.</span>
                </div>
 
                <div className="pt-2">
                  <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer select-none hover:text-black">
                    <input
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 accent-black"
                    />
                    <span>
                      Acepto los términos y condiciones de membresía del Club Pacheca.
                    </span>
                  </label>
                </div>
 
                {regError && <p className="text-[11px] font-bold text-red-600">{regError}</p>}
 
                <button
                  type="submit"
                  className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3 px-4 text-xs uppercase tracking-widest transition-colors rounded-sm"
                >
                  Unirme al Club
                </button>
              </form>
            )}
          </div>
        </div>
      )}
 
      <Footer />
      <WhatsAppButton />
    </>
  );
}
