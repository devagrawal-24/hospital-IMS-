import React, { useState } from 'react';
import { User } from '../types';
import Sidebar from './Sidebar';
import { Menu, X, Bell } from 'lucide-react';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  onLogout: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
  unreadCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ user, children, onLogout, currentView, onChangeView, unreadCount = 0 }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        currentView={currentView}
        onChangeView={(view) => {
          onChangeView(view);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        unreadCount={unreadCount}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shadow-sm z-30">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-bold text-lg text-slate-800">MediCore</span>
          <div className="w-8" /> {/* Spacer */}
        </header>

        {/* Desktop Header / Top Bar */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 capitalize">
            {currentView.replace('-', ' ')}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;