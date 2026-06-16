import fs from "fs";
import path from "path";
import { IConnector, RawProduct } from "./connector-base";

export class SyesMinoristaConnector implements IConnector {
  async fetchProducts(limit?: number): Promise<RawProduct[]> {
    try {
      const filePath = path.join(process.cwd(), "src/connectors/html/syes.html");
      if (!fs.existsSync(filePath)) {
        console.error(`Syes Minorista file not found at ${filePath}`);
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
        let costPrice = 15000.00;
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

        const cleanSku = `SY-${prodId.substring(0, 6)}`;
        
        products.push({
          supplierId: "s1",
          originalSku: cleanSku,
          originalName,
          originalCategory: "Invierno 2026",
          costPrice,
          sourceUrl: "https://syes.com.ar/invierno-2026/",
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500",
          galleryUrls: [],
          availableSizes: ["S", "M", "L", "XL", "XXL"],
          availableColors: ["Negro", "Gris", "Azul"],
          rawVariations: [
            { size: "S", color: "Negro", stock: 10 },
            { size: "M", color: "Negro", stock: 15 },
            { size: "L", color: "Negro", stock: 12 },
            { size: "XL", color: "Negro", stock: 8 },
            { size: "XXL", color: "Negro", stock: 5 },
            { size: "M", color: "Gris", stock: 6 },
            { size: "L", color: "Gris", stock: 8 },
            { size: "XL", color: "Gris", stock: 4 },
          ],
          materialComposicion: "Polyester / Elastano",
          calce: "Calce premium curvado",
          fitType: "elastizado",
        });

        idx++;
      }

      return products;
    } catch (error) {
      console.error("Error in SyesMinoristaConnector:", error);
      return [];
    }
  }
}
