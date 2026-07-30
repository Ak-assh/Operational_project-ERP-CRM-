import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Printer, CheckCircle2, XCircle, Building, Phone, Calendar, User, FileText } from 'lucide-react';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChallanDetails = async () => {
    try {
      const res = await api.get(`/challans/${id}`);
      setChallan(res.data?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchChallanDetails();
  }, [id]);

  const handleConfirm = async () => {
    if (!window.confirm('Are you sure you want to CONFIRM this Sales Challan? Stock will be reduced.')) return;
    try {
      await api.post(`/challans/${id}/confirm`);
      fetchChallanDetails();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to confirm');
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Enter cancellation reason:');
    if (!reason) return;
    try {
      await api.post(`/challans/${id}/cancel`, { reason });
      fetchChallanDetails();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading sales challan...</div>;
  }

  if (!challan) {
    return <div className="p-8 text-center text-rose-400">Sales Challan not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto printable-area">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link to="/challans">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Sales Challans
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {challan.status === 'draft' && (
            <Button variant="primary" size="sm" icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleConfirm}>
              Confirm & Dispatch
            </Button>
          )}
          {challan.status !== 'cancelled' && (
            <Button variant="danger" size="sm" icon={<XCircle className="w-4 h-4" />} onClick={handleCancel}>
              Cancel Order
            </Button>
          )}
          <Button variant="secondary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrintPDF}>
            Print / Export PDF
          </Button>
        </div>
      </div>

      {/* Invoice / Challan Document Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800 print:border-gray-300">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 print:text-indigo-600">
              Official Sales Dispatch Challan
            </span>
            <h2 className="text-3xl font-black text-slate-100 print:text-black font-mono mt-1">
              {challan.challanNumber}
            </h2>
            <div className="mt-2 flex items-center gap-2 print:hidden">
              <Badge variant={challan.status === 'confirmed' ? 'success' : challan.status === 'draft' ? 'warning' : 'danger'}>
                STATUS: {challan.status}
              </Badge>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 text-slate-400 print:text-gray-600">
            <p className="flex items-center sm:justify-end gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date: <strong className="text-slate-200 print:text-black">{new Date(challan.createdAt).toLocaleDateString('en-IN')}</strong>
            </p>
            <p className="flex items-center sm:justify-end gap-1">
              <User className="w-3.5 h-3.5" /> Created By: <strong className="text-slate-200 print:text-black">{challan.createdBy?.fullName || 'System User'}</strong>
            </p>
          </div>
        </div>

        {/* Customer & Company Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-slate-950/60 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-slate-400 print:text-gray-500 uppercase tracking-wider block mb-1">
              Bill To / Consignee:
            </span>
            <h3 className="font-bold text-slate-100 print:text-black text-base">{challan.customer?.customerName}</h3>
            {challan.customer?.businessName && (
              <p className="text-xs text-slate-300 print:text-gray-700 flex items-center gap-1 mt-0.5">
                <Building className="w-3.5 h-3.5" /> {challan.customer.businessName}
              </p>
            )}
            <p className="text-xs text-slate-400 print:text-gray-600 flex items-center gap-1 mt-1 font-mono">
              <Phone className="w-3.5 h-3.5 text-indigo-400" /> {challan.customer?.mobile}
            </p>
            {challan.customer?.gstNumber && (
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1 font-mono">
                GSTIN: {challan.customer.gstNumber}
              </p>
            )}
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-400 print:text-gray-500 uppercase tracking-wider block mb-1">
              Supplier / Dispatch From:
            </span>
            <h3 className="font-bold text-slate-100 print:text-black text-base">Wholesale Operations Portal</h3>
            <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">Central Industrial Warehouse Hub</p>
            <p className="text-xs text-slate-400 print:text-gray-600 mt-1">support@operationalportal.com</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-950 print:bg-gray-100 text-slate-400 print:text-gray-700 uppercase text-xs border-b border-slate-800 print:border-gray-300">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Product Name & SKU</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-center">Quantity</th>
                <th className="px-4 py-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-gray-200">
              {challan.items?.map((item: any, idx: number) => (
                <tr key={item.id} className="print:text-black">
                  <td className="px-4 py-3.5 text-xs text-slate-500 print:text-gray-500 font-mono">{idx + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-100 print:text-black">{item.productName}</div>
                    <div className="text-xs font-mono text-indigo-400 print:text-indigo-700">{item.sku}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono">
                    ₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold">{item.quantity}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-emerald-400 print:text-black font-mono">
                    ₹{item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-700 print:border-gray-400 font-bold bg-slate-950/40 print:bg-gray-50">
                <td colSpan={3} className="px-4 py-4 text-right uppercase text-xs text-slate-400 print:text-gray-700">
                  Total Items: {challan.totalQuantity}
                </td>
                <td className="px-4 py-4 text-slate-400 print:text-gray-700 text-xs uppercase">Grand Total:</td>
                <td className="px-4 py-4 text-right text-lg text-emerald-400 print:text-black font-extrabold font-mono">
                  ₹{challan.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Notes & Declaration */}
        {challan.notes && (
          <div className="p-4 bg-slate-950/60 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-xl text-xs space-y-1">
            <span className="font-bold text-slate-400 print:text-gray-600 uppercase">Special Instructions / Notes:</span>
            <p className="text-slate-200 print:text-gray-800">{challan.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
