"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { db, Product, CuratedLook } from "@/lib/db";
import { Sparkles, MessageCircle, ArrowRight, ShoppingBag } from "lucide-react";

export default function LooksPage() {
  const [looks, setLooks] = useState<CuratedLook[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const WHATSAPP = "+5493584377860";

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const looksList = await db.looks.list();
        setLooks(looksList);

        const prods = await db.products.list();
        setProducts(prods);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);
  };

  const getLookWhatsAppLink = (look: CuratedLook, lookItems: Product[]) => {
    const itemsNames = lookItems.map(p => p.name_public).join(" y ");
    const text = `Hola Pacheca! Vi el look "${look.name}" en la web y me encantaría consultar por las prendas que lo componen: ${itemsNames}.`;
    return `https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-[#FCFAF7] text-[#111] py-16 md:py-24 text-left">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          
          {/* Header */}
          <div className="text-center mb-16 max-w-xl mx-auto">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-3 block">Estilo Pacheca</span>
            <h1 className="text-3xl md:text-4xl font-serif text-black">Curaduría de Looks</h1>
            <div className="h-0.5 w-12 bg-black mx-auto mt-4 mb-4"></div>
            <p className="text-sm text-gray-500">
              Inspirate con nuestros conjuntos seleccionados por temporada. Prendas que combinan a la perfección y se adaptan a tu silueta con soltura y elegancia.
            </p>
          </div>

          {loading ? (
            <div className="space-y-12">
              <div className="h-96 skeleton w-full" />
              <div className="h-96 skeleton w-full" />
            </div>
          ) : (
            <div className="space-y-20">
              {looks.map((look, index) => {
                const lookItems = products.filter(p => look.product_ids.includes(p.id));
                const isEven = index % 2 === 0;

                return (
                  <div 
                    key={look.id}
                    className={`flex flex-col lg:flex-row gap-10 lg:gap-16 items-center ${
                      isEven ? "" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Look Main Image */}
                    <div className="w-full lg:w-1/2 aspect-[4/5] overflow-hidden border border-[#EADED2] bg-white rounded-sm shadow-2xs shrink-0 group relative">
                      <img
                        src={look.image_url}
                        alt={look.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        {look.tags.map(t => (
                          <span key={t} className="bg-black text-[#F5E6D3] text-[9px] font-bold px-2.5 py-1 uppercase tracking-widest font-mono shadow-2xs">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Look Details and Shop the Look */}
                    <div className="w-full lg:w-1/2 space-y-6">
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-[#C8A27C]" /> Conjunto Seleccionado {index + 1}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-serif text-black">{look.name}</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">{look.description}</p>
                      </div>

                      {/* Products list under Look */}
                      <div className="space-y-4 pt-4 border-t border-[#EADED2]">
                        <p className="text-xs uppercase tracking-wider font-bold text-black">Prendas en este Look:</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {lookItems.map((p) => {
                            const isPromo = p.price_promo && p.price_promo > 0;
                            const price = isPromo ? p.price_promo! : p.price_final;

                            return (
                              <div 
                                key={p.id}
                                className="flex items-center gap-3 p-3 bg-white border border-[#EADED2] hover:border-black transition-colors rounded-sm"
                              >
                                <div className="h-12 w-12 bg-[#FCFAF7] border border-[#EADED2] rounded-sm overflow-hidden shrink-0">
                                  <img 
                                    src={`/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp`} 
                                    alt={p.name_public} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <h4 className="text-xs font-serif text-black truncate">{p.name_public}</h4>
                                  <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{formatCurrency(price)}</span>
                                </div>
                                <Link 
                                  href={`/producto/${p.slug_public}`}
                                  className="text-[9px] font-bold uppercase tracking-wider text-black hover:text-gray-600 shrink-0"
                                >
                                  Ver →
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* WhatsApp Inquiry for Full Look */}
                      <div className="pt-4">
                        <a
                          href={getLookWhatsAppLink(look, lookItems)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors rounded-sm"
                        >
                          <MessageCircle className="h-4.5 w-4.5" /> Consultar por Look Completo
                        </a>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
