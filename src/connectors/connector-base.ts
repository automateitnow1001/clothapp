export interface RawProduct {
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
}

export interface IConnector {
  fetchProducts(limit?: number): Promise<RawProduct[]>;
}
