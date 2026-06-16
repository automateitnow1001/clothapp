import { RawProduct } from "../connectors/connector-base";

// 19 Standard Categories for Pacheca
export const PACHECA_CATEGORIES = [
  { id: "cat_jeans", name: "Jeans", slug: "jeans" },
  { id: "cat_pantalones", name: "Pantalones", slug: "pantalones" },
  { id: "cat_remeras", name: "Remeras", slug: "remeras" },
  { id: "cat_camisas", name: "Camisas", slug: "camisas" },
  { id: "cat_blusas", name: "Blusas", slug: "blusas" },
  { id: "cat_sweaters", name: "Sweaters", slug: "sweaters" },
  { id: "cat_buzos", name: "Buzos", slug: "buzos" },
  { id: "cat_abrigos", name: "Camperas y abrigos", slug: "camperas-y-abrigos" },
  { id: "cat_vestidos", name: "Vestidos", slug: "vestidos" },
  { id: "cat_monos", name: "Monos", slug: "monos" },
  { id: "cat_polleras", name: "Polleras", slug: "polleras" },
  { id: "cat_shorts", name: "Shorts y bermudas", slug: "shorts-y-bermudas" },
  { id: "cat_conjuntos", name: "Conjuntos", slug: "conjuntos" },
  { id: "cat_interior", name: "Ropa interior", slug: "ropa-interior" },
  { id: "cat_banio", name: "Trajes de baño", slug: "trajes-de-bano" },
  { id: "cat_deportivo", name: "Deportivo", slug: "deportivo" },
  { id: "cat_talles_grandes", name: "Talles grandes y especiales", slug: "talles-grandes-y-especiales" },
  { id: "cat_nuevos", name: "Nuevos ingresos", slug: "nuevos-ingresos" },
  { id: "cat_ofertas", name: "Ofertas", slug: "ofertas" }
];

export class ProductNormalizer {
  // Normalize Categories
  static normalizeCategory(originalName: string, originalCategory: string): { id: string; name: string } {
    const nameLower = originalName.toLowerCase();
    const catLower = originalCategory.toLowerCase();

    // Check keywords in name and category
    if (nameLower.includes("wideleg") || nameLower.includes("wide leg") || nameLower.includes("jean") || nameLower.includes("denim") || nameLower.includes("semioxford") || nameLower.includes("oxford") || nameLower.includes("mom") || nameLower.includes("chupin") || nameLower.includes("chupín") || nameLower.includes("cargo")) {
      return { id: "cat_jeans", name: "Jeans" };
    }
    if (nameLower.includes("remera") || nameLower.includes("top") || nameLower.includes("musculosa") || nameLower.includes("remerón") || nameLower.includes("remeron")) {
      return { id: "cat_remeras", name: "Remeras" };
    }
    if (nameLower.includes("camisa") || nameLower.includes("maxicamisa")) {
      return { id: "cat_camisas", name: "Camisas" };
    }
    if (nameLower.includes("blusa")) {
      return { id: "cat_blusas", name: "Blusas" };
    }
    if (nameLower.includes("sweater") || nameLower.includes("cardigan") || nameLower.includes("saco de hilo") || nameLower.includes("poncho")) {
      return { id: "cat_sweaters", name: "Sweaters" };
    }
    if (nameLower.includes("buzo") || nameLower.includes("hoodie")) {
      return { id: "cat_buzos", name: "Buzos" };
    }
    if (nameLower.includes("campera") || nameLower.includes("trench") || nameLower.includes("abrigo") || nameLower.includes("blazer") || nameLower.includes("chaleco") || nameLower.includes("saco")) {
      return { id: "cat_abrigos", name: "Camperas y abrigos" };
    }
    if (nameLower.includes("vestido")) {
      return { id: "cat_vestidos", name: "Vestidos" };
    }
    if (nameLower.includes("mono") || nameLower.includes("jumpsuit")) {
      return { id: "cat_monos", name: "Monos" };
    }
    if (nameLower.includes("pollera") || nameLower.includes("falda") || nameLower.includes("kilt")) {
      return { id: "cat_polleras", name: "Polleras" };
    }
    if (nameLower.includes("short") || nameLower.includes("bermuda") || nameLower.includes("jort")) {
      return { id: "cat_shorts", name: "Shorts y bermudas" };
    }
    if (nameLower.includes("bombacha") || nameLower.includes("corpiño") || nameLower.includes("pantie") || nameLower.includes("biquini") || nameLower.includes("slip") || nameLower.includes("boxer")) {
      return { id: "cat_interior", name: "Ropa interior" };
    }
    if (nameLower.includes("malla") || nameLower.includes("traje de baño") || nameLower.includes("bikini")) {
      return { id: "cat_banio", name: "Trajes de baño" };
    }
    if (nameLower.includes("calza") || nameLower.includes("pantalon") || nameLower.includes("pantalón") || nameLower.includes("palazzo") || nameLower.includes("babucha") || nameLower.includes("jogging") || nameLower.includes("sastrero")) {
      return { id: "cat_pantalones", name: "Pantalones" };
    }
    if (nameLower.includes("deportivo") || nameLower.includes("calza deportiva") || nameLower.includes("fitness") || nameLower.includes("running")) {
      return { id: "cat_deportivo", name: "Deportivo" };
    }
    if (nameLower.includes("conjunto") || nameLower.includes("set")) {
      return { id: "cat_conjuntos", name: "Conjuntos" };
    }

    // fallback mapping based on originalCategory
    if (catLower.includes("jean") || catLower.includes("denim")) return { id: "cat_jeans", name: "Jeans" };
    if (catLower.includes("pantalon") || catLower.includes("calza")) return { id: "cat_pantalones", name: "Pantalones" };
    if (catLower.includes("remera") || catLower.includes("top")) return { id: "cat_remeras", name: "Remeras" };
    if (catLower.includes("camisa") || catLower.includes("blusa")) return { id: "cat_camisas", name: "Camisas" };
    if (catLower.includes("sweater") || catLower.includes("abrigo") || catLower.includes("invierno")) return { id: "cat_abrigos", name: "Camperas y abrigos" };

    return { id: "cat_talles_grandes", name: "Talles grandes y especiales" };
  }

