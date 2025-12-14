import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Account, Transaction, StockHolding, PREDEFINED_CATEGORIES } from '../types';
import { TrendingUp, TrendingDown, DollarSign, RotateCcw } from 'lucide-react';
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
    
    const data = [
      { name: 'Bank', value: bank },
      { name: 'Cash', value: cash },
      { name: 'Wallet', value: wallet },
      { name: 'Stocks', value: stockPortfolioValue },
    ].filter(d => d.value > 0);
    return data;
  }, [accounts, stockPortfolioValue]);

  return (
    <div className="p-5 space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Stats since {new Date(viewStartDate).toLocaleDateString()} {new Date(viewStartDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
        <button 
          onClick={handleNewDay}
          className="flex flex-col items-center justify-center bg-white border border-gray-200 text-brand-600 px-3 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={18} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wide">New Day</span>
        </button>
      </header>

      {/* Net Worth Card - Always shows total regardless of reset */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="text-brand-100 text-sm font-medium mb-1">Total Net Worth</div>
        <div className="text-4xl font-bold">${totalNetWorth.toLocaleString()}</div>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-sm">
             <TrendingUp size={16} /> <span>Stocks: ${stockPortfolioValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Input / Output Stats (Resettable) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <div className="p-1.5 bg-green-100 rounded-full"><TrendingUp size={16} /></div>
            <span className="text-xs font-bold uppercase tracking-wider">Input</span>
          </div>
          <div className="text-xl font-bold text-gray-800">+${totalIncome.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <div className="p-1.5 bg-red-100 rounded-full"><TrendingDown size={16} /></div>
            <span className="text-xs font-bold uppercase tracking-wider">Output</span>
          </div>
          <div className="text-xl font-bold text-gray-800">-${totalExpense.toLocaleString()}</div>
        </div>
      </div>

      {/* Expense Chart */}
      {expenseByCategory.length > 0 ? (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Output Breakdown</h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
             {expenseByCategory.map((entry, index) => (
               <div key={index} className="flex items-center text-xs text-gray-500">
                 <div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                 {entry.name}
               </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-dashed border-gray-200 text-center">
          <p className="text-gray-400 text-sm">No output data since reset.</p>
        </div>
      )}

      {/* Asset Distribution */}
      {assetDistribution.length > 0 && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
           <h3 className="text-lg font-bold text-gray-800 mb-4">Asset Breakdown</h3>
           <div className="space-y-3">
             {assetDistribution.map((item, idx) => (
               <div key={item.name}>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-gray-600">{item.name}</span>
                   <span className="font-semibold text-gray-900">${item.value.toLocaleString()}</span>
                 </div>
                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div 
                      className="h-full rounded-full" 
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