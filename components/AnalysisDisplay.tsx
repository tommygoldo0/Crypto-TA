import React, { useState } from 'react';
import type { AnalysisOutput, KeyLevel } from '../types';
import { LongArrow, ShortArrow, TargetIcon, StopIcon, EntryIcon, NewsIcon, CalendarIcon, InfoIcon } from './icons';

interface AnalysisDisplayProps {
  analysis: AnalysisOutput | null;
  isLoading: boolean;
  error: string | null;
}

const SkeletonLoader: React.FC = () => (
    <div className="space-y-8 animate-pulse">
        <div className="h-24 bg-gray-700 rounded-lg"></div>

        <div>
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="h-24 bg-gray-700 rounded-lg"></div>
                <div className="h-24 bg-gray-700 rounded-lg"></div>
                <div className="h-24 bg-gray-700 rounded-lg"></div>
                <div className="h-24 bg-gray-700 rounded-lg"></div>
                <div className="h-24 bg-gray-700 rounded-lg"></div>
                <div className="h-24 bg-gray-700 rounded-lg"></div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-8">
                <div className="h-56 bg-gray-700 rounded-lg"></div>
                <div className="h-72 bg-gray-700 rounded-lg"></div>
            </div>
            <div className="lg:col-span-2 space-y-8">
                 <div className="h-64 bg-gray-700 rounded-lg"></div>
                 <div className="h-64 bg-gray-700 rounded-lg"></div>
            </div>
        </div>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2 px-5 py-4 border-b border-gray-700">
            {icon}
            {title}
        </h3>
        <div className="text-base text-gray-300 space-y-2 p-5">{children}</div>
    </div>
);

const ProbabilityBar: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-base font-medium text-gray-300">{label}</span>
            <span className={`text-base font-bold ${color}`}>{value}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className={`${color.replace('text-', 'bg-')} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

const TradeIdeaItem: React.FC<{ icon: React.ReactNode, label: string, value: string | string[], colorClass: string }> = ({ icon, label, value, colorClass }) => (
  <div className={`flex items-start gap-4 p-4 rounded-lg bg-gray-800 border border-gray-700`}>
    <div className={`flex-shrink-0 mt-1 ${colorClass}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      {Array.isArray(value) ? (
        <ul className="list-disc list-inside">
          {value.map((v, i) => <li key={i} className="text-lg font-semibold text-white">{v}</li>)}
        </ul>
      ) : (
        <p className="text-lg font-semibold text-white">{value}</p>
      )}
    </div>
  </div>
);

