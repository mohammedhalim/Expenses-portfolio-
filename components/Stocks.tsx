import React, { useState } from 'react';
import { StockHolding } from '../types';
import { RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';

interface StocksProps {
  stocks: StockHolding[];
  onUpdatePrice: (id: string, newPrice: number) => void;
}

const Stocks: React.FC<StocksProps> = ({ stocks, onUpdatePrice }) => {
  const [editId, setEditId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const handleUpdate = (id: string) => {
    if (editPrice) {
      onUpdatePrice(id, parseFloat(editPrice));
      setEditId(null);
      setEditPrice('');
    }
  };

  const totalValue = stocks.reduce((acc, s) => acc + (s.quantity * s.currentPrice), 0);
  const totalCost = stocks.reduce((acc, s) => acc + (s.quantity * s.averageBuyPrice), 0);
  const totalPL = totalValue - totalCost;

  return (
    <div className="p-5">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Portfolio</h1>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</span>
          <span className={`text-sm font-medium ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
             {totalPL >= 0 ? '+' : ''}{totalPL.toLocaleString()} ({((totalPL/totalCost || 0)*100).toFixed(2)}%)
          </span>
        </div>
      </header>

      <div className="space-y-4">
        {stocks.length === 0 && (
          <div className="text-gray-400 text-center py-10 text-sm">
            No active holdings. <br/>Add a "Stock Buy" transaction to start.
          </div>
        )}

        {stocks.map(stock => {
          const marketValue = stock.quantity * stock.currentPrice;
          const pl = marketValue - (stock.quantity * stock.averageBuyPrice);
          const plPercent = (pl / (stock.quantity * stock.averageBuyPrice)) * 100;
          const isEditing = editId === stock.id;

          return (
            <div key={stock.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{stock.symbol}</h3>
                  <p className="text-xs text-gray-500">{stock.quantity} shares @ avg ${stock.averageBuyPrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                   <div className="font-bold text-gray-900">${marketValue.toLocaleString()}</div>
                   <div className={`text-xs font-medium ${pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {pl >= 0 ? '+' : ''}{pl.toFixed(2)} ({plPercent.toFixed(1)}%)
                   </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                <span className="text-xs text-gray-400 uppercase font-semibold">Current Price</span>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                       <input 
                         type="number" 
                         className="w-24 border border-brand-200 bg-brand-50 rounded px-2 py-1 text-right text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                         autoFocus
                         value={editPrice}
                         onChange={e => setEditPrice(e.target.value)}
                         placeholder={stock.currentPrice.toString()}
                       />
                       <button onClick={() => handleUpdate(stock.id)} className="text-xs bg-brand-600 text-white px-2 py-1 rounded font-bold">Save</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditId(stock.id); setEditPrice(stock.currentPrice.toString()); }} className="flex items-center gap-1 text-sm text-brand-600 font-bold bg-brand-50 px-2 py-1 rounded border border-brand-100 hover:bg-brand-100 transition-colors">
                      ${stock.currentPrice.toFixed(2)} <RefreshCcw size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stocks;