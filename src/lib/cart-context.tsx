"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, db, Coupon } from "./db";

export interface CartItem {
  id: string; // product_id + size + color
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, size: string, color: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  totalAmount: number;
  advanceAmount: number; // 50% down payment
  appliedCoupon: Coupon | null;
  discountAmount: number;
  finalTotalAmount: number;
  finalAdvanceAmount: number;
  applyCoupon: (code: string, memberProfileId?: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Load cart on init
  useEffect(() => {
    const savedCart = localStorage.getItem("pacheca_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("pacheca_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (product: Product, quantity: number, size: string, color: string) => {
    const id = `${product.id}-${size}-${color}`;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { id, product, quantity, size, color }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = items.reduce((acc, item) => {
    const price = item.product.price_promo || item.product.price_final;
    return acc + price * item.quantity;
  }, 0);
  
  // Calculate 50% advance payment required (anticipo)
  const advanceAmount = Math.round(totalAmount * 0.5);

  // Calculate discount based on appliedCoupon
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === "percentage") {
      discount = Math.round(totalAmount * (appliedCoupon.discount_value / 100));
    } else if (appliedCoupon.discount_type === "fixed_amount") {
      discount = Math.min(appliedCoupon.discount_value, totalAmount);
    }
  }
  const discountAmount = discount;
  const finalTotalAmount = Math.max(0, totalAmount - discountAmount);
  const finalAdvanceAmount = Math.round(finalTotalAmount * 0.5);

  // Validate coupon when totalAmount changes
  useEffect(() => {
    if (appliedCoupon && totalAmount < appliedCoupon.min_purchase_amount) {
      setAppliedCoupon(null);
    }
  }, [totalAmount, appliedCoupon]);

  const applyCoupon = async (code: string, memberProfileId?: string) => {
    const cleanCode = code.trim().toUpperCase();
    const cp = await db.club.coupons.getByCode(cleanCode);
    if (!cp) {
      return { success: false, error: "Cupón inválido o inexistente." };
    }

    if (cp.is_used) {
      return { success: false, error: "El cupón ya ha sido utilizado." };
    }

    if (new Date(cp.expires_at) < new Date()) {
      return { success: false, error: "El cupón ha vencido." };
    }

    if (totalAmount < cp.min_purchase_amount) {
      return { success: false, error: `Compra mínima requerida: $${cp.min_purchase_amount}.` };
    }

    if (cp.member_id) {
      const member = await db.club.members.get(cp.member_id);
      if (!member) {
        return { success: false, error: "Miembro dueño del cupón no encontrado." };
      }
      if (memberProfileId && member.profile_id !== memberProfileId) {
        return { success: false, error: "Este cupón es personal de otro usuario y no te pertenece." };
      }
    }

    setAppliedCoupon(cp);
    return { success: true };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItemsCount,
        totalAmount,
        advanceAmount,
        appliedCoupon,
        discountAmount,
        finalTotalAmount,
        finalAdvanceAmount,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}
