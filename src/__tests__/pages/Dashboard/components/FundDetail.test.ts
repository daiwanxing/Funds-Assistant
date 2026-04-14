import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import FundDetail from "@/pages/Dashboard/components/FundDetail/FundDetail";
import type { ACWorthPoint, FundHoldingItem, FundIndustryItem, FundProfile } from "@/types/fund";

const createProfile = (): FundProfile => ({
  code: "110020",
  name: "易方达消费行业股票",
  sourceRate: "1.50",
  currentRate: "0.15",
  minPurchase: "10.00",
  return1m: "-3.42",
  return3m: "+8.17",
  return6m: "-2.05",
  return1y: "+15.63",
  unitNav: "3.5964",
  unitNavDate: "2026-04-09",
  accumulatedNav: "3.5964",
  fundType: "指数型-其他",
  fundCompany: "华安基金",
  fundManager: "许之彦",
  tradeStatus: "开放申购 开放赎回",
  fundScale: "107.76亿元",
});

const detailState = {
  profile: ref<FundProfile | null>(createProfile()),
  filteredTrend: ref<ACWorthPoint[]>([
    [1712534400000, 3.12],
    [1712620800000, 3.22],
    [1712707200000, 3.41],
  ]),
  periodReturn: ref(0.78),
  periodLabel: ref("过去 6 月"),
  isRising: ref(true),
  latestNav: ref(3.412),
  period: ref("6m"),
  setPeriod: vi.fn(),
  isLoading: ref(false),
  isError: ref(false),
  retry: vi.fn(),
};

vi.mock("@/composables/fund/useFundDetail", () => ({
  useFundDetail: () => detailState,
}));

const holdingsState = {
  holdings: ref<FundHoldingItem[]>([
    {
      rank: 1,
      stockCode: "600519",
      stockName: "贵州茅台",
      marketCode: "SH",
      ratio: 9.74,
      shares: 100,
      marketValue: 1000,
    },
  ]),
  quarter: ref("2025Q4"),
  industries: ref<FundIndustryItem[]>([
    {
      rank: 1,
      name: "食品饮料",
      ratio: 58.1,
      marketValue: 1000,
    },
  ]),
  industryQuarter: ref("2025Q4"),
  isLoading: ref(false),
  isError: ref(false),
  retry: vi.fn(),
};

vi.mock("@/composables/fund/useFundHoldings", () => ({
  useFundHoldings: () => holdingsState,
}));

describe("FundDetail", () => {
  beforeEach(() => {
    detailState.profile.value = createProfile();
    detailState.filteredTrend.value = [
      [1712534400000, 3.12],
      [1712620800000, 3.22],
      [1712707200000, 3.41],
    ];
    detailState.periodReturn.value = 0.78;
    detailState.periodLabel.value = "过去 6 月";
    detailState.isRising.value = true;
    detailState.latestNav.value = 3.412;
    detailState.period.value = "6m";
    detailState.isLoading.value = false;
    detailState.isError.value = false;
    detailState.retry.mockReset();
    holdingsState.holdings.value = [
      {
        rank: 1,
        stockCode: "600519",
        stockName: "贵州茅台",
        marketCode: "SH",
        ratio: 9.74,
        shares: 100,
        marketValue: 1000,
      },
    ];
    holdingsState.quarter.value = "2025Q4";
    holdingsState.industries.value = [
      {
        rank: 1,
        name: "食品饮料",
        ratio: 58.1,
        marketValue: 1000,
      },
    ];
    holdingsState.industryQuarter.value = "2025Q4";
    holdingsState.isLoading.value = false;
    holdingsState.isError.value = false;
    holdingsState.retry.mockReset();
  });

  it("renders fund-detail tabs and only shows the active panel", async () => {
    const wrapper = mount(FundDetail, {
      props: {
        code: "110020",
        isWatchlisted: true,
      },
      global: {
        stubs: {
          FundDetailHero: {
            props: ["isWatchlisted"],
            template: "<div data-test='hero-stub'>{{ isWatchlisted ? 'yes' : 'no' }}</div>",
          },
          FundReturnChart: {
            template: "<div data-test='chart-stub'>chart</div>",
          },
        },
      },
    });

    expect(wrapper.find("[data-test='fund-detail-main']").exists()).toBe(true);
    expect(wrapper.find("[data-test='hero-stub']").text()).toBe("yes");
    expect(wrapper.find("[data-test='fund-detail-main']").text()).toContain("chart");
    expect(wrapper.text()).toContain("业绩走势");
    expect(wrapper.text()).toContain("持仓明细");
    expect(wrapper.find("[data-test='fund-detail-tabs-indicator']").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("交易状态");

    await wrapper.get("[data-test='fund-detail-tab-positions']").trigger("click");

    expect(wrapper.find("[data-test='chart-stub']").exists()).toBe(false);
    expect(wrapper.find("[data-test='fund-detail-overview-rail']").exists()).toBe(true);
    expect(wrapper.text()).toContain("交易状态");
    expect(wrapper.text()).toContain("基金经理");
    expect(wrapper.text()).toContain("基金规模");
    expect(wrapper.text()).toContain("单位净值");
    expect(wrapper.text()).toContain("累计净值");
    expect(wrapper.text()).toContain("基金公司");
    expect(wrapper.text()).toContain("贵州茅台");
    expect(wrapper.text()).toContain("食品饮料");
  });

  it("shows an empty industry state when industry data is unavailable", async () => {
    holdingsState.industries.value = [];

    const wrapper = mount(FundDetail, {
      props: {
        code: "110020",
      },
      global: {
        stubs: {
          FundDetailHero: true,
          FundReturnChart: true,
        },
      },
    });

    await wrapper.get("[data-test='fund-detail-tab-positions']").trigger("click");
    expect(wrapper.text()).toContain("当前基金暂未披露可用的行业配置数据");
  });

  it("renders a retry action when the detail request fails", async () => {
    detailState.profile.value = null;
    detailState.isError.value = true;

    const wrapper = mount(FundDetail, {
      props: {
        code: "110020",
      },
    });

    await wrapper.get("[data-test='fund-detail-retry']").trigger("click");

    expect(wrapper.text()).toContain("重试");
    expect(detailState.retry).toHaveBeenCalledTimes(1);
  });
});
