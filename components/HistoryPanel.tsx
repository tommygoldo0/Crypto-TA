import React, { useState } from 'react';
import type { HistoricalAnalysis, AnalysisOutput } from '../types';
import AnalysisDisplay from './AnalysisDisplay';
import { LongArrow, ShortArrow } from './icons';

interface HistoryPanelProps {
  history: HistoricalAnalysis[];
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisOutput | null>(null);

  if (history.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 h-full flex flex-col justify-center items-center text-center">
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No History Found</h3>
        <p className="text-gray-500">Perform an analysis on the "Live Analysis" tab to see your history here.</p>
      </div>
    );
  }

  const bias_icon = {
    'LONG': <LongArrow className="w-6 h-6" />,
    'SHORT': <ShortArrow className="w-6 h-6" />,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="p-4 flex justify-between items-center border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">History</h2>
            <button
              onClick={onClear}
              className="text-sm text-red-400 hover:text-red-300 hover:bg-red-900/50 px-3 py-1 rounded-md transition-colors"
              aria-label="Clear all analysis history"
            >
              Clear All
            </button>
          </div>
          <ul className="max-h-[80vh] overflow-y-auto">
            {history.map((item) => (
              <li key={item.id} className="border-b border-gray-700 last:border-b-0">
                <button
                  onClick={() => setSelectedAnalysis(item.analysis)}
                  className={`w-full text-left p-4 hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                    selectedAnalysis?.bottomLine === item.analysis.bottomLine && selectedAnalysis?.currentPrice === item.analysis.currentPrice ? 'bg-blue-900/30' : ''
                  }`}
                  aria-label={`View analysis for ${item.cryptoName} from ${new Date(item.timestamp).toLocaleString()}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {bias_icon[item.analysis.educationalTradeIdea.bias]}
                      <div>
                        <p className="font-bold text-white">{item.cryptoName}</p>
                        <p className="text-sm text-gray-400">{item.analysis.educationalTradeIdea.bias}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="lg:col-span-2">
        {selectedAnalysis ? (
          <AnalysisDisplay analysis={selectedAnalysis} isLoading={false} error={null} />
        ) : (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 h-full flex flex-col justify-center items-center text-center">
            <h3 className="text-xl font-semibold text-gray-300 mb-2">View Analysis Details</h3>
            <p className="text-gray-500">Select an item from the history list on the left to see its full analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