  // Size Normalization Mapping (no auto conversion without equivalence, but uniform representations)
  static normalizeSize(size: string): string {
    const s = size.trim().toUpperCase();
    
    // Numeric mapping
    if (/^\d+$/.test(s)) {
      const num = parseInt(s, 10);
      if (num >= 34 && num <= 70) {
        return num.toString();
      }
    }

    // Special cases mapping
    if (s === "ÚNICO" || s === "UNICO" || s === "U" || s === "TALLE UNICO" || s === "TU") {
      return "Talle único";
    }

    // Letters mapping
    if (s === "S" || s === "M" || s === "L" || s === "XL" || s === "XXL" || s === "2XL") {
      return s === "2XL" ? "XXL" : s;
    }
    if (s === "XXXL" || s === "3XL") return "3XL";
    if (s === "XXXXL" || s === "4XL") return "4XL";
    if (s === "XXXXXL" || s === "5XL") return "5XL";

    return s; // Keep as is if unrecognized, but clean
  }

  // Generar etiquetas automáticas
  static generateTags(name: string, categoryName: string, supplierId: string, sizes: string[]): string[] {
    const tags: string[] = [];
    const nameLower = name.toLowerCase();

    // Curvy / Especial tags
    if (["s4", "s5", "s7", "s2"].includes(supplierId) || nameLower.includes("talle especial") || nameLower.includes("curvy") || nameLower.includes("talles grandes")) {
      tags.push("Curvy");
      tags.push("Talle especial");
    }

    // Fabric properties
    if (nameLower.includes("elastizado") || nameLower.includes("lycra") || nameLower.includes("spandex") || nameLower.includes("morley")) {
      tags.push("Elastizado");
    } else if (nameLower.includes("rigido") || nameLower.includes("rígido") || nameLower.includes("denim rigido")) {
      tags.push("Rígido");
    }

    // Silhouettes / Jeans styles
    if (nameLower.includes("wideleg") || nameLower.includes("wide leg")) {
      tags.push("Wide leg");
    } else if (nameLower.includes("recto") || nameLower.includes("straight")) {
      tags.push("Recto");
    } else if (nameLower.includes("chupin") || nameLower.includes("chupín") || nameLower.includes("skinny")) {
      tags.push("Chupín");
    } else if (nameLower.includes("mom")) {
      tags.push("Mom");
    } else if (nameLower.includes("oxford") || nameLower.includes("bootcut")) {
      tags.push("Oxford");
    } else if (nameLower.includes("palazzo") || nameLower.includes("palazo")) {
      tags.push("Palazzo");
    } else if (nameLower.includes("cargo")) {
      tags.push("Cargo");
    }

    // Season tag (Invierno / Verano)
    if (nameLower.includes("invierno") || nameLower.includes("fw") || nameLower.includes("abrigo") || nameLower.includes("lana")) {
      tags.push("Invierno");
    } else if (nameLower.includes("verano") || nameLower.includes("ss") || nameLower.includes("lino") || nameLower.includes("musculosa")) {
      tags.push("Verano");
    } else {
      tags.push("Temporada");
    }

    // Size range tag
    if (sizes.length > 0) {
      const isNumeric = sizes.every(s => /^\d+$/.test(s));
      if (isNumeric) {
        const sorted = sizes.map(Number).sort((a, b) => a - b);
        tags.push(`Talles ${sorted[0]}-${sorted[sorted.length - 1]}`);
      } else {
        tags.push("Rango de talles");
      }
    }

    return Array.from(new Set(tags));
  }

  // Clean raw product name for Pacheca identity
  static cleanPublicName(originalName: string): string {
    // 1. Remove brackets like [P2309] or [SV27]
    let name = originalName.replace(/\[[^\]]+\]/g, "");
    
    // 2. Remove supplier brand names
    const brands = ["pomina", "pury curvy", "pury", "seis moda", "seis", "shaple jeans", "shaple", "cheta jeans", "cheta", "syes mayorista", "syes minorista", "syes"];
    brands.forEach(b => {
      const regex = new RegExp(`\\b${b}\\b`, "gi");
      name = name.replace(regex, "");
    });

    // 3. Split by color indicator and clean
    const colors = ["negro", "gris", "uva", "blanco", "rosa", "chocolate", "azul", "verde", "bordo", "bordó", "visón", "crudo", "vison", "veteado", "fucsia", "amarillo", "beige", "arena", "canela", "marino", "celeste", "azul oscuro"];
    const colorsRegex = new RegExp(`,\\s*(?:${colors.join("|")})\\b`, "i");
    name = name.split(colorsRegex)[0];

    // 4. Split by description attributes
    const details = ["de punto yoga", "con tiras", "con tablas", "con elástico", "cruzado"];
    details.forEach(d => {
      const regex = new RegExp(`\\b${d}\\b`, "gi");
      name = name.split(regex)[0];
    });

    // 5. Clean whitespace and capitalization
    name = name.replace(/\s+/g, " ").trim();
    name = name.replace(/^[,.\-\s]+|[,.\-\s]+$/g, "");

    if (name.length > 0) {
      name = name[0].toUpperCase() + name.substring(1).toLowerCase();
    } else {
      name = "Prenda Pacheca";
    }

    return name;
  }
}
