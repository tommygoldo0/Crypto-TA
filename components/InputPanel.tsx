import React, { useState, useCallback, useEffect } from 'react';

interface InputPanelProps {
  onAnalyze: (cryptoName: string, ticker: string, timeframe: string, livePrice: string | null) => void;
  isLoading: boolean;
}

const CRYPTOS = [
    { name: 'Bitcoin (BTC)', ticker: 'BTCUSDT' },
    { name: 'Ethereum (ETH)', ticker: 'ETHUSDT' },
    { name: 'Solana (SOL)', ticker: 'SOLUSDT' },
    { name: 'Dogecoin (DOGE)', ticker: 'DOGEUSDT' },
    { name: 'XRP (XRP)', ticker: 'XRPUSDT' },
];

const TRADING_STYLES = [
    { label: 'Scalp (5-30 Minutes)', value: '30 Minutes' },
    { label: 'Intraday (1-4 Hours)', value: '4 Hours' },
    { label: 'Swing (1-3 Days)', value: '3Days' },
    { label: 'Position (1 Week+)', value: '1 Week' },
];

const InputPanel: React.FC<InputPanelProps> = ({ onAnalyze, isLoading }) => {
  const [selectedTicker, setSelectedTicker] = useState(CRYPTOS[0].ticker);
  const [timeframe, setTimeframe] = useState(TRADING_STYLES[1].value); // Default to Intraday
  const [livePrice, setLivePrice] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<'up' | 'down' | 'none'>('none');

  useEffect(() => {
    setLivePrice(null);
    setPriceChange('none');

    if (!selectedTicker) return;

    const wsSymbol = selectedTicker.toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@trade`);

    ws.onopen = () => {
      console.log(`WebSocket connected for ${selectedTicker}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.p) {
          const newPrice = parseFloat(data.p);
          setLivePrice(prevPriceStr => {
            if (prevPriceStr) {
              const prevPrice = parseFloat(prevPriceStr);
              if (newPrice > prevPrice) {
                setPriceChange('up');
              } else if (newPrice < prevPrice) {
                setPriceChange('down');
              }
              // If price is the same, keep the last change direction
            }
            return newPrice.toFixed(2);
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setLivePrice('Error');
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected for ${selectedTicker}`);
    };

    // Cleanup function to close the WebSocket connection
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [selectedTicker]);


  const handleSubmit = useCallback(() => {
    const selectedCrypto = CRYPTOS.find(c => c.ticker === selectedTicker);
    if (selectedCrypto) {
        onAnalyze(selectedCrypto.name, selectedCrypto.ticker, timeframe, livePrice);
    }
  }, [onAnalyze, selectedTicker, timeframe, livePrice]);

  const selectStyles = "w-full bg-gray-700 border border-gray-600 text-white text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 transition-colors";

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col h-full justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-white">Live Market Analysis</h2>
        <p className="text-gray-400 mt-2 text-base">
          Select a cryptocurrency and a trading style, then click the button to get a real-time analysis of its current market conditions. The assistant will use live price data and recent news to generate a trading view.
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <label htmlFor="crypto-select" className="block mb-2 text-base font-medium text-gray-300">Cryptocurrency</label>
            <select 
              id="crypto-select" 
              value={selectedTicker} 
              onChange={(e) => setSelectedTicker(e.target.value)} 
              className={selectStyles} 
              disabled={isLoading}
              aria-label="Select Cryptocurrency"
            >
              {CRYPTOS.map(c => <option key={c.ticker} value={c.ticker}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="timeframe-select" className="block mb-2 text-base font-medium text-gray-300">Trading Style / Horizon</label>
            <select 
              id="timeframe-select" 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)} 
              className={selectStyles} 
              disabled={isLoading}
              aria-label="Select Trading Style"
            >
              {TRADING_STYLES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-center">
            <label className="block text-base font-medium text-gray-400">Live Price ({selectedTicker})</label>
            <div className="text-4xl font-mono font-bold my-2 h-10 flex items-center justify-center">
            {livePrice ? (
                <span className={`transition-colors duration-200 ${
                priceChange === 'up' ? 'text-green-400' :
                priceChange === 'down' ? 'text-red-400' :
                'text-white'
                }`}>
                ${parseFloat(livePrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            ) : (
                <span className="text-gray-500 animate-pulse text-2xl">Connecting...</span>
            )}
            </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !livePrice}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center transition-colors text-xl"
        >
          {isLoading && <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
          {isLoading ? 'Analyzing...' : 'Analyze Live Market'}
        </button>
      </div>
    </div>
  );
};

export default InputPanel;