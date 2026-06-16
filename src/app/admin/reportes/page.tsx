"use client";

import React, { useState, useEffect } from "react";
import { db, mockDb } from "@/lib/db";
import { 
  BarChart2, TrendingUp, Users, Calendar, AlertTriangle, 
  DollarSign, ShoppingCart, ArrowUpRight, ArrowDownRight, Package
} from "lucide-react";

export default function AdminReportsPage() {
  const [stats, setStats] = useState({
    totalSalesMonth: 0,
    outstandingReceivables: 0,
    overdueDebtsCount: 0,
    averageMargin: 60,
    totalProfitEst: 0
  });

  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [debtAging, setDebtAging] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  
  useEffect(() => {
    // Calculate total accounts receivable
    const totalCc = mockDb.customers.reduce((acc, c) => acc + (c.balance || 0), 0);
    
    // Calculate overdue debts (balance > credit_limit or overdue entries)
    const overdueCount = mockDb.customers.filter(c => c.balance > 0 && c.credit_limit < c.balance).length;
    
    // Monthly sales calculation from orders
    const salesMonth = mockDb.orders
      .filter(o => o.status_internal !== "cancelado" && o.status_internal !== "reintegrado")
      .reduce((acc, o) => acc + o.total_amount, 0);

    const profitEst = mockDb.orders
      .filter(o => o.status_internal !== "cancelado" && o.status_internal !== "reintegrado")
      .reduce((acc, o) => acc + (o.total_amount - (o.total_amount * 0.6)), 0); // 40% margin assumption

    setStats({
      totalSalesMonth: salesMonth,
      outstandingReceivables: totalCc,
      overdueDebtsCount: overdueCount,
      averageMargin: 65,
      totalProfitEst: profitEst
    });

    // Best sellers mock
    setBestSellers([
      { name: "Remera Oversize New York", category: "Remeras", quantity: 42, revenue: 546000, stock: 12 },
      { name: "Jeans Slouchy Celeste Claro", category: "Pantalones", quantity: 38, revenue: 1330000, stock: 8 },
      { name: "Vestido Lino Botones", category: "Vestidos", quantity: 29, revenue: 841000, stock: 5 },
      { name: "Buzo Unisex Rustico", category: "Buzos", quantity: 24, revenue: 672000, stock: 19 },
      { name: "Camisa Oversize Rayada Celeste", category: "Camisas", quantity: 18, revenue: 414000, stock: 15 }
    ]);

    // Debt aging mock
    setDebtAging([
      { range: "Al día (0 - 15 días)", amount: totalCc * 0.65, count: 6, pct: 65 },
      { range: "Vencimiento Cercano (16 - 30 días)", amount: totalCc * 0.20, count: 3, pct: 20 },
      { range: "Mora Leve (31 - 60 días)", amount: totalCc * 0.10, count: 2, pct: 10 },
      { range: "Mora Grave (Más de 60 días)", amount: totalCc * 0.05, count: 1, pct: 5 }
    ]);

    // Sales history (last 6 months)
    setSalesHistory([
      { month: "Ene", sales: 1200000, profit: 480000 },
      { month: "Feb", sales: 1450000, profit: 580000 },
      { month: "Mar", sales: 1900000, profit: 760000 },
      { month: "Abr", sales: 2400000, profit: 960000 },
      { month: "May", sales: 2800000, profit: 1120000 },
      { month: "Jun (Act)", sales: salesMonth, profit: profitEst }
    ]);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-text-dark font-display uppercase tracking-wider font-bold">Reportes & Estadísticas</h1>
        <p className="text-xs text-text-muted mt-1">
          Panel de control de rendimiento comercial, rentabilidad y antigüedad de deuda de la cartera de clientes.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Ventas Acumuladas</span>
            <span className="p-1.5 bg-green-50 text-success rounded">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-text-dark">{formatCurrency(stats.totalSalesMonth)}</h3>
            <p className="text-[10px] text-success flex items-center font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              <span>+12.4% vs mes anterior</span>
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Cuentas por Cobrar</span>
            <span className="p-1.5 bg-amber-50 text-warning rounded">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-text-dark">{formatCurrency(stats.outstandingReceivables)}</h3>
            <p className="text-[10px] text-text-muted flex items-center font-semibold">
              <span>Capital activo en cuenta corriente</span>
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Ganancia Estimada</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-text-dark">{formatCurrency(stats.totalProfitEst)}</h3>
            <p className="text-[10px] text-text-muted flex items-center font-semibold">
              <span>Margen promedio: {stats.averageMargin}%</span>
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Clientes Excedidos</span>
            <span className="p-1.5 bg-red-50 text-error rounded">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-text-dark">{stats.overdueDebtsCount} Clientes</h3>
            <p className="text-[10px] text-error flex items-center font-semibold">
              <span>Superan límite de crédito o mora</span>
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Charts & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Chart CSS representation */}
        <div className="lg:col-span-2 bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-4">
          <div className="border-b border-border-brand pb-3">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider">Evolución de Ventas y Utilidades</h3>
            <p className="text-[10px] text-text-muted">Cifras comerciales de los últimos 6 meses en ARS.</p>
          </div>
          
          {/* Mock Bar Chart */}
          <div className="h-48 flex items-end justify-between pt-6 px-4">
            {salesHistory.map((item, idx) => {
              const maxSales = Math.max(...salesHistory.map(s => s.sales));
              const salesHeight = (item.sales / maxSales) * 100;
              const profitHeight = (item.profit / maxSales) * 100;

              return (
                <div key={idx} className="flex flex-col items-center space-y-2 w-1/6">
                  <div className="w-full flex justify-center space-x-1 items-end h-32">
                    {/* Sales bar */}
                    <div 
                      style={{ height: `${salesHeight}%` }} 
                      className="w-4 bg-primary hover:bg-accent rounded-t transition-all"
                      title={`Ventas: ${formatCurrency(item.sales)}`}
                    />
                    {/* Profit bar */}
                    <div 
                      style={{ height: `${profitHeight}%` }} 
                      className="w-4 bg-accent/60 hover:bg-accent rounded-t transition-all"
                      title={`Ganancia: ${formatCurrency(item.profit)}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-text-muted">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border-brand flex justify-center space-x-6 text-[10px] font-bold text-text-muted">
            <div className="flex items-center">
              <span className="h-3 w-3 bg-primary rounded-xs mr-2" />
              <span>Venta Bruta</span>
            </div>
            <div className="flex items-center">
              <span className="h-3 w-3 bg-accent/60 rounded-xs mr-2" />
              <span>Ganancia Bruta Est.</span>
            </div>
          </div>
        </div>

        {/* Debt Aging Card */}
        <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-4">
          <div className="border-b border-border-brand pb-3">
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider">Antigüedad de Deuda</h3>
            <p className="text-[10px] text-text-muted">Exposición y vencimientos de la cuenta corriente.</p>
          </div>

          <div className="space-y-4 pt-2">
            {debtAging.map((age, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-text-dark text-[11px]">{age.range}</span>
                  <span className="text-text-muted">{formatCurrency(age.amount)}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-bg-light rounded overflow-hidden">
                  <div 
                    style={{ width: `${age.pct}%` }} 
                    className={`h-full rounded ${
                      idx === 0 ? "bg-success" : 
                      idx === 1 ? "bg-blue-400" :
                      idx === 2 ? "bg-warning" : "bg-error"
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-text-muted font-semibold">
                  <span>{age.count} Cuentas</span>
                  <span>{age.pct}% del total</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Table: Best Sellers */}
      <div className="bg-white border border-border-brand rounded-lg p-5 shadow-2xs space-y-4">
        <div className="border-b border-border-brand pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-dark uppercase tracking-wider">Prendas Más Vendidas</h3>
            <p className="text-[10px] text-text-muted">Artículos con mayor demanda en rondas consolidadas y local.</p>
          </div>
          <span className="px-2 py-0.5 bg-bg-light text-text-muted text-[10px] font-bold rounded flex items-center">
            <Package className="h-3.5 w-3.5 mr-1" />
            Remera / Jeans Líder
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border-brand bg-bg-light text-[10px] uppercase font-bold text-text-muted">
                <th className="py-2 px-3">Producto</th>
                <th className="py-2 px-3">Categoría</th>
                <th className="py-2 px-3 text-center">Prendas Vendidas</th>
                <th className="py-2 px-3 text-right">Facturación</th>
                <th className="py-2 px-3 text-center">Stock Remanente</th>
                <th className="py-2 px-3 text-center">Estado Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-brand/60">
              {bestSellers.map((item, idx) => (
                <tr key={idx} className="hover:bg-bg-light/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-text-dark">{item.name}</td>
                  <td className="py-2.5 px-3 text-text-muted">{item.category}</td>
                  <td className="py-2.5 px-3 text-center font-semibold">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-accent">{formatCurrency(item.revenue)}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{item.stock} u.</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      item.stock < 10 
                        ? "bg-amber-50 text-warning border-amber-200" 
                        : "bg-success-bg text-success border-success/15"
                    }`}>
                      {item.stock < 10 ? "Bajo Stock" : "Estable"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
