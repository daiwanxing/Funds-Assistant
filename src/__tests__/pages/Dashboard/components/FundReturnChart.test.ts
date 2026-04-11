import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import FundReturnChart, { createFundReturnChartOption } from "@/pages/Dashboard/components/FundDetail/FundReturnChart";
import type { ACWorthPoint } from "@/types/fund";

const points: ACWorthPoint[] = [
  [1712534400000, 3.12],
  [1712620800000, 3.22],
  [1712707200000, 3.41],
];

describe("FundReturnChart", () => {
  it("renders the expanded period button set", () => {
    const wrapper = mount(FundReturnChart, {
      props: {
        data: points,
        period: "1m",
        isRising: true,
      },
    });

    expect(wrapper.text()).not.toContain("1天");
    expect(wrapper.text()).toContain("1周");
    expect(wrapper.text()).toContain("1个月");
    expect(wrapper.text()).toContain("10年");
    expect(wrapper.text()).not.toContain("全部");
    expect(wrapper.text()).not.toContain("起点");
    expect(wrapper.text()).not.toContain("最高");
    expect(wrapper.text()).not.toContain("最低");
    expect(wrapper.text()).not.toContain("过去 1 个月");
  });

  it("disables chart grid lines for a cleaner plot", () => {
    const option = createFundReturnChartOption({
      chartData: points,
      period: "1m",
      isRising: true,
      lineColor: "#ff5a52",
      yAxisMin: 3,
      yAxisMax: 4,
    });

    const axes = option as {
      xAxis?: { splitLine?: { show?: boolean } };
      yAxis?: { splitLine?: { show?: boolean } };
    };
    expect(axes.xAxis?.splitLine?.show).toBe(false);
    expect(axes.yAxis?.splitLine?.show).toBe(false);
  });
});
