// Product and Inventory Management Types

export interface Product {
  id: string;
  name: string;
  arabicName?: string;
  slug: string;
  description: string;
  shortDescription?: string;
  
  // Pricing
  price: number;
  originalPrice?: number;
  regularPrice: number;
  currency: 'GBP' | 'USD' | 'EUR';
  vatIncluded: boolean;
  
  // Reviews and Rating
  rating?: number;
  reviewCount?: number;
  
  // Categories and Tags
  category: ProductCategory;
  subcategory?: string;
  tags: string[];
  
  // Images and Media
  images: ProductImage[];
  featuredImage: string;
  gallery?: string[];
  
  // 3D Models (Limited to 1 per product)
  models: Product3DModel[];
  has3dModel: boolean;
  featuredModel: string;
  
  // HDRI Environment
  hdriFiles: ProductHDRI[];
  hasHdri: boolean;
  defaultHdriUrl: string;
  defaultHdriIntensity: number; // 0.0 to 2.0, default 1.0
  backgroundBlurEnabled?: boolean;
  backgroundBlurIntensity?: number; // 0-10 scale for background blur intensity
  
  // Inventory
  sku: string;
  stock: number;
  stockStatus: StockStatus;
  manageStock: boolean;
  lowStockThreshold?: number;
  
  // Physical Properties
  dimensions?: ProductDimensions;
  weight?: number; // in grams
  material: string[];
  color?: string[];
  
  // Islamic Art Specific
  islamicCategory: IslamicArtCategory;
  arabicText?: string;
  transliteration?: string;
  translation?: string;
  historicalContext?: string;
  
  // Manufacturing
  printTime?: number; // in hours
  finishingTime?: number; // in hours
  difficulty: 'Simple' | 'Moderate' | 'Complex' | 'Master';
  
  // Product Variants
  variants?: ProductVariant[];
  
  // SEO and Marketing
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
  onSale: boolean;
  saleStartDate?: string;
  saleEndDate?: string;
  
  // Status and Timestamps
  status: ProductStatus;
  visibility: ProductVisibility;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  
  // Custom Fields
  customCommission: boolean;
  personalizable: boolean;
  giftWrapping: boolean;
  certificates?: string[]; // Halal, Quality certificates
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  title?: string;
  featured?: boolean;
  sortOrder: number;
}

export interface Product3DModel {
  id: string;
  url: string;
  filename: string;
  fileType: '3dModel';
  format: 'glb' | 'stl' | 'obj' | 'fbx' | 'dae' | 'ply';
  fileSize: number;
  featured: boolean;
  title?: string;
  description?: string;
  sortOrder: number;
  thumbnail?: string; // Preview image of the 3D model
  uploadedAt: string;
  // HDRI Environment Support
  hdriUrl?: string;
  hdriFilename?: string;
  hdriIntensity?: number; // 0.0 to 2.0, default 1.0
  enableHdri?: boolean;
}

export interface ProductHDRI {
  id: string;
  url: string;
  filename: string;
  fileSize: number;
  intensity: number; // 0.0 to 2.0
  isDefault: boolean;
  title?: string;
  description?: string;
  uploadedAt?: string;
}

// Enhanced HDRI Settings for admin forms
export interface HDRISettings {
  hdri?: ProductHDRI | null;
  intensity: number; // 0.0 to 2.0
  backgroundBlurEnabled: boolean;
  backgroundBlurIntensity: number; // 0-10 scale
}

export interface ProductDimensions {
  length: number; // in cm
  width: number;  // in cm
  height: number; // in cm
  unit: 'cm' | 'mm' | 'inch';
}

export type ProductCategory = 
  | 'islamic-calligraphy'
  | 'mosque-models'
  | 'geometric-art'
  | 'arabic-text'
  | 'decorative-art'
  | 'custom-commissions'
  | 'architectural-models'
  | 'wall-art'
  | 'sculptures';

export type IslamicArtCategory =
  | 'calligraphy'
  | 'architecture'
  | 'geometric'
  | 'decorative'
  | 'custom'
  | 'ayat-al-kursi'
  | 'bismillah'
  | 'surah-al-fatiha'
  | '99-names-allah'
  | 'shahada'
  | 'mosque-architecture'
  | 'geometric-patterns'
  | 'arabic-names'
  | 'duas-prayers'
  | 'quranic-verses'
  | 'hadith-quotes'
  | 'islamic-symbols';

export type StockStatus = 
  | 'in-stock'
  | 'low-stock'
  | 'out-of-stock'
  | 'on-backorder'
  | 'pre-order';

export type ProductStatus = 
  | 'draft'
  | 'published'
  | 'scheduled'
  | 'archived'
  | 'disabled'
  | 'limited';

export type ProductVisibility = 
  | 'public'
  | 'private'
  | 'password-protected'
  | 'catalog-only';

// Inventory Management Types
export interface InventoryItem {
  productId: string;
  sku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  location: string;
  supplier?: string;
  costPrice: number;
  lastStockUpdate: string;
  stockMovements: StockMovement[];
}

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  reference?: string; // Order ID, supplier reference, etc.
  cost?: number;
  timestamp: string;
  performedBy: string;
}

export type StockMovementType = 
  | 'purchase'
  | 'sale'
  | 'adjustment'
  | 'return'
  | 'damaged'
  | 'transfer'
  | 'reservation'
  | 'release';

// Product Collections and Categories
export interface ProductCollection {
  id: string;
  name: string;
  arabicName?: string;
  slug: string;
  description: string;
  image?: string;
  products: string[]; // Product IDs
  featured: boolean;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Product Variants (for customizable products)
export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: VariantAttribute[];
  image?: string;
  enabled: boolean;
}

export interface VariantAttribute {
  name: string; // Size, Material, Color, etc.
  value: string;
}

// Search and Filtering
export interface ProductFilters {
  category?: ProductCategory[];
  islamicCategory?: IslamicArtCategory[];
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  onSale?: boolean;
  featured?: boolean;
  material?: string[];
  tags?: string[];
  search?: string;
  status?: ProductStatus[];
  stockStatus?: StockStatus[];
}

export interface ProductSearchParams {
  query?: string;
  category?: string;
  sortBy?: ProductSortOption;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  filters?: ProductFilters;
}

export type ProductSortOption = 
  | 'name'
  | 'price'
  | 'created_at'
  | 'updated_at'
  | 'popularity'
  | 'rating'
  | 'stock';

// Admin Management
export interface ProductStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  featuredProducts: number;
  totalValue: number;
  averagePrice: number;
  topSellingProducts: Product[];
  recentlyAdded: Product[];
  categoryDistribution: Record<ProductCategory, number>;
}

// UK Business Specific
export interface UKBusinessData {
  vatRate: number;
  vatNumber?: string;
  businessAddress: {
    line1: string;
    line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
  };
  shippingZones: ShippingZone[];
}

export interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  methods: ShippingMethod[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  freeShippingThreshold?: number;
  estimatedDays: string;
  enabled: boolean;
}