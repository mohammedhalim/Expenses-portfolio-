import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Account, Transaction, StockHolding, PREDEFINED_CATEGORIES } from '../types';
import { TrendingUp, TrendingDown, DollarSign, RotateCcw, Wallet, ArrowDown, ArrowUp } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  stocks: StockHolding[];
}

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, stocks }) => {
  const [viewStartDate, setViewStartDate] = useState(StorageService.getDashboardStart());

  const handleNewDay = () => {
    if (window.confirm("Start a New Day? This will reset the Income and Expense columns to zero for the current view.")) {
      const now = new Date().toISOString();
      StorageService.saveDashboardStart(now);
      setViewStartDate(now);
    }
  };

  // Filter transactions based on the "New Day" reset time
  const viewTransactions = useMemo(() => {
    return transactions.filter(t => t.date >= viewStartDate);
  }, [transactions, viewStartDate]);

  const totalIncome = useMemo(() => 
    viewTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, curr) => acc + curr.amount, 0),
  [viewTransactions]);

  const totalExpense = useMemo(() => 
    viewTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0),
  [viewTransactions]);

  const stockPortfolioValue = useMemo(() => 
    stocks.reduce((acc, stock) => acc + (stock.quantity * stock.currentPrice), 0),
  [stocks]);

  const totalNetWorth = useMemo(() => 
    accounts.reduce((acc, account) => acc + account.balance, 0) + stockPortfolioValue,
  [accounts, stockPortfolioValue]);

  const expenseByCategory = useMemo(() => {
    const expenses = viewTransactions.filter(t => t.type === 'EXPENSE');
    const grouped: Record<string, number> = {};
    expenses.forEach(t => {
      const catName = t.categoryName || PREDEFINED_CATEGORIES.find(c => c.id === t.categoryId)?.name || 'Other';
      grouped[catName] = (grouped[catName] || 0) + t.amount;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by highest expense
  }, [viewTransactions]);

  const assetDistribution = useMemo(() => {
    const bank = accounts.filter(a => a.type === 'BANK').reduce((sum, a) => sum + a.balance, 0);
    const cash = accounts.filter(a => a.type === 'CASH').reduce((sum, a) => sum + a.balance, 0);
    const wallet = accounts.filter(a => a.type === 'WALLET').reduce((sum, a) => sum + a.balance, 0);
    const portfolioCash = accounts.filter(a => a.type === 'PORTFOLIO' || a.type === 'STOCK_PORTFOLIO').reduce((sum, a) => sum + a.balance, 0);
    
    const data = [
      { name: 'Bank', value: bank },
      { name: 'Cash', value: cash },
      { name: 'Wallet', value: wallet },
      { name: 'Portfolio (Cash)', value: portfolioCash },
      { name: 'Stocks (Held)', value: stockPortfolioValue },
    ].filter(d => d.value > 0);
    return data;
  }, [accounts, stockPortfolioValue]);

  return (
    <div className="p-5 space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium">
             Since {new Date(viewStartDate).toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'})}
          </p>
        </div>
        <button 
          onClick={handleNewDay}
          className="flex flex-col items-center justify-center bg-white border border-gray-200 text-brand-600 px-3 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={18} className="mb-1" strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase tracking-wide">New Day</span>
        </button>
      </header>

      {/* Net Worth Card - Always shows total regardless of reset */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 text-white shadow-xl shadow-brand-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        
        <div className="relative z-10">
           <div className="flex items-center gap-2 text-brand-100 text-sm font-bold mb-1 uppercase tracking-wider">
             <Wallet size={16} /> Total Net Worth
           </div>
           <div className="text-4xl font-extrabold tracking-tight">${totalNetWorth.toLocaleString()}</div>
           <div className="flex gap-4 mt-6">
             <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-md">
                <TrendingUp size={16} className="text-green-300" /> 
                <span>Stocks: ${stockPortfolioValue.toLocaleString()}</span>
             </div>
           </div>
        </div>
      </div>

      {/* Input / Output Stats (Resettable) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
               <ArrowDown size={20} strokeWidth={3} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Input</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">+${totalIncome.toLocaleString()}</div>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
               <ArrowUp size={20} strokeWidth={3} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Output</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">-${totalExpense.toLocaleString()}</div>
        </div>
      </div>

      {/* Expense Chart */}
      {expenseByCategory.length > 0 ? (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
             Output Breakdown
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
             {expenseByCategory.map((entry, index) => (
               <div key={index} className="flex items-center text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                 <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                 {entry.name}
               </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
             <DollarSign size={24} />
          </div>
          <p className="text-gray-400 text-sm font-medium">No spending data since last reset.</p>
        </div>
      )}

      {/* Asset Distribution */}
      {assetDistribution.length > 0 && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
           <h3 className="text-lg font-bold text-gray-800 mb-4">Asset Breakdown</h3>
           <div className="space-y-4">
             {assetDistribution.map((item, idx) => (
               <div key={item.name}>
                 <div className="flex justify-between text-sm mb-1.5">
                   <span className="text-gray-600 font-medium">{item.name}</span>
                   <span className="font-bold text-gray-900">${item.value.toLocaleString()}</span>
                 </div>
                 <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                   <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${(item.value / totalNetWorth) * 100}%`,
                        backgroundColor: COLORS[idx % COLORS.length]
                      }} 
                    />
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;