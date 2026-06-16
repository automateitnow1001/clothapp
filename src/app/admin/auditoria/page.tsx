"use client";

import React, { useState, useEffect } from "react";
import { db, AuditLog } from "@/lib/db";
import { 
  ClipboardList, Search, Filter, Shield, Eye, Calendar,
  User, ArrowRight, HelpCircle, HardDrive, RefreshCw
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  
  // Selected log for detailed view modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const list = await db.audit.list();
      setLogs(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const actions: { [key: string]: { bg: string, label: string } } = {
      login: { bg: "bg-blue-50 text-blue-600 border-blue-100", label: "Login" },
      create: { bg: "bg-success-bg text-success border-success/15", label: "Creación" },
      update: { bg: "bg-amber-50 text-warning border-amber-200", label: "Modificación" },
      delete: { bg: "bg-red-50 text-error border-red-250", label: "Eliminación" },
      catalog_import: { bg: "bg-purple-50 text-purple-600 border-purple-100", label: "Importación Masiva" },
      ledger_entry: { bg: "bg-gray-100 text-text-dark border-gray-200", label: "Ajuste Cuenta Cte" },
      payment_approval: { bg: "bg-emerald-50 text-emerald-600 border-emerald-150", label: "Aprobación Pago" }
    };
    
    const info = actions[action] || { bg: "bg-gray-50 text-text-muted border-gray-200", label: action };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border ${info.bg}`}>
        {info.label.toUpperCase()}
      </span>
    );
  };

  // Filter logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (log.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (log.action_type?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (log.reason?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesAction = actionTypeFilter === "all" || log.action_type === actionTypeFilter;
    const matchesEntity = entityFilter === "all" || log.entity_name === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  // Extract unique action types and entities for dropdowns
  const actionTypes = Array.from(new Set(logs.map(l => l.action_type)));
  const entities = Array.from(new Set(logs.map(l => l.entity_name)));

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-border-brand pb-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark font-display uppercase tracking-wider">Bitácora de Auditoría</h1>
          <p className="text-xs text-text-muted mt-1">
            Historial detallado de operaciones críticas sobre stock, precios, cobros y cuentas corrientes realizados por administradores.
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="p-2 border border-border-brand rounded hover:bg-bg-light transition-colors text-text-muted hover:text-text-dark"
          title="Refrescar logs"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-border-brand rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-2xs">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por usuario, motivo, etc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-text-muted" />
            <select
              value={actionTypeFilter}
              onChange={(e) => setActionTypeFilter(e.target.value)}
              className="text-xs bg-white py-1 pr-8 w-full sm:w-auto"
            >
              <option value="all">Todas las Operaciones</option>
              {actionTypes.map(at => (
                <option key={at} value={at}>{at}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <HardDrive className="h-3.5 w-3.5 text-text-muted" />
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="text-xs bg-white py-1 pr-8 w-full sm:w-auto"
            >
              <option value="all">Todas las Entidades</option>
              {entities.map(ent => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main logs list */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-10 skeleton w-full" />
          <div className="h-16 skeleton w-full" />
          <div className="h-16 skeleton w-full" />
          <div className="h-16 skeleton w-full" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white border border-border-brand rounded-lg p-12 text-center text-xs text-text-muted shadow-2xs">
          <Shield className="h-10 w-10 mx-auto text-text-muted mb-3 opacity-60" />
          No se encontraron registros de auditoría que coincidan.
        </div>
      ) : (
        <div className="bg-white border border-border-brand rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border-brand bg-bg-light text-[10px] uppercase font-bold text-text-muted">
                  <th className="py-3 px-4">Fecha & Hora</th>
                  <th className="py-3 px-3">Operación</th>
                  <th className="py-3 px-3">Operador (Email)</th>
                  <th className="py-3 px-3">Entidad Afectada</th>
                  <th className="py-3 px-3">Descripción / Motivo</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-brand/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg-light/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-text-muted whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-3.5 px-3">
                      {getActionBadge(log.action_type)}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-text-dark">
                      {log.user_email || "admin@pacheca.com.ar"}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-semibold text-accent font-mono uppercase text-[10px]">{log.entity_name}</span>
                      {log.entity_id && (
                        <span className="text-[10px] text-text-muted ml-1.5 font-mono">({log.entity_id})</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-text-muted max-w-xs truncate">
                      {log.reason || "Operación administrativa estándar registrada."}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1 border border-border-brand rounded hover:bg-bg-light text-text-muted hover:text-text-dark transition-colors inline-flex items-center"
                        title="Ver detalles antes/después"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedLog(null)} />
          <div className="relative bg-white border border-border-brand rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-border-brand pb-3">
              <h3 className="font-bold text-sm text-text-dark uppercase tracking-wider font-display flex items-center">
                <Shield className="h-4.5 w-4.5 mr-2 text-accent" />
                Detalle de Auditoría
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-text-muted hover:text-text-dark">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-border-brand/60 pb-4">
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold">Fecha de Registro</p>
                  <p className="font-bold text-text-dark mt-0.5">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold">Tipo de Acción</p>
                  <div className="mt-0.5">{getActionBadge(selectedLog.action_type)}</div>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold">Usuario / Operador</p>
                  <p className="font-bold text-text-dark mt-0.5">{selectedLog.user_email || "admin@pacheca.com.ar"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold">Entidad Afectada</p>
                  <p className="font-mono font-bold text-accent mt-0.5">{selectedLog.entity_name} ({selectedLog.entity_id || "N/A"})</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Descripción de la Operación</p>
                <div className="p-3 bg-bg-light border border-border-brand rounded text-text-dark leading-relaxed font-semibold">
                  {selectedLog.reason || "Operación registrada por el sistema administrativo de control."}
                </div>
              </div>

              {/* Before and After details blocks */}
              {(selectedLog.previous_values || selectedLog.new_values) && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold text-accent uppercase tracking-wider border-b border-border-brand pb-1.5">
                    Cotejo de Valores (Historial)
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Estado Previo</span>
                      <pre className="p-3 bg-bg-light border border-border-brand rounded font-mono text-[10px] overflow-auto max-h-40 max-w-full text-text-muted">
                        {selectedLog.previous_values ? JSON.stringify(selectedLog.previous_values, null, 2) : "N/A (Nueva Entidad)"}
                      </pre>
                    </div>

                    {/* After */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-accent uppercase tracking-wider block">Estado Nuevo</span>
                      <pre className="p-3 bg-bg-light border border-border-brand rounded font-mono text-[10px] overflow-auto max-h-40 max-w-full text-text-dark font-semibold">
                        {selectedLog.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : "N/A (Registro Eliminado)"}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {selectedLog.ip_address && (
                <div className="pt-2 text-[10px] text-text-muted flex justify-between">
                  <span>Dirección IP de conexión:</span>
                  <span className="font-mono">{selectedLog.ip_address}</span>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-border-brand flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 border border-border-brand hover:bg-bg-light rounded font-semibold text-text-muted"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline X SVG since lucide X can be imported, let's keep X import in imports list
const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
