// Supabase Database Types
// This file will be auto-generated once we create the database schema

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'customer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'customer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'customer';
          created_at?: string;
          updated_at?: string;
        };
      };
      
      products: {
        Row: {
          id: string;
          name: string;
          arabic_name: string | null;
          slug: string;
          description: string;
          short_description: string | null;
          price: number;
          regular_price: number;
          currency: string;
          vat_included: boolean;
          category: string;
          subcategory: string | null;
          tags: string[];
          sku: string;
          stock: number;
          stock_status: 'in-stock' | 'low-stock' | 'out-of-stock';
          manage_stock: boolean;
          low_stock_threshold: number | null;
          weight: number | null;
          material: string[];
          islamic_category: string;
          arabic_text: string | null;
          transliteration: string | null;
          translation: string | null;
          historical_context: string | null;
          print_time: number | null;
          finishing_time: number | null;
          difficulty: string;
          featured: boolean;
          on_sale: boolean;
          status: 'published' | 'draft' | 'archived';
          visibility: 'public' | 'private' | 'password-protected';
          custom_commission: boolean;
          personalizable: boolean;
          gift_wrapping: boolean;
          featured_image: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          arabic_name?: string | null;
          slug: string;
          description: string;
          short_description?: string | null;
          price: number;
          regular_price: number;
          currency?: string;
          vat_included?: boolean;
          category: string;
          subcategory?: string | null;
          tags?: string[];
          sku: string;
          stock?: number;
          stock_status?: 'in-stock' | 'low-stock' | 'out-of-stock';
          manage_stock?: boolean;
          low_stock_threshold?: number | null;
          weight?: number | null;
          material?: string[];
          islamic_category: string;
          arabic_text?: string | null;
          transliteration?: string | null;
          translation?: string | null;
          historical_context?: string | null;
          print_time?: number | null;
          finishing_time?: number | null;
          difficulty?: string;
          featured?: boolean;
          on_sale?: boolean;
          status?: 'published' | 'draft' | 'archived';
          visibility?: 'public' | 'private' | 'password-protected';
          custom_commission?: boolean;
          personalizable?: boolean;
          gift_wrapping?: boolean;
          featured_image?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          arabic_name?: string | null;
          slug?: string;
          description?: string;
          short_description?: string | null;
          price?: number;
          regular_price?: number;
          currency?: string;
          vat_included?: boolean;
          category?: string;
          subcategory?: string | null;
          tags?: string[];
          sku?: string;
          stock?: number;
          stock_status?: 'in-stock' | 'low-stock' | 'out-of-stock';
          manage_stock?: boolean;
          low_stock_threshold?: number | null;
          weight?: number | null;
          material?: string[];
          islamic_category?: string;
          arabic_text?: string | null;
          transliteration?: string | null;
          translation?: string | null;
          historical_context?: string | null;
          print_time?: number | null;
          finishing_time?: number | null;
          difficulty?: string;
          featured?: boolean;
          on_sale?: boolean;
          status?: 'published' | 'draft' | 'archived';
          visibility?: 'public' | 'private' | 'password-protected';
          custom_commission?: boolean;
          personalizable?: boolean;
          gift_wrapping?: boolean;
          featured_image?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string | null;
          title: string | null;
          featured: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt?: string | null;
          title?: string | null;
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt?: string | null;
          title?: string | null;
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      
      orders: {
        Row: {
          id: string;
          customer_id: string | null;
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          total: number;
          subtotal: number;
          tax_amount: number;
          shipping_amount: number;
          currency: string;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method: string | null;
          stripe_payment_intent_id: string | null;
          notes: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          total: number;
          subtotal: number;
          tax_amount: number;
          shipping_amount: number;
          currency?: string;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          stripe_payment_intent_id?: string | null;
          notes?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          total?: number;
          subtotal?: number;
          tax_amount?: number;
          shipping_amount?: number;
          currency?: string;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          stripe_payment_intent_id?: string | null;
          notes?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          total: number;
          product_name: string;
          product_sku: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          total: number;
          product_name: string;
          product_sku: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
          total?: number;
          product_name?: string;
          product_sku?: string;
          created_at?: string;
        };
      };
      
      addresses: {
        Row: {
          id: string;
          customer_id: string;
          type: 'billing' | 'shipping';
          label: string | null; // e.g., "Home", "Work", "Office"
          first_name: string;
          last_name: string;
          company: string | null;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          county: string | null;
          postcode: string;
          country: string;
          phone: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          type: 'billing' | 'shipping';
          label?: string | null;
          first_name: string;
          last_name: string;
          company?: string | null;
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          county?: string | null;
          postcode: string;
          country?: string;
          phone?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          type?: 'billing' | 'shipping';
          label?: string | null;
          first_name?: string;
          last_name?: string;
          company?: string | null;
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          county?: string | null;
          postcode?: string;
          country?: string;
          phone?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      customers: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          billing_address: any | null; // JSON object
          shipping_address: any | null; // JSON object
          date_of_birth: string | null;
          marketing_consent: boolean;
          stripe_customer_id: string | null; // Stripe customer ID for payment processing
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          billing_address?: any | null;
          shipping_address?: any | null;
          date_of_birth?: string | null;
          marketing_consent?: boolean;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          billing_address?: any | null;
          shipping_address?: any | null;
          date_of_birth?: string | null;
          marketing_consent?: boolean;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      reviews: {
        Row: {
          id: string;
          product_id: string;
          customer_id: string | null;
          customer_name: string;
          customer_email: string;
          rating: number;
          title: string | null;
          comment: string;
          verified_purchase: boolean;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          customer_id?: string | null;
          customer_name: string;
          customer_email: string;
          rating: number;
          title?: string | null;
          comment: string;
          verified_purchase?: boolean;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          customer_id?: string | null;
          customer_name?: string;
          customer_email?: string;
          rating?: number;
          title?: string | null;
          comment?: string;
          verified_purchase?: boolean;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      
      inventory_movements: {
        Row: {
          id: string;
          product_id: string;
          type: 'in' | 'out' | 'adjustment';
          quantity: number;
          reason: string;
          reference: string | null;
          performed_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          type: 'in' | 'out' | 'adjustment';
          quantity: number;
          reason: string;
          reference?: string | null;
          performed_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          type?: 'in' | 'out' | 'adjustment';
          quantity?: number;
          reason?: string;
          reference?: string | null;
          performed_by?: string;
          created_at?: string;
        };
      };
      
      payment_methods: {
        Row: {
          id: string;
          customer_id: string;
          type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
          provider: string;
          provider_payment_method_id: string;
          provider_customer_id: string | null;
          display_name: string | null;
          brand: string | null;
          last_four: string | null;
          exp_month: number | null;
          exp_year: number | null;
          paypal_email: string | null;
          is_default: boolean;
          is_active: boolean;
          billing_address_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
          provider?: string;
          provider_payment_method_id: string;
          provider_customer_id?: string | null;
          display_name?: string | null;
          brand?: string | null;
          last_four?: string | null;
          exp_month?: number | null;
          exp_year?: number | null;
          paypal_email?: string | null;
          is_default?: boolean;
          is_active?: boolean;
          billing_address_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          type?: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
          provider?: string;
          provider_payment_method_id?: string;
          provider_customer_id?: string | null;
          display_name?: string | null;
          brand?: string | null;
          last_four?: string | null;
          exp_month?: number | null;
          exp_year?: number | null;
          paypal_email?: string | null;
          is_default?: boolean;
          is_active?: boolean;
          billing_address_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}