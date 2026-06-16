"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { db, mockDb, Product } from "@/lib/db";
import { Heart, Trash2, ArrowRight, ShoppingBag, MessageCircle, Package } from "lucide-react";

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const WHATSAPP = "+5493584377860";

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const prodList = await db.products.list();
        setProducts(prodList);
        
        const saved = localStorage.getItem("pacheca_favorites");
        if (saved) {
          setFavorites(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const removeFavorite = (id: string) => {
    const next = favorites.filter((favId) => favId !== id);
    setFavorites(next);
    localStorage.setItem("pacheca_favorites", JSON.stringify(next));
  };

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);
  };

  const getWhatsAppLink = () => {
    if (favoriteProducts.length === 0) return "";
    const itemsText = favoriteProducts.map(p => `${p.name_public} (Cód: ${p.code_public})`).join(", ");
    const text = `Hola Pacheca! Estoy interesada en consultar por estas prendas de mi lista de favoritos: ${itemsText}`;
    return `https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-[#FCFAF7] text-[#111] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          
          {/* Header section */}
          <div className="mb-12 border-b border-[#EADED2] pb-6">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-2 block">Lista personal</span>
            <h1 className="text-3xl md:text-4xl font-serif text-black flex items-center gap-3">
              Mis <span className="italic font-light">favoritos</span>
              {favoriteProducts.length > 0 && (
                <span className="text-xs font-sans font-normal text-gray-500 uppercase tracking-widest bg-[#EADED2]/30 px-2.5 py-1 rounded">
                  {favoriteProducts.length} {favoriteProducts.length === 1 ? "prenda" : "prendas"}
                </span>
              )}
            </h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              <div className="h-64 skeleton" />
              <div className="h-64 skeleton" />
              <div className="h-64 skeleton" />
              <div className="h-64 skeleton" />
            </div>
          ) : favoriteProducts.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 space-y-6 max-w-md mx-auto">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mx-auto border border-[#EADED2] shadow-2xs">
                <Heart className="h-8 w-8 text-gray-300" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-xl text-black">Tu lista de favoritos está vacía</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Explorá el catálogo de prendas exclusivas de Pacheca y hacé clic en el corazón para guardarlas aquí.
                </p>
              </div>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
              >
                Explorar catálogo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Favorites Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-12">
                {favoriteProducts.map((p) => {
                  const image = mockDb.product_images.find(pi => pi.product_id === p.id)?.url_public || `/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp`;
                  const isPromo = p.price_promo && p.price_promo > 0;
                  const price = isPromo ? p.price_promo! : p.price_final;

                  return (
                    <div key={p.id} className="group bg-white border border-[#EADED2] shadow-2xs flex flex-col justify-between hover:shadow-sm transition-shadow relative">
                      
                      {/* Image section */}
                      <div className="relative aspect-square overflow-hidden bg-[#FCFAF7] border-b border-[#EADED2] flex items-center justify-center shrink-0">
                        <img
                          src={image}
                          alt={p.name_public}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Remove favorite button */}
                        <button
                          onClick={() => removeFavorite(p.id)}
                          className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/95 border border-[#EADED2] flex items-center justify-center shadow-2xs text-gray-400 hover:text-black hover:bg-white transition-colors z-10"
                          title="Quitar de favoritos"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Info section */}
                      <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-1 text-left">
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Cód: {p.code_public}</span>
                          <Link href={`/producto/${p.slug_public}`} className="font-serif text-sm text-black block hover:text-gray-600 transition-colors line-clamp-2">
                            {p.name_public}
                          </Link>
                        </div>

                        <div className="pt-2 border-t border-[#EADED2] flex justify-between items-center">
                          <span className="text-xs font-bold text-black font-mono">
                            {formatCurrency(price)}
                          </span>
                          <Link
                            href={`/producto/${p.slug_public}`}
                            className="text-[9px] font-bold uppercase tracking-wider text-black flex items-center gap-1 hover:text-gray-600 transition-colors"
                          >
                            Detalles <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 border-t border-[#EADED2] pt-8">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" /> Volver al catálogo
                </Link>
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-black text-black px-8 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> Consultar por WhatsApp
                </a>
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
