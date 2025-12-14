import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { X, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { Account, PREDEFINED_CATEGORIES, Transaction } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsed: (data: Partial<Transaction>) => void;
  accounts: Account[];
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, onParsed, accounts }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleProcess = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemPrompt = `
        You are a financial data entry assistant.
        Your task is to parse the user's natural language input into a JSON object representing a financial transaction.
        
        Current Context:
        - Date: ${new Date().toISOString()}
        - Accounts: ${JSON.stringify(accounts.map(a => ({ id: a.id, name: a.name })))}
        - Categories: ${JSON.stringify(PREDEFINED_CATEGORIES.map(c => ({ id: c.id, name: c.name })))}

        Output Rules:
        - Return ONLY a JSON object. No Markdown formatting.
        - Fields: type (INCOME, EXPENSE, TRANSFER, STOCK_BUY, STOCK_SELL), amount, date, notes, sourceAccountId, destinationAccountId, categoryId, categoryName, stockSymbol, stockQuantity, stockPrice.
        - Infer 'sourceAccountId' and 'destinationAccountId' based on the transaction type and account names provided. 
          - For EXPENSE: Source is Account, Dest is Category.
          - For INCOME: Source is Category, Dest is Account.
          - For TRANSFER: Source is Account, Dest is Account.
        - If an account is mentioned by name, try to match it to an ID. If fuzzy match fails, leave ID blank.
        - If a category matches, use categoryId. If not, use categoryName for a custom category.
      `;

      let modelName = 'gemini-2.5-flash-lite'; // Fast model for standard tasks
      let config: any = {
        responseMimeType: 'application/json',
      };

      if (useThinking) {
        modelName = 'gemini-3-pro-preview'; // Powerful model for reasoning
        config = {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 32768 } // Max thinking budget
        };
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: input,
        config: {
            ...config,
            systemInstruction: systemPrompt
        },
      });

      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        onParsed(data);
        onClose();
        setInput('');
      } else {
        throw new Error("No data returned");
      }
    } catch (err) {
      console.error(err);
      setError('Failed to process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"><X size={20} /></button>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <Sparkles size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Describe your transaction naturally (e.g., "Paid $50 for Groceries from Debit Card").
        </p>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] text-gray-900 placeholder-gray-400 mb-4 resize-none"
          placeholder="Type here..."
        />
        
        <div className="flex items-center gap-2 mb-6">
            <input 
                type="checkbox" 
                id="thinking" 
                checked={useThinking} 
                onChange={e => setUseThinking(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
            />
            <label htmlFor="thinking" className="text-sm text-gray-600 flex items-center gap-1 cursor-pointer select-none">
                <BrainCircuit size={14} /> Deep Thinking (for complex requests)
            </label>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button 
          onClick={handleProcess}
          disabled={loading || !input.trim()}
          className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <><Sparkles size={18} /> Auto-Fill Transaction</>}
        </button>
      </div>
    </div>
  );
};

export default AIAssistantModal;