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
        ),
        product_models (
          id,
          url,
          filename,
          file_type,
          format,
          file_size,
          featured,
          title,
          description,
          sort_order,
          thumbnail,
          created_at
        ),
        product_hdris (
          id,
          url,
          filename,
          file_size,
          intensity,
          is_default,
          title,
          description,
          created_at
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
      featuredImage: data.product_images?.find((img: any) => img.featured)?.url || data.featured_image || '',
      // 3D Models data
      models: data.product_models?.map((model: any) => ({
        id: model.id,
        url: model.url,
        filename: model.filename,
        fileType: model.file_type,
        format: model.format,
        fileSize: model.file_size,
        featured: model.featured,
        title: model.title || '',
        description: model.description || '',
        sortOrder: model.sort_order,
        thumbnail: model.thumbnail,
        uploadedAt: model.created_at
      })) || [],
      has3dModel: data.has_3d_model || false,
      featuredModel: data.featured_model || '',
      // HDRI data
      hdriFiles: data.product_hdris?.map((hdri: any) => ({
        id: hdri.id,
        url: hdri.url,
        filename: hdri.filename,
        fileSize: hdri.file_size,
        intensity: hdri.intensity,
        isDefault: hdri.is_default,
        title: hdri.title || '',
        description: hdri.description || '',
        uploadedAt: hdri.created_at
      })) || [],
      hasHdri: data.has_hdri || false,
      defaultHdriUrl: data.default_hdri_url || '',
      defaultHdriIntensity: data.default_hdri_intensity || 1.0,
      backgroundBlur: data.background_blur || 0
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
    const { images, models, hdriFiles, ...productData } = body;
    
    // Debug logging for product update
    console.log('🔍 Product update data received:');
    console.log('- Images:', images?.length || 0);
    console.log('- Models:', models?.length || 0);
    console.log('- HDRI Files:', hdriFiles?.length || 0);
    console.log('- HDRI Data:', hdriFiles);

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
      // 3D Model fields
      has_3d_model: productData.has3dModel || false,
      featured_model: productData.featuredModel || null,
      // HDRI fields
      has_hdri: (hdriFiles && hdriFiles.length > 0) || false,
      default_hdri_url: hdriFiles?.[0]?.url || null,
      default_hdri_intensity: hdriFiles?.[0]?.intensity || 1.0,
      background_blur: productData.backgroundBlur || 0,
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

    // Update product 3D models if provided
    if (models && Array.isArray(models)) {
      // Delete existing models
      await supabaseAdmin
        .from('product_models')
        .delete()
        .eq('product_id', id);

      // Insert new models
      if (models.length > 0) {
        const modelInserts = models.map((model: any, index: number) => ({
          product_id: id,
          url: model.url,
          filename: model.filename,
          file_type: model.fileType || '3dModel',
          format: model.format,
          file_size: model.fileSize,
          featured: model.featured || false,
          title: model.title || model.filename.split('.')[0],
          description: model.description || '',
          sort_order: model.sortOrder || index,
          thumbnail: model.thumbnail || null
        }));

        const { error: modelsError } = await supabaseAdmin
          .from('product_models')
          .insert(modelInserts);

        if (modelsError) {
          console.error('Error updating product models:', modelsError);
        }

        // Update featured_model on product - use the explicitly marked featured model
        const featuredModel = models.find((model: any) => model.featured);
        if (featuredModel) {
          await supabaseAdmin
            .from('products')
            .update({ 
              featured_model: featuredModel.url,
              has_3d_model: true 
            })
            .eq('id', id);
        } else if (models.length > 0) {
          // If no model is marked as featured, use the first one as fallback
          await supabaseAdmin
            .from('products')
            .update({ 
              featured_model: models[0].url,
              has_3d_model: true 
            })
            .eq('id', id);
        }
      } else {
        // No models provided, update flags
        await supabaseAdmin
          .from('products')
          .update({ 
            featured_model: null,
            has_3d_model: false 
          })
          .eq('id', id);
      }
    }

    // Update product HDRI files if provided
    if (hdriFiles && Array.isArray(hdriFiles)) {
      console.log('🎯 Updating HDRI files for product:', id);
      
      // Delete existing HDRI files
      await supabaseAdmin
        .from('product_hdris')
        .delete()
        .eq('product_id', id);

      // Insert new HDRI files
      if (hdriFiles.length > 0) {
        const hdriInserts = hdriFiles.map((hdri: any, index: number) => ({
          product_id: id,
          url: hdri.url,
          filename: hdri.filename,
          file_size: hdri.fileSize,
          intensity: hdri.intensity || 1.0,
          is_default: index === 0, // First HDRI is default
          title: hdri.title || `HDRI Environment`,
          description: hdri.description || ''
        }));

        console.log('🎯 HDRI insert data for update:', hdriInserts);

        const { error: hdriError } = await supabaseAdmin
          .from('product_hdris')
          .insert(hdriInserts);

        if (hdriError) {
          console.error('❌ Error updating product HDRIs:', hdriError);
        } else {
          console.log('✅ HDRI files updated successfully');
        }

        // Update HDRI fields on product - use the first/default HDRI
        if (hdriFiles.length > 0) {
          await supabaseAdmin
            .from('products')
            .update({ 
              default_hdri_url: hdriFiles[0].url,
              default_hdri_intensity: hdriFiles[0].intensity || 1.0,
              has_hdri: true 
            })
            .eq('id', id);
        }
      } else {
        // No HDRI files provided, clear HDRI flags
        await supabaseAdmin
          .from('products')
          .update({ 
            default_hdri_url: null,
            default_hdri_intensity: 1.0,
            has_hdri: false 
          })
          .eq('id', id);
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