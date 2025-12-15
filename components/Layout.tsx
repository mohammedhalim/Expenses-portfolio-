import React, { ReactNode } from 'react';
import { LayoutDashboard, Wallet, CreditCard, TrendingUp, Sparkles, Plus } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  onAIClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onAddClick, onAIClick }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'transactions', label: 'History', icon: CreditCard },
    { id: 'stocks', label: 'Stocks', icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Increased bottom padding to ensure content scrolls above the floating buttons */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-52">
        {children}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-5 flex flex-col items-center gap-4 z-50">
        {/* AI Assistant Button */}
        <button
          onClick={onAIClick}
          className="w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-95 border-2 border-white"
          title="AI Assistant"
        >
          <Sparkles size={22} strokeWidth={2.5} />
        </button>

        {/* Add Transaction Button */}
        <button
          onClick={onAddClick}
          className="w-14 h-14 bg-brand-600 text-white rounded-full shadow-xl shadow-brand-200 flex items-center justify-center hover:bg-brand-700 transition-all active:scale-95 active:shadow-sm"
        >
          <Plus size={32} strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 pb-6 flex justify-between items-center z-40 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center w-16 space-y-1 transition-all duration-200 ${
                isActive ? 'text-brand-600 scale-105' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-brand-50' : 'bg-transparent'}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;