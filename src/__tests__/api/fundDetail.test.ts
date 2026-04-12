import { beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "@/api/http";
import {
  _parseFundProfileHtml,
  _parseFundTradeStatusHtml,
  _parsePingzhongdata,
  fetchFundDetail,
} from "@/api/fundDetail";

vi.mock("@/api/http", () => ({
  http: {
    get: vi.fn(),
  },
}));

const mockedHttpGet = vi.mocked(http.get);

const MOCK_PINGZHONGDATA = `
var fS_name = "易方达蓝筹精选混合";
var fS_code = "005827";
var fund_sourceRate = "1.50";
var fund_Rate = "0.15";
var fund_minsg = "10";
var syl_1y = "-4.69";
var syl_3y = "-4.44";
var syl_6y = "-12.97";
var syl_1n = "-6.52";
var Data_ACWorthTrend = [[1609459200000,1.5],[1609545600000,1.52],[1609632000000,1.48]];
var Data_netWorthTrend = [{"x":1609459200000,"y":1.1},{"x":1609545600000,"y":1.12},{"x":1609632000000,"y":1.08}];
var stockCodesNew = ["116.00700","1.600519","0.000858"];
`;

const MOCK_PROFILE_HTML = `
<tr><th>基金代码</th><td>000216（前端）<th>基金类型</th><td>指数型-其他</td></tr>
<tr><th>净资产规模</th><td>107.76亿元（截止至：2025年12月31日）<th>份额规模</th><td>31.8068亿份</td></tr>
<tr><th>基金管理人</th><td><a href="//fund.eastmoney.com/company/80000228.html">华安基金</a></td><th>基金托管人</th><td>建设银行</td></tr>
<tr><th>基金经理人</th><td><a href="//fund.eastmoney.com/manager/30044485.html">许之彦</a></td><th>成立来分红</th><td>每份累计0.00元（0次）</td></tr>
`;

const MOCK_TRADE_STATUS_HTML = `
<div class="staticItem"><span class="itemTit">交易状态：</span><span class="staticCell">开放申购  </span><span class="staticCell">开放赎回</span></div>
`;

describe("parsePingzhongdata", () => {
  beforeEach(() => {
    mockedHttpGet.mockReset();
  });

  it("extracts profile fields correctly", () => {
    const result = _parsePingzhongdata(MOCK_PINGZHONGDATA);
    expect(result).not.toBeNull();
    expect(result!.profile).toEqual({
      code: "005827",
      name: "易方达蓝筹精选混合",
      sourceRate: "1.50",
      currentRate: "0.15",
      minPurchase: "10",
      return1m: "-4.69",
      return3m: "-4.44",
      return6m: "-12.97",
      return1y: "-6.52",
      unitNav: "1.0800",
      unitNavDate: "2021-01-03",
      accumulatedNav: "1.4800",
      fundType: null,
      fundCompany: null,
      fundManager: null,
      tradeStatus: null,
      fundScale: null,
    });
  });

  it("extracts ACWorthTrend as [timestamp, nav] pairs", () => {
    const result = _parsePingzhongdata(MOCK_PINGZHONGDATA);
    expect(result!.acWorthTrend).toEqual([
      [1609459200000, 1.5],
      [1609545600000, 1.52],
      [1609632000000, 1.48],
    ]);
  });

  it("extracts stockCodesNew", () => {
    const result = _parsePingzhongdata(MOCK_PINGZHONGDATA);
    expect(result!.stockCodes).toEqual(["116.00700", "1.600519", "0.000858"]);
  });

  it("parses fund overview fields from the fund profile page", () => {
    expect(_parseFundProfileHtml(MOCK_PROFILE_HTML)).toEqual({
      fundType: "指数型-其他",
      fundCompany: "华安基金",
      fundManager: "许之彦",
      fundScale: "107.76亿元",
    });
  });

  it("parses the trade status from the fund home page", () => {
    expect(_parseFundTradeStatusHtml(MOCK_TRADE_STATUS_HTML)).toBe("开放申购 开放赎回");
  });

  it("returns null when fS_code is missing", () => {
    const result = _parsePingzhongdata(`var fS_name = "test";`);
    expect(result).toBeNull();
  });

  it("returns null when fS_name is missing", () => {
    const result = _parsePingzhongdata(`var fS_code = "123456";`);
    expect(result).toBeNull();
  });

  it("handles missing optional fields gracefully", () => {
    const minimal = `
var fS_name = "TestFund";
var fS_code = "999999";
var Data_ACWorthTrend = [];
`;
    const result = _parsePingzhongdata(minimal);
    expect(result).not.toBeNull();
    expect(result!.profile.sourceRate).toBeNull();
    expect(result!.profile.currentRate).toBeNull();
    expect(result!.profile.return1m).toBeNull();
    expect(result!.profile.unitNav).toBeNull();
    expect(result!.profile.accumulatedNav).toBeNull();
    expect(result!.acWorthTrend).toEqual([]);
    expect(result!.stockCodes).toEqual([]);
  });

  it("keeps detail requests silent by default", async () => {
    mockedHttpGet
      .mockResolvedValueOnce({ data: MOCK_PINGZHONGDATA })
      .mockResolvedValueOnce({ data: MOCK_PROFILE_HTML })
      .mockResolvedValueOnce({ data: MOCK_TRADE_STATUS_HTML });

    await fetchFundDetail("005827");

    expect(mockedHttpGet).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/api/pingzhongdata/005827.js"),
      { responseType: "text", suppressToast: true },
    );
    expect(mockedHttpGet).toHaveBeenNthCalledWith(
      2,
      "/api/fundf10/jbgk_005827.html",
      { responseType: "text", suppressToast: true },
    );
    expect(mockedHttpGet).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("/api/fundpage/005827.html"),
      { responseType: "text", suppressToast: true },
    );
  });

  it("uses a non-silent request when explicitly retried", async () => {
    mockedHttpGet
      .mockResolvedValueOnce({ data: MOCK_PINGZHONGDATA })
      .mockResolvedValueOnce({ data: MOCK_PROFILE_HTML })
      .mockResolvedValueOnce({ data: MOCK_TRADE_STATUS_HTML });

    await fetchFundDetail("005827", { suppressToast: false });

    expect(mockedHttpGet).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/api/pingzhongdata/005827.js"),
      { responseType: "text", suppressToast: false },
    );
  });
});
