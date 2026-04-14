import { beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "@/api/http";
import {
  _extractIndustryContent,
  _parseHoldingsHtml,
  _parseIndustryHtml,
  fetchFundHoldings,
  fetchFundIndustry,
} from "@/api/fundHoldings";

vi.mock("@/api/http", () => ({
  http: {
    get: vi.fn(),
  },
}));

const mockedHttpGet = vi.mocked(http.get);

const MOCK_HTML = `
<div class='box'><div class='boxitem w790'>
<h4 class='t'><label class='left'><a title='易方达蓝筹精选混合' href='http://fund.eastmoney.com/005827.html'>易方达蓝筹精选混合</a>&nbsp;&nbsp;2025年4季度股票投资明细</label><label class='right lab2 xq505'>&nbsp;&nbsp;&nbsp;&nbsp;来源：天天基金&nbsp;&nbsp;&nbsp;&nbsp;截止至：<font class='px12'>2025-12-31</font></label></h4>
<div class='space0'></div>
<table class='w782 comm tzxq'>
<thead><tr><th class='first'>序号</th><th>股票代码</th><th>股票名称</th><th class='xglj'>相关资讯</th><th>占净值<br />比例</th><th class='cgs'>持股数<br />（万股）</th><th class='last ccs'>持仓市值<br />（万元）</th></tr></thead>
<tbody>
<tr><td>1</td><td><a href='//quote.eastmoney.com/unify/r/116.00700'>00700</a></td><td class='tol'><a href='//quote.eastmoney.com/unify/r/116.00700'>腾讯控股</a></td><td class='xglj'><a href='//guba.eastmoney.com/interface/GetList.aspx?code=116.00700' >股吧</a><a href='//quote.eastmoney.com/unify/r/116.00700' >行情</a></td><td class='tor'>9.88%</td><td class='tor'>825.00</td><td class='tor'>345,277.62</td></tr>
<tr><td>2</td><td><a href='//quote.eastmoney.com/unify/r/1.600519'>600519</a></td><td class='tol'><a href='//quote.eastmoney.com/unify/r/1.600519'>贵州茅台</a></td><td class='xglj'><a href='//guba.eastmoney.com/interface/GetList.aspx?code=1.600519' >股吧</a><a href='//quote.eastmoney.com/unify/r/1.600519' >行情</a></td><td class='tor'>8.12%</td><td class='tor'>225.05</td><td class='tor'>351,303.05</td></tr>
</tbody></table>
</div></div>
`;

const MOCK_ETF_HTML = `
<div class='box'><div class='boxitem w790'>
<h4 class='t'><label class='left'><a title='电网设备ETF国泰' href='http://fund.eastmoney.com/561380.html'>电网设备ETF国泰</a>&nbsp;&nbsp;2025年4季度股票投资明细</label><label class='right lab2 xq505'>&nbsp;&nbsp;&nbsp;&nbsp;来源：天天基金&nbsp;&nbsp;&nbsp;&nbsp;截止至：<font class='px12'>2025-12-31</font></label></h4>
<div class='space0'></div>
<table class='w782 comm tzxq'>
<thead><tr><th class='first'>序号</th><th>股票代码</th><th>股票名称</th><th>最新价</th><th>涨跌幅</th><th class='xglj'>相关资讯</th><th>占净值<br />比例</th><th class='cgs'>持股数<br />（万股）</th><th class='last ccs'>持仓市值<br />（万元）</th></tr></thead>
<tbody>
<tr><td>1</td><td><a href='//quote.eastmoney.com/unify/r/1.600089'>600089</a></td><td class='tol'><a href='//quote.eastmoney.com/unify/r/1.600089'>特变电工</a></td><td class='tor'><span data-id='dq600089'></span></td><td class='tor'><span data-id='zd600089'></span></td><td class='xglj'><a href='ccbdxq_561380_600089.html' class='red'>变动详情</a><a href='//guba.eastmoney.com/interface/GetList.aspx?code=1.600089' >股吧</a><a href='//quote.eastmoney.com/unify/r/1.600089' >行情</a></td><td class='tor'>9.76%</td><td class='tor'>242.51</td><td class='tor'>5,388.52</td></tr>
<tr><td>2</td><td><a href='//quote.eastmoney.com/unify/r/1.600406'>600406</a></td><td class='tol'><a href='//quote.eastmoney.com/unify/r/1.600406'>国电南瑞</a></td><td class='tor'><span data-id='dq600406'></span></td><td class='tor'><span data-id='zd600406'></span></td><td class='xglj'><a href='ccbdxq_561380_600406.html' class='red'>变动详情</a><a href='//guba.eastmoney.com/interface/GetList.aspx?code=1.600406' >股吧</a><a href='//quote.eastmoney.com/unify/r/1.600406' >行情</a></td><td class='tor'>9.51%</td><td class='tor'>233.64</td><td class='tor'>5,252.21</td></tr>
</tbody></table>
</div></div>
`;

const MOCK_INDUSTRY_RESPONSE = `
var apidata={ content:"<div class='box'><div class='boxitem w790'><h4 class='t'><label class='left'><a href='http://fund.eastmoney.com/561380.html'>电网设备ETF国泰</a>&nbsp;&nbsp;2025年4季度行业配置明细</label><label class='right lab2 xq656'>截止至：<font class='px12'>2025-12-31</font></label></h4><div class='space0'></div><table class='w782 comm hypz'><thead><tr><th class='first'>序号</th><th>行业类别</th><th>行业变动详情</th><th>占净值比例</th><th class='last'>市值（万元）</th><th>行业市盈率</th></tr></thead><tbody><tr><td>1</td><td class='tol'>制造业</td><td><a href='hybd_561380_C_new.html'>变动详情</a></td><td class='tor'>84.47%</td><td class='tor'>46,631.73</td><td><img class='link-syl-detial' data-indcode='C' data-Y='2025' data-Q='4' src='//j5.dfcfw.com/image/201610/20161012111631.jpg'></td></tr><tr><td>2</td><td class='tol'>信息传输、软件和信息技术服务业</td><td><a href='hybd_561380_I_new.html'>变动详情</a></td><td class='tor'>12.07%</td><td class='tor'>6,664.26</td><td><img class='link-syl-detial' data-indcode='I' data-Y='2025' data-Q='4' src='//j5.dfcfw.com/image/201610/20161012111631.jpg'></td></tr></tbody></table></div></div>",arryear:[2025]};
`;

const MOCK_MULTI_QUARTER_INDUSTRY_CONTENT = `
<div class='box'><div class='boxitem w790'><h4 class='t'><label class='left'>2025年4季度行业配置明细</label><label class='right lab2 xq656'>截止至：<font class='px12'>2025-12-31</font></label></h4><table class='w782 comm hypz'><tbody><tr><td>1</td><td class='tol'>制造业</td><td class='tor'>84.47%</td><td class='tor'>46,631.73</td></tr><tr><td>2</td><td class='tol'>信息传输、软件和信息技术服务业</td><td class='tor'>12.07%</td><td class='tor'>6,664.26</td></tr></tbody></table></div></div>
<div class='box'><div class='boxitem w790'><h4 class='t'><label class='left'>2025年3季度行业配置明细</label><label class='right lab2 xq656'>截止至：<font class='px12'>2025-09-30</font></label></h4><table class='w782 comm hypz'><tbody><tr><td>1</td><td class='tol'>制造业</td><td class='tor'>83.61%</td><td class='tor'>10,857.68</td></tr><tr><td>2</td><td class='tol'>采矿业</td><td class='tor'>2.14%</td><td class='tor'>277.95</td></tr></tbody></table></div></div>
`;

describe("parseHoldingsHtml", () => {
  beforeEach(() => {
    mockedHttpGet.mockReset();
  });

  it("extracts quarter and cutoff date", () => {
    const result = _parseHoldingsHtml(MOCK_HTML);
    expect(result).not.toBeNull();
    expect(result!.quarter).toBe("2025年4季度");
    expect(result!.cutoffDate).toBe("2025-12-31");
  });

  it("extracts holdings with correct fields", () => {
    const result = _parseHoldingsHtml(MOCK_HTML);
    expect(result!.holdings).toHaveLength(2);

    expect(result!.holdings[0]).toEqual({
      rank: 1,
      stockCode: "00700",
      stockName: "腾讯控股",
      marketCode: "116.00700",
      ratio: 9.88,
      shares: 825.00,
      marketValue: 345277.62,
    });

    expect(result!.holdings[1]).toEqual({
      rank: 2,
      stockCode: "600519",
      stockName: "贵州茅台",
      marketCode: "1.600519",
      ratio: 8.12,
      shares: 225.05,
      marketValue: 351303.05,
    });
  });

  it("returns null for empty/invalid HTML", () => {
    expect(_parseHoldingsHtml("")).toBeNull();
    expect(_parseHoldingsHtml("<div>no table</div>")).toBeNull();
  });

  it("extracts ETF holdings rows even when the table includes quote columns", () => {
    const result = _parseHoldingsHtml(MOCK_ETF_HTML);

    expect(result).not.toBeNull();
    expect(result!.quarter).toBe("2025年4季度");
    expect(result!.holdings).toHaveLength(2);
    expect(result!.holdings[0]).toEqual({
      rank: 1,
      stockCode: "600089",
      stockName: "特变电工",
      marketCode: "1.600089",
      ratio: 9.76,
      shares: 242.51,
      marketValue: 5388.52,
    });
  });

  it("extracts industry content from the Eastmoney wrapper payload", () => {
    const content = _extractIndustryContent(MOCK_INDUSTRY_RESPONSE);
    expect(content).toContain("2025年4季度行业配置明细");
    expect(content).toContain("制造业");
  });

  it("extracts industry rows from hypz content", () => {
    const result = _parseIndustryHtml(_extractIndustryContent(MOCK_INDUSTRY_RESPONSE));

    expect(result).not.toBeNull();
    expect(result!.quarter).toBe("2025年4季度");
    expect(result!.cutoffDate).toBe("2025-12-31");
    expect(result!.industries).toEqual([
      {
        rank: 1,
        name: "制造业",
        ratio: 84.47,
        marketValue: 46631.73,
      },
      {
        rank: 2,
        name: "信息传输、软件和信息技术服务业",
        ratio: 12.07,
        marketValue: 6664.26,
      },
    ]);
  });

  it("only keeps the latest quarter when multiple industry tables are present", () => {
    const result = _parseIndustryHtml(MOCK_MULTI_QUARTER_INDUSTRY_CONTENT);

    expect(result).not.toBeNull();
    expect(result!.quarter).toBe("2025年4季度");
    expect(result!.cutoffDate).toBe("2025-12-31");
    expect(result!.industries).toEqual([
      {
        rank: 1,
        name: "制造业",
        ratio: 84.47,
        marketValue: 46631.73,
      },
      {
        rank: 2,
        name: "信息传输、软件和信息技术服务业",
        ratio: 12.07,
        marketValue: 6664.26,
      },
    ]);
  });

  it("keeps holdings requests silent by default", async () => {
    mockedHttpGet.mockResolvedValueOnce({ data: MOCK_HTML });

    await fetchFundHoldings("005827");

    expect(mockedHttpGet).toHaveBeenCalledWith(
      "/api/fundf10/FundArchivesDatas.aspx",
      expect.objectContaining({
        responseType: "text",
        suppressToast: true,
      }),
    );
  });

  it("keeps industry requests silent by default", async () => {
    mockedHttpGet.mockResolvedValueOnce({ data: MOCK_INDUSTRY_RESPONSE });

    await fetchFundIndustry("561380");

    expect(mockedHttpGet).toHaveBeenCalledWith(
      "/api/fundf10/F10DataApi.aspx",
      expect.objectContaining({
        responseType: "text",
        suppressToast: true,
      }),
    );
  });
});
