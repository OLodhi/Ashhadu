import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, handleSupabaseError } from '@/lib/supabase';

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
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
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      handleSupabaseError(error);
    }

    // Transform data from snake_case to camelCase for frontend
    const product = {
      id: data.id,
      name: data.name,
      arabicName: data.arabic_name,
      slug: data.slug,
      description: data.description,
      shortDescription: data.short_description,
      price: data.price,
      originalPrice: data.original_price,
      regularPrice: data.regular_price,
      currency: data.currency,
      vatIncluded: data.vat_included,
      rating: data.rating,
      reviewCount: data.review_count,
      category: data.category,
      subcategory: data.subcategory,
      tags: data.tags,
      sku: data.sku,
      stock: data.stock,
      stockStatus: data.stock_status,
      manageStock: data.manage_stock,
      lowStockThreshold: data.low_stock_threshold,
      weight: data.weight,
      material: data.material,
      islamicCategory: data.islamic_category,
      arabicText: data.arabic_text,
      transliteration: data.transliteration,
      translation: data.translation,
      historicalContext: data.historical_context,
      printTime: data.print_time,
      finishingTime: data.finishing_time,
      difficulty: data.difficulty,
      featured: data.featured,
      onSale: data.on_sale,
      status: data.status,
      visibility: data.visibility,
      customCommission: data.custom_commission,
      personalizable: data.personalizable,
      giftWrapping: data.gift_wrapping,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      publishedAt: data.published_at,
      images: data.product_images?.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || '',
        title: img.title || '',
        featured: img.featured,
        sortOrder: img.sort_order
      })) || [],
      featuredImage: data.product_images?.find((img: any) => img.featured)?.url || data.featured_image || ''
    };

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { images, ...productData } = body;

    // Transform camelCase to snake_case for database
    const dbProductData = {
      name: productData.name,
      arabic_name: productData.arabicName,
      slug: productData.slug,
      description: productData.description,
      short_description: productData.shortDescription,
      price: productData.price,
      regular_price: productData.regularPrice,
      currency: productData.currency,
      vat_included: productData.vatIncluded,
      category: productData.category,
      subcategory: productData.subcategory,
      tags: productData.tags,
      sku: productData.sku,
      stock: productData.stock,
      stock_status: productData.stockStatus,
      manage_stock: productData.manageStock,
      low_stock_threshold: productData.lowStockThreshold,
      weight: productData.weight,
      material: productData.material,
      islamic_category: productData.islamicCategory,
      arabic_text: productData.arabicText,
      transliteration: productData.transliteration,
      translation: productData.translation,
      historical_context: productData.historicalContext,
      print_time: productData.printTime,
      finishing_time: productData.finishingTime,
      difficulty: productData.difficulty,
      featured: productData.featured,
      on_sale: productData.on_sale,
      status: productData.status,
      visibility: productData.visibility,
      custom_commission: productData.customCommission,
      personalizable: productData.personalizable,
      gift_wrapping: productData.giftWrapping,
      featured_image: productData.featuredImage,
      updated_at: new Date().toISOString()
    };

    // Update product
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .update(dbProductData)
      .eq('id', id)
      .select()
      .single();

    if (productError) {
      if (productError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      handleSupabaseError(productError);
    }

    // Update product images if provided
    if (images && Array.isArray(images)) {
      // Delete existing images
      await supabaseAdmin
        .from('product_images')
        .delete()
        .eq('product_id', id);

      // Insert new images
      if (images.length > 0) {
        const imageInserts = images.map((img: { url: string; alt?: string; title?: string; featured?: boolean; sortOrder?: number }, index: number) => ({
          product_id: id,
          url: img.url,
          alt: img.alt || `${product.name} - Image ${index + 1}`,
          title: img.title || product.name,
          featured: img.featured || false,
          sort_order: img.sortOrder || index
        }));

        const { error: imagesError } = await supabaseAdmin
          .from('product_images')
          .insert(imageInserts);

        if (imagesError) {
          console.error('Error updating product images:', imagesError);
        }

        // Update featured_image on product - use the explicitly marked featured image
        const featuredImg = images.find(img => img.featured);
        if (featuredImg) {
          await supabaseAdmin
            .from('products')
            .update({ featured_image: featuredImg.url })
            .eq('id', id);
        } else if (images.length > 0) {
          // If no image is marked as featured, use the first one as fallback
          await supabaseAdmin
            .from('products')
            .update({ featured_image: images[0].url })
            .eq('id', id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Delete product (images will be cascade deleted)
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      handleSupabaseError(error);
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}