import React, { useState, useEffect } from 'react';
import { TransactionType, Account, PREDEFINED_CATEGORIES, Transaction, StockHolding } from '../types';
import { X, Check, ArrowDown, Calculator, Wallet } from 'lucide-react';
import { generateId } from '../services/storageService';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  stocks: StockHolding[];
  onSave: (t: Transaction) => void;
  initialData?: Partial<Transaction> | null;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, accounts, stocks, onSave, initialData }) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  // Category Logic
  const [categoryId, setCategoryId] = useState(PREDEFINED_CATEGORIES[2].id); // Default to Food
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  
  // Account Selections
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');
  const [destAccountId, setDestAccountId] = useState(accounts.length > 1 ? accounts[1].id : '');

  // Stock Specific
  const [stockSymbol, setStockSymbol] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [stockPrice, setStockPrice] = useState(''); // Price per share

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Pre-fill from AI data
        if (initialData.type) setType(initialData.type);
        if (initialData.amount) setAmount(initialData.amount.toString());
        if (initialData.date) setDate(initialData.date.split('T')[0]);
        if (initialData.notes) setNotes(initialData.notes);
        
        if (initialData.sourceAccountId) setSourceAccountId(initialData.sourceAccountId);
        if (initialData.destinationAccountId) setDestAccountId(initialData.destinationAccountId);
        
        if (initialData.categoryId) {
          setCategoryId(initialData.categoryId);
          setIsCustomCategory(false);
        } else if (initialData.categoryName) {
          setCustomCategoryName(initialData.categoryName);
          setIsCustomCategory(true);
        }

        if (initialData.stockSymbol) setStockSymbol(initialData.stockSymbol);
        if (initialData.stockQuantity) setStockQty(initialData.stockQuantity.toString());
        if (initialData.stockPrice) setStockPrice(initialData.stockPrice.toString());

      } else {
        // Reset to defaults
        resetForm();
        setSourceAccountId(accounts[0]?.id || '');
        setDestAccountId(accounts.length > 1 ? accounts[1].id : '');
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, initialData, accounts]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    // --- VALIDATION START ---
    const numericAmount = parseFloat(amount);
    const numericQty = parseFloat(stockQty);
    const numericPrice = parseFloat(stockPrice);
    const isStock = type === 'STOCK_BUY' || type === 'STOCK_SELL';

    // 1. Validate Amounts
    if (isStock) {
        if (!stockSymbol) { alert("Please specify the stock symbol."); return; }
        if (!numericQty || numericQty <= 0) { alert("Please specify a valid quantity."); return; }
        if (!numericPrice || numericPrice <= 0) { alert("Please specify a valid price per share."); return; }
    } else {
        if (!numericAmount || numericAmount <= 0) { alert("Please specify a valid amount."); return; }
    }

    // 2. Validate Source/Destination based on Type
    if (type === 'EXPENSE') {
        if (!sourceAccountId) { alert("Please specify the source account (From) where the money comes from."); return; }
    } 
    else if (type === 'INCOME') {
        if (!destAccountId) { alert("Please specify the destination account (To) where the money will be deposited."); return; }
    } 
    else if (type === 'TRANSFER') {
        if (!sourceAccountId) { alert("Please specify the source account (From)."); return; }
        if (!destAccountId) { alert("Please specify the destination account (To)."); return; }
        if (sourceAccountId === destAccountId) { alert("Source and destination accounts cannot be the same."); return; }
    } 
    else if (type === 'STOCK_BUY') {
        if (!sourceAccountId) { alert("Please specify the Funding Account (Source) to pay for this purchase."); return; }
    } 
    else if (type === 'STOCK_SELL') {
        if (!destAccountId) { alert("Please specify the destination account (To) for the sale proceeds."); return; }
    }
    // --- VALIDATION END ---
    
    // Date Logic
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    let finalIsoDate = '';
    if (date === todayStr) {
        finalIsoDate = now.toISOString();
    } else {
        finalIsoDate = new Date(date).toISOString();
    }

    const txn: Transaction = {
      id: generateId(),
      type,
      amount: isStock ? (numericQty * numericPrice) : numericAmount,
      date: finalIsoDate,
      notes,
    };

    if (type === 'INCOME') {
      txn.destinationAccountId = destAccountId;
      if (isCustomCategory) {
        txn.categoryName = customCategoryName || 'Custom Income';
      } else {
        txn.categoryId = categoryId;
      }
    } else if (type === 'EXPENSE') {
      txn.sourceAccountId = sourceAccountId;
      if (isCustomCategory) {
        txn.categoryName = customCategoryName || 'Custom Expense';
      } else {
        txn.categoryId = categoryId;
      }
    } else if (type === 'TRANSFER') {
      txn.sourceAccountId = sourceAccountId;
      txn.destinationAccountId = destAccountId;
    } else if (type === 'STOCK_BUY') {
      txn.stockSymbol = stockSymbol.toUpperCase();
      txn.stockQuantity = numericQty;
      txn.stockPrice = numericPrice;
      txn.sourceAccountId = sourceAccountId;
      txn.destinationAccountId = undefined; // STRICTLY NO DESTINATION
    } else if (type === 'STOCK_SELL') {
      txn.stockSymbol = stockSymbol.toUpperCase();
      txn.stockQuantity = numericQty;
      txn.stockPrice = numericPrice;
      txn.destinationAccountId = destAccountId;
      txn.sourceAccountId = undefined; // Sell is a source in itself, but we map proceeds to dest.
    }

    onSave(txn);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setAmount('');
    setNotes('');
    setStockSymbol('');
    setStockQty('');
    setStockPrice('');
    setCustomCategoryName('');
    setIsCustomCategory(false);
    setType('EXPENSE');
  };

  const getTypeColor = (t: TransactionType) => {
    if (t === 'INCOME') return 'bg-green-100 text-green-800 border-green-200';
    if (t === 'EXPENSE') return 'bg-red-100 text-red-800 border-red-200';
    if (t === 'TRANSFER') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-colors";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1";
  const selectedStock = stocks.find(s => s.symbol === stockSymbol);
  
  // Find selected account names for display
  const sourceAccount = accounts.find(a => a.id === sourceAccountId);

  const renderAccountSelect = (val: string, setVal: (v: string) => void, label: string) => (
    <select 
      value={val}
      onChange={e => setVal(e.target.value)}
      className={inputClass}
    >
      <option value="" disabled>Select {label}</option>
      {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type}) - ${a.balance.toLocaleString()}</option>)}
    </select>
  );

  const renderCategorySelect = () => (
    <>
      {isCustomCategory ? (
        <div className="space-y-2">
          <div className="relative">
            <input 
                type="text" 
                value={customCategoryName} 
                onChange={e => setCustomCategoryName(e.target.value)} 
                className={`${inputClass} pr-20`}
                placeholder={`e.g. ${type === 'INCOME' ? 'Client / Side Job' : 'Merchant / Purpose'}`}
                autoFocus={isCustomCategory && !initialData}
            />
            <button 
              onClick={() => { setIsCustomCategory(false); setCustomCategoryName(''); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="text-[10px] text-gray-400 ml-1">
            Specify the {type === 'INCOME' ? 'source' : 'destination'} of funds.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
          {PREDEFINED_CATEGORIES.filter(c => c.type === type).map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                categoryId === c.id 
                  ? 'bg-white text-brand-700 shadow-sm ring-1 ring-brand-200' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {c.name}
            </button>
          ))}
          <button
            onClick={() => setIsCustomCategory(true)}
            className="px-3 py-2 rounded-lg text-xs font-bold text-brand-600 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-all flex items-center"
          >
            + Custom
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full sm:w-[480px] rounded-t-2xl sm:rounded-2xl p-6 h-[90vh] sm:h-auto overflow-y-auto flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">New Transaction</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"><X size={20} /></button>
        </div>

        {/* Type Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
          {(['EXPENSE', 'INCOME', 'TRANSFER', 'STOCK_BUY', 'STOCK_SELL'] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t);
                setStockSymbol('');
                if (t !== 'INCOME' && t !== 'EXPENSE') setIsCustomCategory(false);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border-2 transition-all ${
                type === t ? getTypeColor(t) : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="space-y-6 flex-1">
          {/* VALUE SECTION */}
          {type.includes('STOCK') ? (
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
               <div>
                 <label className={labelClass}>Stock Symbol</label>
                 {type === 'STOCK_SELL' ? (
                   <div className="relative">
                     {stocks.length === 0 ? (
                       <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                         No stocks available to sell.
                       </div>
                     ) : (
                       <select 
                         value={stockSymbol} 
                         onChange={e => setStockSymbol(e.target.value)} 
                         className={`${inputClass} font-bold uppercase`}
                       >
                         <option value="" disabled>Select Stock to Sell</option>
                         {stocks.map(s => (
                           <option key={s.id} value={s.symbol}>
                             {s.symbol} ({s.quantity} shares owned)
                           </option>
                         ))}
                       </select>
                     )}
                   </div>
                 ) : (
                   <input 
                     type="text" 
                     value={stockSymbol} 
                     onChange={e => setStockSymbol(e.target.value)} 
                     placeholder="e.g. AAPL" 
                     className={`${inputClass} font-bold uppercase`}
                   />
                 )}
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className={labelClass}>Quantity</label>
                     <input 
                       type="number" 
                       value={stockQty} 
                       onChange={e => setStockQty(e.target.value)} 
                       placeholder="0" 
                       className={inputClass}
                       max={type === 'STOCK_SELL' ? selectedStock?.quantity : undefined}
                     />
                     {type === 'STOCK_SELL' && selectedStock && (
                       <p className="text-[10px] text-gray-400 mt-1 ml-1">Max: {selectedStock.quantity}</p>
                     )}
                  </div>
                  <div>
                     <label className={labelClass}>Price per share</label>
                     <input 
                       type="number" 
                       value={stockPrice} 
                       onChange={e => setStockPrice(e.target.value)} 
                       placeholder="0.00" 
                       className={inputClass}
                     />
                  </div>
               </div>

               {/* CALCULATED TOTAL CARD */}
               <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm space-y-2">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Calculator size={16}/>
                        <span className="text-xs font-bold uppercase">Total Cost</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                        ${((parseFloat(stockQty) || 0) * (parseFloat(stockPrice) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                 </div>
                 {type === 'STOCK_BUY' && sourceAccount && (
                    <div className="flex items-center gap-1.5 text-xs text-brand-600 font-medium bg-brand-50 p-2 rounded">
                        <Wallet size={12}/>
                        <span>Deducting from: <b>{sourceAccount.name}</b></span>
                    </div>
                 )}
               </div>
             </div>
          ) : (
            <div>
              <label className={labelClass}>Amount</label>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center focus-within:ring-2 focus-within:ring-brand-500 focus-within:bg-white transition-colors">
                <span className="text-3xl font-light text-gray-400 mr-2">$</span>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  className="w-full bg-transparent text-4xl font-bold text-gray-900 outline-none placeholder-gray-300"
                  placeholder="0.00"
                  autoFocus={!initialData}
                />
              </div>
            </div>
          )}

          {/* FLOW SECTION (Source -> Dest) */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-0.5 h-16 bg-gray-200 hidden sm:block"></div>
            
            <div className="space-y-4">
              {/* SOURCE */}
              <div>
                <label className={`${labelClass} text-red-500 flex items-center gap-1`}>
                   FROM (Source)
                </label>
                {type === 'INCOME' ? renderCategorySelect() : 
                 type === 'STOCK_SELL' ? (
                   <div className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium flex justify-between items-center">
                     <span>Stock Portfolio</span>
                     <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold uppercase">{stockSymbol || 'Select Symbol'}</span>
                   </div>
                 ) :
                 renderAccountSelect(sourceAccountId, setSourceAccountId, type === 'STOCK_BUY' ? 'Funding Account' : 'From Account')
                }
              </div>

              {/* Arrow Indicator */}
              <div className="flex justify-center">
                 <div className="bg-white border border-gray-200 rounded-full p-1 text-gray-400">
                   <ArrowDown size={14} />
                 </div>
              </div>

              {/* DESTINATION */}
              <div>
                <label className={`${labelClass} text-green-600 flex items-center gap-1`}>
                   TO (Destination)
                </label>
                {type === 'EXPENSE' ? renderCategorySelect() : 
                 type === 'STOCK_BUY' ? (
                   <div className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium flex justify-between items-center">
                     <span>Stock Portfolio</span>
                     <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold uppercase">{stockSymbol || 'Enter Symbol'}</span>
                   </div>
                 ) :
                 renderAccountSelect(destAccountId, setDestAccountId, 'To Account')
                }
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className={labelClass}>Date</label>
               <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
               <label className={labelClass}>Notes (Optional)</label>
               <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} placeholder="Details..." />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full mt-6 bg-brand-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-700 active:scale-[0.98] transition-all shadow-md shadow-brand-200"
        >
          <Check size={20} /> Save Transaction
        </button>
      </div>
    </div>
  );
};

export default AddTransactionModal;