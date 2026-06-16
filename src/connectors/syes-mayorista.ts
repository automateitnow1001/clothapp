import fs from "fs";
import path from "path";
import { IConnector, RawProduct } from "./connector-base";

export class SyesMayoristaConnector implements IConnector {
  async fetchProducts(limit?: number): Promise<RawProduct[]> {
    try {
      const filePath = path.join(process.cwd(), "src/connectors/html/syes_mayorista.html");
      if (!fs.existsSync(filePath)) {
        console.error(`Syes Mayorista file not found at ${filePath}`);
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
        let costPrice = 8000.00;
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

        const cleanSku = `SYM-${prodId.substring(0, 6)}`;
        
        products.push({
          supplierId: "s7",
          originalSku: cleanSku,
          originalName,
          originalCategory: "Invierno 2025",
          costPrice,
          sourceUrl: "https://tienda.syestallesgrandes.com/invierno-2025/",
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500",
          galleryUrls: [],
          availableSizes: ["46", "48", "50", "52", "54", "56"],
          availableColors: ["Gris", "Negro", "Marino"],
          rawVariations: [
            { size: "46", color: "Gris", stock: 12 },
            { size: "48", color: "Gris", stock: 15 },
            { size: "50", color: "Gris", stock: 18 },
            { size: "52", color: "Gris", stock: 15 },
            { size: "54", color: "Gris", stock: 10 },
            { size: "56", color: "Gris", stock: 5 },
            { size: "48", color: "Negro", stock: 8 },
            { size: "50", color: "Negro", stock: 12 },
            { size: "52", color: "Negro", stock: 10 },
          ],
          materialComposicion: "Lana / Acrílico de punto",
          calce: "Calce confortable y abrigado",
          fitType: "semi_elastizado",
        });

        idx++;
      }

      return products;
    } catch (error) {
      console.error("Error in SyesMayoristaConnector:", error);
      return [];
    }
  }
}
