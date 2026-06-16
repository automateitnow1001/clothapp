import fs from "fs";
import path from "path";
import { IConnector, RawProduct } from "./connector-base";

export class SeisConnector implements IConnector {
  async fetchProducts(limit?: number): Promise<RawProduct[]> {
    try {
      const filePath = path.join(process.cwd(), "src/connectors/html/seis.html");
      if (!fs.existsSync(filePath)) {
        console.error(`Seis file not found at ${filePath}`);
        return [];
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const products: RawProduct[] = [];
      
      const regex = /data-store="product-item-name-(\d+)">(.*?)<\/div>/g;
      let match;
      let idx = 0;

      while ((match = regex.exec(content)) !== null) {
        if (limit && products.length >= limit) break;

        const prodId = match[1];
        const originalName = match[2].trim();
        const pos = match.index;

        // Search forward for price
        let costPrice = 24000.00;
        const searchAfter = content.substring(pos, pos + 1200);
        const priceMatch = searchAfter.match(/data-product-price="(\d+)"/);
        if (priceMatch) {
          costPrice = parseFloat(priceMatch[1]) / 100.0;
        }

        // Search backward for image
        let imageUrl = "";
        const searchBefore = content.substring(Math.max(0, pos - 1000), pos);
        const imgMatch = searchBefore.match(/src="([^"]+)"/);
        if (imgMatch) {
          imageUrl = imgMatch[1];
          if (imageUrl.startsWith("//")) {
            imageUrl = "https:" + imageUrl;
          }
        }

        const cleanSku = `SE-${prodId.substring(0, 6)}`;
        
        products.push({
          supplierId: "s2",
          originalSku: cleanSku,
          originalName,
          originalCategory: "Productos",
          costPrice,
          sourceUrl: "https://www.seismoda.com/productos/",
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500",
          galleryUrls: [],
          availableSizes: ["46", "48", "50", "52", "54", "56"],
          availableColors: ["Negro", "Rosa", "Blanco"],
          rawVariations: [
            { size: "46", color: "Negro", stock: 6 },
            { size: "48", color: "Negro", stock: 8 },
            { size: "50", color: "Negro", stock: 10 },
            { size: "52", color: "Negro", stock: 7 },
            { size: "54", color: "Negro", stock: 5 },
            { size: "56", color: "Negro", stock: 3 },
            { size: "48", color: "Rosa", stock: 4 },
            { size: "50", color: "Rosa", stock: 6 },
            { size: "52", color: "Rosa", stock: 5 },
          ],
          materialComposicion: "Sastrería / Crepe de alta calidad",
          calce: "Corte sastrero premium",
          fitType: "rigido",
        });

        idx++;
      }

      return products;
    } catch (error) {
      console.error("Error in SeisConnector:", error);
      return [];
    }
  }
}
