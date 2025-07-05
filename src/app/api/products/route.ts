import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, handleSupabaseError } from '@/lib/supabase';
import { Product } from '@/types/product';

// GET /api/products - Get all products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query
    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        product_images (
          id,
          url,
          alt,
          title,
          featured,
          sort_order
        )
      `);

    // Apply filters
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const stockStatus = searchParams.get('stock_status');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    } else if (featured === 'false') {
      query = query.eq('featured', false);
    }

    if (stockStatus) {
      query = query.eq('stock_status', stockStatus);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,arabic_name.ilike.%${search}%`);
    }

    // Apply pagination
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || '20') - 1);
    }

    // Order by created_at descending by default
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) handleSupabaseError(error);

    // Transform data from snake_case to camelCase for frontend
    const products = data?.map((product: any) => ({
      id: product.id,
      name: product.name,
      arabicName: product.arabic_name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.short_description,
      price: product.price,
      originalPrice: product.original_price,
      regularPrice: product.regular_price,
      currency: product.currency,
      vatIncluded: product.vat_included,
      rating: product.rating,
      reviewCount: product.review_count,
      category: product.category,
      subcategory: product.subcategory,
      tags: product.tags,
      sku: product.sku,
      stock: product.stock,
      stockStatus: product.stock_status,
      manageStock: product.manage_stock,
      lowStockThreshold: product.low_stock_threshold,
      weight: product.weight,
      material: product.material,
      islamicCategory: product.islamic_category,
      arabicText: product.arabic_text,
      transliteration: product.transliteration,
      translation: product.translation,
      historicalContext: product.historical_context,
      printTime: product.print_time,
      finishingTime: product.finishing_time,
      difficulty: product.difficulty,
      featured: product.featured,
      onSale: product.on_sale,
      status: product.status,
      visibility: product.visibility,
      customCommission: product.custom_commission,
      personalizable: product.personalizable,
      giftWrapping: product.gift_wrapping,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      publishedAt: product.published_at,
      images: product.product_images?.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || '',
        title: img.title || '',
        featured: img.featured,
        sortOrder: img.sort_order
      })) || [],
      featuredImage: product.product_images?.find((img: any) => img.featured)?.url || product.featured_image || ''
    })) || [];

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract images from body for separate insertion
    const { images, ...productData } = body;

    // Generate slug from name if not provided
    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Generate SKU if not provided
    if (!productData.sku) {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      productData.sku = `${productData.category.substring(0, 3).toUpperCase()}-${timestamp}-${randomStr}`;
    }

    // Set featured_image if images provided
    if (images && images.length > 0) {
      productData.featured_image = images[0].url;
    }

    // Transform camelCase to snake_case for database
    const dbProductData = {
      name: productData.name,
      arabic_name: productData.arabicName,
      slug: productData.slug,
      description: productData.description,
      short_description: productData.shortDescription,
      price: productData.price,
      regular_price: productData.regularPrice,
      currency: productData.currency || 'GBP',
      vat_included: productData.vatIncluded ?? true,
      category: productData.category,
      subcategory: productData.subcategory,
      tags: productData.tags || [],
      sku: productData.sku,
      stock: productData.stock || 0,
      stock_status: productData.stockStatus || 'in-stock',
      manage_stock: productData.manageStock ?? true,
      low_stock_threshold: productData.lowStockThreshold || 5,
      weight: productData.weight,
      material: productData.material || [],
      islamic_category: productData.islamicCategory,
      arabic_text: productData.arabicText,
      transliteration: productData.transliteration,
      translation: productData.translation,
      historical_context: productData.historicalContext,
      print_time: productData.printTime,
      finishing_time: productData.finishingTime,
      difficulty: productData.difficulty || 'Simple',
      featured: productData.featured || false,
      on_sale: productData.on_sale || false,
      status: productData.status || 'draft',
      visibility: productData.visibility || 'public',
      custom_commission: productData.customCommission || false,
      personalizable: productData.personalizable || false,
      gift_wrapping: productData.giftWrapping ?? true,
      featured_image: productData.featuredImage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert product
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert(dbProductData)
      .select()
      .single();

    if (productError) handleSupabaseError(productError);

    // Insert product images if provided
    if (images && images.length > 0 && product) {
      const imageInserts = images.map((img: { url: string; alt?: string; title?: string; featured?: boolean; sortOrder?: number }, index: number) => ({
        product_id: product.id,
        url: img.url,
        alt: img.alt || `${product.name} - Image ${index + 1}`,
        title: img.title || product.name,
        featured: img.featured || false,
        sort_order: index
      }));

      const { error: imagesError } = await supabaseAdmin
        .from('product_images')
        .insert(imageInserts);

      if (imagesError) {
        console.error('Error inserting product images:', imagesError);
        // Don't fail the entire operation for image errors
      }
    }

    // Create initial inventory movement
    if (product && productData.stock > 0) {
      await supabaseAdmin
        .from('inventory_movements')
        .insert({
          product_id: product.id,
          type: 'in',
          quantity: productData.stock,
          reason: 'Initial stock',
          performed_by: 'system'
        });
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });

  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}