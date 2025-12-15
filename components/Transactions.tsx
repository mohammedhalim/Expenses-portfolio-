import React from 'react';
import { Transaction, Account, PREDEFINED_CATEGORIES, TransactionType } from '../types';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, TrendingUp, TrendingDown, ShoppingBag, Trash2 } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
  onClearHistory: () => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, accounts, onClearHistory }) => {
  // Sort by date desc
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getAccountName = (id?: string) => accounts.find(a => a.id === id)?.name || 'Unknown';

  const getTxnStyle = (type: TransactionType) => {
    switch(type) {
        case 'INCOME': return { Icon: ArrowDownLeft, bg: 'bg-green-100', text: 'text-green-600' };
        case 'EXPENSE': return { Icon: ArrowUpRight, bg: 'bg-red-100', text: 'text-red-600' };
        case 'TRANSFER': return { Icon: ArrowRightLeft, bg: 'bg-blue-100', text: 'text-blue-600' };
        case 'STOCK_BUY': return { Icon: TrendingUp, bg: 'bg-indigo-100', text: 'text-indigo-600' };
        case 'STOCK_SELL': return { Icon: TrendingDown, bg: 'bg-orange-100', text: 'text-orange-600' };
        default: return { Icon: ShoppingBag, bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const getCategoryName = (t: Transaction) => {
    if (t.categoryName) return t.categoryName;
    return PREDEFINED_CATEGORIES.find(c => c.id === t.categoryId)?.name || 'General';
  };

  const handleClearClick = () => {
    if (window.confirm("Are you sure you want to delete ALL transaction history? Your current account balances will remain as they are. This action cannot be undone.")) {
      onClearHistory();
    }
  };

  return (
    <div className="p-5">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">History</h1>
        {transactions.length > 0 && (
          <button 
            onClick={handleClearClick} 
            className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
          >
            <Trash2 size={18} />
            <span className="text-xs font-bold uppercase">Clear</span>
          </button>
        )}
      </header>
      
      <div className="space-y-4">
        {sortedTransactions.length === 0 && (
          <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="mb-2 font-bold text-gray-300">No transactions recorded</p>
            <p className="text-xs">Tap the + button to add one.</p>
          </div>
        )}
        
        {sortedTransactions.map(t => {
          const { Icon, bg, text } = getTxnStyle(t.type);
          
          return (
            <div key={t.id} className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform active:scale-[0.99]">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} ${text} shadow-sm`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 capitalize leading-tight">
                    {t.type === 'STOCK_BUY' ? `Buy ${t.stockSymbol}` : 
                     t.type === 'STOCK_SELL' ? `Sell ${t.stockSymbol}` :
                     t.type === 'TRANSFER' ? 'Transfer' :
                     getCategoryName(t)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {t.notes || t.type.replace('_', ' ').toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-base ${
                  t.type === 'INCOME' || t.type === 'STOCK_SELL' ? 'text-green-600' : 
                  t.type === 'EXPENSE' || t.type === 'STOCK_BUY' ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {t.type === 'INCOME' || t.type === 'STOCK_SELL' ? '+' : '-'}
                  ${t.amount.toLocaleString()}
                </p>
                {t.type === 'TRANSFER' && (
                  <p className="text-[10px] text-gray-400 font-medium">
                    {getAccountName(t.sourceAccountId)} → {getAccountName(t.destinationAccountId)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Transactions;