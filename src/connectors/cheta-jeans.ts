import fs from "fs";
import path from "path";
import { IConnector, RawProduct } from "./connector-base";

export class ChetaJeansConnector implements IConnector {
  async fetchProducts(limit?: number): Promise<RawProduct[]> {
    try {
      const filePath = path.join(process.cwd(), "src/connectors/html/cheta.html");
      if (!fs.existsSync(filePath)) {
        console.error(`Cheta file not found at ${filePath}`);
        return [];
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const products: RawProduct[] = [];
      
      const regex = /class="name product-title woocommerce-loop-product__title"><a href="([^"]+)"[^>]*>(.*?)<\/a>/g;
      let match;
      let idx = 0;

      while ((match = regex.exec(content)) !== null) {
        if (limit && products.length >= limit) break;

        const url = match[1];
        const rawName = match[2].trim();
        const pos = match.index;

        // Search backward for image
        let imageUrl = "";
        const searchBefore = content.substring(Math.max(0, pos - 1500), pos);
        const imgMatch = searchBefore.match(/src="([^"]+)"/);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }

        // Search forward for price in WooCommerce schema or variations
        let costPrice = 34000.00;
        const searchAfter = content.substring(pos, pos + 4000);
        const displayPriceMatch = searchAfter.match(/display_price&quot;:(\d+)/);
        if (displayPriceMatch) {
          costPrice = parseFloat(displayPriceMatch[1]);
        } else {
          const priceMatch = searchAfter.match(/woocommerce-Price-amount amount.*?Symbol.*?#36;<\/span>([0-9.,]+)/);
          if (priceMatch) {
            costPrice = parseFloat(priceMatch[1].replace(/\./g, "").replace(",", "."));
          }
        }

        const nameCleaned = rawName.replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " ");
        const codeMatch = nameCleaned.match(/([A-Za-z0-9-]+)/);
        const cleanSku = codeMatch ? `CH-${codeMatch[1]}` : `CH-${200 + idx}`;
        
        // Curvy Jeans Sizes: 48, 50, 52, 54, 56, 58, 60
        const isElastizado = nameCleaned.toLowerCase().includes("elastizado") || nameCleaned.toLowerCase().includes("lycra");
        const fitType = isElastizado ? "elastizado" : "rigido";

        products.push({
          supplierId: "s4",
          originalSku: cleanSku,
          originalName: nameCleaned,
          originalCategory: "Jeans",
          costPrice,
          sourceUrl: "https://chetajeans.com.ar/shop/",
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
          galleryUrls: [],
          availableSizes: ["48", "50", "52", "54", "56", "58", "60"],
          availableColors: ["Negro", "Celeste", "Azul Oscuro"],
          rawVariations: [
            { size: "48", color: "Negro", stock: 5 },
            { size: "50", color: "Negro", stock: 7 },
            { size: "52", color: "Negro", stock: 8 },
            { size: "54", color: "Negro", stock: 10 },
            { size: "56", color: "Negro", stock: 6 },
            { size: "58", color: "Negro", stock: 3 },
            { size: "60", color: "Negro", stock: 2 },
            { size: "48", color: "Celeste", stock: 4 },
            { size: "50", color: "Celeste", stock: 6 },
            { size: "52", color: "Celeste", stock: 5 },
            { size: "54", color: "Celeste", stock: 8 },
            { size: "56", color: "Celeste", stock: 4 },
          ],
          materialComposicion: isElastizado ? "Denim con elastano (Lycra)" : "Denim de algodón 100% rígido",
          calce: "Tiro alto con calce moldeador",
          fitType,
        });

        idx++;
      }

      return products;
    } catch (error) {
      console.error("Error in ChetaJeansConnector:", error);
      return [];
    }
  }
}
