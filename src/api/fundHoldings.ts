import type { AxiosRequestConfig } from "axios";
import { http } from "./http";
import type {
  FundHoldingItem,
  FundHoldingsSnapshot,
  FundIndustryItem,
  FundIndustrySnapshot,
} from "@/types/fund";

interface RequestOptions {
  suppressToast?: boolean;
}

type HttpRequestConfig = AxiosRequestConfig & RequestOptions;

const stripHtml = (value: string): string => value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();

const extractIndustryContent = (payload: string): string => {
  const match = payload.match(/content:"([\s\S]*?)",arryear:/);
  if (!match) return "";
  return match[1]
    .replace(/\\"/g, "\"")
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");
};

/**
 * 从 FundArchivesDatas HTML 表格中解析持仓数据。
 *
 * HTML 结构：多个 `<div class="box">` 块，每块是一个季度。
 * 每块含一个 `<table class="w782 comm tzxq">` 表格。
 * 表格列：序号 | 股票代码 | 股票名称 | 相关资讯 | 占净值比例 | 持股数(万股) | 持仓市值(万元)
 *
 * 只解析第一个季度（最新）。
 */
const parseHoldingsHtml = (html: string): FundHoldingsSnapshot | null => {
  // Extract quarter title: "2025年4季度股票投资明细"
  const titleMatch = html.match(/(\d{4}年\d季度)股票投资明细/);
  const quarter = titleMatch ? titleMatch[1] : "";

  // Extract cutoff date: "截止至：2025-12-31"
  const dateMatch = html.match(/截止至：.*?(\d{4}-\d{2}-\d{2})/);
  const cutoffDate = dateMatch ? dateMatch[1] : "";

  const holdings: FundHoldingItem[] = [];

  // Only parse the first table (latest quarter)
  // Find the first </tbody> to limit scope
  const firstTableEnd = html.indexOf("</tbody>");
  const scope = firstTableEnd > 0 ? html.slice(0, firstTableEnd + 10) : html;

  const rowMatches = scope.match(/<tr>[\s\S]*?<\/tr>/g) ?? [];

  for (const row of rowMatches) {
    const rankMatch = row.match(/<td>(\d+)<\/td>/);
    const marketCodeMatch = row.match(/<td><a\s+href='[^']*?\/(\d+\.\w+)'\s*>[^<]+<\/a><\/td>/);
    const stockNameMatch = row.match(/<td\s+class='tol'><a[^>]*>([^<]+)<\/a><\/td>/);
    const torCells = [...row.matchAll(/<td\s+class='tor'>([\s\S]*?)<\/td>/g)]
      .map((match) => stripHtml(match[1]))
      .filter(Boolean);

    if (!rankMatch || !marketCodeMatch || !stockNameMatch || torCells.length < 3) {
      continue;
    }

    const numericCells = torCells.slice(-3);
    const [ratioRaw, sharesRaw, marketValueRaw] = numericCells;
    const marketCode = marketCodeMatch[1];
    // Extract stock code from market code like "116.00700" -> "00700", "1.600519" -> "600519"
    const dotIdx = marketCode.indexOf(".");
    const stockCode = dotIdx >= 0 ? marketCode.slice(dotIdx + 1) : marketCode;

    holdings.push({
      rank: parseInt(rankMatch[1], 10),
      stockCode,
      stockName: stockNameMatch[1],
      marketCode,
      ratio: parseFloat(ratioRaw.replace("%", "")),
      shares: parseFloat(sharesRaw.replace(/,/g, "")),
      marketValue: parseFloat(marketValueRaw.replace(/,/g, "")),
    });
  }

  if (holdings.length === 0) return null;

  return { quarter, cutoffDate, holdings };
};

const parseIndustryHtml = (html: string): FundIndustrySnapshot | null => {
  const titleMatch = html.match(/(\d{4}年\d季度)行业配置明细/);
  const quarter = titleMatch ? titleMatch[1] : "";

  const dateMatch = html.match(/截止至：.*?(\d{4}-\d{2}-\d{2})/);
  const cutoffDate = dateMatch ? dateMatch[1] : "";

  // Only parse the latest quarter table.
  const firstTableEnd = html.indexOf("</tbody>");
  const scope = firstTableEnd > 0 ? html.slice(0, firstTableEnd + 10) : html;
  const rowMatches = scope.match(/<tr>[\s\S]*?<\/tr>/g) ?? [];
  const industries: FundIndustryItem[] = [];

  for (const row of rowMatches) {
    const rankMatch = row.match(/<td>(\d+)<\/td>/);
    const nameMatch = row.match(/<td class='tol'>([\s\S]*?)<\/td>/);
    const torCells = [...row.matchAll(/<td class='tor'>([\s\S]*?)<\/td>/g)]
      .map((match) => stripHtml(match[1]))
      .filter(Boolean);

    if (!rankMatch || !nameMatch || torCells.length < 2) {
      continue;
    }

    const [ratioRaw, marketValueRaw] = torCells;
    industries.push({
      rank: parseInt(rankMatch[1], 10),
      name: stripHtml(nameMatch[1]),
      ratio: parseFloat(ratioRaw.replace("%", "")),
      marketValue: parseFloat(marketValueRaw.replace(/,/g, "")),
    });
  }

  if (industries.length === 0) return null;

  return { quarter, cutoffDate, industries };
};

/**
 * 获取基金持仓明细。
 * 经 `/api/fundf10/` 代理转发到 fundf10.eastmoney.com。
 */
export const fetchFundHoldings = async (
  code: string,
  topline = 10,
  options: RequestOptions = {},
): Promise<FundHoldingsSnapshot | null> => {
  try {
    const requestConfig: HttpRequestConfig = {
      params: { type: "jjcc", code, topline, year: "", month: "", rt: Math.random() },
      responseType: "text",
      suppressToast: options.suppressToast ?? true,
    };
    const { data } = await http.get<string>(
      `/api/fundf10/FundArchivesDatas.aspx`,
      requestConfig,
    );
    return parseHoldingsHtml(data);
  } catch {
    return null;
  }
};

export const fetchFundIndustry = async (
  code: string,
  topline = 10,
  options: RequestOptions = {},
): Promise<FundIndustrySnapshot | null> => {
  try {
    const requestConfig: HttpRequestConfig = {
      params: { type: "hypz", code, topline, year: "", month: "", rt: Math.random() },
      responseType: "text",
      suppressToast: options.suppressToast ?? true,
    };
    const { data } = await http.get<string>(
      `/api/fundf10/F10DataApi.aspx`,
      requestConfig,
    );

    const content = extractIndustryContent(data);
    if (!content) return null;

    return parseIndustryHtml(content);
  } catch {
    return null;
  }
};

// Exported for testing
export {
  extractIndustryContent as _extractIndustryContent,
  parseHoldingsHtml as _parseHoldingsHtml,
  parseIndustryHtml as _parseIndustryHtml,
};
