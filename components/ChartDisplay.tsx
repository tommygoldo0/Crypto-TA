import React, { useEffect, useRef, memo } from 'react';
import type { AnalysisOutput } from '../types';

interface ChartDisplayProps {
  ticker: string;
  timeframe: string;
  keyLevels: AnalysisOutput['keyLevels'] | null;
}

const getTradingViewTimeframe = (timeframe: string): string => {
    switch (timeframe) {
        case '5m': return '5';
        case '15m': return '15';
        case '30m': return '30';
        case '1H': return '60';
        case '4H': return '240';
        case '1D': return 'D';
        default: return '60'; // Default to 1 hour
    }
}

const createHorzlinesConfig = (keyLevels: AnalysisOutput['keyLevels']) => {
    const lines: any[] = [];

    const levelMapping: { [key: string]: any } = {
        resistance1: { color: 'rgba(239, 68, 68, 0.7)', style: 'dashed', width: 1, text: 'Resistance 1' },
        resistance2: { color: 'rgba(220, 38, 38, 0.8)', style: 'dashed', width: 2, text: 'Resistance 2' },
        support1: { color: 'rgba(34, 197, 94, 0.7)', style: 'dashed', width: 1, text: 'Support 1' },
        support2: { color: 'rgba(22, 163, 74, 0.8)', style: 'dashed', width: 2, text: 'Support 2' },
        dailyPivot: { color: 'rgba(59, 130, 246, 0.7)', style: 'dotted', width: 2, text: 'Daily Pivot' },
        invalidationLevel: { color: 'rgba(249, 115, 22, 0.9)', style: 'solid', width: 2, text: 'Invalidation Level' },
    };
    
    for (const [key, level] of Object.entries(keyLevels)) {
        if (!level || !level.price) continue;
        const price = parseFloat(level.price.replace(/[^0-9.-]+/g, ''));
        const mapping = levelMapping[key as keyof typeof levelMapping];

        if (!isNaN(price) && mapping) {
            lines.push({
                price: price,
                style: { ...mapping }
            });
        }
    }
    
    return { items: lines };
};


const ChartDisplay: React.FC<ChartDisplayProps> = ({ ticker, timeframe, keyLevels }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current && ticker && timeframe) {
      // Ensure the container is empty before appending the new script
      container.current.innerHTML = "";
      
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;

      const widgetConfig: any = {
        "autosize": true,
        "symbol": `BYBIT:${ticker}`,
        "interval": getTradingViewTimeframe(timeframe),
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1", // Candlesticks
        "locale": "en",
        "enable_publishing": false,
        "withdateranges": true,
        "hide_side_toolbar": false,
        "allow_symbol_change": false,
        "studies": [
            "MA@tv-basicstudies"
        ],
        "studies_overrides": {
            "moving average.ma.plot.color": "#2962FF",
            "moving average.ma.length": 9
        },
        "mainSeriesProperties": {
          "candleStyle": {
            "upColor": "#22ab94",
            "downColor": "#f7525f",
            "borderUpColor": "#22ab94",
            "borderDownColor": "#f7525f",
            "wickUpColor": "#22ab94",
            "wickDownColor": "#f7525f"
          }
        }
      };
      
      if (keyLevels) {
        widgetConfig.horzlines = createHorzlinesConfig(keyLevels);
      }
      
      script.innerHTML = JSON.stringify(widgetConfig);
      
      container.current.appendChild(script);
    }
  }, [ticker, timeframe, keyLevels]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "500px", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
};

export default memo(ChartDisplay);