import { Product, Supplier, mockDb } from "./db";

export type RoundingMethod = "sin_redondeo" | "a_100" | "a_500" | "a_1000" | "terminado_900" | "personalizado";

export interface PricingRule {
  markupPercentage?: number;
  markupFixed?: number;
  roundingMethod: RoundingMethod;
  roundingValue?: number;
}

/**
 * Rounds a number according to the specified method
 */
export function applyRounding(amount: number, method: RoundingMethod, value?: number): number {
  if (method === "sin_redondeo") {
    return Math.round(amount * 100) / 100;
  }
  
  if (method === "a_100") {
    return Math.ceil(amount / 100) * 100;
  }
  
  if (method === "a_500") {
    return Math.ceil(amount / 500) * 500;
  }
  
  if (method === "a_1000") {
    return Math.ceil(amount / 1000) * 1000;
  }
  
  if (method === "terminado_900") {
    const ceilThousand = Math.ceil(amount / 1000) * 1000;
    return ceilThousand - 100; // e.g. 2540 -> 3000 -> 2900
  }
  
  if (method === "personalizado" && value && value > 0) {
    return Math.ceil(amount / value) * value;
  }
  
  return Math.round(amount);
}

/**
 * Calculates the total cost of a product based on its wholesale price, taxes, and shipping
 */
export function calculateProductCost(product: Product, supplier?: Supplier): number {
  const pOriginal = Number(product.price_original);
  const ship = Number(product.assigned_shipping_cost || 0);
  const other = Number(product.other_costs || 0);
  
  let tax = 0;
  // If supplier has taxes NOT included, we calculate them
  if (supplier && !supplier.tax_included) {
    tax = pOriginal * (supplier.tax_percentage / 100);
  } else if (!supplier) {
    // Fallback if supplier is missing
    tax = pOriginal * (product.tax_percentage / 100);
  }
  
  return pOriginal + tax + ship + other;
}

/**
 * Calculates the retail public price of a product by searching rules in priority order:
 * 1. Manual Price (if defined on the product, bypasses other calculations)
 * 2. Product-specific markup
 * 3. Category-specific markup
 * 4. Supplier-specific markup
 * 5. General rule markup
 */
export function calculateRetailPrice(product: Product): { costTotal: number; priceFinal: number; profit: number; ruleApplied: string } {
  const supplier = mockDb.suppliers.find(s => s.id === product.supplier_id);
  const category = mockDb.categories.find(c => c.id === product.category_id);
  const generalMarkup = mockDb.settings.find(s => s.key === "general_markup")?.value || { percentage: 50, fixed: 0 };
  const globalRounding = mockDb.settings.find(s => s.key === "global_rounding")?.value || { method: "a_100" };
  
  // Calculate raw cost first
  const costTotal = calculateProductCost(product, supplier);

  // 1. Manual Price Check
  // If price_final is set manually and not 0, we can respect it if it was marked as a manual override
  // But here we implement a flag or just detect if there's no markup info
  // For safety, let's look at the product tags or state.
  // In our schema, we assume if the product status has manual flags or if markup is 0 and price_final > 0, it is manual.
  if (product.markup_percentage === 0 && product.markup_fixed === 0 && product.price_final > 0) {
    return {
      costTotal,
      priceFinal: product.price_final,
      profit: Math.max(0, product.price_final - costTotal),
      ruleApplied: "Precio Manual"
    };
  }

  let markupPct = Number(generalMarkup.percentage);
  let markupFix = Number(generalMarkup.fixed);
  let roundingMethod: RoundingMethod = globalRounding.method || "a_100";
  let roundingVal = globalRounding.value;
  let ruleApplied = "Regla General";

  // 4. Supplier Rule Check
  if (supplier) {
    markupPct = supplier.default_markup_percentage;
    ruleApplied = `Regla de Proveedor (${supplier.name})`;
  }

  // 3. Category Rule Check
  // Check if there is a category pricing rule in database
  const catRule = mockDb.pricing_rules.find(r => r.target_type === "category" && r.target_id === product.category_id && r.is_active);
  if (catRule) {
    if (catRule.markup_percentage !== undefined && catRule.markup_percentage !== null) {
      markupPct = Number(catRule.markup_percentage);
    }
    if (catRule.markup_fixed !== undefined && catRule.markup_fixed !== null) {
      markupFix = Number(catRule.markup_fixed);
    }
    roundingMethod = catRule.rounding_method as RoundingMethod;
    roundingVal = catRule.rounding_value;
    ruleApplied = `Regla de Categoría (${category?.name || "Categoría"})`;
  }

  // 2. Product Rule Check
  if (product.markup_percentage > 0 || product.markup_fixed > 0) {
    markupPct = Number(product.markup_percentage);
    markupFix = Number(product.markup_fixed);
    ruleApplied = "Regla de Producto Específica";
  }

  // Check if there is an active pricing rule targetting this specific product
  const prodRule = mockDb.pricing_rules.find(r => r.target_type === "product" && r.target_id === product.id && r.is_active);
  if (prodRule) {
    if (prodRule.markup_percentage !== undefined && prodRule.markup_percentage !== null) {
      markupPct = Number(prodRule.markup_percentage);
    }
    if (prodRule.markup_fixed !== undefined && prodRule.markup_fixed !== null) {
      markupFix = Number(prodRule.markup_fixed);
    }
    roundingMethod = prodRule.rounding_method as RoundingMethod;
    roundingVal = prodRule.rounding_value;
    ruleApplied = "Regla de Producto (Sobrescribir)";
  }

  // Apply markup formula
  // precio_pacheca = cost_total * (1 + recargo_porcentual / 100) + recargo_fijo
  const rawRetailPrice = costTotal * (1 + markupPct / 100) + markupFix;
  
  // Apply rounding
  const priceFinal = applyRounding(rawRetailPrice, roundingMethod, roundingVal);
  const profit = Math.max(0, priceFinal - costTotal);

  return {
    costTotal,
    priceFinal,
    profit,
    ruleApplied
  };
}
