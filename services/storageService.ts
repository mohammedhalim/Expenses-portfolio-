import { Account, StockHolding, Transaction } from '../types';

const KEYS = {
  ACCOUNTS: 'pf_accounts',
  TRANSACTIONS: 'pf_transactions',
  STOCKS: 'pf_stocks',
  DASHBOARD_START: 'pf_dashboard_start',
};

// Helper for simple ID generation
export const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export const StorageService = {
  getAccounts: (): Account[] => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.ACCOUNTS) || '[]');
    } catch { return []; }
  },

  saveAccounts: (accounts: Account[]) => {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  getTransactions: (): Transaction[] => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    } catch { return []; }
  },

  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getStocks: (): StockHolding[] => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.STOCKS) || '[]');
    } catch { return []; }
  },

  saveStocks: (stocks: StockHolding[]) => {
    localStorage.setItem(KEYS.STOCKS, JSON.stringify(stocks));
  },

  // Dashboard Reset Logic
  getDashboardStart: (): string => {
    // Default to beginning of the current month if not set
    const defaultStart = new Date();
    defaultStart.setDate(1);
    defaultStart.setHours(0, 0, 0, 0);
    return localStorage.getItem(KEYS.DASHBOARD_START) || defaultStart.toISOString();
  },

  saveDashboardStart: (isoDate: string) => {
    localStorage.setItem(KEYS.DASHBOARD_START, isoDate);
  },
  
  // Seed initial data if empty
  seedData: () => {
    if (!localStorage.getItem(KEYS.ACCOUNTS)) {
      const initialAccounts: Account[] = [
        { id: 'acc_1', name: 'Main Bank', type: 'BANK', balance: 2500, color: 'bg-blue-500' },
        { id: 'acc_2', name: 'Cash Wallet', type: 'CASH', balance: 150, color: 'bg-green-500' },
      ];
      localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(initialAccounts));
    }
  }
};