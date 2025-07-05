'use client';

import React, { useState, useEffect } from 'react';
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'cultural'>('description');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
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
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-gray-50">
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
      </div>
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

  const productImages = [
    product.featuredImage || product.images?.[0]?.url || '/images/products/placeholder.jpg',
    ...(product.images?.filter(img => img.url !== product.featuredImage).map(img => img.url) || [])
  ].filter(Boolean);

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
    <div className="min-h-screen bg-white">
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
            {/* Main Image */}
            <div className="aspect-square bg-luxury-gray-50 rounded-lg overflow-hidden relative group">
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
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
                {product.status === 'limited' && (
                  <span className="px-3 py-1 bg-purple-500 text-white text-sm font-medium rounded-full">
                    Limited Edition
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  isWishlisted 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-white/80 text-luxury-gray-600 hover:bg-white hover:text-red-600'
                }`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-luxury-gray-50 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index 
                        ? 'border-luxury-gold' 
                        : 'border-transparent hover:border-luxury-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
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
                  {getRatingStars(product.rating || 5)}
                  <span className="text-sm text-luxury-gray-600 ml-2">
                    ({product.reviewCount || 0} reviews)
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
                <button className="btn-luxury-ghost">
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Wishlist
                </button>
                <button className="btn-luxury-ghost">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
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
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {getRatingStars(product.rating || 5)}
                    <span className="text-2xl font-bold text-luxury-black ml-2">
                      {product.rating || 5.0}
                    </span>
                  </div>
                  <p className="text-luxury-gray-600">
                    Based on {product.reviewCount || 0} reviews
                  </p>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-6">
                  {[
                    {
                      name: "Sarah Ahmad",
                      rating: 5,
                      date: "2 weeks ago",
                      comment: "Absolutely beautiful piece. The craftsmanship is exceptional and the Arabic calligraphy is perfectly executed. Highly recommended!",
                      verified: true
                    },
                    {
                      name: "Mohammed Hassan",
                      rating: 5,
                      date: "1 month ago", 
                      comment: "Amazing quality and attention to detail. The packaging was excellent and it arrived quickly. Perfect for my home mosque.",
                      verified: true
                    }
                  ].map((review, index) => (
                    <div key={index} className="border-b border-luxury-gray-100 pb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-luxury-black">{review.name}</h5>
                            {review.verified && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              {getRatingStars(review.rating)}
                            </div>
                            <span className="text-sm text-luxury-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-luxury-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
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
    </div>
  );
};

export default ProductDetailPage;