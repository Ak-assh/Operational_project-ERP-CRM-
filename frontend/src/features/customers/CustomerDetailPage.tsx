import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { NoteType } from '@op/shared';
import { ArrowLeft, Phone, Mail, Building, Calendar, MessageSquare, Plus, FileText, Clock } from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Note Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<NoteType>(NoteType.GENERAL);

  const fetchCustomerDetails = async () => {
    try {
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCustomerDetails();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/customers/${id}/notes`, { note: noteContent, noteType });
      setNoteContent('');
      setIsNoteModalOpen(false);
      fetchCustomerDetails();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add note');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-rose-400">Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/customers">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Customers
          </Button>
        </Link>
      </div>

      {/* Customer Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-100">{customer.customerName}</h2>
              <Badge variant={customer.status === 'active' ? 'success' : 'info'}>
                {customer.status}
              </Badge>
              <Badge variant="purple">{customer.customerType}</Badge>
            </div>
            {customer.businessName && (
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-400" /> {customer.businessName}
              </p>
            )}
          </div>

          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsNoteModalOpen(true)}>
            Add Follow-up Note
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-500 uppercase font-semibold block">Mobile Number</span>
            <span className="text-slate-200 font-mono font-bold flex items-center gap-1.5 mt-1">
              <Phone className="w-4 h-4 text-indigo-400" /> {customer.mobile}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-500 uppercase font-semibold block">Email Address</span>
            <span className="text-slate-200 font-medium flex items-center gap-1.5 mt-1">
              <Mail className="w-4 h-4 text-slate-400" /> {customer.email || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-500 uppercase font-semibold block">GST Number</span>
            <span className="text-slate-200 font-mono font-semibold mt-1 block">
              {customer.gstNumber || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-500 uppercase font-semibold block">Follow-up Schedule</span>
            <span className="text-amber-400 font-medium flex items-center gap-1.5 mt-1">
              <Calendar className="w-4 h-4" />
              {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString('en-IN') : 'None set'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes & Activity Timeline (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="CRM Follow-Up Notes & History"
            subtitle="Chronological log of calls, meetings, and communications"
            headerAction={
              <Button size="sm" variant="outline" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsNoteModalOpen(true)}>
                Add Note
              </Button>
            }
          >
            <div className="space-y-4 mt-2">
              {customer.notes?.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No notes added for this customer yet.</p>
              ) : (
                customer.notes?.map((n: any) => (
                  <div key={n.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        Logged by {n.createdBy?.fullName || 'User'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-line">{n.note}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Associated Sales Challans (1 column) */}
        <div className="space-y-4">
          <Card title="Recent Sales Challans" subtitle="Transactions linked to customer">
            <div className="space-y-3 mt-2">
              {customer.salesChallans?.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No challans generated yet.</p>
              ) : (
                customer.salesChallans?.map((sc: any) => (
                  <Link
                    key={sc.id}
                    to={`/challans/${sc.id}`}
                    className="block p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-indigo-400">{sc.challanNumber}</span>
                      <Badge variant={sc.status === 'confirmed' ? 'success' : 'warning'}>{sc.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-slate-400">{new Date(sc.createdAt).toLocaleDateString('en-IN')}</span>
                      <span className="font-bold text-emerald-400">₹{sc.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Follow-up Note Modal */}
      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Add CRM Follow-up Note">
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Note Category
            </label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as NoteType)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="general">General Note</option>
              <option value="call">Phone Call Summary</option>
              <option value="meeting">In-Person Meeting</option>
              <option value="proposal">Price Proposal / Deal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Note Details *
            </label>
            <textarea
              rows={4}
              required
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Record key discussion points, commitments, or follow-up tasks..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
