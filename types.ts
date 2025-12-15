export type AccountType = 'BANK' | 'WALLET' | 'CASH' | 'PORTFOLIO' | 'STOCK_PORTFOLIO';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'STOCK_BUY' | 'STOCK_SELL';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color?: string;
}

export interface StockHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO String
  categoryId?: string; // e.g. "Food", "Transport"
  categoryName?: string; // Custom category name
  notes?: string;
  
  // Relations
  sourceAccountId?: string; // For Expense, Transfer, Stock Buy
  destinationAccountId?: string; // For Income, Transfer, Stock Sell
  
  // Stock Specifics
  stockSymbol?: string;
  stockQuantity?: number;
  stockPrice?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'INCOME' | 'EXPENSE';
}

export const PREDEFINED_CATEGORIES: Category[] = [
  { id: 'cat_salary', name: 'Salary', icon: 'briefcase', type: 'INCOME' },
  { id: 'cat_freelance', name: 'Freelance', icon: 'laptop', type: 'INCOME' },
  { id: 'cat_food', name: 'Food & Dining', icon: 'utensils', type: 'EXPENSE' },
  { id: 'cat_transport', name: 'Transport', icon: 'car', type: 'EXPENSE' },
  { id: 'cat_shopping', name: 'Shopping', icon: 'shopping-bag', type: 'EXPENSE' },
  { id: 'cat_bills', name: 'Bills & Utilities', icon: 'file-text', type: 'EXPENSE' },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'film', type: 'EXPENSE' },
  { id: 'cat_health', name: 'Health', icon: 'heart', type: 'EXPENSE' },
];