import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Accounts from './components/Accounts';
import Transactions from './components/Transactions';
import Stocks from './components/Stocks';
import AddTransactionModal from './components/AddTransactionModal';
import AIAssistantModal from './components/AIAssistantModal';
import { StorageService, generateId } from './services/storageService';
import { Account, StockHolding, Transaction } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPreFilledData, setAiPreFilledData] = useState<Partial<Transaction> | null>(null);
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stocks, setStocks] = useState<StockHolding[]>([]);

  // Initial Data Load
  useEffect(() => {
    StorageService.seedData();
    setAccounts(StorageService.getAccounts());
    setTransactions(StorageService.getTransactions());
    setStocks(StorageService.getStocks());
  }, []);

  // Handlers
  const handleAddAccount = (newAccount: Account) => {
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    StorageService.saveAccounts(updated);
  };

  const handleEditAccount = (updatedAccount: Account) => {
    const updated = accounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc);
    setAccounts(updated);
    StorageService.saveAccounts(updated);
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm("Are you sure you want to delete this account? Transactions related to it will remain but may have missing references.")) {
      const updated = accounts.filter(acc => acc.id !== id);
      setAccounts(updated);
      StorageService.saveAccounts(updated);
    }
  };

  const handleUpdateStockPrice = (id: string, newPrice: number) => {
    const updated = stocks.map(s => s.id === id ? { ...s, currentPrice: newPrice } : s);
    setStocks(updated);
    StorageService.saveStocks(updated);
  };

  const handleAddTransaction = (txn: Transaction) => {
    // 1. Save Transaction
    const updatedTxns = [...transactions, txn];
    setTransactions(updatedTxns);
    StorageService.saveTransactions(updatedTxns);

    // 2. Update Account Balances
    const updatedAccounts = accounts.map(acc => {
      let newBalance = acc.balance;
      
      // If money leaves this account
      if (txn.sourceAccountId === acc.id) {
         newBalance -= txn.amount;
      }
      
      // If money enters this account
      if (txn.destinationAccountId === acc.id) {
         // For Stock Sell, txn.amount is the total proceeds
         newBalance += txn.amount; 
      }
      
      return { ...acc, balance: newBalance };
    });
    setAccounts(updatedAccounts);
    StorageService.saveAccounts(updatedAccounts);

    // 3. Update Stocks (if applicable)
    if (txn.type === 'STOCK_BUY') {
      const existingStock = stocks.find(s => s.symbol === txn.stockSymbol);
      let updatedStocks;
      
      if (existingStock) {
        // Calculate new weighted average price
        const totalCost = (existingStock.quantity * existingStock.averageBuyPrice) + txn.amount;
        const totalQty = existingStock.quantity + (txn.stockQuantity || 0);
        
        updatedStocks = stocks.map(s => s.symbol === txn.stockSymbol ? {
          ...s,
          quantity: totalQty,
          averageBuyPrice: totalCost / totalQty,
          currentPrice: txn.stockPrice || s.currentPrice
        } : s);
      } else {
        // New Stock
        const newStock: StockHolding = {
          id: generateId(),
          symbol: txn.stockSymbol!,
          name: txn.stockSymbol!,
          quantity: txn.stockQuantity!,
          averageBuyPrice: txn.stockPrice!,
          currentPrice: txn.stockPrice!
        };
        updatedStocks = [...stocks, newStock];
      }
      setStocks(updatedStocks);
      StorageService.saveStocks(updatedStocks);
    } 
    else if (txn.type === 'STOCK_SELL') {
      const updatedStocks = stocks.map(s => {
        if (s.symbol === txn.stockSymbol) {
          const remaining = s.quantity - (txn.stockQuantity || 0);
          return remaining > 0 ? { ...s, quantity: remaining } : null; // Remove if 0? Or keep with 0? Let's remove for simplicity if 0
        }
        return s;
      }).filter(Boolean) as StockHolding[];
      
      setStocks(updatedStocks);
      StorageService.saveStocks(updatedStocks);
    }
    
    // Clear AI Data
    setAiPreFilledData(null);
  };

  const handleAIParse = (data: Partial<Transaction>) => {
    setAiPreFilledData(data);
    setIsAddModalOpen(true);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard accounts={accounts} transactions={transactions} stocks={stocks} />;
      case 'accounts': return <Accounts accounts={accounts} onAddAccount={handleAddAccount} onEditAccount={handleEditAccount} onDeleteAccount={handleDeleteAccount} />;
      case 'transactions': return <Transactions transactions={transactions} accounts={accounts} />;
      case 'stocks': return <Stocks stocks={stocks} onUpdatePrice={handleUpdateStockPrice} />;
      default: return <Dashboard accounts={accounts} transactions={transactions} stocks={stocks} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onAddClick={() => { setAiPreFilledData(null); setIsAddModalOpen(true); }}
      onAIClick={() => setIsAIModalOpen(true)}
    >
      {renderContent()}
      
      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        accounts={accounts}
        stocks={stocks}
        onSave={handleAddTransaction}
        initialData={aiPreFilledData}
      />

      <AIAssistantModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onParsed={handleAIParse}
        accounts={accounts}
      />
    </Layout>
  );
};

export default App;