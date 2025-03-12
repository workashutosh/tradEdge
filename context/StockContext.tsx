// context/StockContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface StockData {
  ticker: string;
  price: number;
  netChange: number;
  percentChange: number;
  high: number;
  low: number;
}

interface MarketIndicesData {
  ticker: string;
  percentChange: number;
}

interface StockContextType {
  NSEData: StockData[];
  BSEData: StockData[];
  marketIndices: MarketIndicesData[];
  updateNSEData: (data: StockData[]) => void;
  updateBSEData: (data: StockData[]) => void;
  updateMarketIndices: (data: MarketIndicesData[]) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [NSEData, setNSEData] = useState<StockData[]>([]);
  const [BSEData, setBSEData] = useState<StockData[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndicesData[]>([]);

  const updateNSEData = (data: StockData[]) => setNSEData(data);
  const updateBSEData = (data: StockData[]) => setBSEData(data);
  const updateMarketIndices = (data: MarketIndicesData[]) => setMarketIndices(data);

  return (
    <StockContext.Provider value={{ NSEData, BSEData, marketIndices, updateNSEData, updateBSEData, updateMarketIndices }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStockContext = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStockContext must be used within a StockProvider');
  }
  return context;
};