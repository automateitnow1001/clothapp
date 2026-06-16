import { mockDb, Product, ProductVariant } from "../lib/db";
import { PriceCalculator } from "./price-calculator";

export interface SyncReport {
  productId: string;
  name: string;
  sku: string;
  action: "created" | "updated" | "unchanged" | "deactivated" | "error";
  changes: string[];
}

export class StockSynchronizer {
  // Synchronize a parsed RawProduct with the database
  static syncProduct(
    raw: {
      supplierId: string;
      originalSku: string;
      originalName: string;
      originalCategory: string;
      costPrice: number;
      sourceUrl: string;
      imageUrl: string;
      galleryUrls: string[];
      availableSizes: string[];
      availableColors: string[];
      rawVariations: Array<{ size: string; color: string; stock: number; price?: number }>;
      materialComposicion?: string;
      calce?: string;
      fitType?: "elastizado" | "rigido" | "semi_elastizado";
    },
    approvedAutomatically = false,
    adminId = "system"
  ): SyncReport {
    const report: SyncReport = {
      productId: "",
      name: raw.originalName,
      sku: raw.originalSku,
      action: "unchanged",
      changes: [],
    };

    try {
      // 1. Check if product already exists (by supplierId and originalSku)
      const existingProduct = mockDb.products.find(
        (p) => p.supplier_id === raw.supplierId && p.code_original === raw.originalSku
      );

      // Import normalizer and description generator dynamically to avoid circular references if any
      const { ProductNormalizer } = require("./product-normalizer");
      const { DescriptionGenerator } = require("./description-generator");
      const { ImageProcessor } = require("./image-processor");

      // Normalize fields
      const namePublic = ProductNormalizer.cleanPublicName(raw.originalName);
      const category = ProductNormalizer.normalizeCategory(raw.originalName, raw.originalCategory);
      
      // Calculate prices using PriceCalculator
      const priceDetails = PriceCalculator.calculatePrice(raw.costPrice, raw.supplierId, category.id);

      // Process image for watermarks/logos
      const imageResult = ImageProcessor.processImage(raw.imageUrl, raw.supplierId, raw.supplierId === "s1" ? "Syes" : raw.supplierId === "s2" ? "Seis" : raw.supplierId === "s3" ? "Shaple Jeans" : raw.supplierId === "s4" ? "Cheta Jeans" : raw.supplierId === "s5" ? "Pury" : raw.supplierId === "s6" ? "Pomina" : "Syes Mayorista");

      if (!existingProduct) {
        // Create new product in Draft state (following flow approval: first import as draft)
        const descPublic = DescriptionGenerator.generate({
          namePublic,
          originalCategory: raw.originalCategory,
          normalizedCategory: category.name,
          material: raw.materialComposicion,
          calce: raw.calce,
          fitType: raw.fitType,
          sizes: raw.availableSizes,
          colors: raw.availableColors,
        });

        const newProd: Product = {
          id: `pr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          supplier_id: raw.supplierId,
          name_original: raw.originalName,
          name_public: namePublic,
          code_original: raw.originalSku,
          code_public: `PAC-${mockDb.products.length + 1000}`,
          slug_public: namePublic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          url_original: raw.sourceUrl,
          description_original: raw.originalName + " - Importado de proveedor.",
          description_public: descPublic,
          category_id: category.id,
          subcategory: category.name,
          tags: ProductNormalizer.generateTags(namePublic, category.name, raw.supplierId, raw.availableSizes),
          price_original: raw.costPrice,
          currency: "ARS",
          tax_percentage: 21,
          assigned_shipping_cost: 200,
          other_costs: 100,
          cost_total: priceDetails.costTotal,
          markup_percentage: PriceCalculator.getConfig().providerMarkups[raw.supplierId] || 50,
          markup_fixed: 0,
          price_final: priceDetails.priceFinal,
          estimated_profit: priceDetails.profit,
          stock_total: raw.rawVariations.reduce((sum, v) => sum + v.stock, 0),
          availability: imageResult.requiresReview ? "pendiente_de_confirmacion" : "disponible",
          estimated_delivery_weeks: 2,
          status: approvedAutomatically ? "published" : "draft", // Starts as Draft
          created_by: adminId,
          updated_by: adminId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          colors: raw.availableColors,
          images: [imageResult.urlPublic],
        };

        // Save images & variants
        mockDb.products.push(newProd);
        report.productId = newProd.id;
        report.action = "created";
        report.changes.push("Producto importado como Borrador (Draft)");

        // Push variations
        raw.rawVariations.forEach((v, vIdx) => {
          const varSku = `${newProd.code_public}-${v.size}-${v.color.substring(0, 2).toUpperCase()}`;
          mockDb.product_variants.push({
            id: `pv_${Date.now()}_${vIdx}_${Math.floor(Math.random() * 100)}`,
            product_id: newProd.id,
            size: ProductNormalizer.normalizeSize(v.size),
            color: v.color,
            sku_variant: varSku,
            stock: v.stock,
          });
        });

        // Push product image
        mockDb.product_images.push({
          id: `pi_${Date.now()}_${Math.floor(Math.random() * 100)}`,
          product_id: newProd.id,
          url_original: raw.imageUrl,
          url_public: imageResult.urlPublic,
          is_main: true,
          sort_order: 0,
        });

        if (imageResult.requiresReview) {
          report.changes.push(`Requiere revisión de imagen: ${imageResult.reviewReason}`);
        }

        return report;
      }

      // 2. Product already exists -> Perform sync & safe updates
      report.productId = existingProduct.id;
      const changes: string[] = [];

      // A. Cost Change -> Recalculate price
      if (existingProduct.price_original !== raw.costPrice) {
        changes.push(
          `Costo original cambió de $${existingProduct.price_original} a $${raw.costPrice}`
        );
        existingProduct.price_original = raw.costPrice;
        existingProduct.cost_total = priceDetails.costTotal;
        existingProduct.price_final = priceDetails.priceFinal;
        existingProduct.estimated_profit = priceDetails.profit;
        changes.push(`Precio final recalculado a $${priceDetails.priceFinal}`);
      }

      // B. Preserve Pacheca Admin updates
      // If the administrator edited public titles/descriptions, do NOT overwrite them!
      // We can detect this by checking if the current name_public differs from the auto-cleaned name_public
      // or if it was explicitly flagged. Here we simply preserve whatever is in `existingProduct.name_public`
      // and `existingProduct.description_public` if they are not empty.
      if (!existingProduct.name_public) {
        existingProduct.name_public = namePublic;
        changes.push(`Asignado nombre público: ${namePublic}`);
      }
      
      // C. Stock variants synchronization
      const currentVariants = mockDb.product_variants.filter((pv) => pv.product_id === existingProduct.id);
      let newTotalStock = 0;

      // Update or create variations
      raw.rawVariations.forEach((v) => {
        const normSize = ProductNormalizer.normalizeSize(v.size);
        const matchVar = currentVariants.find(
          (pv) => pv.size === normSize && pv.color.toLowerCase() === v.color.toLowerCase()
        );

        if (matchVar) {
          if (matchVar.stock !== v.stock) {
            changes.push(`Variante [${normSize} - ${v.color}] stock cambió de ${matchVar.stock} a ${v.stock}`);
            matchVar.stock = v.stock;
          }
          newTotalStock += v.stock;
        } else {
          // New variant combination
          const varSku = `${existingProduct.code_public}-${normSize}-${v.color.substring(0, 2).toUpperCase()}`;
          const newVar = {
            id: `pv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            product_id: existingProduct.id,
            size: normSize,
            color: v.color,
            sku_variant: varSku,
            stock: v.stock,
          };
          mockDb.product_variants.push(newVar);
          changes.push(`Nueva variante detectada: [${normSize} - ${v.color}] con stock ${v.stock}`);
          newTotalStock += v.stock;
        }
      });

