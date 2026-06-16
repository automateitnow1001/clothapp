"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db, WorkShift, Profile } from "@/lib/db";
import { 
  Calendar, Clock, DollarSign, CalendarRange, UserPlus, 
  Trash2, Edit, AlertCircle, CheckCircle, Info, ToggleLeft, ToggleRight, X,
  ClipboardList
} from "lucide-react";

const HOURLY_RATE = 6000;

export default function MisCobrosPage() {
  const { user, role } = useAuth();
  
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // View states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [adminBypass, setAdminBypass] = useState(false);
  
  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingShift, setEditingShift] = useState<WorkShift | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    start_time: "09:00",
    end_time: "12:00",
    notes: "",
  });
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isAdminOrDev = role === "administrator" || user?.email === "gabriela@somospacheca.com.ar";

  const loadData = async () => {
    setLoading(true);
    try {
      const listShifts = await db.workShifts.list();
      setShifts(listShifts);
      
      const listProfiles = await db.profiles.list();
      // Keep only Paola (p2) and Yamila (p12)
      const staffProfiles = listProfiles.filter(p => p.id === "p2" || p.id === "p12");
      setProfiles(staffProfiles);
      
      if (!selectedEmployeeId) {
        if (isAdminOrDev) {
          // Default to Paola for admin view
          setSelectedEmployeeId("p2");
        } else if (user) {
          setSelectedEmployeeId(user.id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, role]);

  const getHours = (start: string, end: string): number => {
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    const totalMinutes = (eH * 60 + eM) - (sH * 60 + sM);
    return Math.max(0, totalMinutes / 60);
  };

  const handleOpenCreate = () => {
    setErrorMsg(null);
    setEditingShift(null);
    // Set default date to a valid future date (+2 days if employee)
    const defaultDate = new Date();
    if (!isAdminOrDev) {
      defaultDate.setDate(defaultDate.getDate() + 2);
    }
    const formattedDefaultDate = defaultDate.toISOString().split("T")[0];
    
    setFormData({
      date: formattedDefaultDate,
      start_time: "09:00",
      end_time: "13:00",
      notes: "",
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (shift: WorkShift) => {
    setErrorMsg(null);
    setEditingShift(shift);
    setFormData({
      date: shift.date,
      start_time: shift.start_time,
      end_time: shift.end_time,
      notes: shift.notes || "",
    });
    setShowFormModal(true);
  };

  const validateShiftDate = (dateStr: string): boolean => {
    if (isAdminOrDev && adminBypass) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    
    // Difference in milliseconds
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 2;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const shiftEmployeeId = isAdminOrDev ? selectedEmployeeId : user?.id;
    if (!shiftEmployeeId) {
      setErrorMsg("Debe seleccionar un empleado.");
      return;
    }

    const calculatedHours = getHours(formData.start_time, formData.end_time);
    if (calculatedHours <= 0) {
      setErrorMsg("La hora de finalización debe ser posterior a la de inicio.");
      return;
    }

    // Notice validation (2 days minimum before target date)
    if (!validateShiftDate(formData.date)) {
      setErrorMsg("Error: Los turnos solo se pueden programar o modificar con un mínimo de 2 días de anticipación.");
      return;
    }

    try {
      if (editingShift) {
        // Edit constraints
        if (editingShift.edit_count >= 2 && !(isAdminOrDev && adminBypass)) {
          setErrorMsg("Error: Este turno ya ha alcanzado el límite de 2 modificaciones permitidas.");
          return;
        }

        // Check ownership
        if (editingShift.employee_id !== user?.id && !isAdminOrDev) {
          setErrorMsg("Error: No podés modificar el turno de otra empleada.");
          return;
        }

        await db.workShifts.update(editingShift.id, {
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          hours: calculatedHours,
          notes: formData.notes,
          edit_count: editingShift.edit_count + 1,
        });
        setSuccessMsg("Turno de trabajo modificado correctamente.");
      } else {
        await db.workShifts.create({
          employee_id: shiftEmployeeId,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          hours: calculatedHours,
          notes: formData.notes,
          edit_count: 0,
          created_by: user?.email || "system",
        });
        setSuccessMsg("Turno de trabajo registrado exitosamente.");
      }
      setShowFormModal(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar el turno.");
    }
  };

  const handleDelete = async (shift: WorkShift) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (shift.employee_id !== user?.id && !isAdminOrDev) {
      setErrorMsg("Error: No podés eliminar el turno de otra empleada.");
      return;
    }

    if (!validateShiftDate(shift.date)) {
      setErrorMsg("Error: Los turnos solo se pueden cancelar con un mínimo de 2 días de anticipación.");
      return;
    }

    if (window.confirm("¿Estás seguro de eliminar este turno registrado?")) {
      try {
        await db.workShifts.delete(shift.id);
        setSuccessMsg("Turno de trabajo eliminado correctamente.");
        loadData();
      } catch (err: any) {
        setErrorMsg(err.message || "Error al eliminar el turno.");
      }
    }
  };

  // Monthly statistics for selected employee
  const currentMonthShifts = shifts.filter(s => {
    if (s.employee_id !== selectedEmployeeId) return false;
    const shiftDate = new Date(s.date);
    const today = new Date();
    return shiftDate.getMonth() === today.getMonth() && shiftDate.getFullYear() === today.getFullYear();
  });

  const totalMonthlyHours = currentMonthShifts.reduce((acc, curr) => acc + curr.hours, 0);
  const totalMonthlyPay = totalMonthlyHours * HOURLY_RATE;

  // Selected employee profile details
  const selectedProfile = profiles.find(p => p.id === selectedEmployeeId);

  // Group shifts by date for calendar rendering
  const shiftsByDate = shifts.reduce((acc, shift) => {
    if (!acc[shift.date]) acc[shift.date] = [];
    acc[shift.date].push(shift);
    return acc;
  }, {} as Record<string, WorkShift[]>);

  // Calendar dates setup (Current Month)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Adjusted index so Monday is first day of the week
  const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const calendarCells = [];
  // Fill empty leading cells
  for (let i = 0; i < adjustedFirstDayIndex; i++) {
    calendarCells.push(null);
  }
  // Fill month days
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(new Date(year, month, d));
  }

  const getProfileName = (id: string) => {
    if (id === "p2") return "Paola G.";
    if (id === "p12") return "Yamila C.";
    return "Staff";
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-dark font-display uppercase tracking-wider">
            Mis Cobros & Horarios
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Registro de horas laboradas, sueldo por hora de $6000 y calendario de turnos compartido.
          </p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="flex items-center px-4 py-2 bg-primary text-white hover:bg-accent rounded text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Registrar Turno
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-success-bg border border-success/20 rounded text-xs text-success flex items-center space-x-2">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-error-bg border border-error/20 rounded text-xs text-error flex items-center space-x-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top Controls & Admin Switches */}
      <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <CalendarRange className="h-5 w-5 text-accent shrink-0" />
          <div>
            <label className="block text-[10px] uppercase font-bold text-text-muted">Visualizar Horas y Pagos de:</label>
            {isAdminOrDev ? (
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="text-xs bg-[#FCFAF7] border border-border-brand rounded px-2.5 py-1.5 font-bold mt-1 text-text-dark outline-none focus:border-accent"
              >
                <option value="p2">Paola Guevara (Staff)</option>
                <option value="p12">Yamila Coronel (Staff)</option>
              </select>
            ) : (
              <span className="text-sm font-bold text-text-dark block mt-1">
                {selectedProfile?.first_name} {selectedProfile?.last_name} (Mi Ficha)
              </span>
            )}
          </div>
        </div>

        {isAdminOrDev && (
          <button
            onClick={() => setAdminBypass(!adminBypass)}
            className="flex items-center space-x-2 px-3 py-1.5 border border-border-brand rounded text-xs font-semibold bg-bg-light hover:bg-[#EADED2] transition-colors"
          >
            {adminBypass ? (
              <ToggleRight className="h-5 w-5 text-accent shrink-0" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-text-muted shrink-0" />
            )}
            <span className={adminBypass ? "text-accent font-bold" : "text-text-muted"}>
              Ignorar Límites (Modo Administrador)
            </span>
          </button>
        )}
      </div>

      {/* Monthly Statistics Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Horas Registradas en el Mes</p>
          <div className="flex items-baseline mt-2 space-x-1">
            <span className="text-2xl font-bold text-text-dark font-mono">{totalMonthlyHours}</span>
            <span className="text-xs text-text-muted font-medium">hs</span>
          </div>
          <p className="text-[9px] text-text-muted mt-2">
            Turnos del mes de {today.toLocaleString("es-AR", { month: "long" })}.
          </p>
        </div>

        <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Precio de Hora Laborada</p>
          <div className="flex items-baseline mt-2 space-x-0.5">
            <span className="text-2xl font-bold text-text-dark font-mono">$6.000</span>
            <span className="text-xs text-text-muted font-medium">/ hr</span>
          </div>
          <p className="text-[9px] text-text-muted mt-2">Pago por hora base acordado para el personal.</p>
        </div>

        <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs bg-secondary/15">
          <p className="text-[10px] font-bold text-accent uppercase tracking-wider">Cobro Acumulado Estimado</p>
          <div className="flex items-baseline mt-2">
            <span className="text-2xl font-bold text-accent font-mono">
              {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(totalMonthlyPay)}
            </span>
          </div>
          <p className="text-[9px] text-text-muted mt-2">Estimado a liquidar a fin de mes.</p>
        </div>
      </div>

      {/* Acciones de Cobro y Recordatorios del Local */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Acciones de Cobro */}
        <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider flex items-center">
            <DollarSign className="h-4.5 w-4.5 mr-2 text-accent" />
            Acciones de Pago / Anticipo
          </h3>
          <p className="text-[10px] text-text-muted">
            Solicitá tu cobro mensual o un anticipo automático directamente a Vicky por WhatsApp.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                const message = encodeURIComponent(`Hola Vicky! Quería solicitar el retiro de mi plata, el total serian $${totalMonthlyPay} por ${totalMonthlyHours} hs de trabajo.`);
                window.open(`https://wa.me/5493584399113?text=${message}`, "_blank");
              }}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded uppercase tracking-wider transition-colors shadow-2xs flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.978 14.12 .953 11.487.953c-5.442 0-9.866 4.372-9.87 9.802 0 1.968.528 3.888 1.533 5.607L2.145 22.01l5.83-1.528c-.015.006-.015.006 0 0zm10.742-7.404c-.29-.145-1.716-.848-1.98-.942-.262-.096-.453-.145-.642.145-.19.29-.733.942-.897 1.133-.164.19-.327.214-.618.07-2.015-1.007-3.111-1.79-4.372-3.957-.282-.48.282-.45.808-.997.165-.17.327-.34.407-.51.08-.17.04-.32-.02-.465-.06-.145-.453-1.085-.62-1.49-.162-.395-.327-.34-.453-.346-.118-.005-.253-.005-.39-.005-.136 0-.36.05-.55.26-.19.21-.724.708-.724 1.729s.743 2.01 1.847 2.15c.104.015 2.126 3.25 5.152 4.56.72.311 1.28.497 1.717.637.723.23 1.38.197 1.9.12.58-.087 1.716-.7 1.961-1.374.246-.675.246-1.253.172-1.374-.074-.12-.26-.19-.55-.335z"/>
              </svg>
              Solicitar Cobro a Vicky
            </button>
            <button
              onClick={() => {
                const advanceAmount = Math.round(totalMonthlyPay * 0.1);
                const message = encodeURIComponent(`quiero solicitar un anticipo por $${advanceAmount}`);
                window.open(`https://wa.me/5493584399113?text=${message}`, "_blank");
              }}
              className="flex-1 py-2.5 px-4 bg-primary hover:bg-accent text-white font-semibold text-xs rounded uppercase tracking-wider transition-colors shadow-2xs flex items-center justify-center gap-2"
            >
              <DollarSign className="h-4 w-4 shrink-0" />
              Solicitar Anticipo
            </button>
          </div>
          <p className="text-[9px] text-text-muted italic">
            * Nota: El anticipo de dinero tiene un cobro del 10% del monto final del pago y se realiza de manera automática al apretar el botón, calculándose sobre el total acumulado actual.
          </p>
        </div>

        {/* Recordatorios del Local */}
        <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider flex items-center">
            <ClipboardList className="h-4.5 w-4.5 mr-2 text-accent" />
            Recordatorios del Local
          </h3>
          <p className="text-[10px] text-text-muted">
            Lineamientos diarios obligatorios para mantener la excelencia en el salón Pacheca.
          </p>
          <div className="bg-[#FCFAF7] border border-border-brand/60 rounded p-3.5 text-xs space-y-2">
            <div className="flex items-start gap-2 text-text-dark">
              <span className="text-accent font-bold text-sm leading-none">•</span>
              <span><strong>Recordar:</strong> mantener la limpieza del local, el orden, el aroma, la temperatura del salon, los vidrios limpios y las redes en constante actividad.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar and List Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Calendar Grid (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-border-brand pb-3">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider flex items-center">
              <Calendar className="h-4.5 w-4.5 mr-2 text-accent" />
              Calendario de Trabajo ({today.toLocaleString("es-AR", { month: "long", year: "numeric" })})
            </h3>
            <span className="text-[10px] text-text-muted font-medium bg-bg-light border border-border-brand px-2 py-0.5 rounded">
              Turno Compartido
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-text-muted uppercase tracking-wider border-b border-border-brand pb-2">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 aspect-[8/6] sm:aspect-[8/5] min-h-[300px]">
            {calendarCells.map((cellDate, idx) => {
              if (!cellDate) {
                return <div key={`empty-${idx}`} className="bg-bg-light/40 rounded-sm" />;
              }

              const dateStr = cellDate.toISOString().split("T")[0];
              const cellShifts = shiftsByDate[dateStr] || [];
              const isToday = cellDate.getDate() === today.getDate() && cellDate.getMonth() === today.getMonth();

              return (
                <div 
                  key={dateStr} 
                  className={`border border-border-brand rounded-sm p-1.5 flex flex-col justify-between items-stretch overflow-hidden transition-all ${
                    isToday ? "bg-secondary/20 ring-1 ring-accent" : "bg-[#FCFAF7]/50 hover:bg-bg-light"
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isToday ? "text-accent" : "text-text-dark"}`}>
                    {cellDate.getDate()}
                  </span>
                  
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[60px] scrollbar-none">
                    {cellShifts.map(s => {
                      const isPaola = s.employee_id === "p2";
                      const colorClass = isPaola 
                        ? "bg-[#F5E6D3] text-black border-[#EADED2]" 
                        : "bg-purple-100 text-purple-800 border-purple-200";
                      
                      return (
                        <div 
                          key={s.id} 
                          onClick={() => handleOpenEdit(s)}
                          className={`text-[8px] px-1 py-0.5 rounded border leading-tight truncate text-left cursor-pointer font-semibold shadow-4xs ${colorClass}`}
                          title={`${getProfileName(s.employee_id)}: ${s.start_time} a ${s.end_time} (${s.hours}hs)${s.notes ? ` - ${s.notes}` : ""}`}
                        >
                          {getProfileName(s.employee_id)}: {s.start_time} - {s.hours}h
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 items-center text-[10px] text-text-muted justify-center border-t border-border-brand pt-3 font-semibold">
            <div className="flex items-center">
              <span className="h-2.5 w-2.5 rounded bg-[#F5E6D3] border border-[#EADED2] inline-block mr-1.5" />
              Turnos Paola Guevara
            </div>
            <div className="flex items-center">
              <span className="h-2.5 w-2.5 rounded bg-purple-100 border border-purple-200 inline-block mr-1.5" />
              Turnos Yamila Coronel
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Shifts List (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider flex items-center border-b border-border-brand pb-3">
            <Clock className="h-4.5 w-4.5 mr-2 text-accent" />
            Turnos Registrados
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {currentMonthShifts.length === 0 ? (
              <div className="text-center py-12 text-text-muted text-xs">
                No hay turnos registrados para este mes.
              </div>
            ) : (
              currentMonthShifts
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((s) => {
                  const limitReached = s.edit_count >= 2;
                  
                  return (
                    <div 
                      key={s.id} 
                      className="p-3 bg-[#FCFAF7] border border-border-brand rounded-sm space-y-2 text-xs flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-text-dark">
                            {new Date(s.date).toLocaleDateString("es-AR", { weekday: "long", day: "numeric" })}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            Horario: {s.start_time} hs a {s.end_time} hs ({s.hours} hs laboradas)
                          </p>
                          {s.notes && (
                            <p className="text-[10px] text-text-dark italic mt-1 bg-white border border-border-brand/40 px-2 py-1 rounded-sm">
                              &quot;{s.notes}&quot;
                            </p>
                          )}
                          <div className="flex gap-1.5 items-center mt-1.5">
                            <span className="text-[8px] font-bold text-text-muted uppercase bg-bg-light px-1.5 py-0.5 rounded border border-border-brand">
                              Modificado: {s.edit_count}/2 veces
                            </span>
                            {limitReached && (
                              <span className="text-[8px] font-bold text-red-600 uppercase bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                                Bloqueado
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-1 shrink-0">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1 text-text-muted hover:text-accent hover:bg-bg-light rounded border border-transparent hover:border-border-brand transition-colors"
                            title="Editar turno"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="p-1 text-text-muted hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
                            title="Eliminar turno"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          <div className="bg-[#FCFAF7] border border-border-brand p-3 rounded text-[10px] text-text-muted space-y-1.5">
            <div className="flex gap-1.5 text-amber-700 font-bold uppercase tracking-wider text-[9px]">
              <Info className="h-3.5 w-3.5 shrink-0" /> Reglas de Edición
            </div>
            <p>
              1. Máximo de <strong>2 modificaciones</strong> por turno registrado.
            </p>
            <p>
              2. Plazo de anticipación mínimo de <strong>2 días</strong>. No podés crear o cambiar turnos de días en curso o inmediatos.
            </p>
          </div>
        </div>

      </div>

      {/* CREATE/EDIT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-border-brand rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-dark"
            >
              <X className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></X>
            </button>

            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-accent" />
              {editingShift ? "Modificar Turno Registrado" : "Registrar Turno de Trabajo"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Fecha de Turno</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Hora Entrada</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-dark mb-1">Hora Salida</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Notas / Detalle de Tareas</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Apertura del local, reposición de telas, planchado..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-border-brand">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-border-brand text-text-muted hover:bg-bg-light text-xs font-semibold rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-accent text-white text-xs font-semibold rounded uppercase tracking-wider"
                >
                  {editingShift ? "Guardar Cambios" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
