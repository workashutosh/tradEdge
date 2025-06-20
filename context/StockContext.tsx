import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/context/UserContext';

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

interface Package {
  type_id: string;
  type_name: string;
  package_id: string;
  title: string;
  price: string;
  details: string[];
  categoryTag: string;
  icon: string;
  riskCategory: string;
  minimumInvestment: string;
  profitPotential: string;
}

interface StockContextType {
  NSEData: StockData[];
  BSEData: StockData[];
  marketIndices: MarketIndicesData[];
  packages: Package[];
  loading: boolean;
  error: string | null;
  updateNSEData: (data: StockData[]) => void;
  updateBSEData: (data: StockData[]) => void;
  updateMarketIndices: (data: MarketIndicesData[]) => void;
  getNSEBSEStocks: (stock: 'NSE' | 'BSE') => Promise<void>;
  fetchAllData: (forceRefresh?: boolean) => Promise<void>;
  fetchPackages: (forceRefresh?: boolean) => Promise<void>;
  lastFetchTime: number;
  optionTabIndex: number;
  setOptionTabIndex: (index: number) => void;
  packageCategories: string[];
}


const StockContext = createContext<StockContextType | undefined>(undefined);


export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [NSEData, setNSEData] = useState<StockData[]>([]);
  const [BSEData, setBSEData] = useState<StockData[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndicesData[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [optionTabIndex, setOptionTabIndex] = useState(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  const packageCategories = useMemo(() => {
  const unique = [...new Set(packages.map(pkg => pkg.type_name))];
  return unique;
}, [packages]);


  const stocks = useMemo(() => ["nifty 200", "nifty 50", "nifty auto", "nifty bank", "sensex", "nifty infra", "nifty it", "nifty metal", "nifty pharma", "nifty psu bank"], []);

  const updateNSEData = useCallback((data: StockData[]) => setNSEData(data), []);
  const updateBSEData = useCallback((data: StockData[]) => setBSEData(data), []);
  const updateMarketIndices = useCallback((data: MarketIndicesData[]) => setMarketIndices(data), []);

  const getIconForCategory = useCallback((category: string) => {
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
  }, []);

  

  const getNSEBSEStocks = async (stock: 'NSE' | 'BSE') => {
    // try {
    //   setLoading(true);
    //   setError(null);
    //   const response = await fetch(
    //     `https://indian-stock-exchange-api2.p.rapidapi.com/${stock}_most_active`,
    //     {
    //       method: 'GET',
    //       headers: {
    //         'x-rapidapi-key': process.env.EXPO_PUBLIC_RAPID_API_KEY || '',
    //         'x-rapidapi-host': process.env.EXPO_PUBLIC_RAPID_API_HOST || '',
    //       },
    //     }
    //   );

    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }

    //   const data = await response.json();
    //   // console.log(`${stock} Data:`, data); // Debug log
    //   if (data.error) {
    //     throw new Error(`Error fetching ${stock} most active stocks: ${data.error}`);
    //   } else {
    //     const formattedData: StockData[] = data.map((stock: any) => ({
    //       ticker: stock.ticker,
    //       price: stock.price,
    //       netChange: stock.net_change,
    //       percentChange: stock.percent_change,
    //       high: stock.high,
    //       low: stock.low,
    //     }));
    //     if (stock === "NSE") updateNSEData(formattedData);
    //     if (stock === "BSE") updateBSEData(formattedData);
    //   }
    // } catch (err) {
    //   // console.error(`Failed to fetch ${stock} data:`, err);
    //   setError(`Failed to fetch ${stock} data`);
    // } finally {
    //   setLoading(false);
    // }
    const url = 'https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=sensex';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '7670ef5b00msh61aa95da79995d7p1fae1ajsna99a67851f30',
        'x-rapidapi-host': 'indian-stock-exchange-api2.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      // const result = await response.text();
      const data = await response.json();
      console.log(data.percentChange);
    } catch (error) {
      console.error(error);
    }
  };

  // const fetchMarketIndices = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const results: MarketIndicesData[] = [];
  //     for (const st of stocks) {
  //       const response = await fetch(`https://indian-stock-exchange-api2.p.rapidapi.com/stock?name=${st}`, {
  //         method: 'GET',
  //         headers: {
  //           'x-rapidapi-key': process.env.EXPO_PUBLIC_RAPID_API_KEY || '',
  //           'x-rapidapi-host': process.env.EXPO_PUBLIC_RAPID_API_HOST || '',
  //         },
  //       });

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       if (data.error) {
  //         console.error(`Stock not found: ${st}`);
  //         continue;
  //       }

  //       const stockData: MarketIndicesData = {
  //         ticker: st.toUpperCase(),
  //         percentChange: data.percentChange,
  //       };
  //       results.push(stockData);
  //     }
  //     setMarketIndices(results);
  //   } catch (error) {
  //     console.error('Error fetching market indices:', error);
  //     setError('Failed to fetch market indices');
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  // Optimized package fetching with caching
  const fetchPackages = useCallback(async (forceRefresh = false) => {
    let cachedData = null;
    try {
      setLoading(true);
      setError(null);
      const cacheKey = 'cachedPackages';
      const cacheTimeKey = 'cachedPackagesTime';

      // Check if we should use cached data
      if (!forceRefresh) {
        try {
          const [cachedPackagesString, cachedTimeString] = await Promise.all([
            AsyncStorage.getItem(cacheKey),
            AsyncStorage.getItem(cacheTimeKey)
          ]);

          if (cachedPackagesString && cachedTimeString) {
            const cachedTime = parseInt(cachedTimeString);
            const now = Date.now();
            
            if (now - cachedTime < CACHE_DURATION) {
              cachedData = JSON.parse(cachedPackagesString);
              setPackages(cachedData);
              setLoading(false);
              return; // Use cached data if it's fresh
            }
          }
        } catch (cacheError) {
          console.error('Error loading packages from cache:', cacheError);
        }
      }

      // Fetch fresh data
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token available');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://gateway.twmresearchalert.com/package', {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid package data format received from server');
      }
      
      // Transform data in chunks to avoid blocking the main thread
      const transformedPackages: Package[] = [];
      const chunkSize = 20; // Increased chunk size for better performance
      
      for (let i = 0; i < data.data.length; i += chunkSize) {
        const chunk = data.data.slice(i, i + chunkSize);
        const transformedChunk = chunk.flatMap((type: any) => {
          if (!type.subtypes || !Array.isArray(type.subtypes)) {
            console.warn('Invalid subtype data for type:', type.type_name);
            return [];
          }

          return type.subtypes.map((subtype: any) => ({
            type_id: type.type_id || '',
            type_name: type.type_name || '',
            package_id: subtype.subtype_id || '',
            title: subtype.subtype_name || 'Unnamed Package',
            price: subtype.price?.toString() || 'Contact for pricing',
            details: Array.isArray(subtype.details) 
              ? subtype.details.map((detail: string) => detail.replace(/\?/g, '₹'))
              : ['Details not available'],
            categoryTag: type.type_name || 'Uncategorized',
            icon: getIconForCategory(type.type_name || ''),
            riskCategory: (subtype.riskCategory || 'N/A').replace(/^\w/, (c: string) => c.toUpperCase()),
            minimumInvestment: subtype.minimumInvestment || 'N/A',
            profitPotential: '15-25% p.a.'
          }));
        });
        transformedPackages.push(...transformedChunk);
      }

      // Add refund offer package
      const allPackages = [...transformedPackages, {
        type_id: '10000',
        type_name: 'Offer',
        package_id: '10000',
        title: 'Refund offer',
        price: '10000',
        details: ['Profit Gaurantee', 'Refund if no profit', 'If we fail to generate atleast one profitable trade in 7 days period we will refund the amount.', 'If you engage in self-trading or any other trading activity that is not part of our recommendations, we will not be responsible for providing a refund.', 'If you fail to book or realize any profits generated by our services during the specified period, we will not be responsible for providing a refund.' ],
        categoryTag: 'Custom Category',
        icon: 'star',
        riskCategory: 'Low',
        minimumInvestment: 'N/A',
        profitPotential: '10-20% p.a.',
      }];

      // Update state and cache
      setPackages(allPackages);
      const now = Date.now();
      await Promise.all([
        AsyncStorage.setItem(cacheKey, JSON.stringify(allPackages)),
        AsyncStorage.setItem(cacheTimeKey, now.toString())
      ]);
      setLastFetchTime(now);

    } catch (error) {
      console.error('Error fetching packages:', error);
      if (!cachedData) {
        setError('Failed to fetch packages');
      }
    } finally {
      setLoading(false);
    }
  }, [getIconForCategory]);

  // Optimized fetchAllData
  const fetchAllData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      await fetchPackages(forceRefresh);
    } catch (error) {
      console.error('Error fetching all data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchPackages]);

  // Initial fetch with cache
  useEffect(() => {
    fetchAllData(false);
  }, []);

  const value = useMemo(() => ({
  NSEData,
  BSEData,
  marketIndices,
  packages,
  loading,
  error,
  updateNSEData,
  updateBSEData,
  updateMarketIndices,
  getNSEBSEStocks,
  fetchAllData,
  fetchPackages,
  lastFetchTime,
  optionTabIndex,
  setOptionTabIndex,
  packageCategories,
}), [
  NSEData,
  BSEData,
  marketIndices,
  packages,
  loading,
  error,
  updateNSEData,
  updateBSEData,
  updateMarketIndices,
  fetchAllData,
  fetchPackages,
  lastFetchTime,
  optionTabIndex,
  packageCategories
]);


  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

// Export the context and provider
export const useStockContext = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStockContext must be used within a StockProvider');
  }
  return context;
};