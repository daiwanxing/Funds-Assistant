import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import FundDetailHero from "@/pages/Dashboard/components/FundDetail/FundDetailHero";
import type { FundProfile } from "@/types/fund";

const createProfile = (): FundProfile => ({
  code: "018124",
  name: "永赢先进制造智选混合发起A",
  sourceRate: "1.50",
  currentRate: "0.15",
  minPurchase: "10.00",
  return1m: "-3.42",
  return3m: "+8.17",
  return6m: "-2.05",
  return1y: "+15.63",
  unitNav: "2.2579",
  unitNavDate: "2026-04-09",
  accumulatedNav: "2.2579",
  fundType: "混合型-偏股",
  fundCompany: "永赢基金",
  fundManager: "张璐",
  tradeStatus: "开放申购 开放赎回",
  fundScale: "39.92亿元",
});

describe("FundDetailHero", () => {
  it("renders badges beside the title and removes the metric meta row", () => {
    const wrapper = mount(FundDetailHero, {
      props: {
        profile: createProfile(),
        latestNav: 2.2579,
        periodReturn: -7.68,
        periodLabel: "6个月",
        isRising: false,
        isWatchlisted: false,
        categoryLabel: "混合型-偏股",
        valueLabel: "净值",
        metaTags: ["高弹性风格"],
      },
    });

    const titleRow = wrapper.get(".fund-detail-hero__title-row");
    const metrics = wrapper.get(".fund-detail-hero__metrics");
    const metaRow = wrapper.get(".fund-detail-hero__meta-row");

    expect(titleRow.text()).toContain("永赢先进制造智选混合发起A");
    expect(titleRow.text()).toContain("018124");
    expect(titleRow.text()).toContain("混合型-偏股");
    expect(titleRow.text()).toContain("高弹性风格");
    expect(metrics.text()).toContain("2.2579");
    expect(metrics.text()).toContain("-7.68%");
    expect(metrics.text()).not.toContain("6个月");
    expect(wrapper.find(".fund-detail-hero__metric-meta").exists()).toBe(false);

    const identity = wrapper.get(".fund-detail-hero__identity");
    expect(identity.element.firstElementChild).toBe(titleRow.element);
    expect(titleRow.element.nextElementSibling).toBe(metrics.element);
    expect(metaRow.element.parentElement).toBe(titleRow.element);
  });
});
