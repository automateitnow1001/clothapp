"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { db, FAQ } from "@/lib/db";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFaqs = async () => {
      setLoading(true);
      try {
        const list = await db.faqs.list();
        const published = list.filter(f => f.is_published).sort((a, b) => a.order - b.order);
        setFaqs(published);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadFaqs();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* Barra de anuncio superior */}
      <div className="bg-black text-[#F5E6D3] text-[10px] tracking-[0.2em] uppercase py-2 text-center font-medium">
        Envíos gratis a todo el país a partir de $95.000 | 3 cuotas sin interés
      </div>

      <Navbar />

      <main className="flex-grow bg-[#FCFAF7] text-[#111] py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-5">
          
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-3 block">Preguntas Frecuentes</span>
            <h1 className="text-3xl md:text-4xl font-serif text-black">Preguntas Frecuentes</h1>
            <div className="h-0.5 w-12 bg-black mx-auto mt-4 mb-4"></div>
            <p className="text-sm text-gray-600">
              Despejá tus dudas sobre compras, envíos, medios de pago y políticas de cambios de Pacheca.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="h-16 skeleton w-full" />
              <div className="h-16 skeleton w-full" />
              <div className="h-16 skeleton w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div 
                    key={faq.id}
                    className="bg-white border border-[#EADED2] hover:border-black transition-colors duration-200"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                    >
                      <span className="text-sm font-bold uppercase tracking-wider text-black">
                        {faq.question}
                      </span>
                      <span className="ml-4 flex-shrink-0 text-black">
                        {isOpen ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </span>
                    </button>

                    <div 
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-96 opacity-100 border-t border-[#EADED2]" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-6 py-5 text-sm text-gray-600 leading-relaxed bg-[#FCFAF7]">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-16 text-center bg-[#F5E6D3]/30 p-8 border border-[#EADED2] space-y-4">
            <h3 className="text-base font-serif text-black">¿No encontrás lo que buscás?</h3>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              Escribinos por WhatsApp y con gusto te asesoramos de forma inmediata para resolver cualquier consulta adicional.
            </p>
            <a
              href="https://wa.me/5493584377860?text=Hola%20Pacheca!%20Tengo%20una%20consulta%20que%20no%20encontr%C3%A9%20en%20las%20Preguntas%20Frecuentes."
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-black text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
            >
              Consultar por WhatsApp
            </a>
          </div>

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
