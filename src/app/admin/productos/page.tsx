"use client";

import React, { useState, useEffect } from "react";
import { db, mockDb, Product, Category, Supplier, PurchaseRound, ProductImage, supabase } from "@/lib/db";

import { useAuth } from "@/lib/auth-context";
import {
  Package, Search, Plus, Filter, RefreshCw, Eye, EyeOff,
  Edit, Trash2, ArrowUpRight, DollarSign, CheckCircle, Tag,
  X, Check, AlertCircle, HelpCircle, Save
} from "lucide-react";

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseRounds, setPurchaseRounds] = useState<PurchaseRound[]>([]);
  const [productImages, setProductImages] = useState<Record<string, ProductImage[]>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const emptyForm = {
    supplier_id: "",
    name_original: "",
    name_public: "",
    code_original: "",
    code_public: "",
    slug_public: "",
    description_original: "",
    description_public: "",
    category_id: "",
    subcategory: "",
    tagsRaw: "temporada-nueva",
    price_original: 0,
    tax_percentage: 21,
    assigned_shipping_cost: 0,
    other_costs: 0,
    markup_percentage: 50,
    markup_fixed: 0,
    stock_total: 10,
    availability: "disponible" as Product["availability"],
    estimated_delivery_weeks: 2,
    status: "published" as Product["status"],
    product_type: "indumentaria" as "indumentaria" | "telas",
    gender: "mujer" as "mujer" | "hombre" | "unisex",
    round_id: "",
    size_guide_text: "",
    colorsRaw: "",
    imagesRaw: "",
  };

  const [newProduct, setNewProduct] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const allProducts = await db.products.list();
      setProducts(allProducts);

      // Load supporting lists
      const cats = await db.categories.list();
      setCategories(cats);

      const sups = await db.suppliers.list();
      setSuppliers(sups);

      const allRounds = await db.purchaseRounds.list();
      const rounds = allRounds.filter(r => r.status === "abierta" || r.status === "minimo_alcanzado");
      setPurchaseRounds(rounds);

      if (sups.length > 0 && cats.length > 0) {
        setNewProduct(prev => ({
          ...prev,
          supplier_id: sups[0].id,
          category_id: cats[0].id,
        }));
      }

      // Load images for all products
      if (supabase) {
        const { data: imgs } = await supabase
          .from("product_images")
          .select("*")
          .order("sort_order", { ascending: true });
        if (imgs) {
          const grouped: Record<string, ProductImage[]> = {};
          for (const img of imgs as ProductImage[]) {
            if (!grouped[img.product_id]) grouped[img.product_id] = [];
            grouped[img.product_id].push(img);
          }
          setProductImages(grouped);
        }
      } else {
        // Use mockDb images
        const grouped: Record<string, ProductImage[]> = {};
        for (const img of mockDb.product_images) {
          if (!grouped[img.product_id]) grouped[img.product_id] = [];
          grouped[img.product_id].push(img);
        }
        setProductImages(grouped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMainImage = (productId: string): string | null => {
    const imgs = productImages[productId];
    if (!imgs || imgs.length === 0) return null;
    const main = imgs.find(i => i.is_main) || imgs[0];
    return main.url_public || null;
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tags = newProduct.tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t !== "");

      // Compute total cost and final price using raw formula
      const cost_total = Number(newProduct.price_original) * (1 + Number(newProduct.tax_percentage) / 100) +
        Number(newProduct.assigned_shipping_cost) + Number(newProduct.other_costs);

      const price_final = Math.ceil((cost_total * (1 + Number(newProduct.markup_percentage) / 100) + Number(newProduct.markup_fixed)) / 100) * 100;
      
      const profit = price_final - cost_total;

      const colors = newProduct.colorsRaw
        .split(",")
        .map(c => c.trim())
        .filter(c => c !== "");
      
      const images = newProduct.imagesRaw
        .split(",")
        .map(img => img.trim())
        .filter(img => img !== "");

      const pCreated = await db.products.create({
        supplier_id: newProduct.supplier_id,
        name_original: newProduct.name_original || newProduct.name_public,
        name_public: newProduct.name_public,
        code_original: newProduct.code_original,
        code_public: newProduct.code_public,
        slug_public: newProduct.slug_public || newProduct.name_public.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description_original: newProduct.description_original || undefined,
        description_public: newProduct.description_public || undefined,
        category_id: newProduct.category_id,
        subcategory: newProduct.subcategory || undefined,
        tags,
        price_original: Number(newProduct.price_original),
        currency: "ARS",
        tax_percentage: Number(newProduct.tax_percentage),
        assigned_shipping_cost: Number(newProduct.assigned_shipping_cost),
        other_costs: Number(newProduct.other_costs),
        cost_total,
        markup_percentage: Number(newProduct.markup_percentage),
        markup_fixed: Number(newProduct.markup_fixed),
        price_final,
        estimated_profit: profit,
        stock_total: Number(newProduct.stock_total),
        availability: newProduct.availability,
        estimated_delivery_weeks: Number(newProduct.estimated_delivery_weeks),
        status: newProduct.status,
        product_type: newProduct.product_type,
        gender: newProduct.gender,
        round_id: newProduct.round_id || undefined,
        size_guide_text: newProduct.size_guide_text || undefined,
        colors: colors.length > 0 ? colors : undefined,
        images: images.length > 0 ? images : undefined,
        created_by: user?.email || "equipo@somospacheca.com.ar",
      } as any);

      // Save product images to product_images table
      if (images.length > 0 && pCreated) {
        const imageInserts = images.map((imgUrl: string, index: number) => ({
          product_id: pCreated.id,
          url_public: imgUrl,
          is_main: index === 0,
          sort_order: index,
        }));
        
        if (supabase) {
          await supabase.from("product_images").insert(imageInserts);
        } else {
          imageInserts.forEach((img, i) => {
            mockDb.product_images.push({ ...img, id: `pi_${Date.now()}_${i}`, url_original: undefined });
          });
        }
      }

      setSuccessMsg("Producto añadido correctamente al catálogo de Pacheca.");
      setShowCreateModal(false);
      setNewProduct(emptyForm);
      loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
      alert("Error al crear el producto. Revisá la consola para más detalles.");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (p: Product) => {
    setSelectedProduct(p);
    const imgs = productImages[p.id] || [];
    const imagesStr = imgs.map(i => i.url_public).join(", ");
    setEditForm({
      supplier_id: p.supplier_id,
      name_original: p.name_original,
      name_public: p.name_public,
      code_original: p.code_original || "",
      code_public: p.code_public,
      slug_public: p.slug_public,
      description_original: p.description_original || "",
      description_public: p.description_public || "",
      category_id: p.category_id,
      subcategory: p.subcategory || "",
      tagsRaw: (p.tags || []).join(", "),
      price_original: p.price_original,
      tax_percentage: p.tax_percentage,
      assigned_shipping_cost: p.assigned_shipping_cost,
      other_costs: p.other_costs,
      markup_percentage: p.markup_percentage,
      markup_fixed: p.markup_fixed,
      stock_total: p.stock_total,
      availability: p.availability,
      estimated_delivery_weeks: p.estimated_delivery_weeks,
      status: p.status,
      product_type: p.product_type || "indumentaria",
      gender: p.gender || "mujer",
      round_id: p.round_id || "",
      size_guide_text: p.size_guide_text || "",
      colorsRaw: (p.colors || []).join(", "),
      imagesRaw: imagesStr,
    });
    setShowEditModal(true);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSaving(true);
    try {
      const tags = editForm.tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t !== "");

      const cost_total = Number(editForm.price_original) * (1 + Number(editForm.tax_percentage) / 100) +
        Number(editForm.assigned_shipping_cost) + Number(editForm.other_costs);

      const price_final = Math.ceil((cost_total * (1 + Number(editForm.markup_percentage) / 100) + Number(editForm.markup_fixed)) / 100) * 100;
      
      const profit = price_final - cost_total;

      const colors = editForm.colorsRaw
        .split(",")
        .map(c => c.trim())
        .filter(c => c !== "");

      const images = editForm.imagesRaw
        .split(",")
        .map(img => img.trim())
        .filter(img => img !== "");

      await db.products.update(selectedProduct.id, {
        supplier_id: editForm.supplier_id,
        name_original: editForm.name_original || editForm.name_public,
        name_public: editForm.name_public,
        code_original: editForm.code_original,
        code_public: editForm.code_public,
        slug_public: editForm.slug_public || editForm.name_public.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description_original: editForm.description_original || undefined,
        description_public: editForm.description_public || undefined,
        category_id: editForm.category_id,
        subcategory: editForm.subcategory || undefined,
        tags,
        price_original: Number(editForm.price_original),
        tax_percentage: Number(editForm.tax_percentage),
        assigned_shipping_cost: Number(editForm.assigned_shipping_cost),
        other_costs: Number(editForm.other_costs),
        cost_total,
        markup_percentage: Number(editForm.markup_percentage),
        markup_fixed: Number(editForm.markup_fixed),
        price_final,
        estimated_profit: profit,
        stock_total: Number(editForm.stock_total),
        availability: editForm.availability,
        estimated_delivery_weeks: Number(editForm.estimated_delivery_weeks),
        status: editForm.status,
        product_type: editForm.product_type,
        gender: editForm.gender,
        round_id: editForm.round_id || undefined,
        size_guide_text: editForm.size_guide_text || undefined,
        colors: colors.length > 0 ? colors : undefined,
        images: images.length > 0 ? images : undefined,
        updated_by: user?.email || "equipo@somospacheca.com.ar",
      } as any);

      // Update images: delete old, insert new
      if (supabase) {
        await supabase.from("product_images").delete().eq("product_id", selectedProduct.id);
        if (images.length > 0) {
          const imageInserts = images.map((imgUrl: string, index: number) => ({
            product_id: selectedProduct.id,
            url_public: imgUrl,
            is_main: index === 0,
            sort_order: index,
          }));
          await supabase.from("product_images").insert(imageInserts);
        }
      } else {
        // Mock: replace images
        const filtered = mockDb.product_images.filter(pi => pi.product_id !== selectedProduct.id);
        mockDb.product_images.length = 0;
        filtered.forEach(pi => mockDb.product_images.push(pi));
        images.forEach((imgUrl, i) => {
          mockDb.product_images.push({
            id: `pi_${Date.now()}_${i}`,
            product_id: selectedProduct.id,
            url_public: imgUrl,
            is_main: i === 0,
            sort_order: i,
            url_original: undefined,
          });
        });
      }

      setSuccessMsg("Producto actualizado correctamente.");
      setShowEditModal(false);
      setSelectedProduct(null);
      loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (prod: Product) => {
    const nextStatus = prod.status === "published" ? "draft" : "published";
    try {
      await db.products.update(prod.id, { 
        status: nextStatus,
        updated_by: user?.email || "equipo@somospacheca.com.ar",
      } as any);
      setSuccessMsg(`Estado del producto modificado a: ${nextStatus === "published" ? "Publicado" : "Borrador"}.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      // Delete product images first
      if (supabase) {
        await supabase.from("product_images").delete().eq("product_id", productId);
        await supabase.from("products").delete().eq("id", productId);
      } else {
        const filteredImgs = mockDb.product_images.filter(pi => pi.product_id !== productId);
        mockDb.product_images.length = 0;
        filteredImgs.forEach(pi => mockDb.product_images.push(pi));
        const idx = mockDb.products.findIndex(p => p.id === productId);
        if (idx !== -1) mockDb.products.splice(idx, 1);
      }
      setSuccessMsg("Producto eliminado correctamente.");
      setConfirmDeleteId(null);
      loadData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el producto.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name_public.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name_original.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code_public.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.code_original || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || p.category_id === categoryFilter;
    const matchesSupplier = supplierFilter === "all" || p.supplier_id === supplierFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesSupplier && matchesStatus;
  });

  // Shared form fields component
  const renderFormFields = (form: typeof emptyForm, setForm: (f: typeof emptyForm) => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Tipo de Producto *</label>
          <select
            required
            value={form.product_type}
            onChange={(e) => setForm({ ...form, product_type: e.target.value as any })}
            className="w-full text-xs bg-white"
          >
            <option value="indumentaria">Indumentaria / Ropa</option>
            <option value="telas">Telas / Géneros</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Proveedor *</label>
          <select
            required
            value={form.supplier_id}
            onChange={(e) => {
              const sup = suppliers.find(s => s.id === e.target.value);
              const activeRound = purchaseRounds.find(r => r.supplier_id === e.target.value);
              setForm({ 
                ...form, 
                supplier_id: e.target.value,
                round_id: activeRound?.id || "",
                markup_percentage: sup?.default_markup_percentage || 50,
              });
            }}
            className="w-full text-xs bg-white"
          >
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Categoría *</label>
          <select
            required
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full text-xs bg-white"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.gender ? `(${c.gender})` : ""}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Género / Sección</label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
            className="w-full text-xs bg-white"
          >
            <option value="mujer">Mujer</option>
            <option value="hombre">Hombre</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Ronda de Compra Activa</label>
          <select
            value={form.round_id}
            onChange={(e) => setForm({ ...form, round_id: e.target.value })}
            className="w-full text-xs bg-white"
          >
            <option value="">Sin ronda asignada</option>
            {purchaseRounds.map(r => {
              const sup = suppliers.find(s => s.id === r.supplier_id);
              return (
                <option key={r.id} value={r.id}>
                  {sup?.name || r.supplier_id} — {r.code_round} ({r.status === "minimo_alcanzado" ? "✓ Mín. OK" : "Abierta"})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Nombre Público Pacheca *</label>
          <input
            type="text"
            required
            placeholder="Ej. Sweater Olivia Nube"
            value={form.name_public}
            onChange={(e) => setForm({ ...form, name_public: e.target.value })}
            className="w-full text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Nombre Proveedor (Original)</label>
          <input
            type="text"
            placeholder="Ej. Sweater Olivia Lanilla"
            value={form.name_original}
            onChange={(e) => setForm({ ...form, name_original: e.target.value })}
            className="w-full text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Código Público Pacheca *</label>
          <input
            type="text"
            required
            placeholder="Ej. PAC-0015"
            value={form.code_public}
            onChange={(e) => setForm({ ...form, code_public: e.target.value })}
            className="w-full text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Código Proveedor (Original)</label>
          <input
            type="text"
            placeholder="Ej. SY-102"
            value={form.code_original}
            onChange={(e) => setForm({ ...form, code_original: e.target.value })}
            className="w-full text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Costo Original *</label>
          <input
            type="number"
            required
            value={form.price_original}
            onChange={(e) => setForm({ ...form, price_original: Number(e.target.value) })}
            className="w-full text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">IVA (%)</label>
          <input
            type="number"
            value={form.tax_percentage}
            onChange={(e) => setForm({ ...form, tax_percentage: Number(e.target.value) })}
            className="w-full text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Envío Asignado</label>
          <input
            type="number"
            value={form.assigned_shipping_cost}
            onChange={(e) => setForm({ ...form, assigned_shipping_cost: Number(e.target.value) })}
            className="w-full text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Otros Gastos</label>
          <input
            type="number"
            value={form.other_costs}
            onChange={(e) => setForm({ ...form, other_costs: Number(e.target.value) })}
            className="w-full text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Markup (%) *</label>
          <input
            type="number"
            required
            value={form.markup_percentage}
            onChange={(e) => setForm({ ...form, markup_percentage: Number(e.target.value) })}
            className="w-full text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Markup Fijo ($)</label>
          <input
            type="number"
            value={form.markup_fixed}
            onChange={(e) => setForm({ ...form, markup_fixed: Number(e.target.value) })}
            className="w-full text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Stock *</label>
          <input
            type="number"
            required
            value={form.stock_total}
            onChange={(e) => setForm({ ...form, stock_total: Number(e.target.value) })}
            className="w-full text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-text-dark mb-1">Imágenes del Producto (URLs separadas por coma)</label>
        <input
          type="text"
          placeholder="https://ejemplo.com/foto1.jpg, https://ejemplo.com/foto2.jpg"
          value={form.imagesRaw}
          onChange={(e) => setForm({ ...form, imagesRaw: e.target.value })}
          className="w-full text-xs"
        />
        <p className="text-[10px] text-text-muted mt-1">Pegá la URL directa de la imagen (terminada en .jpg, .webp, etc.). La primera imagen será la principal.</p>
        {form.imagesRaw && form.imagesRaw.split(",").map(u => u.trim()).filter(u => u).length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {form.imagesRaw.split(",").map(u => u.trim()).filter(u => u).map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Preview ${i + 1}`}
                className="h-14 w-14 object-cover rounded border border-border-brand"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Colores Disponibles (separados por coma)</label>
          <input
            type="text"
            placeholder="Rojo, Azul, Negro"
            value={form.colorsRaw}
            onChange={(e) => setForm({ ...form, colorsRaw: e.target.value })}
            className="w-full text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Estado de Publicación</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            className="w-full text-xs bg-white"
          >
            <option value="published">Publicado (visible en tienda)</option>
            <option value="draft">Borrador (oculto en tienda)</option>
          </select>
        </div>
      </div>

      {form.product_type !== "telas" && (
        <div>
          <label className="block text-xs font-semibold text-text-dark mb-1">Guía de Talles del Proveedor (Opcional)</label>
          <textarea
            rows={2}
            placeholder={"S: Busto 85-90cm, Largo 60cm\nM: Busto 90-95cm, Largo 62cm"}
            value={form.size_guide_text}
            onChange={(e) => setForm({ ...form, size_guide_text: e.target.value })}
            className="w-full text-xs"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-text-dark mb-1">Descripción Pública</label>
        <textarea
          rows={2}
          placeholder="Detalle comercial visible por los clientes..."
          value={form.description_public}
          onChange={(e) => setForm({ ...form, description_public: e.target.value })}
          className="w-full text-xs"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-brand pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-text-dark uppercase tracking-wider flex items-center">
            <Package className="h-5 w-5 mr-2 text-accent" />
            Catálogo Interno de Productos
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Administración de costos mayoristas, fórmulas de margen comercial, variantes y publicación.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Añadir Producto
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-success-bg border border-success/20 rounded text-xs text-success flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-border-brand rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por código, nombre público o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 text-xs"
          />
        </div>

        {/* Filters Selects */}
        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white py-1"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="text-xs bg-white py-1"
          >
            <option value="all">Todos los Proveedores</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white py-1"
          >
            <option value="all">Todos los Estados</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white border border-border-brand rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 skeleton w-full" />
            <div className="h-6 skeleton w-full" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-xs text-text-muted">
            No se registraron productos con los filtros especificados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-brand text-left text-xs">
              <thead className="bg-bg-light">
                <tr>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Artículo / Cód</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Proveedor</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Costo Neto (Prov)</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Margen / Markup</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Precio Final</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Ganancia Est.</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Stock</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase">Estado</th>
                  <th className="px-4 py-3 font-semibold text-text-muted uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-brand bg-white">
                {filteredProducts.map((p) => {
                  const supplier = suppliers.find(s => s.id === p.supplier_id);
                  const isDraft = p.status === "draft";
                  const profit = Number(p.estimated_profit);
                  const mainImg = getMainImage(p.id);

                  return (
                    <tr key={p.id} className="hover:bg-bg-light/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-bg-light border border-border-brand rounded flex items-center justify-center text-text-muted overflow-hidden shrink-0">
                            {mainImg ? (
                              <img
                                src={mainImg}
                                alt={p.name_public}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const el = e.target as HTMLImageElement;
                                  el.style.display = "none";
                                  el.nextElementSibling?.classList.remove("hidden");
                                }}
                              />
                            ) : null}
                            <Package className={`h-5 w-5 text-text-muted/40 ${mainImg ? "hidden" : ""}`} />
                          </div>
                          <div>
                            <span className="font-bold text-text-dark block">{p.name_public}</span>
                            <span className="text-[10px] text-text-muted block mt-0.5">PAC SKU: {p.code_public}</span>
                            <span className="text-[9px] text-text-muted italic block">Orig: {p.name_original} ({p.code_original || "N/A"})</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-text-muted">
                        {supplier?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-text-muted">
                        {formatCurrency(p.price_original)}
                        <span className="block text-[8px] text-text-muted mt-0.5">Total Costo: {formatCurrency(p.cost_total)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-text-dark">
                        {p.markup_percentage}%
                        {p.markup_fixed > 0 && <span className="block text-[9px] text-text-muted mt-0.5">+ {formatCurrency(p.markup_fixed)}</span>}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-text-dark text-sm">
                        {formatCurrency(p.price_final)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-success text-sm">
                        {formatCurrency(profit)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold whitespace-nowrap">
                        <span className={p.stock_total <= 0 ? "text-error font-bold" : "text-text-dark"}>
                          {p.stock_total} uds.
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isDraft ? "bg-amber-50 text-warning border-amber-200" : "bg-success-bg text-success border-success/20"
                        }`}>
                          {isDraft ? "Borrador" : "Publicado"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 border rounded transition-colors bg-white text-text-muted border-border-brand hover:bg-primary hover:text-white hover:border-primary"
                            title="Editar producto"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          {/* Toggle Status */}
                          <button
                            onClick={() => handleToggleStatus(p)}
                            className={`p-1.5 border rounded transition-colors ${
                              isDraft 
                                ? "bg-success-bg text-success border-success/20 hover:bg-success hover:text-white"
                                : "bg-amber-50 text-warning border-warning/20 hover:bg-warning hover:text-white"
                            }`}
                            title={isDraft ? "Publicar en tienda" : "Despublicar (guardar en borrador)"}
                          >
                            {isDraft ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                          {/* Delete */}
                          {confirmDeleteId === p.id ? (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 border rounded bg-error text-white border-error/20 hover:bg-red-700"
                                title="Confirmar eliminación"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="p-1.5 border rounded bg-white text-text-muted border-border-brand hover:bg-bg-light"
                                title="Cancelar"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(p.id)}
                              className="p-1.5 border rounded transition-colors bg-white text-error border-error/20 hover:bg-error hover:text-white"
                              title="Eliminar producto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE PRODUCT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-start justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-border-brand rounded-lg shadow-xl max-w-lg w-full p-6 relative my-8">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-dark"
            >
              <X className="h-4 w-4" />
            </button>
            
            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-2 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-accent" />
              Añadir Producto al Catálogo
            </h3>
            <p className="text-xs text-text-muted mb-6">
              Registrá un nuevo artículo. Las fórmulas de costo y precio de venta al público se aplicarán automáticamente.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {renderFormFields(newProduct, setNewProduct)}

              <div className="flex justify-end space-x-2 pt-4 border-t border-border-brand">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-border-brand text-text-muted hover:bg-bg-light text-xs font-semibold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Añadir al Catálogo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-start justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-border-brand rounded-lg shadow-xl max-w-lg w-full p-6 relative my-8">
            <button
              onClick={() => { setShowEditModal(false); setSelectedProduct(null); }}
              className="absolute right-4 top-4 text-text-muted hover:text-text-dark"
            >
              <X className="h-4 w-4" />
            </button>
            
            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-2 flex items-center">
              <Edit className="h-5 w-5 mr-2 text-accent" />
              Editar Producto
            </h3>
            <p className="text-xs text-text-muted mb-1">
              Editando: <span className="font-semibold text-text-dark">{selectedProduct.name_public}</span>
            </p>
            <p className="text-[10px] text-text-muted mb-6">Código: {selectedProduct.code_public}</p>

            <form onSubmit={handleEditProduct} className="space-y-4">
              {renderFormFields(editForm, setEditForm)}

              <div className="flex justify-end space-x-2 pt-4 border-t border-border-brand">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedProduct(null); }}
                  className="px-4 py-2 border border-border-brand text-text-muted hover:bg-bg-light text-xs font-semibold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-accent transition-colors disabled:opacity-60 flex items-center"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
