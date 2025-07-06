// Wishlist-related TypeScript interfaces

export interface Wishlist {
  id: string;
  customer_id: string;
  product_id: string;
  created_at: string;
  
  // Related data (when included)
  product?: {
    id: string;
    name: string;
    arabic_name?: string;
    slug: string;
    description: string;
    short_description?: string;
    price: number;
    regular_price: number;
    currency: string;
    featured_image?: string;
    category: string;
    stock_status: string;
    status: string;
    created_at: string;
  };
}

export interface WishlistItem extends Wishlist {
  product: NonNullable<Wishlist['product']>;
}

export interface WishlistStats {
  totalItems: number;
  recentlyAdded: WishlistItem[];
  categoryCounts: Record<string, number>;
  totalValue: number;
}

export interface WishlistFilters {
  category?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  search?: string;
  sortBy?: WishlistSortOption;
  sortOrder?: 'asc' | 'desc';
}

export type WishlistSortOption = 
  | 'created_at'    // Date added
  | 'name'          // Product name A-Z
  | 'price'         // Price low to high
  | 'category';     // Islamic category

export interface WishlistContextType {
  // State
  wishlistItems: WishlistItem[];
  loading: boolean;
  error: string | null;
  
  // Computed values
  wishlistCount: number;
  totalValue: number;
  
  // Actions
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  
  // Utility
  refreshWishlist: () => Promise<void>;
  moveToCart: (productId: string) => Promise<void>;
  shareWishlist: () => Promise<string>; // Returns shareable URL
}

// For the header wishlist count badge
export interface WishlistBadgeProps {
  count: number;
  showBadge?: boolean;
  className?: string;
}

// For wishlist action buttons
export interface WishlistButtonProps {
  productId: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'button' | 'text';
  showText?: boolean;
  className?: string;
  onToggle?: (productId: string, isInWishlist: boolean) => void;
}

// For bulk operations
export interface WishlistBulkActions {
  selectedItems: string[];
  actions: {
    addAllToCart: () => Promise<void>;
    removeSelected: () => Promise<void>;
    clearAll: () => Promise<void>;
  };
}

// Configuration for wishlist display
export const WISHLIST_CONFIG = {
  maxItems: 100, // Maximum items per wishlist
  itemsPerPage: 12, // For pagination
  gridCols: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    large: 4
  },
  sortOptions: [
    { value: 'created_at-desc', label: 'Recently Added' },
    { value: 'created_at-asc', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price-asc', label: 'Price Low to High' },
    { value: 'price-desc', label: 'Price High to Low' },
    { value: 'category-asc', label: 'Category A-Z' }
  ]
} as const;

export const WISHLIST_MESSAGES = {
  added: 'Added to wishlist',
  removed: 'Removed from wishlist',
  error: 'Something went wrong',
  loginRequired: 'Please log in to save items to your wishlist',
  empty: 'Your wishlist is empty',
  emptyFiltered: 'No items match your filters',
  maxItemsReached: 'Maximum wishlist items reached',
  alreadyExists: 'Item already in wishlist'
} as const;