

/** 自选持仓配置项（存储在 storage 中的原始结构） */
export interface FundListItem {
  code: string;
  num: number;
  cost?: number;
}

/** 完整的基金数据项（含行情和持仓计算结果） */
export interface FundItem {
  fundcode: string;
  name: string;
  jzrq: string;
  dwjz: number | null;
  gsz: number | null;
  gszzl: number;
  gztime: string;
  num: number;
  cost: number;
  amount: number;
  gains: number;
  costGains: number;
  costGainsRate: number;
  hasReplace?: boolean;
}

/** 搜索结果条目 */
export interface SearchFundItem {
  label: string;
  value: string;
  desc?: string;
  tag?: string;
  /** 估算净值，例如 "1.0820" */
  gsz?: string;
  /** 估算涨跌幅，例如 0.51（正数涨，负数跌） */
  gszzl?: number;
}

/** 基金列表可排序字段 */
export type FundSortableField =
  | "gszzl"
  | "amount"
  | "gains"
  | "costGains"
  | "costGainsRate";

/** 搜索接口原始条目 */
export interface FundSearchResponseItem {
  CODE: string;
  NAME: string;
  CATEGORY?: number | string | null;
}

/** 搜索接口响应 */
export interface FundSearchApiResponse {
  Datas?: FundSearchResponseItem[];
}

/** 基金行情接口原始条目 */
export interface FundQuoteResponseItem {
  FCODE: string;
  SHORTNAME: string;
  PDATE: string;
  NAV: string | null;
  NAVCHGRT: string | null;
  GSZ: string | null;
  GSZZL: string | null;
  GZTIME: string | null;
  NEWPRICE?: string | null;
  CHANGERATIO?: string | null;
  HQDATE?: string | null;
}

/** 基金行情接口响应 */
export interface FundQuoteApiResponse {
  Datas?: FundQuoteResponseItem[];
}

/* ── Phase 3: Fund Detail ─────────────────────────────────── */

/** 累计收益图表周期选项 */
export type FundReturnPeriod =
  | "1w"
  | "1m"
  | "3m"
  | "6m"
  | "ytd"
  | "1y"
  | "2y"
  | "5y"
  | "10y";

/** 基金概况（来自 pingzhongdata） */
export interface FundProfile {
  code: string;
  name: string;
  sourceRate: string | null;
  currentRate: string | null;
  minPurchase: string | null;
  return1m: string | null;
  return3m: string | null;
  return6m: string | null;
  return1y: string | null;
  unitNav: string | null;
  unitNavDate: string | null;
  accumulatedNav: string | null;
  fundType: string | null;
  fundCompany: string | null;
  fundManager: string | null;
  tradeStatus: string | null;
  fundScale: string | null;
}

/** 累计净值走势点 [timestamp, nav] */
export type ACWorthPoint = [number, number];

/** pingzhongdata 完整解析结果 */
export interface FundDetailData {
  profile: FundProfile;
  acWorthTrend: ACWorthPoint[];
  stockCodes: string[];
}

/** 持仓明细条目（来自 FundArchivesDatas HTML 解析） */
export interface FundHoldingItem {
  rank: number;
  stockCode: string;
  stockName: string;
  marketCode: string;
  ratio: number;
  shares: number;
  marketValue: number;
}

/** 持仓快照（一个季度） */
export interface FundHoldingsSnapshot {
  quarter: string;
  cutoffDate: string;
  holdings: FundHoldingItem[];
}

/** 行业配置条目（来自 F10DataApi hypz） */
export interface FundIndustryItem {
  rank: number;
  name: string;
  ratio: number;
  marketValue: number;
}

/** 行业配置快照（一个季度） */
export interface FundIndustrySnapshot {
  quarter: string;
  cutoffDate: string;
  industries: FundIndustryItem[];
}
