import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  quantity: number;
  customizations?: {
    size?: string;
    material?: string;
    engraving?: string;
  };
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: CartItem) => void;
  addToCart: (product: any) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existingItem = get().items.find(i => i.id === item.id);
        
        if (existingItem) {
          // Update quantity if item already exists - add the new quantity to existing
          set({
            items: get().items.map(i =>
              i.id === item.id 
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          });
        } else {
          // Add new item with the specified quantity
          set({
            items: [...get().items, item]
          });
        }
      },

      addToCart: (product) => {
        const cartItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.regularPrice,
          image: product.featuredImage || '',
          category: product.islamicCategory || '',
          quantity: product.quantity || 1,
          customizations: {
            size: product.selectedVariant,
            material: product.selectedMaterial,
          }
        };
        
        get().addItem(cartItem);
      },

      removeItem: (id) => {
        set({
          items: get().items.filter(item => item.id !== id)
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === id 
              ? { ...item, quantity }
              : item
          )
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      setOpen: (isOpen) => {
        set({ isOpen });
      }
    }),
    {
      name: 'cart-storage',
      // Only persist cart items, not the isOpen state
      partialize: (state) => ({ items: state.items }),
    }
  )
);