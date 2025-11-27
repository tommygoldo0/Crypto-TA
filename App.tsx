import React, { useState, useEffect } from 'react';
import InputPanel from './components/InputPanel';
import AnalysisDisplay from './components/AnalysisDisplay';
import ChartDisplay from './components/ChartDisplay';
import { analyzeCryptoMarket } from './services/geminiService';
import type { AnalysisOutput, HistoricalAnalysis } from './types';
import HistoryPanel from './components/HistoryPanel';

// In-component definition for the timeframe selector
interface TimeframeSelectorProps {
  selected: string;
  onSelect: (timeframe: string) => void;
}

const CHART_TIMEFRAMES = ['5m', '15m', '30m', '1H', '4H', '1D'];

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ selected, onSelect }) => {
  const baseButtonStyles = "px-3 py-1 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500";
  const selectedButtonStyles = "bg-blue-600 text-white";
  const unselectedButtonStyles = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 mr-2">Chart Timeframe:</span>
      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-1">
        {CHART_TIMEFRAMES.map(tf => (
          <button
            key={tf}
            onClick={() => onSelect(tf)}
            className={`${baseButtonStyles} ${selected === tf ? selectedButtonStyles : unselectedButtonStyles}`}
            aria-pressed={selected === tf}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
};


function App() {
  const [analysis, setAnalysis] = useState<AnalysisOutput | null>(null);
  const [chartLevels, setChartLevels] = useState<AnalysisOutput['keyLevels'] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCrypto, setCurrentCrypto] = useState<string>('Bitcoin');
  const [currentTicker, setCurrentTicker] = useState<string>('BTCUSDT');
  const [chartTimeframe, setChartTimeframe] = useState<string>('1H');
  const [activeTab, setActiveTab] = useState<'analysis' | 'history'>('analysis');
  const [history, setHistory] = useState<HistoricalAnalysis[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('analysisHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      // If parsing fails, clear the corrupted data
      localStorage.removeItem('analysisHistory');
    }
  }, []);


  const handleAnalyze = async (cryptoName: string, ticker: string, timeframe: string, livePrice: string | null) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setChartLevels(null);
    setCurrentCrypto(cryptoName.split(' ')[0]);
    setCurrentTicker(ticker);
    try {
      const result = await analyzeCryptoMarket(cryptoName, timeframe, livePrice);
      setAnalysis(result);
      setChartLevels(result.keyLevels);

      const newHistoryEntry: HistoricalAnalysis = {
        id: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        cryptoName: cryptoName,
        ticker: ticker,
        timeframe: timeframe,
        analysis: result,
      };

      setHistory(prevHistory => {
        const updatedHistory = [newHistoryEntry, ...prevHistory].slice(0, 50); // Keep max 50 entries
        try {
          localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory));
        } catch (error) {
          console.error("Failed to save history to localStorage", error);
        }
        return updatedHistory;
      });

    } catch (e) {
      if (e instanceof Error) {
        setError(`Analysis failed: ${e.message}`);
      } else {
        setError('An unknown error occurred during analysis.');
      }
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all analysis history? This cannot be undone.')) {
        setHistory([]);
        try {
            localStorage.removeItem('analysisHistory');
        } catch (error) {
            console.error("Failed to clear history from localStorage", error);
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            {currentCrypto} TA <span className="text-blue-400">Assistant</span>
          </h1>
          <a
            href="https://ai.google.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
          >
            Powered by Gemini
          </a>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg mb-8">
            <div className="px-4 py-2 border-b border-gray-700">
              <TimeframeSelector selected={chartTimeframe} onSelect={setChartTimeframe} />
            </div>
            <div className="p-2">
              <ChartDisplay ticker={currentTicker} timeframe={chartTimeframe} keyLevels={chartLevels} />
            </div>
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                  activeTab === 'analysis'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`}
                aria-current={activeTab === 'analysis' ? 'page' : undefined}
              >
                Live Analysis
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`}
                aria-current={activeTab === 'history' ? 'page' : undefined}
              >
                History ({history.length})
              </button>
            </nav>
          </div>
        </div>
        
        {activeTab === 'analysis' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InputPanel onAnalyze={handleAnalyze} isLoading={isLoading} />
              <AnalysisDisplay analysis={analysis} isLoading={isLoading} error={error} />
            </div>
        )}

        {activeTab === 'history' && (
          <HistoryPanel history={history} onClear={handleClearHistory} />
        )}
      </main>

       <footer className="text-center p-6 mt-8 text-gray-500 text-sm border-t border-gray-800">
          <p>This is not financial advice. All analysis is for educational purposes only.</p>
          <p>&copy; 2024 Crypto TA Assistant. All Rights Reserved.</p>
        </footer>
    </div>
  );
}

export default App;