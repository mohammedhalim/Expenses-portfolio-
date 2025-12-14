import React, { useState, useEffect } from 'react';
import { Account, AccountType } from '../types';
import { Wallet, Landmark, Banknote, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { generateId } from '../services/storageService';

interface AccountsProps {
  accounts: Account[];
  onAddAccount: (account: Account) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
}

const Accounts: React.FC<AccountsProps> = ({ accounts, onAddAccount, onEditAccount, onDeleteAccount }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<AccountType>('BANK');
  const [newAccBalance, setNewAccBalance] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setNewAccName('');
    setNewAccType('BANK');
    setNewAccBalance('');
    setIsModalOpen(true);
  };

  const openEditModal = (acc: Account) => {
    setEditingId(acc.id);
    setNewAccName(acc.name);
    setNewAccType(acc.type);
    setNewAccBalance(acc.balance.toString());
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!newAccName || !newAccBalance) return;
    
    if (editingId) {
      const updatedAccount: Account = {
        id: editingId,
        name: newAccName,
        type: newAccType,
        balance: parseFloat(newAccBalance),
        color: 'bg-gray-500' 
      };
      onEditAccount(updatedAccount);
    } else {
      const account: Account = {
        id: generateId(),
        name: newAccName,
        type: newAccType,
        balance: parseFloat(newAccBalance),
        color: 'bg-gray-500' 
      };
      onAddAccount(account);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setNewAccName('');
    setNewAccBalance('');
  };

  const getIcon = (type: AccountType) => {
    switch(type) {
      case 'BANK': return <Landmark className="text-blue-500" />;
      case 'CASH': return <Banknote className="text-green-500" />;
      case 'WALLET': return <Wallet className="text-purple-500" />;
      default: return <Wallet className="text-gray-500" />;
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none text-gray-900 placeholder-gray-400 transition-colors";
  const labelClass = "block text-sm font-bold text-gray-600 mb-1.5 ml-1";

  return (
    <div className="p-5">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Accounts</h1>
        <button onClick={openAddModal} className="text-brand-600 font-semibold text-sm flex items-center bg-brand-50 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors">
          <Plus size={16} className="mr-1" /> New Slot
        </button>
      </header>

      <div className="space-y-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                {getIcon(acc.type)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{acc.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{acc.type.replace('_', ' ').toLowerCase()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 text-lg">${acc.balance.toLocaleString()}</p>
              <div className="flex justify-end gap-3 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(acc)} 
                  className="text-gray-400 hover:text-brand-600 transition-colors"
                  aria-label="Edit account"
                >
                  <Pencil size={14} />
                </button>
                <button 
                  onClick={() => onDeleteAccount(acc.id)} 
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Delete account"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {accounts.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400 mb-2">No slots defined.</p>
            <button onClick={openAddModal} className="text-brand-600 font-bold text-sm">Create your first account</button>
          </div>
        )}
      </div>

      {/* Add/Edit Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Account' : 'New Account'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Slot Name</label>
                <input 
                  type="text" 
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Chase Bank, Safety Box"
                />
              </div>

              <div>
                <label className={labelClass}>Type</label>
                <select 
                  value={newAccType}
                  onChange={e => setNewAccType(e.target.value as AccountType)}
                  className={inputClass}
                >
                  <option value="BANK">Bank Account</option>
                  <option value="WALLET">E-Wallet</option>
                  <option value="CASH">Physical Cash</option>
                  <option value="STOCK_FUND">Stock Fund</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">
                  Categorizes where the money is stored.
                </p>
              </div>

              <div>
                <label className={labelClass}>{editingId ? 'Current Balance' : 'Initial Balance'}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input 
                    type="number" 
                    value={newAccBalance}
                    onChange={e => setNewAccBalance(e.target.value)}
                    className={`${inputClass} pl-7`}
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">
                  How much money is in this slot right now?
                </p>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl mt-4 hover:bg-brand-700 active:scale-[0.98] transition-all shadow-md shadow-brand-200"
              >
                {editingId ? 'Update Slot' : 'Create Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;