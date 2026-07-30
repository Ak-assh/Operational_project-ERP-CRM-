import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Users, Package, FileText, TrendingUp, AlertTriangle, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    customersCount: 0,
    productsCount: 0,
    lowStockCount: 0,
    challansCount: 0,
    totalChallanAmount: 0,
  });
  const [recentChallans, setRecentChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [custRes, prodRes, lowStockRes, challanRes] = await Promise.all([
          api.get('/customers?limit=1'),
          api.get('/products?limit=1'),
          api.get('/products?lowStock=true&limit=100'),
          api.get('/challans?limit=5'),
        ]);

        const totalAmount = (challanRes.data?.data || []).reduce(
          (acc: number, item: any) => acc + (item.totalAmount || 0),
          0
        );

        setStats({
          customersCount: custRes.data?.meta?.total || 0,
          productsCount: prodRes.data?.meta?.total || 0,
          lowStockCount: lowStockRes.data?.meta?.total || 0,
          challansCount: challanRes.data?.meta?.total || 0,
          totalChallanAmount: totalAmount,
        });

        setRecentChallans(challanRes.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <Badge variant="purple">Welcome Back</Badge>
          <h2 className="text-3xl font-extrabold text-slate-100">
            Hello, {user?.fullName || 'User'} 👋
          </h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Here is your live operations summary for today. Track customer follow-ups, product inventory, and sales challans in real time.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customers</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{stats.customersCount}</h3>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Products Managed</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{stats.productsCount}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{stats.lowStockCount}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sales Challans</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{stats.challansCount}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link to="/customers" className="block">
          <Card className="hover:border-indigo-500/40 hover:bg-slate-900/90 transition group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 group-hover:text-indigo-400 transition">Manage Customers</h4>
                <p className="text-xs text-slate-400">View CRM, add contacts & notes</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/products" className="block">
          <Card className="hover:border-indigo-500/40 hover:bg-slate-900/90 transition group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 group-hover:text-amber-400 transition">Inventory & Stock</h4>
                <p className="text-xs text-slate-400">Log stock movements & low alerts</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/challans/new" className="block">
          <Card className="hover:border-indigo-500/40 hover:bg-slate-900/90 transition group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 group-hover:text-emerald-400 transition">Create Sales Challan</h4>
                <p className="text-xs text-slate-400">Generate draft or confirmed challan</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity Table */}
      <Card
        title="Recent Sales Challans"
        subtitle="Latest transactions processed through the operational portal"
        headerAction={
          <Link to="/challans">
            <Button variant="ghost" size="sm" icon={<ArrowUpRight className="w-4 h-4" />}>
              View All
            </Button>
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-semibold uppercase text-slate-400 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Challan #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Items Qty</th>
                <th className="px-4 py-3">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentChallans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No recent challans found.
                  </td>
                </tr>
              ) : (
                recentChallans.map((sc) => (
                  <tr key={sc.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono text-indigo-400 font-bold">
                      <Link to={`/challans/${sc.id}`}>{sc.challanNumber}</Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {sc.customer?.customerName}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-slate-300 font-medium">{sc.totalQuantity}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      ₹{sc.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
