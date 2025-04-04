import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface ServiceItem {
  title: string;
  price: string;
  details: string[];
  categoryTag: string;
  icon: string;
  riskCategory: string;
  minimumInvestment: string;
}

interface StockContextType {
  NSEData: StockData[];
  BSEData: StockData[];
  marketIndices: MarketIndicesData[];
  services: ServiceItem[];
  loading: boolean;
  error: string | null;
  updateNSEData: (data: StockData[]) => void;
  updateBSEData: (data: StockData[]) => void;
  updateMarketIndices: (data: MarketIndicesData[]) => void;
  getNSEBSEStocks: (stock: 'NSE' | 'BSE') => Promise<void>;
  fetchAllData: () => Promise<void>;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [NSEData, setNSEData] = useState<StockData[]>([]);
  const [BSEData, setBSEData] = useState<StockData[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndicesData[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stocks = ["nifty 200", "nifty 50", "nifty auto", "nifty bank", "sensex", "nifty infra", "nifty it", "nifty metal", "nifty pharma", "nifty psu bank"];

  const updateNSEData = (data: StockData[]) => setNSEData(data);
  const updateBSEData = (data: StockData[]) => setBSEData(data);
  const updateMarketIndices = (data: MarketIndicesData[]) => setMarketIndices(data);

  // const getRandomRiskCategory = () => {
  //   const randomTags = ['Low', 'Moderate', 'High'];
  //   const shuffled = randomTags.sort(() => 0.5 - Math.random());
  //   return shuffled.slice(0, 1);
  // };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Equity': return 'trending-up';
      case 'Stock Option': return 'tune';
      case 'Stock Future': return 'bar-chart';
      case 'Index Option': return 'tune';
      case 'Index Future': return 'bar-chart';
      case 'Swing Trading': return 'trending-up';
      case 'TWM Package (All In One)': return 'star';
      case 'MCX Commodities': return 'diamond';
      case 'Forex': return 'currency-exchange';
      case 'International Club Commodities': return 'public';
      default: return 'info';
    }
  };

  const getNSEBSEStocks = async (stock: 'NSE' | 'BSE') => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://indian-stock-exchange-api2.p.rapidapi.com/${stock}_most_active`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': process.env.EXPO_PUBLIC_RAPID_API_KEY || '',
            'x-rapidapi-host': process.env.EXPO_PUBLIC_RAPID_API_HOST || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log(`${stock} Data:`, data); // Debug log
      if (data.error) {
        throw new Error(`Error fetching ${stock} most active stocks: ${data.error}`);
      } else {
        const formattedData: StockData[] = data.map((stock: any) => ({
          ticker: stock.ticker,
          price: stock.price,
          netChange: stock.net_change,
          percentChange: stock.percent_change,
          high: stock.high,
          low: stock.low,
        }));
        if (stock === "NSE") updateNSEData(formattedData);
        if (stock === "BSE") updateBSEData(formattedData);
      }
    } catch (err) {
      // console.error(`Failed to fetch ${stock} data:`, err);
      setError(`Failed to fetch ${stock} data`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketIndices = async () => {
    try {
      setLoading(true);
      setError(null);
      const results: MarketIndicesData[] = [];
      for (const st of stocks) {
        const response = await fetch(`https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=${st}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': process.env.EXPO_PUBLIC_RAPID_API_KEY || '',
            'x-rapidapi-host': process.env.EXPO_PUBLIC_RAPID_API_HOST || '',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
          console.error(`Stock not found: ${st}`);
          continue;
        }

        const stockData: MarketIndicesData = {
          ticker: st.toUpperCase(),
          percentChange: data.percentChange,
        };
        results.push(stockData);
      }
      setMarketIndices(results);
    } catch (error) {
      console.error('Error fetching market indices:', error);
      setError('Failed to fetch market indices');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('access_token');
      const response = await fetch('https://gateway.twmresearchalert.com/package', {
        headers: {
          Authorization: token || '',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Assuming the API returns an array of package objects directly (no 'status' or 'data' wrapper)
      const transformedServices: ServiceItem[] = data.data.flatMap((type: any) => {
        const items =
          type.subtypes.length > 0
            ? type.subtypes
            : [
                {
                  subtype_name: type.type_name,
                  price: type.price,
                  details: type.details || [],
                  minimumInvestment: type.minimumInvestment,
                  riskCategory: type.riskCategory,
                },
              ];

        return items.map((item: {
          subtype_name: string;
          price: number | null;
          details: string[];
          minimumInvestment: string;
          riskCategory: string;
        }) => ({
          title: item.subtype_name,
          price: item.price ? item.price : 'Contact for pricing',
          details: (item.details || ['Details not available']).map(detail => detail.replace(/\?/g, '₹')),
          categoryTag: type.type_name,
          icon: getIconForCategory(type.type_name),
          riskCategory: (item.riskCategory || 'N/A').replace(/^\w/, c => c.toUpperCase()),
          minimumInvestment: item.minimumInvestment || 'N/A', // Use provided minimumInvestment or default
        }));
      });
      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        // getNSEBSEStocks('NSE'),
        // getNSEBSEStocks('BSE'),
        // fetchMarketIndices(), // Uncomment if needed
        fetchServices(),
      ]);
    } catch (error) {
      console.error('Error fetching all data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <StockContext.Provider value={{ 
      NSEData, 
      BSEData, 
      marketIndices, 
      services, 
      loading, 
      error,
      updateNSEData, 
      updateBSEData, 
      updateMarketIndices,
      getNSEBSEStocks,
      fetchAllData
    }}>
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