import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface TradeSignal {
  ticker: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  position_size: number;
  rationale: string;
}

const TradeLogger: React.FC = () => {
  const [formData, setFormData] = useState<TradeSignal>({
    ticker: '',
    entry_price: 0,
    stop_loss: 0,
    take_profit: 0,
    position_size: 1,
    rationale: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'ticker' || name === 'rationale')
        ? value
        : parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErr(null);

    try {
      const response = await fetch('http://localhost:8000/upload-trade', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis); // Display AI comments
      } else {
        setErr("Server processed request but failed to log.");
      }
    } catch (error: any) {
      setErr(error.message || "Connection to backend failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setFormData({
      ticker: '',
      entry_price: 0,
      stop_loss: 0,
      take_profit: 0,
      position_size: 1,
      rationale: ''
    });
  };

  // --- Success / Analysis View ---
  if (analysis) {
    return (
      <section className="panel animate-in">
        <div className="header">
          <div>
            <h1 style={{ color: '#10b981' }}>Trade Analyzed</h1>
            <p>Your mentor has reviewed the {formData.ticker} setup.</p>
          </div>
          <button className="btn" onClick={handleReset}>Upload Another</button>
        </div>

        <div className="panel" style={{ background: '#0b0f17', borderLeft: '4px solid #10b981' }}>
          <div className="markdown-content">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={handleReset}>Yes, Log New Trade</button>
          <button className="btnSmall" style={{ opacity: 0.6 }} onClick={() => window.scrollTo(0, 0)}>Back to Dashboard</button>
        </div>
      </section>
    );
  }

  // --- Main Form View ---
  return (
    <section className="panel">
      <header className="header">
        <div>
          <h1>Log Trade Signal</h1>
          <p>Send your trade setup to the AI Mentor for persistent memory.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div className="grid">
          <div className="card">
            <label>Ticker</label>
            <input
              type="text"
              name="ticker"
              className="chat-input"
              style={{ width: '100%', marginTop: '5px' }}
              value={formData.ticker}
              onChange={handleChange}
              placeholder="e.g. NVDA"
              required
            />
          </div>
          <div className="card">
            <label>Entry Price ($)</label>
            <input
              type="number"
              name="entry_price"
              style={{ width: '100%', marginTop: '5px' }}
              value={formData.entry_price}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div className="card">
            <label>Position Size (Shares)</label>
            <input
              type="number"
              name="position_size"
              style={{ width: '100%', marginTop: '5px' }}
              value={formData.position_size}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <label>Stop Loss ($)</label>
            <input
              type="number"
              name="stop_loss"
              style={{ width: '100%', marginTop: '5px' }}
              value={formData.stop_loss}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div className="card">
            <label>Take Profit ($)</label>
            <input
              type="number"
              name="take_profit"
              style={{ width: '100%', marginTop: '5px' }}
              value={formData.take_profit}
              onChange={handleChange}
              step="0.01"
            />
          </div>
        </div>

        <div className="panel">
          <label>Rationale / Strategy Notes</label>
          <textarea
            name="rationale"
            className="chat-input"
            style={{ width: '100%', minHeight: '100px', marginTop: '10px', background: '#0b0f17' }}
            value={formData.rationale}
            onChange={handleChange}
            placeholder="Explain why you are taking this trade (e.g. 3-month breakout, RSI divergence...)"
          />
        </div>

        {err && <div className="err" style={{ marginBottom: '10px' }}>{err}</div>}

        <button className="btn" type="submit" disabled={isLoading} style={{ width: '100%', padding: '15px', fontSize: '16px' }}>
          {isLoading ? "Mentor is analyzing..." : "Log Trade & Get Feedback"}
        </button>
      </form>
    </section>
  );
};

export default TradeLogger;
