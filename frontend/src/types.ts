export type ScanRequest = {
  universe: "nasdaq100";
  risk_dollars: number;
  include_headlines: boolean;
  top_n: number;
};

export type Headline = { title: string; url: string };

export type Candidate = {
  ticker: string;
  score: number;
  score_breakdown: Record<string, number>;
  indicators: Record<string, number>;
  plan: {
    entry_low: number;
    entry_high: number;
    stop: number;
    target: number;
    shares: number;
    risk_per_share: number;
    reward_per_share: number;
    rr: number;
  };
  headlines: Headline[];
  reasoning?: string | null;
};

export type ScanResponse = {
  run_id: string;
  candidates: Candidate[];
  meta: Record<string, any>;
};
