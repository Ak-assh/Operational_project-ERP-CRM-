import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layers, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setAuth(res.data.data.user, res.data.data.token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Demo login credentials handler
  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-600 selection:text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-2xl mb-2 shadow-xl">
            <Layers className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Mini ERP + CRM Portal</h1>
          <p className="text-sm text-slate-400">Sign in to access your operational workspace</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium text-center animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@portal.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-full py-3" isLoading={loading}>
              Sign In to Portal <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* User Request Comment: New User? -> Signup */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              New User?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5" /> Create Account / Signup
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials Helper */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Quick Demo Role Logins
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => fillDemoCredentials('admin@portal.com')}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition text-left"
            >
              <span className="font-bold block text-indigo-400">Admin</span>
              admin@portal.com
            </button>
            <button
              onClick={() => fillDemoCredentials('sales@portal.com')}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition text-left"
            >
              <span className="font-bold block text-sky-400">Sales</span>
              sales@portal.com
            </button>
            <button
              onClick={() => fillDemoCredentials('warehouse@portal.com')}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition text-left"
            >
              <span className="font-bold block text-amber-400">Warehouse</span>
              warehouse@portal.com
            </button>
            <button
              onClick={() => fillDemoCredentials('accounts@portal.com')}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition text-left"
            >
              <span className="font-bold block text-emerald-400">Accounts</span>
              accounts@portal.com
            </button>
          </div>
          <p className="text-[10px] text-slate-500">Password for demo accounts: <code className="text-slate-300">password123</code></p>
        </div>
      </div>
    </div>
  );
};
