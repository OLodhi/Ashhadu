import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductFilters, ProductSearchParams, InventoryItem, StockMovement, ProductStats } from '@/types/product';
import { generateUUID } from '@/lib/uuid';

interface ProductStore {
  // Product Data
  products: Product[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  
  // Filters and Search
  filters: ProductFilters;
  searchParams: ProductSearchParams;
  
  // Actions - Product Management
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  
  // Actions - Inventory Management
  updateStock: (productId: string, newStock: number, reason: string, performedBy: string) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => void;
  reserveStock: (productId: string, quantity: number, reference: string) => void;
  releaseStock: (productId: string, quantity: number, reference: string) => void;
  
  // Actions - Search and Filtering
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  setSearchParams: (params: Partial<ProductSearchParams>) => void;
  
  // Actions - Product Operations
  toggleProductStatus: (id: string) => void;
  toggleProductFeatured: (id: string) => void;
  updateProductStock: (id: string, stock: number) => void;
  setProductOnSale: (id: string, salePrice: number, startDate?: string, endDate?: string) => void;
  removeProductFromSale: (id: string) => void;
  
  // Getters
  getProduct: (id: string) => Product | undefined;
  getProductBySku: (sku: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getPublishedProducts: () => Product[];
  getFeaturedProducts: () => Product[];
  getOutOfStockProducts: () => Product[];
  getLowStockProducts: () => Product[];
  getFilteredProducts: () => Product[];
  getProductStats: () => ProductStats;
  
  // Bulk Operations
  bulkUpdateProducts: (productIds: string[], updates: Partial<Product>) => void;
  bulkDeleteProducts: (productIds: string[]) => void;
  bulkUpdateStock: (updates: Array<{ productId: string; stock: number }>) => void;
  
  // Import/Export
  importProducts: (products: Product[]) => void;
  exportProducts: () => Product[];
  
  // Utility
  generateSku: (category: string, name: string) => string;
  calculateProductStats: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSelectedProduct: () => void;
  setSelectedProduct: (product: Product | null) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      // Initial State
      products: [],
      inventory: [],
      stockMovements: [],
      isLoading: false,
      error: null,
      selectedProduct: null,
      filters: {},
      searchParams: { page: 1, limit: 20, sortBy: 'created_at', sortOrder: 'desc' },

      // Product Management Actions
      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: generateUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          products: [...state.products, newProduct],
        }));

        // Create inventory entry
        const inventoryItem: InventoryItem = {
          productId: newProduct.id,
          sku: newProduct.sku,
          currentStock: newProduct.stock,
          reservedStock: 0,
          availableStock: newProduct.stock,
          location: 'Main Warehouse',
          costPrice: newProduct.price * 0.6, // Assume 40% margin
          lastStockUpdate: new Date().toISOString(),
          stockMovements: [],
        };

        set((state) => ({
          inventory: [...state.inventory, inventoryItem],
        }));
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? { ...product, ...updates, updatedAt: new Date().toISOString() }
              : product
          ),
        }));

        // Update inventory if stock changed
        if (updates.stock !== undefined) {
          get().updateStock(id, updates.stock, 'Manual adjustment', 'Admin');
        }
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
          inventory: state.inventory.filter((item) => item.productId !== id),
          stockMovements: state.stockMovements.filter((movement) => movement.productId !== id),
        }));
      },

      duplicateProduct: (id) => {
        const originalProduct = get().getProduct(id);
        if (!originalProduct) return;

        const duplicatedProduct = {
          ...originalProduct,
          name: `${originalProduct.name} (Copy)`,
          sku: get().generateSku(originalProduct.category, `${originalProduct.name} Copy`),
          featured: false,
        };

        get().addProduct(duplicatedProduct);
      },

      // Inventory Management
      updateStock: (productId, newStock, reason, performedBy) => {
        const currentInventory = get().inventory.find(item => item.productId === productId);
        if (!currentInventory) return;

        const quantityChange = newStock - currentInventory.currentStock;
        
        // Add stock movement
        const movement: StockMovement = {
          id: generateUUID(),
          productId,
          type: quantityChange > 0 ? 'purchase' : 'adjustment',
          quantity: Math.abs(quantityChange),
          reason,
          timestamp: new Date().toISOString(),
          performedBy,
        };

        set((state) => ({
          stockMovements: [...state.stockMovements, movement],
          inventory: state.inventory.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  currentStock: newStock,
                  availableStock: newStock - item.reservedStock,
                  lastStockUpdate: new Date().toISOString(),
                  stockMovements: [...item.stockMovements, movement],
                }
              : item
          ),
          products: state.products.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  stock: newStock,
                  stockStatus: newStock <= 0 ? 'out-of-stock' : 
                              newStock <= (product.lowStockThreshold || 5) ? 'low-stock' : 'in-stock',
                }
              : product
          ),
        }));
      },

      addStockMovement: (movementData) => {
        const movement: StockMovement = {
          ...movementData,
          id: generateUUID(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          stockMovements: [...state.stockMovements, movement],
        }));
      },

      reserveStock: (productId, quantity, reference) => {
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  reservedStock: item.reservedStock + quantity,
                  availableStock: item.availableStock - quantity,
                }
              : item
          ),
        }));

        get().addStockMovement({
          productId,
          type: 'reservation',
          quantity,
          reason: 'Stock reserved for order',
          reference,
          performedBy: 'System',
        });
      },

      releaseStock: (productId, quantity, reference) => {
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  reservedStock: Math.max(0, item.reservedStock - quantity),
                  availableStock: Math.min(item.currentStock, item.availableStock + quantity),
                }
              : item
          ),
        }));

        get().addStockMovement({
          productId,
          type: 'release',
          quantity,
          reason: 'Stock released from order',
          reference,
          performedBy: 'System',
        });
      },

      // Search and Filtering
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      setSearchParams: (params) => {
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        }));
      },

      // Product Operations
      toggleProductStatus: (id) => {
        const product = get().getProduct(id);
        if (!product) return;

        const newStatus = product.status === 'published' ? 'draft' : 'published';
        get().updateProduct(id, { status: newStatus });
      },

      toggleProductFeatured: (id) => {
        const product = get().getProduct(id);
        if (!product) return;

        get().updateProduct(id, { featured: !product.featured });
      },

      updateProductStock: (id, stock) => {
        get().updateStock(id, stock, 'Stock update', 'Admin');
      },

      setProductOnSale: (id, salePrice, startDate, endDate) => {
        get().updateProduct(id, {
          originalPrice: get().getProduct(id)?.price,
          price: salePrice,
          onSale: true,
          saleStartDate: startDate,
          saleEndDate: endDate,
        });
      },

      removeProductFromSale: (id) => {
        const product = get().getProduct(id);
        if (!product || !product.originalPrice) return;

        get().updateProduct(id, {
          price: product.originalPrice,
          originalPrice: undefined,
          onSale: false,
          saleStartDate: undefined,
          saleEndDate: undefined,
        });
      },

      // Getters
      getProduct: (id) => {
        return get().products.find((product) => product.id === id);
      },

      getProductBySku: (sku) => {
        return get().products.find((product) => product.sku === sku);
      },

      getProductsByCategory: (category) => {
        return get().products.filter((product) => product.category === category);
      },

      getPublishedProducts: () => {
        return get().products.filter((product) => product.status === 'published');
      },

      getFeaturedProducts: () => {
        return get().products.filter((product) => product.featured && product.status === 'published');
      },

      getOutOfStockProducts: () => {
        return get().products.filter((product) => product.stockStatus === 'out-of-stock');
      },

      getLowStockProducts: () => {
        return get().products.filter((product) => product.stockStatus === 'low-stock');
      },

      getFilteredProducts: () => {
        const { products, filters } = get();
        let filtered = [...products];

        if (filters.category && filters.category.length > 0) {
          filtered = filtered.filter((product) => filters.category!.includes(product.category));
        }

        if (filters.islamicCategory && filters.islamicCategory.length > 0) {
          filtered = filtered.filter((product) => filters.islamicCategory!.includes(product.islamicCategory));
        }

        if (filters.priceRange) {
          filtered = filtered.filter(
            (product) =>
              product.price >= filters.priceRange!.min && product.price <= filters.priceRange!.max
          );
        }

        if (filters.inStock) {
          filtered = filtered.filter((product) => product.stockStatus === 'in-stock');
        }

        if (filters.onSale) {
          filtered = filtered.filter((product) => product.onSale);
        }

        if (filters.featured !== undefined) {
          filtered = filtered.filter((product) => product.featured === filters.featured);
        }

        if (filters.status && filters.status.length > 0) {
          filtered = filtered.filter((product) => filters.status!.includes(product.status));
        }

        if (filters.stockStatus && filters.stockStatus.length > 0) {
          filtered = filtered.filter((product) => filters.stockStatus!.includes(product.stockStatus));
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filtered = filtered.filter(
            (product) =>
              product.name.toLowerCase().includes(searchTerm) ||
              product.description.toLowerCase().includes(searchTerm) ||
              product.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
          );
        }

        return filtered;
      },

      getProductStats: () => {
        const products = get().products;
        const publishedProducts = products.filter(p => p.status === 'published');
        
        return {
          totalProducts: products.length,
          publishedProducts: publishedProducts.length,
          draftProducts: products.filter(p => p.status === 'draft').length,
          outOfStockProducts: products.filter(p => p.stockStatus === 'out-of-stock').length,
          lowStockProducts: products.filter(p => p.stockStatus === 'low-stock').length,
          featuredProducts: products.filter(p => p.featured).length,
          totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
          averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
          topSellingProducts: [], // Would be populated from sales data
          recentlyAdded: products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
          categoryDistribution: products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        };
      },

      // Bulk Operations
      bulkUpdateProducts: (productIds, updates) => {
        set((state) => ({
          products: state.products.map((product) =>
            productIds.includes(product.id)
              ? { ...product, ...updates, updatedAt: new Date().toISOString() }
              : product
          ),
        }));
      },

      bulkDeleteProducts: (productIds) => {
        set((state) => ({
          products: state.products.filter((product) => !productIds.includes(product.id)),
          inventory: state.inventory.filter((item) => !productIds.includes(item.productId)),
          stockMovements: state.stockMovements.filter((movement) => !productIds.includes(movement.productId)),
        }));
      },

      bulkUpdateStock: (updates) => {
        updates.forEach(({ productId, stock }) => {
          get().updateStock(productId, stock, 'Bulk stock update', 'Admin');
        });
      },

      // Import/Export
      importProducts: (products) => {
        set((state) => ({
          products: [...state.products, ...products],
        }));
      },

      exportProducts: () => {
        return get().products;
      },

      // Utility
      generateSku: (category, name) => {
        const categoryCode = category.substring(0, 3).toUpperCase();
        const nameCode = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
        const timestamp = Date.now().toString().slice(-4);
        return `${categoryCode}-${nameCode}-${timestamp}`;
      },

      calculateProductStats: () => {
        // This would trigger recalculation of stats
        // For now, stats are calculated on-demand via getProductStats
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearSelectedProduct: () => {
        set({ selectedProduct: null });
      },

      setSelectedProduct: (product) => {
        set({ selectedProduct: product });
      },
    }),
    {
      name: 'product-storage',
      // Only persist products and inventory, not UI state
      partialize: (state) => ({
        products: state.products,
        inventory: state.inventory,
        stockMovements: state.stockMovements,
      }),
    }
  )
);