const KeyFigureBox: React.FC<{label: string; level: KeyLevel; onClick: () => void; isSelected: boolean}> = ({ label, level, onClick, isSelected }) => {
    const selectedStyles = "bg-blue-900/50 border-blue-500 ring-2 ring-blue-500";
    const baseStyles = "bg-gray-800 border-gray-700 hover:bg-gray-700/80";
    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-lg border text-left transition-all duration-200 ${isSelected ? selectedStyles : baseStyles}`}
            aria-pressed={isSelected}
        >
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">{label}</p>
                <InfoIcon className={`w-5 h-5 transition-colors ${isSelected ? 'text-blue-400' : 'text-gray-500'}`} />
            </div>
            <p className="text-xl font-bold text-white mt-1">{level.price}</p>
        </button>
    );
};

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, isLoading, error }) => {
  const [selectedKeyLevel, setSelectedKeyLevel] = useState<string | null>(null);

  if (isLoading) {
    return <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 h-full"><SkeletonLoader /></div>;
  }
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 h-full flex flex-col justify-center items-center text-center">
        <h3 className="text-xl font-semibold text-red-400 mb-2">Analysis Error</h3>
        <p className="text-red-300">{error}</p>
      </div>
    );
  }
  if (!analysis) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 h-full flex flex-col justify-center items-center text-center">
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Awaiting Analysis</h3>
        <p className="text-gray-500">Select your preferences and click "Analyze Live Market" to generate a trading view.</p>
      </div>
    );
  }
  
  const bias_colors = {
    'LONG': 'text-green-400',
    'SHORT': 'text-red-400',
  }
  const bias_icon = {
    'LONG': <LongArrow className="w-10 h-10" />,
    'SHORT': <ShortArrow className="w-10 h-10" />,
  }

  const idea = analysis.educationalTradeIdea;
  const keyLevels = analysis.keyLevels ? Object.entries(analysis.keyLevels) : [];
  const justification = analysis.technicalJustification;

  const handleKeyLevelClick = (key: string) => {
    setSelectedKeyLevel(prev => (prev === key ? null : key));
  };

  const selectedLevelData = selectedKeyLevel ? analysis.keyLevels[selectedKeyLevel as keyof typeof analysis.keyLevels] : null;

  const importanceColors = {
      'High': 'bg-red-500',
      'Medium': 'bg-yellow-500',
      'Low': 'bg-gray-500',
  };

  return (
    <div className="space-y-8">
        <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center justify-between gap-6 ${bias_colors[idea.bias].replace('text-', 'border-l-4 border-')}`}>
            <div className="flex items-center gap-5">
              {bias_icon[idea.bias]}
              <div>
                  <h2 className="text-xl font-bold text-white">Bottom Line</h2>
                  <p className="text-lg text-gray-300">{analysis.bottomLine}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="text-base text-gray-400">Current Price</p>
                <p className="text-3xl font-bold text-white">{analysis.currentPrice}</p>
            </div>
        </div>

        <Section title="Key Price Levels">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {keyLevels.map(([key, level]) => (
                    <KeyFigureBox 
                        key={key} 
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                        level={level}
                        onClick={() => handleKeyLevelClick(key)}
                        isSelected={selectedKeyLevel === key}
                    />
                ))}
            </div>
            {selectedLevelData && (
                 <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 transition-all duration-300 ease-in-out">
                    <p className="text-base font-semibold text-blue-300">{selectedKeyLevel?.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</p>
                    <p className="text-sm text-gray-300 mt-1">{selectedLevelData.description}</p>
                </div>
            )}
        </Section>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <Section title="Bias Probabilities">
                <div className="space-y-5">
                    <ProbabilityBar label="Long" value={analysis.biasProbabilities.long} color="text-green-400" />
                    <ProbabilityBar label="Short" value={analysis.biasProbabilities.short} color="text-red-400" />
                </div>
            </Section>
            
            <Section title="Educational Trade Idea (Not Financial Advice)">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                        <p><strong>BIAS:</strong> <span className={`font-bold ${bias_colors[idea.bias]}`}>{idea.bias}</span></p>
                        <p><strong>Approx. R/R:</strong> <span className="font-mono text-blue-300">{idea.riskReward}</span></p>
                    </div>
                    <TradeIdeaItem icon={<EntryIcon className="w-6 h-6"/>} label="Entry Zone" value={idea.entryZone} colorClass="text-gray-300" />
                    <TradeIdeaItem icon={<TargetIcon className="w-6 h-6"/>} label="Take Profit Zone(s)" value={idea.takeProfitZones} colorClass="text-green-400" />
                    <TradeIdeaItem icon={<StopIcon className="w-6 h-6"/>} label="Stop Loss Zone" value={idea.stopLossZone} colorClass="text-red-400" />
                 </div>
                <p className="mt-4 pt-4 border-t border-gray-700 text-base"><strong>Rationale:</strong> {idea.explanation}</p>
            </Section>
          </div>

          <div className="lg:col-span-2 space-y-8">
              <Section title="Live News" icon={<NewsIcon className="w-5 h-5" />}>
                  <div className="space-y-4 max-h-[24rem] overflow-y-auto pr-2">
                     {(analysis.liveNews && analysis.liveNews.length > 0) ? analysis.liveNews.map((news, index) => (
                          <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                              <div className="flex justify-between items-start gap-2">
                                  <p className="font-semibold text-white text-base leading-tight">{news.title}</p>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <span className={`text-sm font-bold ${importanceColors[news.importance].replace('bg-', 'text-')}`}>{news.importance}</span>
                                      <div className={`w-2.5 h-2.5 rounded-full ${importanceColors[news.importance]}`}></div>
                                  </div>
                              </div>
                              <p className="text-sm text-gray-400 mt-2">{news.summary}</p>
                          </div>
                      )) : <p className="text-sm text-gray-500">No recent news found.</p>}
                  </div>
              </Section>
               <Section title="Upcoming Events" icon={<CalendarIcon className="w-5 h-5" />}>
                  <div className="space-y-4 max-h-[24rem] overflow-y-auto pr-2">
                     {(analysis.upcomingEvents && analysis.upcomingEvents.length > 0) ? analysis.upcomingEvents.map((event, index) => (
                         <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                             <p className="font-semibold text-white text-base">{event.event}</p>
                             <p className="text-sm text-blue-300 font-mono mt-1">{new Date(event.date).toLocaleString()}</p>
                             <p className="text-sm text-gray-400 mt-2">{event.potentialImpact}</p>
                         </div>
                     )) : <p className="text-sm text-gray-500">No major upcoming events found.</p>}
                  </div>
              </Section>
          </div>
        </div>
        
        <details className="bg-gray-800/50 border border-gray-700 rounded-lg">
            <summary className="text-lg font-semibold text-blue-300 flex items-center gap-2 px-5 py-4 cursor-pointer hover:bg-gray-800 transition-colors rounded-t-lg">
                Technical Justification
            </summary>
            <div className="text-base text-gray-300 space-y-6 p-5 border-t border-gray-700">
                <div className="flex items-center gap-4">
                    <strong className="flex-shrink-0">Confluence Score:</strong>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                        <div 
                            className="bg-blue-500 h-4 rounded-full text-center text-xs text-white font-bold flex items-center justify-center" 
                            style={{ width: `${justification.confluenceScore}%` }}
                        >
                            {justification.confluenceScore}
                        </div>
                    </div>
                </div>

                <p><strong>Market Regime:</strong> {justification.marketRegime}</p>

                <div>
                    <strong>Trading Method Evaluation:</strong>
                    <div className="mt-2 space-y-3">
                        {/* FIX: Cast `data` to a specific type to avoid TypeScript errors on property access. */}
                        {Object.entries(justification.methodsEvaluation).map(([method, data]) => {
                            const evalData = data as { score: number; reasoning: string };
                            return (
                                <div key={method} className="p-3 bg-gray-900/50 rounded-lg border border-gray-600">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-gray-200">{method}</p>
                                        <span className="text-sm font-bold bg-gray-700 text-blue-300 px-2 py-0.5 rounded-full">{evalData.score}/10</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{evalData.reasoning}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="pt-6 border-t border-gray-700/50 space-y-4">
                  <p><strong>Trend & Structure:</strong> {justification.trendAndStructure}</p>
                  <p><strong>Key Levels Summary:</strong> {justification.keyLevels}</p>
                  <p><strong>Momentum & Volume:</strong> {justification.momentumAndVolume}</p>
                  <p><strong>News Summary:</strong> {justification.newsSummary}</p>
                  <p><strong>Liquidity Notes:</strong> {justification.liquidityNotes}</p>
                </div>
            </div>
        </details>
        
        <div className="p-5 border border-red-700/50 bg-red-900/20 rounded-lg">
            <h4 className="font-bold text-red-400 text-lg">RISK WARNING</h4>
            <p className="text-base text-red-300 mt-1">{analysis.riskWarning}</p>
        </div>

        {/* FIX: Corrected typo from `ão` to `0`. */}
        {analysis.sources && analysis.sources.length > 0 && (
          <Section title="Sources">
            <ul className="list-disc list-inside text-sm space-y-1">
              {analysis.sources.map((source, index) => (
                <li key={index}>
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}
    </div>
  );
};

export default AnalysisDisplay;
