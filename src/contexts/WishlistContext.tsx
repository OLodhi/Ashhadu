'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/supabase-client';
import { WishlistItem, WishlistContextType } from '@/types/wishlist';
import toast from 'react-hot-toast';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, customer, loading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load wishlist when user/customer changes
  useEffect(() => {
    if (customer && !authLoading) {
      loadWishlist();
    } else if (!customer && !authLoading) {
      setWishlistItems([]);
    }
  }, [customer, authLoading]);

  const loadWishlist = async () => {
    if (!customer?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await db.wishlists.selectByCustomerId(customer.id);

      if (fetchError) {
        console.error('Error loading wishlist:', fetchError);
        setError('Failed to load wishlist');
        return;
      }

      // Filter out items that don't have product data and ensure proper typing
      const validItems = (data || [])
        .filter((item): item is WishlistItem => !!item.product)
        .map(item => ({
          ...item,
          product: item.product!
        }));

      setWishlistItems(validItems);
    } catch (err) {
      console.error('Error loading wishlist:', err);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please log in to save items to your wishlist');
      return;
    }

    if (!customer?.id) {
      toast.error('Customer profile not found');
      return;
    }

    // Check if already in wishlist
    if (isInWishlist(productId)) {
      toast.success('Item already in your wishlist');
      return;
    }

    try {
      const { error: insertError } = await db.wishlists.insert({
        customer_id: customer.id,
        product_id: productId,
        created_at: new Date().toISOString()
      });

      if (insertError) {
        console.error('Error adding to wishlist:', insertError);
        
        // Handle unique constraint violation
        if (insertError.code === '23505') {
          toast.success('Item already in your wishlist');
          return;
        }
        
        toast.error('Failed to add item to wishlist');
        return;
      }

      // Reload wishlist to get the new item with product data
      await loadWishlist();
      toast.success('Added to wishlist');
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      toast.error('Failed to add item to wishlist');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!customer?.id) {
      toast.error('Customer profile not found');
      return;
    }

    try {
      const { error: deleteError } = await db.wishlists.delete(customer.id, productId);

      if (deleteError) {
        console.error('Error removing from wishlist:', deleteError);
        toast.error('Failed to remove item from wishlist');
        return;
      }

      // Optimistically update local state
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      toast.success('Removed from wishlist');
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const clearWishlist = async () => {
    if (!customer?.id) {
      toast.error('Customer profile not found');
      return;
    }

    if (wishlistItems.length === 0) {
      toast.success('Wishlist is already empty');
      return;
    }

    try {
      // Remove all items
      const deletePromises = wishlistItems.map(item => 
        db.wishlists.delete(customer.id, item.product_id)
      );

      await Promise.all(deletePromises);

      setWishlistItems([]);
      toast.success('Wishlist cleared');
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      toast.error('Failed to clear wishlist');
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const refreshWishlist = async () => {
    await loadWishlist();
  };

  const moveToCart = async (productId: string) => {
    // TODO: Implement add to cart functionality
    // This would integrate with the cart store/context
    toast.success('Add to cart functionality coming soon!');
  };

  const shareWishlist = async (): Promise<string> => {
    // TODO: Implement wishlist sharing
    // This would generate a shareable URL for the wishlist
    const shareUrl = `${window.location.origin}/wishlist/shared/${customer?.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Islamic Art Wishlist',
          text: 'Check out my wishlist of beautiful Islamic art pieces',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Wishlist link copied to clipboard');
      } catch (err) {
        toast.error('Failed to copy link');
      }
    }
    
    return shareUrl;
  };

  // Computed values
  const wishlistCount = wishlistItems.length;
  const totalValue = wishlistItems.reduce((sum, item) => {
    return sum + item.product.price;
  }, 0);

  const value: WishlistContextType = {
    // State
    wishlistItems,
    loading,
    error,
    
    // Computed values
    wishlistCount,
    totalValue,
    
    // Actions
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    
    // Utility
    refreshWishlist,
    moveToCart,
    shareWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export default WishlistContext;