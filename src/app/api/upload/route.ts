import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, uploadFile, getPublicUrl, handleSupabaseError } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'product-images';
    const folder = formData.get('folder') as string || 'products';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Determine file type based on bucket
    const is3DModel = bucket === '3d-models';
    const isHDRI = bucket === 'hdri-files';
    
    console.log('Upload API Debug:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      bucket,
      folder,
      is3DModel,
      isHDRI
    });
    
    // Validate file type based on upload type
    if (isHDRI) {
      // HDRI file validation
      const supportedHDRIFormats = [
        'image/x-hdr',
        'application/octet-stream', // .hdr, .exr
        'image/vnd.radiance', // .hdr
        'image/x-exr', // .exr
        'application/x-hdr' // .hdr
      ];
      
      // Check file extension for HDRI files
      const fileName = file.name.toLowerCase();
      const supportedHDRIExtensions = ['.hdr', '.exr', '.hdri', '.pic'];
      const hasValidHDRIExtension = supportedHDRIExtensions.some(ext => fileName.endsWith(ext));
      
      if (!supportedHDRIFormats.includes(file.type) && !hasValidHDRIExtension) {
        return NextResponse.json(
          { success: false, error: 'File must be a supported HDRI format (HDR, EXR, HDRI, PIC)' },
          { status: 400 }
        );
      }
      
      // HDRI file size limit (100MB)
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'HDRI file size must be less than 100MB' },
          { status: 400 }
        );
      }
    } else if (is3DModel) {
      // 3D Model file validation
      const supported3DFormats = [
        'model/gltf-binary', // .glb
        'application/octet-stream', // .stl, .obj, .fbx, .ply (generic binary)
        'text/plain', // .obj, .dae (text-based)
        'model/obj', // .obj
        'application/x-fbx', // .fbx
        'model/x3d+xml', // .dae
        'application/x-ply' // .ply
      ];
      
      // Also check file extension as MIME types for 3D models can be inconsistent
      const fileName = file.name.toLowerCase();
      const supported3DExtensions = ['.glb', '.stl', '.obj', '.fbx', '.dae', '.ply'];
      const hasValid3DExtension = supported3DExtensions.some(ext => fileName.endsWith(ext));
      
      if (!supported3DFormats.includes(file.type) && !hasValid3DExtension) {
        return NextResponse.json(
          { success: false, error: 'File must be a supported 3D model format (GLB, STL, OBJ, FBX, DAE, PLY)' },
          { status: 400 }
        );
      }
    } else if (!isHDRI) {
      // Image file validation (only if not HDRI)
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'File must be an image' },
          { status: 400 }
        );
      }
    }

    // Validate file size based on file type
    let maxSize: number;
    let maxSizeText: string;
    
    if (is3DModel) {
      maxSize = 50 * 1024 * 1024; // 50MB for 3D models
      maxSizeText = '50MB';
    } else if (isHDRI) {
      maxSize = 100 * 1024 * 1024; // 100MB for HDRI files
      maxSizeText = '100MB';
    } else {
      maxSize = 5 * 1024 * 1024; // 5MB for images
      maxSizeText = '5MB';
    }
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File size must be less than ${maxSizeText}` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}_${randomString}.${extension}`;

    // Check if storage bucket exists first
    const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketError || !buckets?.find(b => b.name === bucket)) {
      // Storage bucket doesn't exist - create a temporary solution
      // For development, we'll create a data URL instead
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      return NextResponse.json({
        success: true,
        data: {
          url: dataUrl,
          fileName: fileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          bucket: bucket,
          warning: 'Using temporary data URL - Storage bucket not configured'
        },
        message: 'File processed successfully (temporary storage)'
      });
    }

    // Upload to Supabase Storage using admin client
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      handleSupabaseError(error);
    }

    if (!data) {
      throw new Error('Failed to upload file');
    }

    // Get public URL using admin client
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    const publicUrl = publicUrlData.publicUrl;

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        bucket: bucket
      },
      message: 'File uploaded successfully'
    });

  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// DELETE /api/upload - Delete uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const bucket = searchParams.get('bucket') || 'product-images';

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'fileName parameter required' },
        { status: 400 }
      );
    }

    // Delete from Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([fileName]);

    if (error) handleSupabaseError(error);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete file' },
      { status: 500 }
    );
  }
}