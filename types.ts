export interface UserInput {}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface KeyLevel {
  price: string;
  description: string;
}

export interface LiveNews {
  title: string;
  source: string;
  summary: string;
  importance: 'Low' | 'Medium' | 'High';
}

export interface UpcomingEvent {
  event: string;
  date: string;
  potentialImpact: string;
}

export interface MethodsEvaluation {
  [method: string]: {
    score: number;
    reasoning: string;
  };
}

export interface TechnicalJustification {
  confluenceScore: number;
  marketRegime: string;
  methodsEvaluation: MethodsEvaluation;
  trendAndStructure: string;
  keyLevels: string;
  momentumAndVolume: string;
  liquidityNotes: string;
  newsSummary: string;
}

export interface AnalysisOutput {
  currentPrice: string;
  bottomLine: string;
  assumptions: string;
  biasProbabilities: {
    long: number;
    short: number;
  };
  keyLevels: {
    resistance1: KeyLevel;
    support1: KeyLevel;
    resistance2: KeyLevel;
    support2: KeyLevel;
    dailyPivot: KeyLevel;
    invalidationLevel: KeyLevel;
  };
  liveNews: LiveNews[];
  upcomingEvents: UpcomingEvent[];
  technicalJustification: TechnicalJustification;
  educationalTradeIdea: {
    bias: 'LONG' | 'SHORT';
    entryZone: string;
    stopLossZone: string;
    takeProfitZones: string[];
    riskReward: string;
    explanation: string;
  };
  riskWarning: string;
  sources?: GroundingSource[];
}

export interface HistoricalAnalysis {
  id: string;
  timestamp: string;
  cryptoName: string;
  ticker: string;
  timeframe: string;
  analysis: AnalysisOutput;
}
