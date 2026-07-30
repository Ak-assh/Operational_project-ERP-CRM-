import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Plus, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ChallanListPage: React.FC = () => {
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/challans?${params.toString()}`);
      setChallans(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter]);

  const handleConfirm = async (id: string, challanNum: string) => {
    if (!window.confirm(`Are you sure you want to CONFIRM Challan #${challanNum}? Stock will be reduced automatically.`)) return;
    try {
      await api.post(`/challans/${id}/confirm`);
      fetchChallans();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to confirm challan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100">Sales Challans</h2>
          <p className="text-xs text-slate-400">Generate dispatch notes, manage draft & confirmed sales orders</p>
        </div>
        <Link to="/challans/new">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            New Sales Challan
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search challan number or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses (Draft, Confirmed, Cancelled)</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-semibold uppercase text-slate-400 bg-slate-950/80 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Challan #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Total Qty</th>
                <th className="px-5 py-3.5">Grand Total</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    Loading sales challans...
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No sales challans found.
                  </td>
                </tr>
              ) : (
                challans.map((sc) => (
                  <tr key={sc.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-mono font-bold text-indigo-400">
                      <Link to={`/challans/${sc.id}`}>{sc.challanNumber}</Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-100">{sc.customer?.customerName}</div>
                      {sc.customer?.businessName && (
                        <div className="text-xs text-slate-400">{sc.customer.businessName}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          sc.status === 'confirmed'
                            ? 'success'
                            : sc.status === 'draft'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {sc.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-300 font-medium">{sc.totalQuantity} items</td>
                    <td className="px-5 py-4 font-bold text-emerald-400">
                      ₹{sc.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {new Date(sc.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {sc.status === 'draft' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleConfirm(sc.id, sc.challanNumber)}
                            title="Confirm Challan & Reduce Stock"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1" /> Confirm
                          </Button>
                        )}
                        <Link to={`/challans/${sc.id}`}>
                          <Button variant="ghost" size="sm" title="View Challan Details & Print PDF">
                            <Eye className="w-4 h-4 text-indigo-400" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
