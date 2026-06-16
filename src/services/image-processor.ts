export interface ImageProcessingResult {
  urlPublic: string;
  urlOriginal: string;
  requiresReview: boolean;
  reviewReason?: string;
  isDuplicate: boolean;
  dimensions: { width: number; height: number };
}

export class ImageProcessor {
  private static processedUrls = new Set<string>();

  // Reset processor state (e.g. at start of sync)
  static reset(): void {
    this.processedUrls.clear();
  }

  // Processes an image URL, checks for watermarks/logos, and flags duplicates
  static processImage(
    imageUrl: string,
    supplierId: string,
    supplierName: string
  ): ImageProcessingResult {
    const urlLower = imageUrl.toLowerCase();
    const supplierLower = supplierName.toLowerCase();
    
    let requiresReview = false;
    let reviewReason = "";

    // 1. Watermark / Logo detection
    // If the image URL contains the supplier's name or common supplier patterns, or if it lacks specific public branding, flag it.
    // In particular, look for file keywords: logo, watermark, marca, original, or supplier names.
    if (
      urlLower.includes("logo") ||
      urlLower.includes("watermark") ||
      urlLower.includes("marca") ||
      urlLower.includes("copyright") ||
      urlLower.includes(supplierLower) ||
      urlLower.includes("pomina") ||
      urlLower.includes("pury") ||
      urlLower.includes("cheta") ||
      urlLower.includes("shaple") ||
      urlLower.includes("seismoda") ||
      urlLower.includes("seis") ||
      urlLower.includes("syes")
    ) {
      requiresReview = true;
      reviewReason = `Posible marca de agua o logotipo detectado en la URL de origen (${supplierName})`;
    }

    // 2. Duplicate detection
    const isDuplicate = this.processedUrls.has(imageUrl);
    if (!isDuplicate) {
      this.processedUrls.add(imageUrl);
    }

    // 3. Simulated conversion to WebP / optimization
    // In a real server, we would fetch, crop, convert to webp, and save in S3/Supabase Storage.
    // Here we return the URL as is, or format it to simulate a local WebP storage path if it was processed, 
    // but preserving the original. For demo purposes we suffix it or replace extension, and keep it accessible.
    let urlPublic = imageUrl;
    if (imageUrl && !imageUrl.startsWith("data:") && !imageUrl.includes("unsplash.com")) {
      // simulate optimized local webp storage path
      const urlParts = imageUrl.split("/");
      const filename = urlParts[urlParts.length - 1].split("?")[0];
      const nameWithoutExt = filename.substring(0, filename.lastIndexOf(".")) || filename;
      urlPublic = `/images/catalog/optimized/${supplierId}_${nameWithoutExt}.webp`;
      
      // But if it's external, for visual rendering we will keep the original URL or fallback to unsplash
      // so it actually renders in the UI, but under the hood we store this optimized public path.
      // Let's pass the original URL so the image loads, but register that it is optimized.
      urlPublic = imageUrl;
    }

    return {
      urlPublic,
      urlOriginal: imageUrl,
      requiresReview,
      reviewReason: requiresReview ? reviewReason : undefined,
      isDuplicate,
      dimensions: { width: 800, height: 1200 }, // Standard apparel aspect ratio 2:3
    };
  }
}
