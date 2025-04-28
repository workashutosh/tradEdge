import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
// import { load } from 'react-native-cheerio';c

const indices = [
  { ticker: 'NIFTY_50', exchange: 'INDEXNSE' },
  { ticker: 'SENSEX', exchange: 'INDEXBOM' },
  { ticker: 'NIFTY_BANK', exchange: 'INDEXNSE' },
  { ticker: 'NIFTY_IT', exchange: 'INDEXNSE' },
  { ticker: 'BSE-SMLCAP', exchange: 'INDEXBOM' },
  { ticker: 'NIFTY_MIDCAP_100', exchange: 'INDEXNSE' },
  { ticker: 'NIFTY_SMLCAP_100', exchange: 'INDEXNSE' },
  { ticker: 'NIFTY_100', exchange: 'INDEXNSE' },
  { ticker: 'NIFTY_200', exchange: 'INDEXNSE' },
  { ticker: 'NIFTY_500', exchange: 'INDEXNSE' },
  { ticker: 'NIFTY_AUTO', exchange: 'INDEXNSE' },
  { ticker: 'NIFTY_PHARMA', exchange: 'INDEXNSE' },
  { ticker: 'NIFTY_FMCG', exchange: 'INDEXNSE' },
  { ticker: 'NIFTY_METAL', exchange: 'INDEXNSE' },
  { ticker: 'NIFTY_ENERGY', exchange: 'INDEXNSE' },
  { ticker: 'NIFTY_INFRA', exchange: 'INDEXNSE' },
];

const Ticker = () => {
  const [ticker, setTicker] = useState<
    { name: string; price: number | null; change: string; percent_change: number | null; point_change: number | null }[]
  >([]);

interface IndexData {
    name: string;
    price: number | null;
    change: string;
    percent_change: number | null;
    point_change: number | null;
}

interface Index {
    ticker: string;
    exchange: string;
}

const scrapeIndexData = async (ticker: string, exchange: string): Promise<IndexData | null> => {
    const url = `https://www.google.com/finance/quote/${ticker}:${exchange}`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            },
        });

        const $ = load(response.data);

        // Extract the name (class 'zzDege')
        const name = $('.zzDege').text() || ticker;

        // Extract the price (class 'YMlKec fxKbKc')
        const priceStr = $('.YMlKec.fxKbKc').text() || 'N/A';
        const priceNum = priceStr !== 'N/A' ? parseFloat(priceStr.replace(/,/g, '')) : null;

        // Extract the change (percentage and points, class 'T7Akdb')
        const changeContainer = $('.T7Akdb');
        let changeStr = 'N/A';
        let percentChangeNum = null;
        let pointChangeNum = null;

        if (changeContainer.length) {
            const percentChange = changeContainer.find('.JwB6zf').text();
            const pointChange = changeContainer.find('.P2Luy').text();
            changeStr = `${percentChange} (${pointChange})`;
            percentChangeNum = percentChange ? parseFloat(percentChange.replace('%', '')) : null;
            pointChangeNum = pointChange ? parseFloat(pointChange.replace(/,/g, '')) : null;
        }

        return {
            name,
            price: priceNum,
            change: changeStr,
            percent_change: percentChangeNum,
            point_change: pointChangeNum,
        };
    } catch (error) {
        if (error instanceof Error) {
            console.log(`Error scraping ${ticker}:`, error.message);
        } else {
            console.log(`Error scraping ${ticker}:`, error);
        }
        return null;
    }
};

  const fetchData = async () => {
    const newTicker = [];
    for (const index of indices) {
      const data = await scrapeIndexData(index.ticker, index.exchange);
      if (data) {
        newTicker.push(data);
      }
    }
    setTicker(newTicker);
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 15000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const renderItem = ({ item }: { item: IndexData }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>Price: {item.price !== null ? item.price.toFixed(2) : 'N/A'}</Text>
      <Text style={styles.change}>Change: {item.change}</Text>
      <Text style={styles.change}>
        Percent Change: {item.percent_change !== null ? item.percent_change.toFixed(2) : 'N/A'}%
      </Text>
      <Text style={styles.change}>
        Point Change: {item.point_change !== null ? item.point_change.toFixed(2) : 'N/A'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nifty Indices Data</Text>
      <FlatList
        data={ticker}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        ListEmptyComponent={<Text>Loading...</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: '#333',
  },
  change: {
    fontSize: 14,
    color: '#666',
  },
});

export default Ticker;