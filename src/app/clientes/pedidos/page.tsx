"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db, Customer, Order, OrderItem, Product, mockDb } from "@/lib/db";
import { ShoppingBag, ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle, Package, Star, Camera, Check } from "lucide-react";

interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product | null })[];
  isOpen?: boolean;
}

export default function ClientOrdersPage() {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  // Loyalty states
  const [member, setMember] = useState<any | null>(null);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [revProductId, setRevProductId] = useState("");
  const [revProductName, setRevProductName] = useState("");
  const [revOrderId, setRevOrderId] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revSize, setRevSize] = useState("");
  const [revFit, setRevFit] = useState<"small" | "perfect" | "large">("perfect");
  const [revRecommend, setRevRecommend] = useState(true);

  // Photo Modal State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoProductId, setPhotoProductId] = useState("");
  const [photoProductName, setPhotoProductName] = useState("");
  const [photoSize, setPhotoSize] = useState("");
  const [photoComment, setPhotoComment] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [photoAuthPublish, setPhotoAuthPublish] = useState(false);

  useEffect(() => {
    if (user) {
      db.club.members.getByProfile(user.id).then(setMember);
      db.customers.getByProfile(user.id).then((cust) => {
        const targetCust = cust || mockDb.customers[0];
        if (targetCust) {
          setCustomer(targetCust);
          db.orders.listByCustomer(targetCust.id).then(async (list) => {
            const richOrders = await Promise.all(
              list.map(async (ord) => {
                const items = await db.orders.getItems(ord.id);
                const itemsWithProduct = items.map(oi => ({
                  ...oi,
                  product: mockDb.products.find(p => p.id === oi.product_id) || null
                }));
                return {
                  ...ord,
                  items: itemsWithProduct,
                  isOpen: false
                };
              })
            );
            richOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setOrders(richOrders);
            setLoading(false);
          });
        }
      });
    }
  }, [user]);

  const toggleOrderOpen = (id: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, isOpen: !o.isOpen } : o))
    );
  };

  const handleOpenReviewModal = (productId: string, productName: string, orderId: string, size: string) => {
    setRevProductId(productId);
    setRevProductName(productName);
    setRevOrderId(orderId);
    setRevSize(size);
    setRevRating(5);
    setRevComment("");
    setRevFit("perfect");
    setRevRecommend(true);
    setShowReviewModal(true);
  };

  const handleOpenPhotoModal = (productId: string, productName: string, size: string) => {
    setPhotoProductId(productId);
    setPhotoProductName(productName);
    setPhotoSize(size);
    setPhotoComment("");
    setPhotoDataUrl("");
    setPhotoAuthPublish(false);
    setShowPhotoModal(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const customerName = customer ? `${customer.first_name} ${customer.last_name[0]}.` : "Clienta Anon.";
      await db.club.reviews.submit({
        customer_name: customerName,
        rating: revRating,
        comment: revComment,
        product_id: revProductId,
        product_name: revProductName,
        size_purchased: revSize,
        fit_opinion: revFit,
        recommend: revRecommend,
        member_id: member?.id || undefined,
        order_id: revOrderId
      });
      alert("¡Reseña enviada con éxito! Queda pendiente de moderación para acreditar tus puntos.");
      setShowReviewModal(false);
    } catch (err: any) {
      alert(`Error al enviar reseña: ${err.message || err}`);
    }
  };

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl) {
      alert("Por favor cargá una imagen de tu look.");
      return;
    }
    if (!photoAuthPublish) {
      alert("Debés autorizar a Pacheca para publicar tu foto.");
      return;
    }
    if (!member) {
      alert("Debés ser miembro del Club Pacheca para sumar puntos por subir fotos.");
      return;
    }

    try {
      await db.club.photos.submit({
        member_id: member.id,
        image_url: photoDataUrl,
        product_id: photoProductId,
        size_used: photoSize,
        comment: photoComment || undefined,
        authorized_publishing: photoAuthPublish
      });
      alert("¡Foto enviada con éxito! Acreditaremos tus puntos una vez sea moderada.");
      setShowPhotoModal(false);
    } catch (err: any) {
      alert(`Error al subir foto: ${err.message || err}`);
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoDataUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getPublicStatusBadge = (status: Order["status_public"]) => {
    const states: Record<string, { bg: string, label: string, icon: any }> = {
      reserva_recibida: { bg: "bg-gray-50 text-text-muted border-gray-200", label: "Reserva Recibida", icon: Clock },
      pendiente_de_confirmacion: { bg: "bg-amber-50 text-warning border-amber-200", label: "Pendiente", icon: AlertCircle },
      pedido_confirmado: { bg: "bg-blue-50 text-blue-600 border-blue-100", label: "Confirmado", icon: CheckCircle },
      en_preparacion: { bg: "bg-purple-50 text-purple-600 border-purple-100", label: "En Preparación", icon: Package },
      en_camino: { bg: "bg-indigo-50 text-indigo-600 border-indigo-100", label: "En Camino", icon: Package },
      recibido_en_pacheca: { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", label: "En Pacheca", icon: CheckCircle },
      listo_para_retirar: { bg: "bg-success-bg text-success border-success/20", label: "Listo para Retirar", icon: CheckCircle },
      enviado: { bg: "bg-success-bg text-success border-success/20", label: "Enviado", icon: Package },
      entregado: { bg: "bg-success-bg text-success border-success/20", label: "Entregado", icon: CheckCircle },
      cancelado: { bg: "bg-red-50 text-error border-red-200", label: "Cancelado", icon: AlertCircle },
    };

    const info = states[status] || { bg: "bg-gray-50 text-text-muted border-gray-200", label: status, icon: Clock };
    const Icon = info.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${info.bg}`}>
        <Icon className="h-3 w-3 mr-1 shrink-0" />
        {info.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 skeleton"></div>
        <div className="space-y-4">
          <div className="h-16 w-full skeleton"></div>
          <div className="h-16 w-full skeleton"></div>
          <div className="h-16 w-full skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-border-brand pb-4">
        <h1 className="text-lg font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2 text-accent" />
          Seguimiento de Pedidos
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Revisá el estado de avance de tus reservas. Recordá que los productos por encargo pueden tardar de 1 a 3 semanas.
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border-brand rounded-lg">
            <ShoppingBag className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <p className="text-xs text-text-muted">No realizaste pedidos todavía.</p>
          </div>
        ) : (
          orders.map((order) => {
            const formattedTotal = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(order.total_amount);
            const formattedAdvance = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(order.advance_amount);
            const formattedBalance = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(order.remaining_balance);

            return (
              <div
                key={order.id}
                className="border border-border-brand rounded-lg shadow-2xs overflow-hidden bg-white"
              >
                
                {/* Order Summary Bar */}
                <div
                  onClick={() => toggleOrderOpen(order.id)}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-bg-light transition-colors gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-bold text-text-dark">{order.code_public}</span>
                      {getPublicStatusBadge(order.status_public)}
                    </div>
                    <p className="text-[10px] text-text-muted">
                      Realizado el: {new Date(order.created_at).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </p>
                  </div>

                  <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">Total</p>
                      <p className="text-xs font-bold text-text-dark">{formattedTotal}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">Seña / Anticipo</p>
                      <p className="text-xs font-bold text-success">{formattedAdvance}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">Saldo Pendiente</p>
                      <p className={`text-xs font-bold ${order.remaining_balance > 0 ? "text-error" : "text-text-dark"}`}>
                        {formattedBalance}
                      </p>
                    </div>

                    <div className="text-text-muted pl-2">
                      {order.isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Item Details */}
                {order.isOpen && (
                  <div className="bg-bg-light border-t border-border-brand p-4 space-y-4">
                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Detalle de Artículos
                    </h4>
                    <div className="divide-y divide-border-brand">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex py-3 justify-between items-center gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 rounded bg-white border border-border-brand flex items-center justify-center text-text-muted overflow-hidden shrink-0">
                              {item.product?.code_public ? (
                                <img
                                  src={mockDb.product_images.find(pi => pi.product_id === item.product_id)?.url_public || `/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp`}
                                  alt={item.product?.name_public}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-6 w-6" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-dark">
                                {item.product?.name_public || "Artículo"}
                              </p>
                              <p className="text-[10px] text-text-muted mt-0.5">
                                Código: {item.product?.code_public || "N/A"} | Talle: <span className="font-semibold">{item.size}</span> | Color: <span className="font-semibold">{item.color}</span>
                              </p>
                              {order.status_public === "entregado" && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <button
                                    onClick={() => handleOpenReviewModal(item.product_id, item.product?.name_public || "Artículo", order.id, item.size)}
                                    className="inline-flex items-center px-2 py-1 text-[10px] font-medium text-text-dark bg-white border border-border-brand rounded hover:bg-bg-light transition-colors"
                                  >
                                    <Star className="h-3 w-3 mr-1 text-accent fill-accent" /> Opinar
                                  </button>
                                  {member && (
                                    <button
                                      onClick={() => handleOpenPhotoModal(item.product_id, item.product?.name_public || "Artículo", item.size)}
                                      className="inline-flex items-center px-2 py-1 text-[10px] font-medium text-text-dark bg-white border border-border-brand rounded hover:bg-bg-light transition-colors"
                                    >
                                      <Camera className="h-3 w-3 mr-1 text-text-muted" /> Subir Foto
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-text-dark font-medium">
                              {item.quantity} x {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(item.price_unit_final)}
                            </p>
                            <p className="text-xs font-bold text-text-dark mt-0.5">
                              {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(item.price_unit_final * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery summary details */}
                    <div className="pt-3 border-t border-border-brand flex flex-col sm:flex-row justify-between text-xs text-text-muted gap-2">
                      <p>
                        <strong>Método de Entrega:</strong>{" "}
                        {order.delivery_method === "retiro_local"
                          ? "Retiro por Local Pacheca (Villa María)"
                          : order.delivery_method === "envio_domicilio"
                          ? "Envío a Domicilio"
                          : "Envío por Correo Argentino"}
                      </p>
                      {order.shipping_address && (
                        <p>
                          <strong>Dirección:</strong> {order.shipping_address}
                        </p>
                      )}
                      {order.customer_notes && (
                        <p className="italic">
                          &quot;{order.customer_notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-border-brand">
            <div className="flex justify-between items-center border-b border-border-brand pb-3">
              <h3 className="font-display font-bold text-text-dark uppercase tracking-wider text-sm flex items-center">
                <Star className="h-4 w-4 mr-2 text-accent fill-accent" />
                Opinar sobre el Producto
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-text-muted hover:text-text-dark text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-text-muted">Producto a opinar:</p>
                <p className="text-sm font-bold text-text-dark">{revProductName}</p>
                {revSize && <p className="text-[10px] text-text-muted">Talle comprado: {revSize}</p>}
              </div>

              {/* Rating */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-text-dark uppercase">Calificación</label>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRevRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= revRating ? "text-accent fill-accent" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Opinion */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-text-dark uppercase">¿Cómo te quedó el calce?</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["small", "perfect", "large"] as const).map((fitOption) => (
                    <button
                      key={fitOption}
                      type="button"
                      onClick={() => setRevFit(fitOption)}
                      className={`py-2 text-[10px] font-semibold border rounded-lg transition-all ${
                        revFit === fitOption
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border-brand hover:bg-bg-light text-text-muted"
                      }`}
                    >
                      {fitOption === "small" ? "Chico / Ajustado" : fitOption === "perfect" ? "Perfecto" : "Grande / Suelto"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="revRecommend"
                  checked={revRecommend}
                  onChange={(e) => setRevRecommend(e.target.checked)}
                  className="rounded border-border-brand text-accent focus:ring-accent"
                />
                <label htmlFor="revRecommend" className="text-xs text-text-dark">
                  Recomiendo este producto
                </label>
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-text-dark uppercase">Tu comentario</label>
                <textarea
                  required
                  rows={3}
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  placeholder="Contanos qué te pareció la tela, la confección, etc..."
                  className="w-full text-xs p-2.5 border border-border-brand rounded-lg focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="w-1/2 py-2.5 text-xs border border-border-brand rounded-lg hover:bg-bg-light text-text-muted transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 text-xs bg-black text-white hover:bg-neutral-800 rounded-lg transition-colors font-semibold shadow-xs"
                >
                  Enviar Reseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-border-brand">
            <div className="flex justify-between items-center border-b border-border-brand pb-3">
              <h3 className="font-display font-bold text-text-dark uppercase tracking-wider text-sm flex items-center">
                <Camera className="h-4 w-4 mr-2 text-accent" />
                Subir Foto de tu Look
              </h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-text-muted hover:text-text-dark text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePhotoSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-text-muted">Producto:</p>
                <p className="text-sm font-bold text-text-dark">{photoProductName}</p>
                {photoSize && <p className="text-[10px] text-text-muted">Talle: {photoSize}</p>}
              </div>

              {/* File input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-dark uppercase">Elegí tu foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  className="w-full text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-bg-light file:text-text-dark hover:file:bg-border-brand cursor-pointer"
                />

                {photoDataUrl && (
                  <div className="mt-3 relative h-40 w-full rounded-lg overflow-hidden border border-border-brand">
                    <img src={photoDataUrl} alt="Vista previa de tu look" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-text-dark uppercase">Comentario opcional</label>
                <input
                  type="text"
                  value={photoComment}
                  onChange={(e) => setPhotoComment(e.target.value)}
                  placeholder="¿Querés contarnos algo de tu look?"
                  className="w-full text-xs p-2.5 border border-border-brand rounded-lg focus:outline-none focus:border-accent"
                />
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="photoAuthPublish"
                  checked={photoAuthPublish}
                  onChange={(e) => setPhotoAuthPublish(e.target.checked)}
                  className="mt-0.5 rounded border-border-brand text-accent focus:ring-accent"
                />
                <label htmlFor="photoAuthPublish" className="text-[11px] text-text-muted leading-tight">
                  Autorizo a Pacheca a publicar mi foto en su galería de clientas y redes sociales.
                </label>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="w-1/2 py-2.5 text-xs border border-border-brand rounded-lg hover:bg-bg-light text-text-muted transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 text-xs bg-black text-white hover:bg-neutral-800 rounded-lg transition-colors font-semibold shadow-xs"
                >
                  Subir Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
