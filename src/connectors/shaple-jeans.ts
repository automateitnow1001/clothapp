import fs from "fs";
import path from "path";
import { IConnector, RawProduct } from "./connector-base";

export class ShapleJeansConnector implements IConnector {
  async fetchProducts(limit?: number): Promise<RawProduct[]> {
    try {
      const filePath = path.join(process.cwd(), "src/connectors/html/shaple.html");
      if (!fs.existsSync(filePath)) {
        console.error(`Shaple file not found at ${filePath}`);
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
        const searchBefore = content.substring(Math.max(0, pos - 1200), pos);
        const imgMatch = searchBefore.match(/src="([^"]+)"/);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }

        // Search forward for price
        let costPrice = 32000.00;
        const searchAfter = content.substring(pos, pos + 1500);
        const priceMatch = searchAfter.match(/woocommerce-Price-amount amount.*?Symbol.*?#36;<\/span>([0-9.,]+)/);
        if (priceMatch) {
          costPrice = parseFloat(priceMatch[1].replace(/\./g, "").replace(",", "."));
        }

        const nameCleaned = rawName.replace(/<[^>]+>/g, "").trim();
        const codeMatch = nameCleaned.match(/\[([^\]]+)\]/);
        const cleanSku = codeMatch ? `SH-${codeMatch[1]}` : `SH-${100 + idx}`;
        
        const isRigid = nameCleaned.toLowerCase().includes("rigido") || nameCleaned.toLowerCase().includes("rígido");
        const fitType = isRigid ? "rigido" : "elastizado";

        products.push({
          supplierId: "s3",
          originalSku: cleanSku,
          originalName: nameCleaned,
          originalCategory: "Jeans",
          costPrice,
          sourceUrl: "https://shaplejeans.com/tienda/",
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
          galleryUrls: [],
          availableSizes: ["38", "40", "42", "44", "46", "48", "50"],
          availableColors: ["Azul", "Celeste", "Negro"],
          rawVariations: [
            { size: "38", color: "Azul", stock: 8 },
            { size: "40", color: "Azul", stock: 10 },
            { size: "42", color: "Azul", stock: 12 },
            { size: "44", color: "Azul", stock: 10 },
            { size: "46", color: "Azul", stock: 6 },
            { size: "48", color: "Azul", stock: 4 },
            { size: "50", color: "Azul", stock: 3 },
            { size: "38", color: "Celeste", stock: 5 },
            { size: "40", color: "Celeste", stock: 8 },
            { size: "42", color: "Celeste", stock: 10 },
            { size: "44", color: "Celeste", stock: 7 },
          ],
          materialComposicion: isRigid ? "Denim rígido 100% Algodón" : "Denim con elastano",
          calce: "Wide Leg o Semi Oxford",
          fitType,
        });

        idx++;
      }

      return products;
    } catch (error) {
      console.error("Error in ShapleJeansConnector:", error);
      return [];
    }
  }
}
