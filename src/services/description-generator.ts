export class DescriptionGenerator {
  // Generate a customized, premium commercial description in Argentine Spanish
  static generate(params: {
    namePublic: string;
    originalCategory: string;
    normalizedCategory: string;
    material?: string;
    calce?: string;
    fitType?: "elastizado" | "rigido" | "semi_elastizado";
    sizes: string[];
    colors: string[];
  }): string {
    const { namePublic, normalizedCategory, material, calce, fitType, sizes, colors } = params;
    const cat = normalizedCategory.toLowerCase();

    const isJeans = cat.includes("jeans") || namePublic.toLowerCase().includes("jean");
    const isAbrigo = cat.includes("abrigo") || cat.includes("sweater") || cat.includes("buzo");
    const isRemera = cat.includes("remera") || cat.includes("blusa") || cat.includes("camisa");

    // 1. Hook / Intro
    let intro = "";
    if (isJeans) {
      intro = `Un jean imprescindible para tu placard. El modelo ${namePublic} se convertirá rápidamente en tu aliado diario para armar looks súper cancheros y ultra cómodos.`;
    } else if (isAbrigo) {
      intro = `Súper abrigado y con una textura espectacular, el modelo ${namePublic} es ideal para hacerle frente a los días frescos con toda la onda.`;
    } else if (isRemera) {
      intro = `Fresco, liviano y con una caída divina, el modelo ${namePublic} es esa prenda versátil que necesitás para salvar cualquier outfit.`;
    } else {
      intro = `Te presentamos el modelo ${namePublic}, diseñado especialmente para complementar tus looks diarios con estilo, frescura y la comodidad que merecés.`;
    }

    // 2. Style & Design details
    let designDetails = "";
    if (calce) {
      designDetails = `Presenta un calce ${calce.toLowerCase()}, diseñado para adaptarse a tu cuerpo con total naturalidad y realzar tu figura sin ajustar.`;
    } else if (isJeans) {
      designDetails = `Con tiro alto clásico y calce súper asentador, se adapta de manera espectacular para brindarte libertad de movimiento total.`;
    } else {
      designDetails = `Cuenta con un diseño pensado para la versatilidad de todos los días, perfecto tanto para ir a trabajar como para una salida casual de fin de semana.`;
    }

    // 3. Fabric & Material details
    let fabricDetails = "";
    const fabricType = fitType === "elastizado" ? "elastizado" : fitType === "semi_elastizado" ? "semi-elastizado" : "rígido";
    if (material) {
      fabricDetails = `Confeccionado en ${material.toLowerCase()}, un género de calidad premium que garantiza durabilidad y suavidad al tacto. La tela posee un comportamiento ${fabricType}, perfecto para acompañarte todo el día.`;
    } else if (isJeans) {
      fabricDetails = `Confeccionado en denim premium con comportamiento ${fabricType}, súper resistente y amigable con el uso cotidiano.`;
    } else {
      fabricDetails = `Su textil seleccionado es suave y ligero, ideal para usar directamente sobre la piel o en capas.`;
    }

    // 4. Details on sizes and colors
    let sizeDetails = "";
    if (sizes.length > 0) {
      const isNumeric = sizes.every(s => /^\d+$/.test(s));
      const tallesWord = isNumeric ? "talles reales del" : "talles";
      sizeDetails = `Disponible en ${tallesWord} ${sizes[0]} al ${sizes[sizes.length - 1]}. En Pacheca nos enfocamos en que encuentres tu talle ideal para que te sientas cómoda y segura.`;
    }

    // 5. Build description paragraphs
    return `${intro}\n\n${designDetails} ${fabricDetails}\n\n${sizeDetails}`.trim();
  }
}
