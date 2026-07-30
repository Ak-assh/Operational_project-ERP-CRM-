import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  const getRoleVariant = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'SALES': return 'info';
      case 'WAREHOUSE': return 'warning';
      case 'ACCOUNTS': return 'success';
      default: return 'default';
    }
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-100 hidden sm:block">
          Operations Portal
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              {user.fullName.charAt(0)}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-200">{user.fullName}</p>
              <p className="text-[10px] text-slate-400">{user.email}</p>
            </div>
            <Badge variant={getRoleVariant(user.role)}>
              {user.role}
            </Badge>
          </div>
        )}

        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition flex items-center gap-2 text-xs font-medium"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
