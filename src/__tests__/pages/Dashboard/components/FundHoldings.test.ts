import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import FundHoldings from "@/pages/Dashboard/components/FundDetail/FundHoldings.vue";
import type { FundHoldingItem } from "@/types/fund";

const createHolding = (
  rank: number,
  stockName: string,
  ratio: number,
  marketCode = "1.600000",
): FundHoldingItem => ({
  rank,
  stockCode: `60000${rank}`,
  stockName,
  marketCode,
  ratio,
  shares: 100 + rank,
  marketValue: 200 + rank,
});

const holdingsState = {
  holdings: ref<FundHoldingItem[]>([
    createHolding(1, "贵州茅台", 9.8),
    createHolding(2, "腾讯控股", 8.4, "116.00700"),
    createHolding(3, "宁德时代", 6.2, "0.300750"),
  ]),
  quarter: ref("2025年4季度"),
  maxRatio: ref(9.8),
  isLoading: ref(false),
  isError: ref(false),
};

vi.mock("@/composables/fund/useFundHoldings", () => ({
  useFundHoldings: () => holdingsState,
}));

describe("FundHoldings", () => {
  beforeEach(() => {
    holdingsState.holdings.value = [
      createHolding(1, "贵州茅台", 9.8),
      createHolding(2, "腾讯控股", 8.4, "116.00700"),
      createHolding(3, "宁德时代", 6.2, "0.300750"),
    ];
    holdingsState.quarter.value = "2025年4季度";
    holdingsState.maxRatio.value = 9.8;
    holdingsState.isLoading.value = false;
    holdingsState.isError.value = false;
  });

  it("renders an always-visible bottom strip layout for holdings", () => {
    const wrapper = mount(FundHoldings, {
      props: {
        code: "110020",
      },
    });

    expect(wrapper.find("[data-test='fund-holdings-strip']").exists()).toBe(true);
    expect(wrapper.find(".fund-holdings").exists()).toBe(true);
    expect(wrapper.find(".fund-holdings__grid").exists()).toBe(true);
    expect(wrapper.findAll("[data-test='fund-holding-item']")).toHaveLength(3);
    expect(wrapper.text()).toContain("2025年4季度");
    expect(wrapper.text()).toContain("前3合计占比");
  });
});
