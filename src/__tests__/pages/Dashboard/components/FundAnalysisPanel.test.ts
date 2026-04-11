import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import FundAnalysisPanel from "@/pages/Dashboard/components/FundDetail/FundAnalysisPanel.vue";
import type { FundHoldingItem, FundIndustryItem } from "@/types/fund";

const createHolding = (
  rank: number,
  stockName: string,
  ratio: number,
  change: number,
): FundHoldingItem & { change: number } => ({
  rank,
  stockCode: `60000${rank}`,
  stockName,
  marketCode: "1.600000",
  ratio,
  shares: 100 + rank,
  marketValue: 200 + rank,
  change,
});

const industries: FundIndustryItem[] = [
  { rank: 1, name: "制造业", ratio: 84.47, marketValue: 46631.73 },
  { rank: 2, name: "信息传输、软件和信息技术服务业", ratio: 12.07, marketValue: 6664.26 },
];

describe("FundAnalysisPanel", () => {
  it("renders holding rows together with real industry allocation data", () => {
    const wrapper = mount(FundAnalysisPanel, {
      props: {
        holdings: [
          createHolding(1, "山东黄金", 13.3, 1.5),
          createHolding(2, "中国铝业", 4.47, -1.62),
          createHolding(3, "铜陵有色", 6.3, 5.48),
          createHolding(4, "紫金矿业", 5.1, -0.54),
        ],
        quarter: "2025年4季度",
        industries,
        industryQuarter: "2025年4季度",
      },
    });

    expect(wrapper.text()).toContain("持仓明细");
    expect(wrapper.text()).toContain("AI 分析");
    expect(wrapper.text()).toContain("BETA");
    expect(wrapper.text()).toContain("全宽重仓信念榜");
    expect(wrapper.text()).toContain("行业拆解已接通");
    expect(wrapper.text()).toContain("制造业");
    expect(wrapper.text()).toContain("84.47%");
    expect(wrapper.findAll("[data-test='holding-leader-card']")).toHaveLength(3);
    expect(wrapper.findAll("[data-test='holding-row']")).toHaveLength(1);
    expect(wrapper.text()).not.toContain("行业配置");
  });

  it("shows compact empty-state messaging without a dead industry panel when data is unavailable", () => {
    const wrapper = mount(FundAnalysisPanel, {
      props: {
        holdings: [],
        quarter: "",
        industries: [],
        industryQuarter: "",
      },
    });

    expect(wrapper.text()).toContain("持仓明细");
    expect(wrapper.text()).toContain("该基金暂无股票重仓披露");
    expect(wrapper.text()).toContain("行业拆解待补齐");
    expect(wrapper.findAll("[data-test='holding-leader-card']")).toHaveLength(0);
    expect(wrapper.findAll("[data-test='holding-row']")).toHaveLength(0);
    expect(wrapper.text()).not.toContain("当前暂无行业配置数据");
  });
});
