'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Clock,
  DollarSign,
  Search,
  Download,
  Edit,
  History,
  Plus,
  Minus
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface StockSummary {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalStockValue: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  stock_status: string;
  low_stock_threshold: number;
  manage_stock: boolean;
  price: number;
  category: string;
  islamic_category: string;
  created_at: string;
  updated_at: string;
}

interface InventoryMovement {
  id: string;
  product_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference: string;
  performed_by: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'movements'>('overview');
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustmentModal, setAdjustmentModal] = useState<{
    isOpen: boolean;
    product?: Product;
    newQuantity: string;
    reason: string;
  }>({
    isOpen: false,
    newQuantity: '',
    reason: ''
  });

  // Fetch summary data
  useEffect(() => {
    fetchSummary();
  }, []);

  // Fetch products when tab changes
  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'movements') {
      fetchMovements();
    }
  }, [activeTab]);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/inventory/reports?type=summary');
      const result = await response.json();
      
      if (result.success) {
        setSummary(result.data);
      } else {
        toast.error('Failed to load inventory summary');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Error loading inventory data');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/reports?type=detailed');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data.products);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/movements?limit=100');
      const result = await response.json();
      
      if (result.success) {
        setMovements(result.data);
      } else {
        toast.error('Failed to load inventory movements');
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast.error('Error loading movements');
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async () => {
    if (!adjustmentModal.product || !adjustmentModal.newQuantity || !adjustmentModal.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: adjustmentModal.product.id,
          newQuantity: parseInt(adjustmentModal.newQuantity),
          reason: adjustmentModal.reason
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Stock adjustment completed successfully');
        setAdjustmentModal({ isOpen: false, newQuantity: '', reason: '' });
        fetchProducts();
        fetchSummary();
      } else {
        toast.error(result.error || 'Failed to adjust stock');
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Error adjusting stock');
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'text-green-600 bg-green-50';
      case 'low-stock':
        return 'text-yellow-600 bg-yellow-50';
      case 'out-of-stock':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <Edit className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && activeTab === 'overview') {
    return (
      <div className="space-y-6">
        <h1 className="heading-section text-luxury-black">Inventory Management</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-luxury-gray-500">Loading inventory data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-section text-luxury-black">Inventory Management</h1>
          <p className="text-body mt-2">
            Monitor stock levels and manage inventory movements
          </p>
        </div>
        <button className="btn-luxury-ghost">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-luxury">
        <div className="border-b border-luxury-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Package },
              { id: 'products', label: 'Stock Levels', icon: AlertTriangle },
              { id: 'movements', label: 'Movements', icon: History }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-luxury-gold text-luxury-gold'
                      : 'border-transparent text-luxury-gray-500 hover:text-luxury-gray-700 hover:border-luxury-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && summary && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Products</p>
                      <p className="text-2xl font-bold text-blue-900">{summary.totalProducts}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">In Stock</p>
                      <p className="text-2xl font-bold text-green-900">{summary.inStock}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Low Stock</p>
                      <p className="text-2xl font-bold text-yellow-900">{summary.lowStock}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Out of Stock</p>
                      <p className="text-2xl font-bold text-red-900">{summary.outOfStock}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-luxury-gold/10 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-luxury-gold">Stock Value</p>
                      <p className="text-2xl font-bold text-luxury-black">{formatPrice(summary.totalStockValue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-luxury-gold" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-luxury-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                />
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-luxury-gray-200">
                  <thead className="bg-luxury-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-luxury-gray-200">
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-luxury-gray-50">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-luxury-black">{product.name}</div>
                            <div className="text-sm text-luxury-gray-600">{product.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-luxury-gray-900">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-luxury-black">{product.stock}</div>
                            <div className="text-xs text-luxury-gray-500">
                              Threshold: {product.low_stock_threshold}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(product.stock_status)}`}>
                            {product.stock_status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-luxury-gold">
                          {formatPrice(product.stock * product.price)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setAdjustmentModal({
                              isOpen: true,
                              product,
                              newQuantity: product.stock.toString(),
                              reason: ''
                            })}
                            className="text-luxury-gold hover:text-luxury-gold/80 transition-colors"
                            title="Adjust Stock"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-luxury-gray-200">
                  <thead className="bg-luxury-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-luxury-gray-200">
                    {movements.map(movement => (
                      <tr key={movement.id} className="hover:bg-luxury-gray-50">
                        <td className="px-6 py-4 text-sm text-luxury-gray-900">
                          {new Date(movement.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-luxury-black">{movement.product.name}</div>
                            <div className="text-sm text-luxury-gray-600">{movement.product.sku}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getMovementIcon(movement.type)}
                            <span className="text-sm capitalize">{movement.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {movement.type === 'out' ? '-' : '+'}{movement.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-luxury-gray-900">
                          {movement.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustmentModal.isOpen && adjustmentModal.product && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-luxury-black mb-4">
              Adjust Stock: {adjustmentModal.product.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Current Stock: {adjustmentModal.product.stock}
                </label>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  New Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustmentModal.newQuantity}
                  onChange={(e) => setAdjustmentModal(prev => ({ ...prev, newQuantity: e.target.value }))}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Reason for Adjustment
                </label>
                <textarea
                  value={adjustmentModal.reason}
                  onChange={(e) => setAdjustmentModal(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                  placeholder="Enter reason for stock adjustment..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setAdjustmentModal({ isOpen: false, newQuantity: '', reason: '' })}
                className="btn-luxury-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleStockAdjustment}
                className="btn-luxury"
              >
                Adjust Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;