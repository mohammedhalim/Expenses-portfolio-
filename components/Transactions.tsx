import React from 'react';
import { Transaction, Account, PREDEFINED_CATEGORIES } from '../types';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, TrendingUp } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, accounts }) => {
  // Sort by date desc
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getAccountName = (id?: string) => accounts.find(a => a.id === id)?.name || 'Unknown';

  const getIcon = (t: Transaction) => {
    if (t.type === 'INCOME') return <ArrowDownLeft className="text-green-500" />;
    if (t.type === 'EXPENSE') return <ArrowUpRight className="text-red-500" />;
    if (t.type === 'TRANSFER') return <ArrowRightLeft className="text-blue-500" />;
    return <TrendingUp className="text-purple-500" />;
  };

  const getCategoryName = (t: Transaction) => {
    if (t.categoryName) return t.categoryName;
    return PREDEFINED_CATEGORIES.find(c => c.id === t.categoryId)?.name || 'General';
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">History</h1>
      
      <div className="space-y-3">
        {sortedTransactions.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            No transactions yet. Tap + to add one.
          </div>
        )}
        
        {sortedTransactions.map(t => (
          <div key={t.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50`}>
                {getIcon(t)}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 capitalize">
                  {t.type === 'STOCK_BUY' ? `Buy ${t.stockSymbol}` : 
                   t.type === 'STOCK_SELL' ? `Sell ${t.stockSymbol}` :
                   t.type === 'TRANSFER' ? 'Transfer' :
                   getCategoryName(t)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(t.date).toLocaleDateString()} • {t.notes || t.type.replace('_', ' ').toLowerCase()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${
                t.type === 'INCOME' || t.type === 'STOCK_SELL' ? 'text-green-600' : 
                t.type === 'EXPENSE' || t.type === 'STOCK_BUY' ? 'text-red-600' : 'text-gray-900'
              }`}>
                {t.type === 'INCOME' || t.type === 'STOCK_SELL' ? '+' : '-'}
                ${t.amount.toLocaleString()}
              </p>
              {t.type === 'TRANSFER' && (
                <p className="text-[10px] text-gray-400">
                  {getAccountName(t.sourceAccountId)} → {getAccountName(t.destinationAccountId)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;