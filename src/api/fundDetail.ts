import axios from "axios";
import type { ACWorthPoint, FundDetailData, FundProfile } from "@/types/fund";

/**
 * 从 pingzhongdata JS 文本中提取变量值。
 * 变量格式：var <name> = <value>;
 */
const extractVar = (text: string, name: string): string | null => {
  const pattern = new RegExp(`var\\s+${name}\\s*=\\s*(.+?)\\s*;(?:\\s*(?:var\\s|/\\*|$))`, "s");
  const match = text.match(pattern);
  if (!match) return null;
  return match[1].trim();
};

const extractStringVar = (text: string, name: string): string | null => {
  const pattern = new RegExp(`var\\s+${name}\\s*=\\s*"([^"]*)"\\s*;`);
  const match = text.match(pattern);
  return match ? match[1] : null;
};

const stripHtml = (value: string): string => {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const formatNavValue = (value: number | null | undefined): string | null => {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return value.toFixed(4);
};

const formatShanghaiDate = (timestamp: number | null | undefined): string | null => {
  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) return null;
  const shifted = new Date(timestamp + 8 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const extractOverviewValue = (html: string, label: string): string | null => {
  const pattern = new RegExp(`<th>${label}<\\/th><td>([\\s\\S]*?)<\\/td>`, "i");
  const match = html.match(pattern);
  if (!match) return null;
  const value = stripHtml(match[1]);
  return value || null;
};

const parseFundProfileHtml = (html: string): Pick<FundProfile, "fundType" | "fundCompany" | "fundManager" | "fundScale"> => {
  const fundType = extractOverviewValue(html, "基金类型");
  const fundCompany = extractOverviewValue(html, "基金管理人");
  const fundManager = extractOverviewValue(html, "基金经理人");
  const fundScaleRaw = extractOverviewValue(html, "净资产规模");

  return {
    fundType,
    fundCompany,
    fundManager,
    fundScale: fundScaleRaw?.replace(/（截止至：.*$/, "").trim() || null,
  };
};

const parseFundTradeStatusHtml = (html: string): string | null => {
  const match = html.match(/<span class="itemTit">交易状态：<\/span>([\s\S]*?)<\/div>/i);
  if (!match) return null;

  const statuses = [...match[1].matchAll(/<span class="staticCell">([\s\S]*?)<\/span>/g)]
    .map((item) => stripHtml(item[1]))
    .filter(Boolean);

  return statuses.length > 0 ? statuses.join(" ") : null;
};

const parsePingzhongdata = (text: string): FundDetailData | null => {
  const code = extractStringVar(text, "fS_code");
  const name = extractStringVar(text, "fS_name");

  if (!code || !name) return null;

  const sourceRate = extractStringVar(text, "fund_sourceRate");
  const currentRate = extractStringVar(text, "fund_Rate");
  const minPurchase = extractStringVar(text, "fund_minsg");
  const return1m = extractStringVar(text, "syl_1y");
  const return3m = extractStringVar(text, "syl_3y");
  const return6m = extractStringVar(text, "syl_6y");
  const return1y = extractStringVar(text, "syl_1n");

  let latestAccumulatedNav: string | null = null;

  let acWorthTrend: ACWorthPoint[] = [];
  const acWorthRaw = extractVar(text, "Data_ACWorthTrend");
  if (acWorthRaw) {
    try {
      const parsed = JSON.parse(acWorthRaw) as unknown;
      if (Array.isArray(parsed)) {
        acWorthTrend = parsed.filter(
          (p): p is [number, number] =>
            Array.isArray(p) && p.length >= 2 && typeof p[0] === "number" && typeof p[1] === "number",
        );
        const latestPoint = acWorthTrend[acWorthTrend.length - 1];
        latestAccumulatedNav = formatNavValue(latestPoint?.[1]);
      }
    } catch {
      // Parsing failed, leave empty
    }
  }

  let latestUnitNav: string | null = null;
  let latestUnitNavDate: string | null = null;
  const netWorthRaw = extractVar(text, "Data_netWorthTrend");
  if (netWorthRaw) {
    try {
      const parsed = JSON.parse(netWorthRaw) as unknown;
      if (Array.isArray(parsed)) {
        const latestPoint = parsed[parsed.length - 1] as { x?: number; y?: number } | undefined;
        latestUnitNav = formatNavValue(latestPoint?.y);
        latestUnitNavDate = formatShanghaiDate(latestPoint?.x);
      }
    } catch {
      // Parsing failed, leave empty
    }
  }

  const profile: FundProfile = {
    code,
    name,
    sourceRate,
    currentRate,
    minPurchase,
    return1m,
    return3m,
    return6m,
    return1y,
    unitNav: latestUnitNav,
    unitNavDate: latestUnitNavDate,
    accumulatedNav: latestAccumulatedNav,
    fundType: null,
    fundCompany: null,
    fundManager: null,
    tradeStatus: null,
    fundScale: null,
  };

  // Parse stockCodesNew: ["116.00700", "1.600519", ...]
  let stockCodes: string[] = [];
  const stockCodesRaw = extractVar(text, "stockCodesNew");
  if (stockCodesRaw) {
    try {
      const parsed = JSON.parse(stockCodesRaw) as unknown;
      if (Array.isArray(parsed)) {
        stockCodes = parsed.filter((s): s is string => typeof s === "string");
      }
    } catch {
      // Parsing failed, leave empty
    }
  }

  return { profile, acWorthTrend, stockCodes };
};

/**
 * 获取基金详情数据（来自 pingzhongdata JS 脚本）。
 *
 * 请求层只做数据获取与映射，不做 Vue 状态与副作用。
 */
export const fetchFundDetail = async (code: string): Promise<FundDetailData | null> => {
  try {
    const [detailResponse, profileResponse, homeResponse] = await Promise.all([
      axios.get<string>(
        `/api/pingzhongdata/${code}.js?v=${Date.now()}`,
        { responseType: "text" },
      ),
      axios.get<string>(
        `/api/fundf10/jbgk_${code}.html`,
        { responseType: "text" },
      ),
      axios.get<string>(
        `/api/fundpage/${code}.html?v=${Date.now()}`,
        { responseType: "text" },
      ),
    ]);

    const parsed = parsePingzhongdata(detailResponse.data);
    if (!parsed) return null;

    const overview = parseFundProfileHtml(profileResponse.data);
    const tradeStatus = parseFundTradeStatusHtml(homeResponse.data);

    return {
      ...parsed,
      profile: {
        ...parsed.profile,
        ...overview,
        tradeStatus,
      },
    };
  } catch {
    return null;
  }
};

// Exported for testing
export {
  parseFundProfileHtml as _parseFundProfileHtml,
  parseFundTradeStatusHtml as _parseFundTradeStatusHtml,
  parsePingzhongdata as _parsePingzhongdata,
};
