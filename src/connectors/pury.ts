import fs from "fs";
import path from "path";
import { IConnector, RawProduct } from "./connector-base";

export class PuryConnector implements IConnector {
  async fetchProducts(limit?: number): Promise<RawProduct[]> {
    try {
      const filePath = path.join(process.cwd(), "src/connectors/html/pury.html");
      if (!fs.existsSync(filePath)) {
        console.error(`Pury file not found at ${filePath}`);
        return [];
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const products: RawProduct[] = [];
      
      const titleRegex = /data-product-title="([^"]+)"/g;
      let match;
      const seen = new Set<string>();
      let idx = 0;

      while ((match = titleRegex.exec(content)) !== null) {
        const originalName = match[1].trim();
        if (seen.has(originalName)) continue;
        seen.add(originalName);

        if (limit && products.length >= limit) break;

        const pos = match.index;

        // Search backward for the image
        let imageUrl = "";
        const searchBefore = content.substring(Math.max(0, pos - 2000), pos);
        const imgMatch = searchBefore.match(/src="([^"]+)"/);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }

        // Search forward for the price
        let costPrice = 11000.00; // default cost
        const searchAfter = content.substring(pos, pos + 1500);
        const priceMatch = searchAfter.match(/woocommerce-Price-amount amount.*?Symbol.*?#36;<\/span>([0-9.,]+)/);
        if (priceMatch) {
          costPrice = parseFloat(priceMatch[1].replace(/\./g, "").replace(",", "."));
        }

        const codeMatch = originalName.match(/\[([^\]]+)\]/);
        const cleanSku = codeMatch ? `PU-${codeMatch[1]}` : `PU-${100 + idx}`;
        
        products.push({
          supplierId: "s5",
          originalSku: cleanSku,
          originalName,
          originalCategory: "FW 24",
          costPrice,
          sourceUrl: "https://purycurvy.com.ar/categoria-producto/fw-24/",
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500",
          galleryUrls: [],
          availableSizes: ["XL", "XXL", "3XL", "4XL"],
          availableColors: ["Negro", "Azul", "Rojo"],
          rawVariations: [
            { size: "XL", color: "Negro", stock: 8 },
            { size: "XXL", color: "Negro", stock: 12 },
            { size: "3XL", color: "Negro", stock: 14 },
            { size: "4XL", color: "Negro", stock: 6 },
            { size: "XL", color: "Azul", stock: 5 },
            { size: "XXL", color: "Azul", stock: 8 },
            { size: "3XL", color: "Azul", stock: 10 },
            { size: "4XL", color: "Azul", stock: 4 },
          ],
          materialComposicion: "Viscosa / Lanilla soft",
          calce: "Corte holgado / Curvy confort",
          fitType: "semi_elastizado",
        });

        idx++;
      }

      return products;
    } catch (error) {
      console.error("Error in PuryConnector:", error);
      return [];
    }
  }
}
