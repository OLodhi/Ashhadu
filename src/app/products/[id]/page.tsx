'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Ruler,
  Package,
  Clock,
  CheckCircle,
  ArrowLeft,
  Zap,
  Award,
  Info
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types/product';
import { toast } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WishlistButton from '@/components/ui/WishlistButton';
import ShareButton from '@/components/ui/ShareButton';
import MediaLightbox from '@/components/ui/MediaLightbox';
import HollowStarRating from '@/components/ui/HollowStarRating';
import Model3DViewer from '@/components/models/Model3DViewer';

const ProductDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'cultural'>('description');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | '3d'>('image');
  const [selected3DModel, setSelected3DModel] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 });

  // Build product images array with proper deduplication and fallback logic
  const productImages = useMemo(() => {
    if (!product) return ['/images/products/placeholder.jpg'];
    
    const images: string[] = [];
    
    // Get all available image URLs from product.images array
    const allImageUrls = product.images?.map(img => img.url).filter(Boolean) || [];
    
    // If we have a featured image, start with that
    if (product.featuredImage && allImageUrls.includes(product.featuredImage)) {
      images.push(product.featuredImage);
      // Add remaining images in order, excluding the featured image
      allImageUrls.forEach(url => {
        if (url !== product.featuredImage) {
          images.push(url);
        }
      });
    } else if (allImageUrls.length > 0) {
      // No featured image set, use all images in order
      images.push(...allImageUrls);
    } else if (product.featuredImage) {
      // Only featured image exists (not in images array)
      images.push(product.featuredImage);
    } else {
      // No images at all, use placeholder
      images.push('/images/products/placeholder.jpg');
    }
    
    return images;
  }, [product?.featuredImage, product?.images]);

  // Build combined media array for lightbox (images + 3D models)
  const mediaItems = useMemo(() => {
    const items: Array<{
      type: 'image' | '3d';
      url: string;
      alt?: string;
      format?: string;
      model?: any;
    }> = [];

    // Add images first
    productImages.forEach((imageUrl, index) => {
      if (!imageUrl.includes('placeholder')) { // Skip placeholder images in lightbox
        items.push({
          type: 'image',
          url: imageUrl,
          alt: `${product?.name || 'Product'} - Image ${index + 1}`
        });
      }
    });

    // Add 3D models
    if (product?.models && product.models.length > 0) {
      product.models.forEach((model, index) => {
        items.push({
          type: '3d',
          url: model.url,
          format: model.format,
          model: model,
          alt: `${product.name} - 3D Model ${index + 1}`
        });
      });
    }

    return items;
  }, [productImages, product?.models, product?.name]);

  // Synchronize selectedImage with productImages array changes
  useEffect(() => {
    // Reset selectedImage to 0 when productImages array changes
    if (productImages.length > 0 && selectedImage >= productImages.length) {
      setSelectedImage(0);
    }
  }, [productImages, selectedImage]);

  // Auto-switch to 3D view only if product has NO real images (only placeholder)
  useEffect(() => {
    if (product && product.has3dModel && product.models && product.models.length > 0) {
      // Only default to 3D view if product has NO real images (only placeholder)
      const hasOnlyPlaceholder = productImages.length === 1 && productImages[0]?.includes('placeholder');
      
      if (hasOnlyPlaceholder && selectedMediaType === 'image') {
        setSelectedMediaType('3d');
        setSelected3DModel(product.models.findIndex(m => m.featured) || 0);
      }
    }
  }, [product, productImages, selectedMediaType]);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.data);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch reviews for the product
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      try {
        setReviewsLoading(true);
        const response = await fetch(`/api/products/${id}/reviews`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.data.reviews || []);
          setReviewStats({
            totalReviews: data.data.statistics.totalReviews || 0,
            averageRating: data.data.statistics.averageRating || 0
          });
        } else {
          console.error('Failed to fetch reviews');
          setReviews([]);
          setReviewStats({ totalReviews: 0, averageRating: 0 });
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
        setReviewStats({ totalReviews: 0, averageRating: 0 });
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        
        <main className="pt-16 lg:pt-20 min-h-screen bg-white">
          {/* Loading skeleton */}
          <div className="bg-luxury-gray-50 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-4 bg-luxury-gray-200 rounded w-64 animate-pulse"></div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-luxury-gray-200 rounded-lg animate-pulse"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-luxury-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="h-8 bg-luxury-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-luxury-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-luxury-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
                <div className="h-10 bg-luxury-gray-200 rounded w-32 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-luxury-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-luxury-gray-200 rounded w-5/6 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        
        <main className="pt-16 lg:pt-20 flex items-center justify-center bg-luxury-gray-50 min-h-[calc(100vh-16rem)]">
          <div className="text-center">
            <Package className="h-16 w-16 text-luxury-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-luxury-black mb-2">Product not found</h2>
            <p className="text-luxury-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/shop')}
              className="btn-luxury"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </button>
          </div>
        </main>
        
        <Footer />
      </>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
      selectedVariant,
      selectedMaterial,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const openLightbox = (mediaType: 'image' | '3d', index: number) => {
    let lightboxIndex = 0;
    
    if (mediaType === 'image') {
      // Find the index of this image in the combined media array
      const imageUrl = productImages[index];
      lightboxIndex = mediaItems.findIndex(item => item.type === 'image' && item.url === imageUrl);
    } else {
      // Find the index of this 3D model in the combined media array
      const model = product?.models?.[index];
      lightboxIndex = mediaItems.findIndex(item => item.type === '3d' && item.url === model?.url);
    }
    
    // Ensure index is within bounds
    const safeIndex = Math.max(0, Math.min(lightboxIndex, mediaItems.length - 1));
    setLightboxIndex(safeIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating 
            ? 'text-luxury-gold fill-current' 
            : 'text-luxury-gray-300'
        }`}
      />
    ));
  };

  const formatDimensions = (dimensions: any) => {
    if (typeof dimensions === 'string') return dimensions;
    if (dimensions?.length && dimensions?.width && dimensions?.height) {
      return `${dimensions.length}cm × ${dimensions.width}cm × ${dimensions.height}cm`;
    }
    return 'Custom dimensions available';
  };
  
  return (
    <>
      <Header />
      
      <main className="pt-16 lg:pt-20 min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-luxury-gray-50 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-2 text-sm">
              <button 
                onClick={() => router.push('/')}
                className="text-luxury-gray-600 hover:text-luxury-black"
              >
                Home
              </button>
              <span className="text-luxury-gray-400">/</span>
              <button 
                onClick={() => router.push('/shop')}
                className="text-luxury-gray-600 hover:text-luxury-black"
              >
                Shop
              </button>
              <span className="text-luxury-gray-400">/</span>
              <span className="text-luxury-black font-medium">{product.name}</span>
            </nav>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Media Display */}
            <div className="aspect-square bg-luxury-gray-50 rounded-lg overflow-hidden relative group max-w-full max-h-full">
              {selectedMediaType === 'image' ? (
                <>
                  {/* Image Display */}
                  <Image
                    src={productImages[Math.min(selectedImage, productImages.length - 1)] || productImages[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onClick={() => openLightbox('image', Math.min(selectedImage, productImages.length - 1))}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  
                  {/* Zoom Indicator for Images */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none cursor-pointer">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      Click to zoom
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* 3D Model Display */}
                  {product.models && product.models.length > 0 && (
                    <div className="w-full h-full">
                      <Model3DViewer
                        modelUrl={product.models[Math.min(selected3DModel, product.models.length - 1)]?.url || product.models[0]?.url}
                        format={product.models[Math.min(selected3DModel, product.models.length - 1)]?.format || product.models[0]?.format}
                        showControls={true}
                        autoRotate={false}
                        enableZoom={true}
                        enablePan={true}
                        className="w-full h-full"
                        // ✨ HDRI Environment Support
                        hdriUrl={product.hdriFiles?.[0]?.url || product.defaultHdriUrl || undefined}
                        hdriIntensity={product.hdriFiles?.[0]?.intensity || product.defaultHdriIntensity || 1.0}
                        enableHdri={product.hasHdri && (product.hdriFiles?.length > 0 || !!product.defaultHdriUrl)}
                        backgroundBlur={product.backgroundBlur || 0}
                      />
                    </div>
                  )}
                  
                  {/* 3D Controls Indicator */}
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                    Click & drag to rotate • Scroll to zoom
                  </div>
                </>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 space-y-2">
                {product.onSale && product.regularPrice && product.price && product.regularPrice > product.price && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                    Save {Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)}%
                  </span>
                )}
                {product.featured && (
                  <span className="px-3 py-1 bg-luxury-gold text-white text-sm font-medium rounded-full">
                    Featured
                  </span>
                )}
                {product.has3dModel && product.models && product.models.length > 0 && (
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full flex items-center space-x-1">
                    <Package className="w-3 h-3" />
                    <span>3D View</span>
                  </span>
                )}
                {product.status === 'limited' && (
                  <span className="px-3 py-1 bg-purple-500 text-white text-sm font-medium rounded-full">
                    Limited Edition
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <div className="absolute top-4 right-4">
                <WishlistButton
                  productId={product.id.toString()}
                  size="medium"
                  variant="icon"
                />
              </div>
            </div>

            {/* Media Thumbnails */}
            {(productImages.length > 1 || (product.models && product.models.length > 0)) && (
              <div className="grid grid-cols-4 gap-2">
                {/* Image Thumbnails */}
                {productImages.map((image, index) => (
                  <button
                    key={`image-${index}`}
                    onClick={() => {
                      setSelectedMediaType('image');
                      setSelectedImage(index);
                    }}
                    className={`aspect-square bg-luxury-gray-50 rounded-lg overflow-hidden border-2 transition-colors relative ${
                      selectedMediaType === 'image' && selectedImage === index
                        ? 'border-luxury-gold' 
                        : 'border-transparent hover:border-luxury-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12vw"
                    />
                  </button>
                ))}
                
                {/* 3D Model Thumbnails */}
                {product.models && product.models.length > 0 && product.models.map((model, index) => (
                  <button
                    key={`model-${index}`}
                    onClick={() => {
                      setSelectedMediaType('3d');
                      setSelected3DModel(index);
                    }}
                    className={`aspect-square bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border-2 transition-colors relative group ${
                      selectedMediaType === '3d' && selected3DModel === index
                        ? 'border-luxury-gold' 
                        : 'border-transparent hover:border-luxury-gray-300'
                    }`}
                  >
                    {/* 3D Model Thumbnail Content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-1 bg-luxury-gold rounded-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-luxury-black" />
                        </div>
                        <div className="text-white text-xs font-medium">3D</div>
                        <div className="text-luxury-gold text-xs uppercase">{model.format}</div>
                      </div>
                    </div>
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-luxury-gold/0 group-hover:bg-luxury-gold/10 transition-colors duration-200" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-luxury-black mb-2">{product.name}</h1>
              {product.arabicName && (
                <h2 className="text-xl text-luxury-gray-600 mb-2 arabic-text">{product.arabicName}</h2>
              )}
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <HollowStarRating 
                    rating={reviewStats.averageRating} 
                    size="small"
                  />
                  <span className="text-sm text-luxury-gray-600 ml-2">
                    ({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
                <span className="text-sm text-luxury-gray-600">SKU: {product.sku}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-luxury-gold">
                {formatPrice(product.price || product.regularPrice || 0)}
              </span>
              {product.onSale && product.regularPrice && product.price && product.regularPrice > product.price && (
                <span className="text-xl text-luxury-gray-500 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-luxury-gray-600 leading-relaxed">{product.shortDescription}</p>

            {/* Product Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-luxury-black">
                  Size Options:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`p-3 text-sm border rounded-lg transition-colors ${
                        selectedVariant === variant.id
                          ? 'border-luxury-gold bg-luxury-gold text-white'
                          : 'border-luxury-gray-200 hover:border-luxury-gold'
                      }`}
                    >
                      <div className="font-medium">{variant.name}</div>
                      <div className="text-xs">{formatPrice(variant.price)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material Options */}
            {product.material && product.material.length > 1 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-luxury-black">
                  Material:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.material.map((material) => (
                    <button
                      key={material}
                      onClick={() => setSelectedMaterial(material)}
                      className={`p-3 text-sm border rounded-lg transition-colors ${
                        selectedMaterial === material
                          ? 'border-luxury-gold bg-luxury-gold text-white'
                          : 'border-luxury-gray-200 hover:border-luxury-gold'
                      }`}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-luxury-black">Quantity:</label>
              <div className="flex items-center border border-luxury-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-luxury-gray-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="p-2 hover:bg-luxury-gray-50 transition-colors"
                  disabled={quantity >= (product.stock || 99)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-luxury-gray-600">
                {product.stock || 0} in stock
              </span>
            </div>

            {/* Add to Cart Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={(product.stock || 0) === 0}
                className="w-full btn-luxury"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <WishlistButton
                  productId={product.id.toString()}
                  size="medium"
                  variant="button"
                  className="btn-luxury-ghost flex items-center justify-center"
                />
                <ShareButton
                  productId={product.id.toString()}
                  productName={product.name}
                  productPrice={formatPrice(product.price || product.regularPrice || 0)}
                  size="medium"
                  variant="button"
                  showText={false}
                  className="btn-luxury-ghost flex items-center justify-center"
                />
              </div>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-luxury-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-luxury-black">Free UK Shipping</p>
                  <p className="text-sm text-luxury-gray-600">On orders over £50</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-luxury-black">Authenticity Guaranteed</p>
                  <p className="text-sm text-luxury-gray-600">100% authentic Islamic art</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <RotateCcw className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-luxury-black">30-Day Returns</p>
                  <p className="text-sm text-luxury-gray-600">Easy returns & exchanges</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-luxury-black">Custom Orders</p>
                  <p className="text-sm text-luxury-gray-600">Bespoke commissions available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          {/* Tab Navigation */}
          <div className="border-b border-luxury-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description', icon: Info },
                { id: 'specifications', label: 'Specifications', icon: Ruler },
                { id: 'reviews', label: 'Reviews', icon: Star },
                { id: 'cultural', label: 'Cultural Context', icon: Award },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-luxury-gold text-luxury-gold'
                      : 'border-transparent text-luxury-gray-500 hover:text-luxury-black hover:border-luxury-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose prose-luxury max-w-none">
                <div className="text-luxury-gray-700 leading-relaxed space-y-4">
                  <p>{product.description}</p>
                  
                  {product.arabicText && (
                    <div className="bg-luxury-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-luxury-black mb-3">Arabic Text:</h4>
                      <p className="arabic-text text-2xl text-luxury-black mb-2">{product.arabicText}</p>
                      {product.transliteration && (
                        <p className="text-luxury-gray-600 italic">{product.transliteration}</p>
                      )}
                      {product.translation && (
                        <p className="text-luxury-gray-700 mt-2">"{product.translation}"</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-luxury-black mb-4">Product Details</h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-luxury-gray-600">Dimensions:</dt>
                      <dd className="text-luxury-black">{formatDimensions(product.dimensions)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-luxury-gray-600">Weight:</dt>
                      <dd className="text-luxury-black">{product.weight || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-luxury-gray-600">Material:</dt>
                      <dd className="text-luxury-black">{product.material?.join(', ') || 'Various'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-luxury-gray-600">Print Time:</dt>
                      <dd className="text-luxury-black">{product.printTime || 2} hours</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-luxury-gray-600">Finishing Time:</dt>
                      <dd className="text-luxury-black">{product.finishingTime || 1} hour</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-luxury-gray-600">Difficulty Level:</dt>
                      <dd className="text-luxury-black">{product.difficulty}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-semibold text-luxury-black mb-4">Care Instructions</h4>
                  <ul className="space-y-2 text-luxury-gray-700">
                    <li>• Dust regularly with a soft, dry cloth</li>
                    <li>• Keep away from direct sunlight</li>
                    <li>• Handle with care to preserve details</li>
                    <li>• Store in a cool, dry place</li>
                    <li>• Avoid water or cleaning chemicals</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Rating Summary - Left Aligned */}
                <div className="text-left">
                  <div className="flex items-center space-x-3 mb-2">
                    <HollowStarRating 
                      rating={reviewStats.averageRating} 
                      size="medium"
                      showRating={true}
                    />
                    <span className="text-luxury-gray-600">
                      Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-b border-luxury-gray-100 pb-6 animate-pulse">
                        <div className="flex items-start space-x-4 mb-3">
                          <div className="h-4 bg-luxury-gray-200 rounded w-32"></div>
                          <div className="h-4 bg-luxury-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-4 bg-luxury-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-luxury-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-luxury-gray-100 pb-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="font-medium text-luxury-black">{review.customerName}</h5>
                              {review.verifiedPurchase && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                {getRatingStars(review.rating)}
                              </div>
                              <span className="text-sm text-luxury-gray-500">{review.relativeDate}</span>
                            </div>
                          </div>
                        </div>
                        {review.title && (
                          <h6 className="font-medium text-luxury-black mb-2">{review.title}</h6>
                        )}
                        <p className="text-luxury-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <Star className="h-12 w-12 text-luxury-gray-300 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-luxury-black mb-2">
                      No reviews for this product
                    </h3>
                    <p className="text-luxury-gray-600">
                      Be the first to review this beautiful Islamic art piece!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cultural' && (
              <div className="space-y-6">
                {product.historicalContext && (
                  <div>
                    <h4 className="font-semibold text-luxury-black mb-3">Historical Context</h4>
                    <p className="text-luxury-gray-700 leading-relaxed">{product.historicalContext}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-luxury-black mb-3">Cultural Significance</h4>
                  <p className="text-luxury-gray-700 leading-relaxed">
                    This piece represents centuries of Islamic artistic tradition, combining spiritual meaning 
                    with aesthetic beauty. Each element has been carefully crafted to honour the rich heritage 
                    of Islamic art while bringing timeless beauty to modern spaces.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-luxury-black mb-3">Artisan Craftsmanship</h4>
                  <p className="text-luxury-gray-700 leading-relaxed">
                    Our artisans combine traditional Islamic design principles with modern 3D printing technology, 
                    ensuring each piece maintains authentic proportions and details while meeting contemporary 
                    quality standards.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </main>
      
      <Footer />

      {/* Media Lightbox */}
      <MediaLightbox
        mediaItems={mediaItems}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        productName={product?.name || 'Product'}
        // ✨ HDRI Environment Support - Pass Product's HDRI Data
        hdriUrl={product?.hdriFiles?.[0]?.url || product?.defaultHdriUrl}
        hdriIntensity={product?.hdriFiles?.[0]?.intensity || product?.defaultHdriIntensity || 1.0}
        enableHdri={product?.hasHdri && (product?.hdriFiles?.length > 0 || !!product?.defaultHdriUrl)}
        backgroundBlur={product?.backgroundBlur || 0}
      />
    </>
  );
};

export default ProductDetailPage;