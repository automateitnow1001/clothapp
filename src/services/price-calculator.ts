import { mockDb } from "../lib/db";

export interface PricingRuleConfig {
  supplierId?: string;
  categoryId?: string;
  generalMarkupPercentage: number;
  providerMarkups: Record<string, number>;
  categoryMarkups: Record<string, number>;
  fixedCostAdditional: number;
  estimatedOperatingCost: number;
  paymentProcessingCostPercentage: number;
  marginOfSafetyPercentage: number;
  minPrice: number;
  roundingType: "terminado_900" | "none" | "a_100" | "a_500" | "a_1000";
}

// Default system-wide pricing rules configuration
export const DEFAULT_PRICING_CONFIG: PricingRuleConfig = {
  generalMarkupPercentage: 50.0,
  providerMarkups: {
    s1: 50.0, // Syes Minorista
    s2: 50.0, // Seis
    s3: 60.0, // Shaple Jeans
    s4: 65.0, // Cheta Jeans
    s5: 45.0, // Pury Curvy
    s6: 70.0, // Pomina
    s7: 50.0, // Syes Mayorista
  },
  categoryMarkups: {
    cat_jeans: 60.0,
    cat_pantalones: 50.0,
    cat_abrigos: 55.0,
  },
  fixedCostAdditional: 100.0, // Costo fijo adicional
  estimatedOperatingCost: 200.0, // Costo operativo estimado
  paymentProcessingCostPercentage: 10.0, // 10% costos de pago/financiamiento
  marginOfSafetyPercentage: 5.0, // 5% margen de seguridad
  minPrice: 500.0,
  roundingType: "terminado_900", // $43.270 -> $43.900, $58.120 -> $58.900, etc.
};

export class PriceCalculator {
  // Get active configurations from database or settings if available, otherwise return defaults
  static getConfig(): PricingRuleConfig {
    try {
      // Look up in mockDb.settings
      const settingsConfig = mockDb.settings.find(s => s.key === "pacheca_pricing_rules")?.value;
      if (settingsConfig) {
        return { ...DEFAULT_PRICING_CONFIG, ...settingsConfig };
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_PRICING_CONFIG;
  }

  // Save active configuration to mockDb
  static saveConfig(config: PricingRuleConfig): void {
    const idx = mockDb.settings.findIndex(s => s.key === "pacheca_pricing_rules");
    const val = {
      key: "pacheca_pricing_rules",
      value: config,
    };
    if (idx !== -1) {
      mockDb.settings[idx] = val;
    } else {
      mockDb.settings.push(val);
    }
  }

  // Calculate final sale price based on wholesale cost price and configs
  static calculatePrice(
    costPrice: number,
    supplierId: string,
    categoryId: string,
    overrideConfig?: Partial<PricingRuleConfig>
  ): {
    costTotal: number;
    priceFinal: number;
    profit: number;
    marginPercentage: number;
    breakdown: {
      costPrice: number;
      markupAmount: number;
      operatingCost: number;
      paymentCost: number;
      safetyMargin: number;
      fixedCost: number;
      rawTotal: number;
    };
  } {
    const config = { ...this.getConfig(), ...overrideConfig };

    // 1. Determine markup percentage: Priority: Category markup > Supplier markup > General markup
    let markupPercentage = config.generalMarkupPercentage;
    if (config.categoryMarkups[categoryId] !== undefined) {
      markupPercentage = config.categoryMarkups[categoryId];
    } else if (config.providerMarkups[supplierId] !== undefined) {
      markupPercentage = config.providerMarkups[supplierId];
    }

    // 2. Base cost price
    const baseCost = Number(costPrice);

    // 3. Fómula Base components:
    // - margen_comercial (markup)
    const markupAmount = baseCost * (markupPercentage / 100);
    // - costo_operativo_estimado
    const operatingCost = config.estimatedOperatingCost;
    // - costos_de_pago (10% of base cost)
    const paymentCost = baseCost * (config.paymentProcessingCostPercentage / 100);
    // - margen_de_seguridad
    const safetyMargin = baseCost * (config.marginOfSafetyPercentage / 100);
    // - importe_fijo_adicional
    const fixedCost = config.fixedCostAdditional;

    // costTotal represents the true cost to Pacheca: baseCost + operatingCost + paymentCost + safetyMargin + fixedCost
    const costTotal = baseCost + operatingCost + paymentCost + safetyMargin + fixedCost;

    // raw retail price = costTotal + markupAmount
    const rawRetailPrice = costTotal + markupAmount;

    // 4. Apply commercial rounding
    let priceFinal = rawRetailPrice;
    if (config.roundingType === "terminado_900") {
      const baseThousand = Math.floor(rawRetailPrice / 1000) * 1000;
      const remainder = rawRetailPrice % 1000;
      if (remainder <= 900) {
        priceFinal = baseThousand + 900;
      } else {
        priceFinal = baseThousand + 1900;
      }
    } else if (config.roundingType === "a_100") {
      priceFinal = Math.ceil(rawRetailPrice / 100) * 100;
    } else if (config.roundingType === "a_500") {
      priceFinal = Math.ceil(rawRetailPrice / 500) * 500;
    } else if (config.roundingType === "a_1000") {
      priceFinal = Math.ceil(rawRetailPrice / 1000) * 1000;
    }

    // Ensure price is at least the minimum price
    if (priceFinal < config.minPrice) {
      priceFinal = config.minPrice;
    }

    const profit = Math.max(0, priceFinal - costTotal);
    const marginPercentage = priceFinal > 0 ? (profit / priceFinal) * 100 : 0;

    return {
      costTotal: Math.round(costTotal * 100) / 100,
      priceFinal: Math.round(priceFinal * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      marginPercentage: Math.round(marginPercentage * 10) / 10,
      breakdown: {
        costPrice: baseCost,
        markupAmount: Math.round(markupAmount * 100) / 100,
        operatingCost,
        paymentCost: Math.round(paymentCost * 100) / 100,
        safetyMargin: Math.round(safetyMargin * 100) / 100,
        fixedCost,
        rawTotal: Math.round(rawRetailPrice * 100) / 100,
      },
    };
  }
}
