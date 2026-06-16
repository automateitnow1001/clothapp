"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { db, mockDb, Product, Category } from "@/lib/db";
import { Search, SlidersHorizontal, Package, ArrowUpDown, X, Heart } from "lucide-react";

function CatalogContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Occasions / Tag Filters
  const [activeFilter, setActiveFilter] = useState("all");
  const [promoOnly, setPromoOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);

  // Mobile filters sidebar toggle
  const [showFilters, setShowFilters] = useState(false);

  // Gender filter
  const [genderFilter, setGenderFilter] = useState<"all" | "mujer" | "hombre">("all");

  // Load basic data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const prodList = await db.products.list();
        const publishedProducts = prodList.filter(p => p.status === "published");
        setProducts(publishedProducts);

        const catList = await db.categories.list();
        setCategories(catList);

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

  // Parse search params on load or change
  useEffect(() => {
    if (categories.length === 0) return;

    const qParam = searchParams.get("q");
    if (qParam) setSearchTerm(qParam);

    const catParam = searchParams.get("cat");
    if (catParam) {
      const found = categories.find(
        (c) => c.slug.toLowerCase() === catParam.toLowerCase()
      );
      if (found) {
        setSelectedCategory(found.id);
      }
    }

    const filterParam = searchParams.get("filter");
    if (filterParam) {
      setActiveFilter(filterParam);
    }

    const promoParam = searchParams.get("promo");
    if (promoParam === "true") {
      setPromoOnly(true);
    }

    const newParam = searchParams.get("new");
    if (newParam === "true") {
      setNewOnly(true);
    }
  }, [searchParams, categories]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem("pacheca_favorites", JSON.stringify(next));
      return next;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name_public.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code_public.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory;

    let matchesAvailability = true;
    if (selectedAvailability !== "all") {
      if (selectedAvailability === "disponible") {
        matchesAvailability = p.availability === "disponible" || p.availability === "disponible_en_local";
      } else {
        matchesAvailability = p.availability === selectedAvailability;
      }
    }

    let matchesFilter = true;
    if (activeFilter !== "all") {
      const f = activeFilter.toLowerCase();
      const sub = (p.subcategory || "").toLowerCase();
      if (f === "casual") {
        matchesFilter = p.tags.includes("casual") || sub === "básicos" || p.tags.includes("esencial") || p.tags.includes("algodon");
      } else if (f === "trabajo") {
        matchesFilter = p.tags.includes("trabajo") || sub === "camisas" || sub === "blusas" || p.tags.includes("lino");
      } else if (f === "salida") {
        matchesFilter = p.tags.includes("lencero") || p.tags.includes("encaje") || sub === "tops" || p.tags.includes("salida");
      } else if (f === "conjuntos") {
        matchesFilter = p.name_public.toLowerCase().includes("conjunto") || p.tags.includes("conjunto");
      } else if (f === "abrigos") {
        matchesFilter = p.category_id === "c2" || p.tags.includes("abrigo") || p.tags.includes("sweater") || p.tags.includes("cardigan");
      } else if (f === "talles-especiales") {
        matchesFilter = true;
      } else {
        matchesFilter = p.tags.includes(f) || sub === f;
      }
    }

    const matchesPromo = !promoOnly || (p.price_promo !== undefined && p.price_promo !== null && p.price_promo > 0);
    const matchesNew = !newOnly || p.tags.includes("nuevo") || p.id === "pr1" || p.id === "pr2" || p.id === "pr3";

    const matchesGender = genderFilter === "all" ||
      categories.some(cat => cat.id === p.category_id && (cat.gender === genderFilter || cat.gender === "unisex"));

    return matchesSearch && matchesCategory && matchesAvailability && matchesFilter && matchesPromo && matchesNew && matchesGender;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") {
      const pA = a.price_promo || a.price_final;
      const pB = b.price_promo || b.price_final;
      return pA - pB;
    }
    if (sortBy === "price_desc") {
      const pA = a.price_promo || a.price_final;
      const pB = b.price_promo || b.price_final;
      return pB - pA;
    }
    if (sortBy === "name_asc") {
      return a.name_public.localeCompare(b.name_public);
    }
    return 0;
  });

  const getAvailabilityLabel = (status: Product["availability"]) => {
    const states = {
      disponible: { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Disponible" },
      disponible_en_local: { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "En Local" },
      por_encargo: { bg: "bg-neutral-50 text-neutral-600 border-neutral-200", label: "A Pedido" },
      preventa: { bg: "bg-amber-50 text-amber-700 border-amber-100", label: "Preventa" },
      poca_disponibilidad: { bg: "bg-rose-50 text-rose-700 border-rose-100", label: "Últimos" },
      agotado: { bg: "bg-red-50 text-red-600 border-red-200", label: "Agotado" },
      pendiente_de_confirmacion: { bg: "bg-gray-50 text-gray-500 border-gray-200", label: "Consultar Stock" },
    };

    const info = states[status] || { bg: "bg-gray-50 text-gray-500 border-gray-200", label: status };
    return (
      <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${info.bg}`}>
        {info.label}
      </span>
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedAvailability("all");
    setActiveFilter("all");
    setPromoOnly(false);
    setNewOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-12 space-y-8">
      
      {/* Banner / Title */}
      <div className="border-b border-[#EADED2] pb-6 text-left">
        <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-2 block">Boutique Pacheca</span>
        <h1 className="text-3xl md:text-4xl font-serif text-black tracking-wide">
          Nuestra Colección
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-3xl leading-relaxed">
          Explorá nuestras prendas seleccionadas. Podés comprar lo disponible de forma inmediata o reservar artículos por encargo para la próxima ronda de compras de la boutique.
        </p>
      </div>

      {/* Gender Tabs */}
      <div className="flex items-center gap-2 border border-[#EADED2] bg-white rounded-sm p-1.5 w-fit shadow-2xs">
        {([
          { value: "all", label: "✦ Todos" },
          { value: "mujer", label: "♀ Mujer" },
          { value: "hombre", label: "♂ Hombre" },
        ] as const).map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setGenderFilter(opt.value); setSelectedCategory("all"); }}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${
              genderFilter === opt.value
                ? "bg-black text-white shadow-sm"
                : "text-gray-500 hover:bg-[#FCFAF7] hover:text-black"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Filters Sidebar + Catalog Grid */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Filters Sidebar (Desktop) */}
        <aside className="w-full lg:w-64 bg-white border border-[#EADED2] rounded-sm p-6 shrink-0 hidden lg:block space-y-6">
          <div className="flex items-center justify-between border-b border-[#EADED2] pb-4">
            <h3 className="text-xs font-bold text-black uppercase tracking-widest flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filtros
            </h3>
            {(selectedCategory !== "all" || selectedAvailability !== "all" || activeFilter !== "all" || promoOnly || newOnly || searchTerm) && (
              <button onClick={clearAllFilters} className="text-[10px] text-gray-400 hover:text-black uppercase tracking-wider font-bold">
                Limpiar
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoría</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-sm transition-colors uppercase tracking-wider font-semibold ${
                  selectedCategory === "all" ? "bg-black text-white" : "text-gray-600 hover:bg-[#FCFAF7] hover:text-black"
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-sm transition-colors flex justify-between items-center uppercase tracking-wider ${
                    selectedCategory === cat.id ? "bg-black text-white font-semibold" : "text-gray-600 hover:bg-[#FCFAF7] hover:text-black"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[9px] ${selectedCategory === cat.id ? "text-white" : "text-gray-400"}`}>
                    ({products.filter(p => p.category_id === cat.id).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Gender filter in sidebar */}
          <div className="space-y-3 pt-4 border-t border-[#EADED2]">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sección</h4>
            <div className="space-y-1.5">
              {([{ value: "all", label: "Todo" }, { value: "mujer", label: "♀ Mujer" }, { value: "hombre", label: "♂ Hombre" }] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setGenderFilter(opt.value); setSelectedCategory("all"); }}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-sm transition-colors uppercase tracking-wider font-semibold ${
                    genderFilter === opt.value ? "bg-black text-white" : "text-gray-600 hover:bg-[#FCFAF7] hover:text-black"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Occasions / Tag Filters */}
          <div className="space-y-3 pt-4 border-t border-[#EADED2]">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estilos y Ocasiones</h4>
            <div className="space-y-1.5">
              {[
                { value: "all", label: "Todos los estilos" },
                { value: "casual", label: "Para todos los días" },
                { value: "trabajo", label: "Para trabajar" },
                { value: "salida", label: "Para salir" },
                { value: "conjuntos", label: "Conjuntos" },
                { value: "abrigos", label: "Abrigos / Sweaters" },
                { value: "talles-especiales", label: "Talles Especiales" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-sm transition-colors uppercase tracking-wider ${
                    activeFilter === opt.value ? "bg-black text-white font-semibold" : "text-gray-600 hover:bg-[#FCFAF7] hover:text-black"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-3 pt-4 border-t border-[#EADED2]">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destacados</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <label className="flex items-center space-x-2.5 cursor-pointer hover:text-black">
                <input
                  type="checkbox"
                  checked={promoOnly}
                  onChange={(e) => setPromoOnly(e.target.checked)}
                  className="h-3.5 w-3.5 accent-black rounded-sm"
                />
                <span className="uppercase tracking-wider">Promociones</span>
              </label>
              <label className="flex items-center space-x-2.5 cursor-pointer hover:text-black">
                <input
                  type="checkbox"
                  checked={newOnly}
                  onChange={(e) => setNewOnly(e.target.checked)}
                  className="h-3.5 w-3.5 accent-black rounded-sm"
                />
                <span className="uppercase tracking-wider">Nuevos Ingresos</span>
              </label>
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-3 pt-4 border-t border-[#EADED2]">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disponibilidad</h4>
            <div className="space-y-2 text-xs text-gray-600">
              {[
                { value: "all", label: "Mostrar Todo" },
                { value: "disponible", label: "En Stock / Local" },
                { value: "por_encargo", label: "A Pedido" },
                { value: "preventa", label: "Preventa" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center space-x-2.5 cursor-pointer hover:text-black">
                  <input
                    type="radio"
                    name="availability_filter"
                    checked={selectedAvailability === opt.value}
                    onChange={() => setSelectedAvailability(opt.value)}
                    className="h-3.5 w-3.5 accent-black"
                  />
                  <span className="uppercase tracking-wider">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Catalog Content Area */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Controls Bar (Search, Sort, Mobile Filter Button) */}
          <div className="bg-white border border-[#EADED2] rounded-sm p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-2xs">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs text-left">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar prendas o códigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#FCFAF7] border border-[#EADED2] focus:border-black outline-none transition-colors rounded-sm"
              />
            </div>

            {/* Mobile Filters Toggle & Sort */}
            <div className="flex gap-4 w-full sm:w-auto justify-between sm:justify-end items-center">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center px-4 py-2.5 border border-[#EADED2] bg-white rounded-sm text-xs font-bold text-black hover:bg-[#FCFAF7] uppercase tracking-wider"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
              </button>

              <div className="flex items-center space-x-2 text-xs">
                <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-[#EADED2] py-2 px-3 focus:border-black outline-none rounded-sm font-semibold uppercase tracking-wider text-[10px] text-black"
                >
                  <option value="default">Relevancia</option>
                  <option value="price_asc">Precio: Menor a Mayor</option>
                  <option value="price_desc">Precio: Mayor a Menor</option>
                  <option value="name_asc">Nombre: A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Filter Sidebar Drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowFilters(false)} />
              <div className="relative w-72 max-w-xs bg-white h-full p-6 flex flex-col space-y-6 overflow-y-auto z-10 text-left">
                <div className="flex justify-between items-center border-b border-[#EADED2] pb-4">
                  <h3 className="text-xs font-bold text-black uppercase tracking-widest flex items-center">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros de Búsqueda
                  </h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-black">
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Categories inside drawer */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoría</h4>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => { setSelectedCategory("all"); setShowFilters(false); }}
                      className={`w-full text-left text-xs py-2 px-2.5 rounded-sm uppercase tracking-wider ${
                        selectedCategory === "all" ? "bg-black text-white font-bold" : "text-gray-600 hover:bg-[#FCFAF7]"
                      }`}
                    >
                      Todas
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.id); setShowFilters(false); }}
                        className={`w-full text-left text-xs py-2 px-2.5 rounded-sm flex justify-between items-center uppercase tracking-wider ${
                          selectedCategory === cat.id ? "bg-black text-white font-bold" : "text-gray-600 hover:bg-[#FCFAF7]"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="opacity-60 text-[9px]">{products.filter(p => p.category_id === cat.id).length}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasions inside drawer */}
                <div className="space-y-3 pt-4 border-t border-[#EADED2]">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estilos y Ocasiones</h4>
                  <div className="space-y-1.5">
                    {[
                      { value: "all", label: "Todos los estilos" },
                      { value: "casual", label: "Para todos los días" },
                      { value: "trabajo", label: "Para trabajar" },
                      { value: "salida", label: "Para salir" },
                      { value: "conjuntos", label: "Conjuntos" },
                      { value: "abrigos", label: "Abrigos / Sweaters" },
                      { value: "talles-especiales", label: "Talles Especiales" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setActiveFilter(opt.value); setShowFilters(false); }}
                        className={`w-full text-left text-xs py-2 px-2.5 rounded-sm uppercase tracking-wider ${
                          activeFilter === opt.value ? "bg-black text-white font-bold" : "text-gray-600 hover:bg-[#FCFAF7]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Highligts inside drawer */}
                <div className="space-y-3 pt-4 border-t border-[#EADED2]">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destacados</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <label className="flex items-center space-x-2.5 cursor-pointer hover:text-black">
                      <input
                        type="checkbox"
                        checked={promoOnly}
                        onChange={(e) => { setPromoOnly(e.target.checked); setShowFilters(false); }}
                        className="h-3.5 w-3.5 accent-black rounded-sm"
                      />
                      <span className="uppercase tracking-wider">Promociones</span>
                    </label>
                    <label className="flex items-center space-x-2.5 cursor-pointer hover:text-black">
                      <input
                        type="checkbox"
                        checked={newOnly}
                        onChange={(e) => { setNewOnly(e.target.checked); setShowFilters(false); }}
                        className="h-3.5 w-3.5 accent-black rounded-sm"
                      />
                      <span className="uppercase tracking-wider">Nuevos Ingresos</span>
                    </label>
                  </div>
                </div>

                {/* Availability inside drawer */}
                <div className="space-y-3 pt-4 border-t border-[#EADED2]">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disponibilidad</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    {[
                      { value: "all", label: "Mostrar Todo" },
                      { value: "disponible", label: "En Stock / Local" },
                      { value: "por_encargo", label: "A Pedido" },
                      { value: "preventa", label: "Preventa" },
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center space-x-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="availability_filter_mob"
                          checked={selectedAvailability === opt.value}
                          onChange={() => { setSelectedAvailability(opt.value); setShowFilters(false); }}
                          className="h-3.5 w-3.5 accent-black"
                        />
                        <span className="uppercase tracking-wider">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Catalog Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              <div className="h-72 skeleton" />
              <div className="h-72 skeleton" />
              <div className="h-72 skeleton" />
              <div className="h-72 skeleton" />
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20 text-xs text-gray-400 bg-white border border-[#EADED2] rounded-sm shadow-2xs">
              <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              No encontramos prendas que coincidan con la búsqueda.
              <button onClick={clearAllFilters} className="block mx-auto mt-4 text-xs font-bold text-black underline uppercase tracking-wider">
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {sortedProducts.map((p) => {
                const isPromo = p.price_promo !== undefined && p.price_promo !== null && p.price_promo > 0;
                const image = mockDb.product_images.find(pi => pi.product_id === p.id)?.url_public || `/images/dsc00472-05a44cdc4d83da11b717561176996330-1024-1024.webp`;
                
                return (
                  <div
                    key={p.id}
                    className="bg-white border border-[#EADED2] shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-sm transition-shadow group relative rounded-sm"
                  >
                    {/* Heart Favorite Toggle Icon */}
                    <button
                      onClick={(e) => toggleFavorite(p.id, e)}
                      className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/95 border border-[#EADED2] flex items-center justify-center shadow-2xs text-gray-400 hover:text-black z-10 transition-colors"
                      title={favorites.includes(p.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                      <Heart 
                        className={`h-4.5 w-4.5 transition-colors ${
                          favorites.includes(p.id) 
                            ? "fill-black text-black" 
                            : "text-gray-400 group-hover:text-gray-600"
                        }`} 
                      />
                    </button>

                    {/* Image */}
                    <Link href={`/producto/${p.slug_public}`} className="aspect-square bg-[#FCFAF7] relative overflow-hidden flex items-center justify-center border-b border-[#EADED2] shrink-0">
                      <img
                        src={image}
                        alt={p.name_public}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {isPromo && (
                        <span className="absolute top-2.5 left-2.5 bg-black text-white text-[9px] font-bold px-2 py-0.5 shadow-2xs uppercase tracking-widest font-mono">
                          Promo
                        </span>
                      )}
                    </Link>

                    {/* Description & metadata */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1 text-left">
                        <div className="flex justify-between items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Cód: {p.code_public}</span>
                          {getAvailabilityLabel(p.availability)}
                        </div>
                        <Link href={`/producto/${p.slug_public}`} className="font-serif text-[13px] text-black block line-clamp-2 hover:text-gray-600 transition-colors">
                          {p.name_public}
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-[#EADED2] flex items-center justify-between">
                        <div>
                          {isPromo ? (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs font-bold text-black font-mono">
                                {formatCurrency(p.price_promo!)}
                              </span>
                              <span className="text-[10px] text-gray-400 line-through font-mono">
                                {formatCurrency(p.price_final)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-black font-mono">
                              {formatCurrency(p.price_final)}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/producto/${p.slug_public}`}
                          className="text-[9px] font-bold uppercase tracking-wider text-black hover:text-gray-600 flex items-center gap-1"
                        >
                          Ver →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default function PublicCatalogPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow bg-[#FCFAF7] text-[#111]">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-5 py-12 text-center text-xs text-gray-400">
            Cargando Colección Pacheca...
          </div>
        }>
          <CatalogContent />
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
