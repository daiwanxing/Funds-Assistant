import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import FundAiPlaceholder from "@/pages/Dashboard/components/FundDetail/FundAiPlaceholder";
import FundDetailInfoGroup from "@/pages/Dashboard/components/FundDetail/FundDetailInfoGroup";
import FundOverview from "@/pages/Dashboard/components/FundDetail/FundOverview";
import FundDetailSidebar from "@/pages/Dashboard/components/FundDetail/FundDetailSidebar";
import type { FundProfile } from "@/types/fund";

const profile: FundProfile = {
  code: "110020",
  name: "测试基金",
  sourceRate: "1.50",
  currentRate: "0.15",
  minPurchase: "10",
  return1m: "1.23",
  return3m: "-2.34",
  return6m: "5.67",
  return1y: "-8.90",
  unitNav: "1.2345",
  unitNavDate: "2026-04-11",
  accumulatedNav: "3.4567",
  fundType: "混合型",
  fundCompany: "测试基金公司",
  fundManager: "测试经理",
  tradeStatus: "开放申购",
  fundScale: "123.45亿元",
};

describe("Fund detail supplementary blocks", () => {
  it("renders semantic structure for ai placeholder", () => {
    const wrapper = mount(FundAiPlaceholder);

    expect(wrapper.find(".fund-ai-placeholder").exists()).toBe(true);
    expect(wrapper.find(".fund-ai-placeholder__icon-shell").exists()).toBe(true);
    expect(wrapper.text()).toContain("AI 分析功能开发中");
  });

  it("renders semantic info group items with tone modifiers", () => {
    const wrapper = mount(FundDetailInfoGroup, {
      props: {
        title: "交易信息",
        items: [
          { label: "最新收益", value: "+1.23%", tone: "positive" },
          { label: "近1年", value: "-8.90%", tone: "negative" },
        ],
      },
    });

    expect(wrapper.find(".fund-detail-info-group").exists()).toBe(true);
    expect(wrapper.find(".fund-detail-info-group__grid").exists()).toBe(true);
    expect(wrapper.findAll(".fund-detail-info-group__item")).toHaveLength(2);
    expect(wrapper.find(".fund-detail-info-group__value--positive").exists()).toBe(true);
    expect(wrapper.find(".fund-detail-info-group__value--negative").exists()).toBe(true);
  });

  it("renders overview rows with semantic classes and return tones", () => {
    const wrapper = mount(FundOverview, {
      props: {
        profile,
      },
    });

    expect(wrapper.find(".fund-overview").exists()).toBe(true);
    expect(wrapper.find(".fund-overview__rows").exists()).toBe(true);
    expect(wrapper.findAll(".fund-overview__row")).toHaveLength(4);
    expect(wrapper.find(".fund-overview__value--positive").exists()).toBe(true);
    expect(wrapper.find(".fund-overview__value--negative").exists()).toBe(true);
    expect(wrapper.text()).toContain("基金概况");
  });

  it("renders sidebar rows with semantic classes", () => {
    const wrapper = mount(FundDetailSidebar, {
      props: {
        profile,
      },
    });

    expect(wrapper.find("[data-test='fund-detail-sidebar']").exists()).toBe(true);
    expect(wrapper.find(".fund-detail-sidebar").exists()).toBe(true);
    expect(wrapper.find(".fund-detail-sidebar__card").exists()).toBe(true);
    expect(wrapper.findAll(".fund-detail-sidebar__row")).toHaveLength(7);
    expect(wrapper.text()).toContain("单位净值");
    expect(wrapper.text()).toContain("测试基金公司");
  });
});
