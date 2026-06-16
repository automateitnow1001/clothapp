"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { db, mockDb, Product, ProductVariant, ProductImage, SizeGuide } from "@/lib/db";
import { useCart } from "@/lib/cart-context";
import {
  ShoppingBag, ShieldCheck, ArrowLeft, Send, Heart, Ruler, X, Truck, Info, Bell
} from "lucide-react";

export default function PublicProductDetailPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);

  // User selections
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  const [currentImage, setCurrentImage] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Recommendations and History
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>([]);

  // Waitlist States
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistWhatsapp, setWaitlistWhatsapp] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const WHATSAPP = "+5493584377860";

  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await db.products.getBySlug(slug);
        if (prod) {
          setProduct(prod);

          const vars = await db.products.getVariants(prod.id);
          setVariants(vars);

          const imgs = await db.products.getImages(prod.id);
          setImages(imgs);

          const guides = await db.sizeGuides.list();
          setSizeGuides(guides);

          if (imgs.length > 0) {
            setCurrentImage(imgs[0].url_public);
          } else {
            setCurrentImage(`/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp`);
          }

          // Default selection if variants exist
          if (vars.length > 0) {
            setSelectedSize(vars[0].size);
            setSelectedColor(vars[0].color);
          } else if (prod.colors && prod.colors.length > 0) {
            setSelectedColor(prod.colors[0]);
          }

          // Check favorites
          const savedFavs = localStorage.getItem("pacheca_favorites");
          if (savedFavs) {
            const favs = JSON.parse(savedFavs) as string[];
            setIsFavorite(favs.includes(prod.id));
          }

          // Fetch catalog for recs and history
          const allProds = await db.products.list();
          const published = allProds.filter(p => p.status === "published");

          // Recommended (same category, different ID)
          const recs = published
            .filter(p => p.category_id === prod.category_id && p.id !== prod.id)
            .slice(0, 4);
          setRecommendedProducts(recs);

          // Track Recently Viewed
          const savedRecent = localStorage.getItem("pacheca_recent");
          let recentIds: string[] = [];
          if (savedRecent) {
            recentIds = JSON.parse(savedRecent) as string[];
          }

          // Update recent list
          const nextRecent = [prod.id, ...recentIds.filter(id => id !== prod.id)].slice(0, 5);
          localStorage.setItem("pacheca_recent", JSON.stringify(nextRecent));

          // Fetch products for recent list (excluding current)
          const recents = published.filter(p => nextRecent.includes(p.id) && p.id !== prod.id);
          setRecentProducts(recents);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  const toggleFavorite = () => {
    if (!product) return;
    const saved = localStorage.getItem("pacheca_favorites");
    let favs: string[] = [];
    if (saved) {
      favs = JSON.parse(saved) as string[];
    }
    
    let next: string[];
    if (favs.includes(product.id)) {
      next = favs.filter(id => id !== product.id);
      setIsFavorite(false);
    } else {
      next = [...favs, product.id];
      setIsFavorite(true);
    }
    localStorage.setItem("pacheca_favorites", JSON.stringify(next));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem(
      product,
      quantity,
      selectedSize || "U",
      selectedColor || "Único"
    );

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const getWhatsAppLink = () => {
    if (!product) return "";
    const text = `Hola Pacheca! Vengo de la web y quiero consultar por la prenda ${product.name_public} (Código: ${product.code_public})`;
    return `https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  };

  const getAvailabilityLabel = (status: Product["availability"]) => {
    const states = {
      disponible: { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Disponible" },
      disponible_en_local: { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "En Stock Local" },
      por_encargo: { bg: "bg-neutral-50 text-neutral-600 border-neutral-200", label: "A Pedido" },
      preventa: { bg: "bg-amber-50 text-amber-700 border-amber-100", label: "Preventa Lanzamiento" },
      poca_disponibilidad: { bg: "bg-rose-50 text-rose-700 border-rose-100", label: "Últimos Disponibles" },
      agotado: { bg: "bg-red-50 text-red-600 border-red-200", label: "Agotado" },
      pendiente_de_confirmacion: { bg: "bg-gray-50 text-gray-500 border-gray-200", label: "Consultar Stock" },
    };

    const info = states[status] || { bg: "bg-gray-50 text-gray-500 border-gray-200", label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border uppercase tracking-wider ${info.bg}`}>
        {info.label}
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-5 py-12 space-y-6">
          <div className="h-6 w-32 skeleton" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="aspect-square skeleton w-full" />
            <div className="space-y-4">
              <div className="h-8 w-64 skeleton" />
              <div className="h-6 w-32 skeleton" />
              <div className="h-24 w-full skeleton" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-5 py-24 text-center space-y-4">
          <p className="text-sm text-gray-500">La prenda que buscás no existe o no está disponible en este momento.</p>
          <button onClick={() => router.push("/catalogo")} className="text-xs font-bold text-black uppercase tracking-widest underline">
            ← Volver al Catálogo
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const isPromo = product.price_promo && product.price_promo > 0;
  const originalPrice = product.price_final;
  const displayPrice = isPromo ? product.price_promo! : product.price_final;
  const discountPct = isPromo ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

  const availableSizes = product.product_type === "telas"
    ? []
    : Array.from(new Set(variants.map(v => v.size)));
  const availableColors = product.colors && product.colors.length > 0
    ? product.colors
    : Array.from(new Set(variants.map(v => v.color)));

  const selectedVariant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : product.stock_total <= 0 || product.availability === "agotado";

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-[#FCFAF7] text-[#111] py-12">
        <div className="max-w-7xl mx-auto px-5 md:px-10 space-y-16">
          
          {/* Top navigation path */}
          <button
            onClick={() => router.push("/catalogo")}
            className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Catálogo
          </button>

          {/* Product Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Images Carousel */}
            <div className="space-y-4">
              <div className="aspect-[4/5] bg-white border border-[#EADED2] overflow-hidden flex items-center justify-center relative shadow-2xs rounded-sm">
                <img
                  src={currentImage}
                  alt={product.name_public}
                  className="h-full w-full object-cover"
                />
                {isPromo && (
                  <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold px-3 py-1 shadow-2xs uppercase tracking-widest font-mono">
                    {discountPct}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto py-1">
                  {images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImage(img.url_public)}
                      className={`h-16 w-16 bg-white border rounded-sm overflow-hidden p-0.5 shrink-0 transition-all ${
                        currentImage === img.url_public ? "border-black ring-1 ring-black" : "border-[#EADED2]"
                      }`}
                    >
                      <img src={img.url_public} alt="mini" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details & Configurations */}
            <div className="space-y-8 text-left">
              
              {/* Product Title and pricing */}
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Código: {product.code_public}</span>
                  
                  {/* Favorite toggle */}
                  <button 
                    onClick={toggleFavorite}
                    className="text-gray-400 hover:text-black transition-colors"
                    title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                  >
                    <Heart className={`h-5.5 w-5.5 ${isFavorite ? "fill-black text-black" : ""}`} />
                  </button>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-serif text-black leading-snug">
                  {product.name_public}
                </h1>
                
                <div className="flex items-center gap-3">
                  {getAvailabilityLabel(product.availability)}
                </div>

                <div className="pt-2">
                  {isPromo ? (
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-2xl font-bold text-black font-mono">
                        {formatCurrency(product.price_promo!)}
                      </span>
                      <span className="text-sm text-gray-400 line-through font-mono">
                        {formatCurrency(product.price_final)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-black font-mono">
                      {formatCurrency(product.price_final)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-b border-[#EADED2] py-5 space-y-2">
                <p className="text-xs uppercase tracking-wider font-bold text-black">Descripción:</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description_public || "Prenda de diseño seleccionado y calidad boutique exclusive de Pacheca."}
                </p>
              </div>

              {/* Purchase Selection */}
              <div className="space-y-6">
                
                {/* Sizes */}
                {availableSizes.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs uppercase tracking-wider font-bold text-black">Talle:</label>
                      <button
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-[10px] uppercase tracking-wider font-bold text-gray-500 hover:text-black flex items-center gap-1.5 focus:outline-none"
                      >
                        <Ruler className="h-3.5 w-3.5" /> Guía de Talles
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {availableSizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-4 py-2 border rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors ${
                            selectedSize === sz
                              ? "border-black bg-black text-white"
                              : "border-[#EADED2] text-gray-600 hover:border-black"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {availableColors.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-xs uppercase tracking-wider font-bold text-black">Color:</label>
                    <div className="flex flex-wrap gap-2.5">
                      {availableColors.map((col) => (
                        <button
                          key={col}
                          onClick={() => setSelectedColor(col)}
                          className={`px-4 py-2 border rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors ${
                            selectedColor === col
                              ? "border-black bg-black text-white"
                              : "border-[#EADED2] text-gray-600 hover:border-black"
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-wider font-bold text-black">Cantidad:</span>
                  <div className="flex items-center border border-[#EADED2] rounded-sm bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-xs hover:bg-[#FCFAF7] font-semibold"
                    >
                      -
                    </button>
                    <span className="px-4 text-xs font-bold text-black font-mono">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-xs hover:bg-[#FCFAF7] font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {isOutOfStock ? (
                    <button
                      onClick={() => setWaitlistOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-neutral-900 text-white hover:bg-black transition-colors uppercase tracking-widest text-xs font-bold rounded-sm shadow-2xs"
                    >
                      <Bell className="h-4.5 w-4.5" />
                      Avisarme / Lista Espera
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className={`w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-black text-white hover:bg-neutral-800 transition-colors uppercase tracking-widest text-xs font-bold rounded-sm ${
                        addedToCart ? "bg-emerald-600 hover:bg-emerald-600" : ""
                      }`}
                    >
                      <ShoppingBag className="h-4.5 w-4.5" />
                      {addedToCart ? "Añadido!" : "Agregar al Carrito"}
                    </button>
                  )}

                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-8 py-3.5 border border-black text-black hover:bg-black hover:text-white transition-colors uppercase tracking-widest text-xs font-bold rounded-sm"
                  >
                    <Send className="h-4 w-4" />
                    Consultar WhatsApp
                  </a>
                </div>

              </div>

              {/* Guarantees info */}
              <div className="pt-6 border-t border-[#EADED2] space-y-4 text-xs text-gray-500">
                <div className="flex items-start gap-3">
                  <Truck className="h-4.5 w-4.5 text-black shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-black uppercase tracking-wider text-[10px]">Entrega y Envíos</p>
                    <p className="mt-0.5">Envíos a todo el país. Retiros gratis en showroom de Villa María coordinando cita previa.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-4.5 w-4.5 text-black shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-black uppercase tracking-wider text-[10px]">Garantía de Boutique</p>
                    <p className="mt-0.5">Controlamos detalladamente cada costura y textil para entregarte una prenda impecable.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Recommended Section (Te puede gustar) */}
          {recommendedProducts.length > 0 && (
            <div className="border-t border-[#EADED2] pt-12 space-y-8">
              <div className="text-left">
                <h3 className="text-xl font-serif text-black">Te puede gustar...</h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Sugerencias recomendadas para vos</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {recommendedProducts.map((p) => {
                  const isPromo = p.price_promo !== undefined && p.price_promo !== null && p.price_promo > 0;
                  const price = isPromo ? p.price_promo! : p.price_final;
                  const image = mockDb.product_images.find(pi => pi.product_id === p.id)?.url_public || `/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp`;

                  return (
                    <Link 
                      href={`/producto/${p.slug_public}`}
                      key={p.id}
                      className="group flex flex-col justify-between border border-[#EADED2] bg-white hover:shadow-sm transition-shadow rounded-sm overflow-hidden"
                    >
                      <div className="aspect-square overflow-hidden bg-[#FCFAF7] border-b border-[#EADED2]">
                        <img 
                          src={image} 
                          alt={p.name_public} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 space-y-3 text-left">
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold block">Cód: {p.code_public}</span>
                          <h4 className="font-serif text-xs text-black line-clamp-1 group-hover:text-gray-600 transition-colors">
                            {p.name_public}
                          </h4>
                        </div>
                        <div className="pt-2 border-t border-[#EADED2] flex justify-between items-center">
                          <span className="text-xs font-bold text-black font-mono">
                            {formatCurrency(price)}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-black group-hover:underline">Ver →</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vistos Recientemente Section */}
          {recentProducts.length > 0 && (
            <div className="border-t border-[#EADED2] pt-12 space-y-8">
              <div className="text-left">
                <h3 className="text-xl font-serif text-black">Vistos recientemente</h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Historial de prendas vistas en tu navegador</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                {recentProducts.map((p) => {
                  const isPromo = p.price_promo !== undefined && p.price_promo !== null && p.price_promo > 0;
                  const price = isPromo ? p.price_promo! : p.price_final;
                  const image = mockDb.product_images.find(pi => pi.product_id === p.id)?.url_public || `/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp`;

                  return (
                    <Link 
                      href={`/producto/${p.slug_public}`}
                      key={p.id}
                      className="group flex flex-col justify-between border border-[#EADED2] bg-white hover:shadow-sm transition-shadow rounded-sm overflow-hidden"
                    >
                      <div className="aspect-square overflow-hidden bg-[#FCFAF7] border-b border-[#EADED2]">
                        <img 
                          src={image} 
                          alt={p.name_public} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3 space-y-2 text-left">
                        <h4 className="font-serif text-[11px] text-black line-clamp-1 group-hover:text-gray-600 transition-colors">
                          {p.name_public}
                        </h4>
                        <div className="pt-1.5 border-t border-[#EADED2] flex justify-between items-center text-[11px]">
                          <span className="font-bold text-black font-mono">
                            {formatCurrency(price)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSizeGuideOpen(false)} />
          
          <div className="bg-white border border-[#EADED2] max-w-md w-full p-6 shadow-xl relative rounded-sm z-10 text-left space-y-6">
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-[#EADED2] pb-3">
              <h3 className="text-base font-serif text-black uppercase tracking-wider flex items-center gap-2">
                <Ruler className="h-5 w-5" /> Guía de Talles
              </h3>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Medidas de la prenda</p>
            </div>

            <div className="space-y-4">
              {product.size_guide_text ? (
                <div className="p-4 bg-[#FCFAF7] border border-[#EADED2] text-xs text-gray-700 leading-relaxed whitespace-pre-line font-mono">
                  {product.size_guide_text}
                </div>
              ) : (
                <>
                  <div className="p-4 bg-[#FCFAF7] border border-[#EADED2] text-xs text-gray-600 leading-relaxed space-y-3">
                    <div className="flex gap-2 text-amber-700 font-bold uppercase tracking-wider text-[10px]">
                      <Info className="h-4 w-4 shrink-0" /> Medidas pendientes de cargar
                    </div>
                    <p>
                      Las medidas específicas de busto, cadera, cintura y largos para este artículo se encuentran actualmente en proceso de carga en nuestra base de datos.
                    </p>
                    <p>
                      Si tenés dudas, podés escribirnos directamente por WhatsApp y te pasaremos las medidas tomadas en el momento con un centímetro.
                    </p>
                  </div>

                  <table className="w-full text-xs text-left border-collapse border border-[#EADED2]">
                    <thead>
                      <tr className="bg-[#FCFAF7]">
                        <th className="border border-[#EADED2] p-2 font-bold uppercase tracking-wider text-[9px]">Talle</th>
                        <th className="border border-[#EADED2] p-2 font-bold uppercase tracking-wider text-[9px]">Busto</th>
                        <th className="border border-[#EADED2] p-2 font-bold uppercase tracking-wider text-[9px]">Cintura</th>
                        <th className="border border-[#EADED2] p-2 font-bold uppercase tracking-wider text-[9px]">Cadera</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v) => {
                        const guide = sizeGuides.find(sg => sg.size.toLowerCase() === v.size.toLowerCase());
                        return (
                          <tr key={v.id} className="hover:bg-[#FCFAF7]/50">
                            <td className="border border-[#EADED2] p-2 font-bold font-mono">{v.size}</td>
                            <td className="border border-[#EADED2] p-2 text-gray-700">
                              {guide ? `${guide.bust_min}-${guide.bust_max} cm` : "S/D"}
                            </td>
                            <td className="border border-[#EADED2] p-2 text-gray-700">
                              {guide ? `${guide.waist_min}-${guide.waist_max} cm` : "S/D"}
                            </td>
                            <td className="border border-[#EADED2] p-2 text-gray-700">
                              {guide ? `${guide.hip_min}-${guide.hip_max} cm` : "S/D"}
                            </td>
                          </tr>
                        );
                      })}
                      {variants.length === 0 && (
                        <tr>
                          <td className="border border-[#EADED2] p-2 font-bold font-mono">U</td>
                          <td className="border border-[#EADED2] p-2 text-gray-400 italic">S/D</td>
                          <td className="border border-[#EADED2] p-2 text-gray-400 italic">S/D</td>
                          <td className="border border-[#EADED2] p-2 text-gray-400 italic">S/D</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-between gap-3">
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="w-1/2 border border-[#EADED2] text-gray-500 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-black hover:text-black rounded-sm transition-colors text-center"
              >
                Cerrar
              </button>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                className="w-1/2 bg-black text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 rounded-sm transition-colors text-center block"
              >
                Consultar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {waitlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setWaitlistOpen(false)} />
          
          <div className="bg-white border border-[#EADED2] max-w-md w-full p-6 shadow-xl relative rounded-sm z-10 text-left space-y-6">
            <button
              onClick={() => { setWaitlistOpen(false); setWaitlistSubmitted(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-[#EADED2] pb-3">
              <h3 className="text-base font-serif text-black uppercase tracking-wider flex items-center gap-2">
                <Bell className="h-5 w-5" /> Lista de Espera
              </h3>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Aviso de reposición de stock</p>
            </div>

            {!waitlistSubmitted ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  // Save waitlist locally
                  const saved = localStorage.getItem("pacheca_waitlist");
                  let list = [];
                  if (saved) {
                    try { list = JSON.parse(saved); } catch {}
                  }
                  list.push({
                    id: `wl_${Date.now()}`,
                    product_id: product.id,
                    product_name: product.name_public,
                    size: selectedSize || "U",
                    color: selectedColor || "Único",
                    name: waitlistName,
                    whatsapp: waitlistWhatsapp,
                    created_at: new Date().toISOString(),
                    status: "pending"
                  });
                  localStorage.setItem("pacheca_waitlist", JSON.stringify(list));
                  setWaitlistSubmitted(true);
                }}
                className="space-y-4"
              >
                <div className="p-3 bg-[#FCFAF7] border border-[#EADED2] text-xs text-gray-500 leading-relaxed">
                  Estás solicitando aviso para la prenda <strong className="text-black">{product.name_public}</strong> en Talle <strong className="text-black">{selectedSize || "U"}</strong> y Color <strong className="text-black">{selectedColor || "Único"}</strong>. Te notificaremos de inmediato cuando reingrese stock.
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-black">Tu Nombre</label>
                  <input
                    type="text"
                    required
                    value={waitlistName}
                    onChange={(e) => setWaitlistName(e.target.value)}
                    placeholder="Ej: Martina Gómez"
                    className="w-full px-3 py-2 text-xs border border-[#EADED2] rounded-sm focus:border-black outline-none bg-[#FCFAF7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-black">WhatsApp de Contacto</label>
                  <input
                    type="tel"
                    required
                    value={waitlistWhatsapp}
                    onChange={(e) => setWaitlistWhatsapp(e.target.value)}
                    placeholder="Ej: +54 9 3584 123456"
                    className="w-full px-3 py-2 text-xs border border-[#EADED2] rounded-sm focus:border-black outline-none bg-[#FCFAF7] font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setWaitlistOpen(false)}
                    className="w-1/2 border border-[#EADED2] text-gray-500 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-black hover:text-black rounded-sm transition-colors text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-black text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 rounded-sm transition-colors text-center"
                  >
                    Anotarme
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="text-emerald-600 font-bold text-sm uppercase tracking-wider">¡Te anotaste con éxito! 🎉</div>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Registramos tu solicitud para {product.name_public} ({selectedSize} - {selectedColor}). Te avisaremos por WhatsApp en cuanto reingrese stock.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hola Pacheca! Me anoté en la lista de espera de la web para la prenda ${product.name_public} (Talle: ${selectedSize}, Color: ${selectedColor}). Mi nombre es ${waitlistName}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-black text-white py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 rounded-sm transition-colors text-center block font-semibold text-center"
                  >
                    Notificar por WhatsApp
                  </a>
                  <button
                    onClick={() => { setWaitlistOpen(false); setWaitlistSubmitted(false); }}
                    className="text-xs text-gray-400 hover:text-black font-bold uppercase tracking-widest pt-1"
                  >
                    Volver a la tienda
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
    </>
  );
}
