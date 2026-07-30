import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { StockMovementType } from '@op/shared';
import { Search, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight, Edit3, MapPin, Package } from 'lucide-react';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryIdFilter, setCategoryIdFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Product Form State
  const [productForm, setProductForm] = useState({
    productName: '',
    sku: '',
    categoryId: '',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 5,
    unit: 'pcs',
    location: '',
    description: '',
  });

  // Stock Movement Form State
  const [stockForm, setStockForm] = useState({
    quantity: 1,
    movementType: StockMovementType.IN,
    reason: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryIdFilter) params.append('categoryId', categoryIdFilter);
      if (lowStockFilter) params.append('lowStock', 'true');

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryIdFilter, lowStockFilter]);

  const handleOpenCreateModal = () => {
    setSelectedProduct(null);
    setProductForm({
      productName: '',
      sku: '',
      categoryId: categories[0]?.id || '',
      unitPrice: 0,
      currentStock: 0,
      minStockAlert: 5,
      unit: 'pcs',
      location: '',
      description: '',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (prod: any) => {
    setSelectedProduct(prod);
    setProductForm({
      productName: prod.productName,
      sku: prod.sku,
      categoryId: prod.categoryId || '',
      unitPrice: prod.unitPrice,
      currentStock: prod.currentStock,
      minStockAlert: prod.minStockAlert,
      unit: prod.unit || 'pcs',
      location: prod.location || '',
      description: prod.description || '',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenStockModal = (prod: any) => {
    setSelectedProduct(prod);
    setStockForm({
      quantity: 1,
      movementType: StockMovementType.IN,
      reason: '',
    });
    setIsStockModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, productForm);
      } else {
        await api.post('/products', productForm);
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save product');
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products/stock-movement', {
        productId: selectedProduct.id,
        quantity: Number(stockForm.quantity),
        movementType: stockForm.movementType,
        reason: stockForm.reason,
      });
      setIsStockModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Stock adjustment failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100">Products & Inventory</h2>
          <p className="text-xs text-slate-400">Manage catalog, real-time stock levels, and movement logs</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreateModal}>
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search SKU or product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={categoryIdFilter}
            onChange={(e) => setCategoryIdFilter(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition ${
              lowStockFilter
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {lowStockFilter ? 'Filtering Low Stock Items' : 'Filter Low Stock Only'}
          </button>
        </div>
      </Card>

      {/* Product Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-semibold uppercase text-slate-400 bg-slate-950/80 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Product & SKU</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Unit Price</th>
                <th className="px-5 py-3.5">Stock Level</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLowStock = p.currentStock <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-100">{p.productName}</div>
                        <div className="text-xs font-mono text-indigo-400 font-semibold">{p.sku}</div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="default">{p.category?.name || 'Uncategorized'}</Badge>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-100">
                        ₹{p.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-extrabold text-base ${
                              isLowStock ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {p.currentStock} {p.unit}
                          </span>
                          {isLowStock && (
                            <Badge variant="warning">
                              <AlertTriangle className="w-3 h-3" /> Low Stock ({p.minStockAlert})
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {p.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" /> {p.location}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-5 py-4 text-right space-x-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenStockModal(p)}
                          title="Adjust Stock IN/OUT"
                        >
                          Stock ±
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(p)}
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4 text-slate-400" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={selectedProduct ? 'Edit Product Details' : 'Add New Product'}
      >
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <Input
            label="Product Name *"
            value={productForm.productName}
            onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="SKU Code *"
              value={productForm.sku}
              onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={productForm.categoryId}
                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Unit Price (₹) *"
              type="number"
              step="0.01"
              value={productForm.unitPrice}
              onChange={(e) => setProductForm({ ...productForm, unitPrice: Number(e.target.value) })}
              required
            />
            <Input
              label="Initial Stock *"
              type="number"
              value={productForm.currentStock}
              onChange={(e) => setProductForm({ ...productForm, currentStock: Number(e.target.value) })}
              required
              disabled={!!selectedProduct} // Edit stock via movement log for audit trail
            />
            <Input
              label="Min Alert Quantity *"
              type="number"
              value={productForm.minStockAlert}
              onChange={(e) => setProductForm({ ...productForm, minStockAlert: Number(e.target.value) })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Unit (pcs, box, kg)"
              value={productForm.unit}
              onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
            />
            <Input
              label="Warehouse / Rack Location"
              value={productForm.location}
              onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsProductModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {selectedProduct ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Movement Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Adjust Stock: ${selectedProduct?.productName || ''}`}
      >
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Available Stock:</span>
            <span className="font-bold text-emerald-400 text-sm">{selectedProduct?.currentStock} {selectedProduct?.unit}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Movement Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStockForm({ ...stockForm, movementType: StockMovementType.IN })}
                className={`py-2.5 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition ${
                  stockForm.movementType === StockMovementType.IN
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" /> Stock IN (+)
              </button>
              <button
                type="button"
                onClick={() => setStockForm({ ...stockForm, movementType: StockMovementType.OUT })}
                className={`py-2.5 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition ${
                  stockForm.movementType === StockMovementType.OUT
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" /> Stock OUT (-)
              </button>
            </div>
          </div>

          <Input
            label="Quantity *"
            type="number"
            min={1}
            value={stockForm.quantity}
            onChange={(e) => setStockForm({ ...stockForm, quantity: Number(e.target.value) })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Reason / Reference *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Restock shipment received / Damaged goods written off"
              value={stockForm.reason}
              onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsStockModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Stock Movement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