      // Deactivate/zero out variants that disappeared from the raw catalog feed
      currentVariants.forEach((pv) => {
        const rawExists = raw.rawVariations.some(
          (rv) =>
            ProductNormalizer.normalizeSize(rv.size) === pv.size &&
            rv.color.toLowerCase() === pv.color.toLowerCase()
        );
        if (!rawExists && pv.stock > 0) {
          changes.push(`Variante descontinuada [${pv.size} - ${pv.color}], se le asignó stock 0.`);
          pv.stock = 0;
        }
      });

      existingProduct.stock_total = newTotalStock;

      // D. Availability status
      if (newTotalStock === 0) {
        if (existingProduct.availability !== "agotado") {
          existingProduct.availability = "agotado";
          changes.push("Producto marcado sin stock (agotado).");
        }
      } else {
        if (existingProduct.availability === "agotado") {
          existingProduct.availability = "disponible";
          changes.push("Producto reactivado (stock disponible).");
        }
      }

      existingProduct.updated_at = new Date().toISOString();
      existingProduct.updated_by = adminId;

      if (changes.length > 0) {
        report.action = "updated";
        report.changes = changes;
      }

      return report;
    } catch (error: any) {
      console.error("Error synchronizing product SKU:", raw.originalSku, error);
      report.action = "error";
      report.changes.push(`Error: ${error.message || error}`);
      return report;
    }
  }
}
