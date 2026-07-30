import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChallanStatus } from '@op/shared';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Save, AlertCircle } from 'lucide-react';

interface SelectedItem {
  productId: string;
  quantity: number;
  productName?: string;
  sku?: string;
  unitPrice?: number;
  availableStock?: number;
}

export const CreateChallanPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<SelectedItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100'),
        ]);
        setCustomers(custRes.data?.data || []);
        const prodList = prodRes.data?.data || [];
        setProducts(prodList);

        if (prodList.length > 0) {
          setItems([
            {
              productId: prodList[0].id,
              quantity: 1,
              productName: prodList[0].productName,
              sku: prodList[0].sku,
              unitPrice: prodList[0].unitPrice,
              availableStock: prodList[0].currentStock,
            },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddItem = () => {
    if (products.length === 0) return;
    const firstProd = products[0];
    setItems([
      ...items,
      {
        productId: firstProd.id,
        quantity: 1,
        productName: firstProd.productName,
        sku: firstProd.sku,
        unitPrice: firstProd.unitPrice,
        availableStock: firstProd.currentStock,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      alert('Challan must contain at least one product item');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId,
      productName: prod.productName,
      sku: prod.sku,
      unitPrice: prod.unitPrice,
      availableStock: prod.currentStock,
    };
    setItems(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, quantity);
    setItems(updated);
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);
  };

  const calculateTotalQuantity = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmit = async (status: ChallanStatus) => {
    setError(null);
    if (!customerId) {
      setError('Please select a valid customer');
      return;
    }

    try {
      const payload = {
        customerId,
        status,
        notes,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      const res = await api.post('/challans', payload);
      if (res.data.success) {
        navigate(`/challans/${res.data.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create sales challan');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading master data...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/challans">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Challans
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-black text-slate-100">New Sales Challan</h2>
          <p className="text-xs text-slate-400">Generate auto-numbered dispatch note with snapshot pricing</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Customer Selection Card */}
      <Card title="1. Select Customer & Delivery Context">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Customer Name *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerName} {c.businessName ? `(${c.businessName})` : ''} — {c.mobile}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Dispatch / Order Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Special packaging instructions, PO reference #"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Card>

      {/* Product Items Table Card */}
      <Card
        title="2. Product Line Items"
        subtitle="Snapshot unit prices will be permanently locked on creation"
        headerAction={
          <Button variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleAddItem}>
            Add Item Row
          </Button>
        }
      >
        <div className="space-y-4">
          {items.map((item, idx) => {
            const lineTotal = (item.unitPrice || 0) * item.quantity;
            const isStockExceeded = item.quantity > (item.availableStock || 0);

            return (
              <div
                key={idx}
                className="p-4 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
              >
                <div className="md:col-span-5">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Select Product
                  </label>
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(idx, e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.productName} ({p.sku}) — Stock: {p.currentStock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Unit Price</label>
                  <div className="px-3 py-2 bg-slate-900 border border-slate-800/80 rounded-xl text-sm font-bold text-slate-200">
                    ₹{item.unitPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                    className={`w-full px-3 py-2 bg-slate-900 border rounded-xl text-sm font-bold text-slate-100 focus:outline-none ${
                      isStockExceeded ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:ring-indigo-500'
                    }`}
                  />
                  {isStockExceeded && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold">Exceeds stock ({item.availableStock})</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Line Total</label>
                  <div className="px-3 py-2 bg-slate-900 border border-slate-800/80 rounded-xl text-sm font-bold text-emerald-400">
                    ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition"
                    title="Remove line item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Totals Summary */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-slate-400 font-medium">
              Total Quantity: <strong className="text-slate-100 font-bold">{calculateTotalQuantity()} items</strong>
            </span>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-semibold block">Grand Total Amount</span>
              <span className="text-2xl font-black text-emerald-400">
                ₹{calculateGrandTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Submission Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          icon={<Save className="w-4 h-4" />}
          onClick={() => handleSubmit(ChallanStatus.DRAFT)}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          icon={<CheckCircle2 className="w-4 h-4" />}
          onClick={() => handleSubmit(ChallanStatus.CONFIRMED)}
        >
          Save & Confirm (Reduce Stock Immediately)
        </Button>
      </div>
    </div>
  );
};
