import React from 'react';
import { User, Role } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardList, 
  Package, 
  LogOut, 
  UserCircle, 
  Clock,
  MessageSquare,
  StickyNote
} from 'lucide-react';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
  isOpen: boolean;
  unreadCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, currentView, onChangeView, isOpen, unreadCount = 0 }) => {
  const getMenuItems = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'messages', label: 'Messages', icon: MessageSquare, hasBadge: true },
          { id: 'attendance', label: 'Attendance', icon: Clock },
          { id: 'patients', label: 'Patients', icon: Users },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'users', label: 'User Management', icon: UserCircle },
          { id: 'notes', label: 'My Notes', icon: StickyNote },
        ];
      case 'DOCTOR':
        return [
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'attendance', label: 'My Attendance', icon: Clock },
          { id: 'messages', label: 'Messages', icon: MessageSquare, hasBadge: true },
          { id: 'notes', label: 'My Notes', icon: StickyNote },
          { id: 'profile', label: 'Profile', icon: UserCircle },
        ];
      case 'NURSE':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'attendance', label: 'My Attendance', icon: Clock },
          { id: 'message', label: 'Message Admin', icon: MessageSquare },
          { id: 'notes', label: 'My Notes', icon: StickyNote },
        ];
      case 'STAFF':
        return [
          { id: 'inventory', label: 'Inventory Tasks', icon: ClipboardList },
          { id: 'attendance', label: 'My Attendance', icon: Clock },
          { id: 'message', label: 'Message Admin', icon: MessageSquare },
          { id: 'notes', label: 'My Notes', icon: StickyNote },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems(user.role);

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:inset-0`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 bg-slate-950">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="font-bold text-white text-xl">+</span>
          </div>
          <span className="text-xl font-bold tracking-tight">MediCore</span>
        </div>

        {/* User Info */}
        <div className="px-6 py-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <p className="font-medium text-sm truncate max-w-[140px]">{user.name}</p>
              <p className="text-xs text-blue-400 font-semibold">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  active 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </div>
                {item.hasBadge && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 bg-slate-950/50 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;