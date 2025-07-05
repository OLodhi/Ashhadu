import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ShopLoading() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main id="main-content" className="pt-16 lg:pt-20 bg-luxury-gray-50">
        {/* Page Header Skeleton */}
        <div className="bg-white border-b border-luxury-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="h-10 bg-luxury-gray-200 rounded-lg mb-4 max-w-md mx-auto animate-pulse"></div>
              <div className="h-6 bg-luxury-gray-200 rounded-lg max-w-2xl mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar Skeleton */}
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow-luxury p-6">
                <div className="h-6 bg-luxury-gray-200 rounded mb-6 animate-pulse"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-luxury-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 bg-luxury-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Section Skeleton */}
            <div className="flex-1">
              {/* Toolbar Skeleton */}
              <div className="bg-white rounded-lg shadow-luxury p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-luxury-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="flex space-x-4">
                    <div className="h-8 bg-luxury-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-8 bg-luxury-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Products Grid Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-luxury p-6 animate-pulse">
                    <div className="bg-luxury-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="bg-luxury-gray-200 h-4 rounded"></div>
                      <div className="bg-luxury-gray-200 h-4 rounded w-3/4"></div>
                      <div className="bg-luxury-gray-200 h-6 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}