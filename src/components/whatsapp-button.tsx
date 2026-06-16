"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { db } from "@/lib/db";

export default function WhatsAppButton() {
  const [phone, setPhone] = useState("5491122334455");
  const [template, setTemplate] = useState("Hola Pacheca! Estoy navegando en su sitio web y quería realizar una consulta.");

  useEffect(() => {
    // Load WhatsApp settings
    db.settings.get("whatsapp_contact").then((val) => {
      if (val) {
        if (val.phone) setPhone(val.phone);
        if (val.message_template) setTemplate(val.message_template);
      }
    });
  }, []);

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(template)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-all hover:scale-110 flex items-center justify-center animate-pulse-slow"
      title="Consultar por WhatsApp"
      id="whatsapp-floating-action-button"
    >
      <MessageCircle className="h-6 w-6 fill-white text-[#25D366]" />
    </a>
  );
}
