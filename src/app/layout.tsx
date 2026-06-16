import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import SocialProofToast from "@/components/social-proof-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pacheca | Almacén",
  description: "Descubrí la colección exclusiva de Pacheca. Diseños modernos, delicados y profesionales pensados para vos. Encontrá vestidos, blusas, jeans y más.",
  metadataBase: new URL("https://somospacheca.com.ar"),
  icons: {
    icon: "/images/isologo.png",
  },
  openGraph: {
    title: "Pacheca | Almacén",
    description: "Descubrí la colección exclusiva de Pacheca. Diseños modernos, delicados y profesionales.",
    url: "https://somospacheca.com.ar",
    siteName: "Pacheca",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-light text-text-dark font-sans">
        <AuthProvider>
          <CartProvider>
            {children}
            <SocialProofToast />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

