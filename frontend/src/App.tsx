import { useState } from "react";
import { scan } from "./api";
import type { Candidate } from "./types";
import "./styles.css";

export default function App() {
  const [risk, setRisk] = useState<number>(50);
  const [includeHeadlines, setIncludeHeadlines] = useState(true);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onScan() {
    setErr(null);
    setLoading(true);
    setCandidates([]);
    try {
      const res = await scan({
        universe: "nasdaq100",
        risk_dollars: risk,
        include_headlines: includeHeadlines,
        top_n: 3,
      });
      setCandidates(res.candidates);
      setMeta(res.meta);
    } catch (e: any) {
      setErr(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <header className="header">
        <div>
          <h1>SignalStack</h1>
          <p>Autonomous swing-trade scanner → execution-ready plans</p>
        </div>
        <button className="btn" onClick={onScan} disabled={loading}>
          {loading ? "Scanning..." : "Scan Nasdaq-100 (sample)"}
        </button>
      </header>

      <section className="panel">
        <div className="row">
          <label>
            Risk per trade ($):
            <input
              type="number"
              min={1}
              value={risk}
              onChange={(e) => setRisk(Number(e.target.value))}
            />
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={includeHeadlines}
              onChange={(e) => setIncludeHeadlines(e.target.checked)}
            />
            Include live headlines (Bright Data)
          </label>
        </div>
        {meta && (
          <div className="meta">
            Universe size: {meta.universe_size} | Qualified: {meta.scanned} | Headlines:{" "}
            {String(meta.include_headlines)}
          </div>
        )}
        {err && <div className="err">{err}</div>}
      </section>

      <main className="grid">
        {candidates.map((c) => (
          <Card key={c.ticker} c={c} />
        ))}
      </main>
    </div>
  );
}

function Card({ c }: { c: Candidate }) {
  const ticket = `TICKER: ${c.ticker}
ENTRY: ${c.plan.entry_low} - ${c.plan.entry_high}
STOP: ${c.plan.stop}
TARGET: ${c.plan.target}
SHARES: ${c.plan.shares}
RISK/SHARE: ${c.plan.risk_per_share}
R:R: ${c.plan.rr}`;

  return (
    <div className="card">
      <div className="cardTop">
        <div>
          <div className="ticker">{c.ticker}</div>
          <div className="sub">Score: {c.score}</div>
        </div>
        <button className="btnSmall" onClick={() => navigator.clipboard.writeText(ticket)}>
          Copy order ticket
        </button>
      </div>

      <div className="kv">
        <div><span>Entry</span><b>{c.plan.entry_low} – {c.plan.entry_high}</b></div>
        <div><span>Stop</span><b>{c.plan.stop}</b></div>
        <div><span>Target</span><b>{c.plan.target}</b></div>
        <div><span>Shares</span><b>{c.plan.shares}</b></div>
      </div>

      <div className="split">
        <div>
          <h3>Breakdown</h3>
          <ul>
            {Object.entries(c.score_breakdown).map(([k, v]) => (
              <li key={k}>{k}: {v}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Indicators</h3>
          <ul>
            {["close","sma50","sma200","rsi14","macd_hist","atr14","vol_ratio"].map((k) => (
              <li key={k}>{k}: {c.indicators[k]}</li>
            ))}
          </ul>
        </div>
      </div>

      {c.headlines?.length > 0 && (
        <>
          <h3>Latest headlines</h3>
          <ul className="links">
            {c.headlines.map((h, i) => (
              <li key={i}>
                <a href={h.url} target="_blank" rel="noreferrer">{h.title}</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
