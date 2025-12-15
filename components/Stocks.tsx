import React, { useState } from 'react';
import { StockHolding } from '../types';
import { RefreshCcw, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

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
  const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  return (
    <div className="p-5">
      <header className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                <PieChart size={20} strokeWidth={2.5} />
            </div>
            Investment Portfolio
        </h1>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Market Value</p>
            <p className="text-3xl font-extrabold text-gray-900">${totalValue.toLocaleString()}</p>
          </div>
          <div className={`text-right ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
             <p className="text-xs font-bold uppercase tracking-wider mb-1">Total Return</p>
             <p className="text-lg font-bold flex items-center justify-end gap-1">
               {totalPL >= 0 ? <TrendingUp size={18} strokeWidth={2.5}/> : <TrendingDown size={18} strokeWidth={2.5}/>}
               {totalPLPercent.toFixed(2)}%
             </p>
             <p className="text-sm font-medium opacity-80">
               {totalPL >= 0 ? '+' : ''}${totalPL.toLocaleString()}
             </p>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {stocks.length === 0 && (
          <div className="text-gray-400 text-center py-12 text-sm bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                <TrendingUp size={24} />
            </div>
            <p className="mb-2 font-bold">Your portfolio is empty.</p>
            <p>Add a "Stock Buy" transaction to see your investments here.</p>
          </div>
        )}

        {stocks.map(stock => {
          const marketValue = stock.quantity * stock.currentPrice;
          const costBasis = stock.quantity * stock.averageBuyPrice;
          const pl = marketValue - costBasis;
          const plPercent = (pl / costBasis) * 100;
          const isEditing = editId === stock.id;

          return (
            <div key={stock.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
              {/* Header: Symbol & Quick Stats */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md shadow-brand-200">
                    {stock.symbol.substring(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{stock.symbol}</h3>
                    <p className="text-xs text-gray-500 font-medium">{stock.quantity} shares</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-base font-bold ${pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pl >= 0 ? '+' : ''}{plPercent.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Return</div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-8">
                {/* Buy Side */}
                <div>
                   <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Avg Buy Price</p>
                   <p className="text-sm font-medium text-gray-700">${stock.averageBuyPrice.toFixed(2)}</p>
                </div>
                <div>
                   <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Invested Amount</p>
                   <p className="text-sm font-medium text-gray-700">${costBasis.toLocaleString()}</p>
                </div>

                {/* Current Side */}
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Current Price</p>
                      {!isEditing && (
                        <button onClick={() => { setEditId(stock.id); setEditPrice(stock.currentPrice.toString()); }} className="text-brand-600 hover:text-brand-700 bg-brand-50 p-1 rounded">
                          <RefreshCcw size={10} strokeWidth={3} />
                        </button>
                      )}
                   </div>
                   
                   {isEditing ? (
                     <div className="flex gap-1">
                       <input 
                         type="number" 
                         className="w-full border border-brand-300 rounded px-1 py-0.5 text-sm font-bold outline-none"
                         autoFocus
                         value={editPrice}
                         onChange={e => setEditPrice(e.target.value)}
                       />
                       <button onClick={() => handleUpdate(stock.id)} className="bg-brand-600 text-white px-2 rounded text-xs font-bold">OK</button>
                     </div>
                   ) : (
                     <p className="text-sm font-bold text-brand-600">${stock.currentPrice.toFixed(2)}</p>
                   )}
                </div>
                <div>
                   <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Current Value</p>
                   <p className="text-sm font-bold text-gray-900">${marketValue.toLocaleString()}</p>
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