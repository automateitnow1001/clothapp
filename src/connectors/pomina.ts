import fs from "fs";
import path from "path";
import { IConnector, RawProduct } from "./connector-base";

export class PominaConnector implements IConnector {
  async fetchProducts(limit?: number): Promise<RawProduct[]> {
    try {
      const filePath = path.join(process.cwd(), "src/connectors/html/pomina.html");
      if (!fs.existsSync(filePath)) {
        console.error(`Pomina file not found at ${filePath}`);
        return [];
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const products: RawProduct[] = [];
      
      // Match woocommerce loop product title
      // We can search for the titles and find the surrounding links/images
      const titleRegex = /<div class="woocommerce-loop-product__title">([^<]+)<\/div>/g;
      let match;
      let idx = 0;

      while ((match = titleRegex.exec(content)) !== null) {
        if (limit && products.length >= limit) break;

        const originalName = match[1].trim();
        const pos = match.index;

        // Search backward for the image
        let imageUrl = "";
        const searchBefore = content.substring(Math.max(0, pos - 2500), pos);
        const imgMatch = searchBefore.match(/src="([^"]+)"/);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }

        // Search forward for the price
        let costPrice = 14000.00; // default cost
        const searchAfter = content.substring(pos, pos + 1500);
        const priceMatch = searchAfter.match(/woocommerce-Price-amount amount.*?Symbol.*?#36;<\/span>([0-9.,]+)/);
        if (priceMatch) {
          costPrice = parseFloat(priceMatch[1].replace(/\./g, "").replace(",", "."));
        }

        const cleanSku = `PO-${originalName.replace(/\s+/g, "").substring(0, 6).toUpperCase()}-${idx}`;
        
        products.push({
          supplierId: "s6",
          originalSku: cleanSku,
          originalName,
          originalCategory: "Todos",
          costPrice,
          sourceUrl: "https://pomina.com.ar/product-category/todos/",
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500",
          galleryUrls: [],
          availableSizes: ["S", "M", "L", "XL", "XXL"],
          availableColors: ["Negro", "Beige", "Gris"],
          rawVariations: [
            { size: "S", color: "Negro", stock: 10 },
            { size: "M", color: "Negro", stock: 15 },
            { size: "L", color: "Negro", stock: 8 },
            { size: "XL", color: "Negro", stock: 5 },
            { size: "XXL", color: "Negro", stock: 2 },
            { size: "S", color: "Beige", stock: 5 },
            { size: "M", color: "Beige", stock: 12 },
            { size: "L", color: "Beige", stock: 7 },
            { size: "S", color: "Gris", stock: 3 },
            { size: "M", color: "Gris", stock: 6 },
          ],
          materialComposicion: "Morley / Algodón y poliéster",
          calce: "Silueta amplia",
          fitType: "semi_elastizado",
        });

        idx++;
      }

      return products;
    } catch (error) {
      console.error("Error in PominaConnector:", error);
      return [];
    }
  }
}
