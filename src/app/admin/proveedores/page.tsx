"use client";

import React, { useState, useEffect } from "react";
import { db, Supplier } from "@/lib/db";
import { 
  Plus, Edit, Eye, Trash, Search, Mail, Phone, ExternalLink, 
  Check, X, AlertTriangle, Scale, Percent, Clock, DollarSign
} from "lucide-react";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selected supplier for viewing/editing
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState<Omit<Supplier, "id">>({
    name: "",
    slug_internal: "",
    website: "",
    catalog_url: "",
    contact_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    private_notes: "",
    is_active: true,
    requires_login: false,
    minimum_type: "monto_minimo",
    minimum_amount: 0,
    minimum_items: 0,
    currency: "ARS",
    tax_included: true,
    tax_percentage: 21,
    additional_costs: 0,
    estimated_shipping_cost: 0,
    estimated_delay_days: 7,
    conditions_summary: "",
    default_markup_percentage: 60,
    import_method: "manual",
    sync_status: "ok",
    sync_frequency: "manual",
    created_at: "",
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const list = await db.suppliers.list();
      setSuppliers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (sup: Supplier) => {
    setSelectedSupplier(sup);
    setFormData({
      name: sup.name,
      slug_internal: sup.slug_internal,
      website: sup.website || "",
      catalog_url: sup.catalog_url || "",
      contact_name: sup.contact_name || "",
      phone: sup.phone || "",
      whatsapp: sup.whatsapp || "",
      email: sup.email || "",
      private_notes: sup.private_notes || "",
      is_active: sup.is_active,
      requires_login: sup.requires_login,
      minimum_type: sup.minimum_type,
      minimum_amount: sup.minimum_amount,
      minimum_items: sup.minimum_items,
      currency: sup.currency,
      tax_included: sup.tax_included,
      tax_percentage: sup.tax_percentage,
      additional_costs: sup.additional_costs,
      estimated_shipping_cost: sup.estimated_shipping_cost,
      estimated_delay_days: sup.estimated_delay_days,
      conditions_summary: sup.conditions_summary || "",
      default_markup_percentage: sup.default_markup_percentage,
      import_method: sup.import_method,
      sync_status: sup.sync_status || "ok",
      sync_frequency: sup.sync_frequency || "manual",
      created_at: sup.created_at || new Date().toISOString(),
    });
    setIsEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      slug_internal: "",
      website: "",
      catalog_url: "",
      contact_name: "",
      phone: "",
      whatsapp: "",
      email: "",
      private_notes: "",
      is_active: true,
      requires_login: false,
      minimum_type: "monto_minimo",
      minimum_amount: 0,
      minimum_items: 0,
      currency: "ARS",
      tax_included: true,
      tax_percentage: 21,
      additional_costs: 0,
      estimated_shipping_cost: 0,
      estimated_delay_days: 7,
      conditions_summary: "",
      default_markup_percentage: 60,
      import_method: "manual",
      sync_status: "ok",
      sync_frequency: "manual",
      created_at: new Date().toISOString(),
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isCreateModalOpen) {
        // Slug generation from name
        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await db.suppliers.create({
          ...formData,
          slug_internal: slug,
        });
      } else if (isEditModalOpen && selectedSupplier) {
        await db.suppliers.update(selectedSupplier.id, formData);
      }
      
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
      loadSuppliers();
    } catch (e) {
      console.error(e);
      alert("Error al guardar el proveedor.");
    }
  };

  const handleToggleActive = async (sup: Supplier) => {
    try {
      await db.suppliers.update(sup.id, { is_active: !sup.is_active });
      loadSuppliers();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.slug_internal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMinimumLabel = (type: Supplier["minimum_type"], amount: number, items: number) => {
    switch (type) {
      case "monto_minimo":
        return `Monto Mín: $${amount.toLocaleString("es-AR")}`;
      case "cantidad_prendas":
        return `Cant. Mín: ${items} prendas`;
      case "monto_y_cantidad":
        return `Mín: $${amount.toLocaleString("es-AR")} y ${items} prendas`;
      case "sin_minimo":
        return "Sin Mínimo";
      default:
        return "Pendiente de Confirmación";
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark font-display uppercase tracking-wider">Proveedores</h1>
          <p className="text-xs text-text-muted mt-1">
            Administrá los contactos comerciales, condiciones de compra mínima, recargos y márgenes predeterminados por proveedor.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center px-4 py-2 bg-primary text-white hover:bg-accent rounded text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-border-brand rounded-lg p-4 flex items-center shadow-2xs">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre, contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 text-xs"
          />
        </div>
      </div>

      {/* Supplier Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-44 skeleton" />
          <div className="h-44 skeleton" />
          <div className="h-44 skeleton" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-border-brand rounded-lg p-12 text-center text-xs text-text-muted">
          <Scale className="h-10 w-10 mx-auto text-text-muted mb-3 opacity-60" />
          No se encontraron proveedores.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sup) => (
            <div
              key={sup.id}
              className={`bg-white border rounded-lg p-5 shadow-2xs hover-card flex flex-col justify-between space-y-4 ${
                sup.is_active ? "border-border-brand" : "border-red-200 bg-red-50/10"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-text-dark font-display tracking-wide uppercase">
                      {sup.name}
                    </h3>
                    <span className="text-[10px] text-text-muted block font-semibold uppercase">ID: {sup.slug_internal}</span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(sup)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      sup.is_active 
                        ? "bg-success-bg text-success border-success/15" 
                        : "bg-red-50 text-error border-red-100"
                    }`}
                  >
                    {sup.is_active ? "Activo" : "Inactivo"}
                  </button>
                </div>

                <div className="pt-2 border-t border-border-brand/60 space-y-1.5 text-xs text-text-muted">
                  {sup.contact_name && (
                    <p>
                      <strong>Contacto:</strong> {sup.contact_name}
                    </p>
                  )}
                  {(sup.whatsapp || sup.phone) && (
                    <p className="flex items-center">
                      <Phone className="h-3.5 w-3.5 mr-1.5 text-text-muted" />
                      <span>{sup.whatsapp || sup.phone}</span>
                    </p>
                  )}
                  {sup.email && (
                    <p className="flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1.5 text-text-muted" />
                      <span className="truncate">{sup.email}</span>
                    </p>
                  )}
                </div>

                {/* Purchase conditions block */}
                <div className="p-3 bg-bg-light rounded-md text-xs space-y-1 text-text-dark">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-accent">
                    <span>Condiciones</span>
                    <span className="font-semibold text-text-muted normal-case font-mono">{sup.import_method}</span>
                  </div>
                  <p className="font-semibold">{getMinimumLabel(sup.minimum_type, sup.minimum_amount, sup.minimum_items)}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border-brand/40 text-[10px] text-text-muted">
                    <span>Markup: {sup.default_markup_percentage}%</span>
                    <span>Entrega: {sup.estimated_delay_days} días</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border-brand flex justify-end space-x-2">
                {sup.catalog_url && (
                  <a
                    href={sup.catalog_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 border border-border-brand rounded text-text-muted hover:text-text-dark transition-colors"
                    title="Ver Catálogo del Proveedor"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={() => handleOpenEdit(sup)}
                  className="flex items-center px-3 py-1.5 border border-border-brand rounded text-xs text-text-muted hover:text-text-dark transition-colors"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} />
          <div className="relative bg-white border border-border-brand rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-border-brand pb-3">
              <h3 className="font-bold text-sm text-text-dark uppercase tracking-wider font-display">
                {isCreateModalOpen ? "Nuevo Proveedor" : "Editar Proveedor"}
              </h3>
              <button 
                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} 
                className="text-text-muted hover:text-text-dark"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-6 text-xs">
              {/* Main Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Nombre Comercial *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs"
                    placeholder="Ej. Cheta Jeans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Nombre Corto / Código Interno (Slug)</label>
                  <input
                    type="text"
                    disabled={isEditModalOpen}
                    value={formData.slug_internal}
                    onChange={(e) => setFormData({ ...formData, slug_internal: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                    className="w-full text-xs bg-bg-light disabled:opacity-70"
                    placeholder="Auto-generado si se deja en blanco"
                  />
                </div>
              </div>

              {/* Contacts info */}
              <div className="border-t border-border-brand pt-4 space-y-4">
                <h4 className="text-[10px] font-bold text-accent uppercase tracking-wider">Contactos & Links</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Nombre de Contacto</label>
                    <input
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="w-full text-xs"
                      placeholder="Ej. Martín Pérez"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full text-xs"
                      placeholder="Ej. 5491122334455"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs"
                      placeholder="proveedor@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Sitio Web</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full text-xs"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-text-dark mb-1">Link de Catálogo Online</label>
                    <input
                      type="url"
                      value={formData.catalog_url}
                      onChange={(e) => setFormData({ ...formData, catalog_url: e.target.value })}
                      className="w-full text-xs"
                      placeholder="Ej. Catalogo Drive / Web Mayorista..."
                    />
                  </div>
                </div>
              </div>

              {/* Purchase targets and margins */}
              <div className="border-t border-border-brand pt-4 space-y-4">
                <h4 className="text-[10px] font-bold text-accent uppercase tracking-wider">Reglas de Compra & Costos</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Criterio Mínimo Ronda</label>
                    <select
                      value={formData.minimum_type}
                      onChange={(e) => setFormData({ ...formData, minimum_type: e.target.value as any })}
                      className="w-full text-xs bg-white"
                    >
                      <option value="monto_minimo">Monto Mínimo (ARS)</option>
                      <option value="cantidad_prendas">Cantidad de Prendas</option>
                      <option value="monto_y_cantidad">Monto y Cantidad</option>
                      <option value="sin_minimo">Sin Mínimo de Compra</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Monto Mínimo ($)</label>
                    <input
                      type="number"
                      value={formData.minimum_amount}
                      onChange={(e) => setFormData({ ...formData, minimum_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Prendas Mínimas</label>
                    <input
                      type="number"
                      value={formData.minimum_items}
                      onChange={(e) => setFormData({ ...formData, minimum_items: parseInt(e.target.value) || 0 })}
                      className="w-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Markup Predeterminado (%)</label>
                    <div className="relative">
                      <Percent className="absolute right-3 top-2.5 h-4 w-4 text-text-muted" />
                      <input
                        type="number"
                        value={formData.default_markup_percentage}
                        onChange={(e) => setFormData({ ...formData, default_markup_percentage: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs pr-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Demora Estimada (Días)</label>
                    <div className="relative">
                      <Clock className="absolute right-3 top-2.5 h-4 w-4 text-text-muted" />
                      <input
                        type="number"
                        value={formData.estimated_delay_days}
                        onChange={(e) => setFormData({ ...formData, estimated_delay_days: parseInt(e.target.value) || 0 })}
                        className="w-full text-xs pr-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Costo Envío Estimado ($)</label>
                    <input
                      type="number"
                      value={formData.estimated_shipping_cost}
                      onChange={(e) => setFormData({ ...formData, estimated_shipping_cost: parseFloat(e.target.value) || 0 })}
                      className="w-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Tipo Importación</label>
                    <select
                      value={formData.import_method}
                      onChange={(e) => setFormData({ ...formData, import_method: e.target.value as any })}
                      className="w-full text-xs bg-white"
                    >
                      <option value="manual">Carga Manual</option>
                      <option value="csv">Archivo CSV</option>
                      <option value="excel">Archivo Excel</option>
                      <option value="url_scraper">Scraper Web URL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">Moneda Base</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full text-xs bg-white"
                    >
                      <option value="ARS">Pesos Argentinos ($)</option>
                      <option value="USD">Dólares Estadounidenses (US$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-dark mb-1">¿IVA Incluido en Costo original?</label>
                    <select
                      value={formData.tax_included ? "true" : "false"}
                      onChange={(e) => setFormData({ ...formData, tax_included: e.target.value === "true" })}
                      className="w-full text-xs bg-white"
                    >
                      <option value="true">Sí (IVA Incluido)</option>
                      <option value="false">No (Sumar IVA)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Private Notes & Conditions Summary */}
              <div className="border-t border-border-brand pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Resumen de Condiciones de Compra</label>
                  <input
                    type="text"
                    value={formData.conditions_summary}
                    onChange={(e) => setFormData({ ...formData, conditions_summary: e.target.value })}
                    className="w-full text-xs"
                    placeholder="Ej. Descuento 5% superando los $500.000."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Notas Privadas / Observaciones Administrativas</label>
                  <textarea
                    rows={3}
                    value={formData.private_notes}
                    onChange={(e) => setFormData({ ...formData, private_notes: e.target.value })}
                    className="w-full text-xs"
                    placeholder="Detalles sobre facturación, demoras habituales, reclamos..."
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-border-brand flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 border border-border-brand hover:bg-bg-light rounded font-semibold text-text-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-accent text-white rounded font-semibold uppercase tracking-wider"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
