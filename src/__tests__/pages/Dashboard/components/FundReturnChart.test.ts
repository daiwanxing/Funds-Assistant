import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import type { ACWorthPoint } from "@/types/fund";

const setOptionMock = vi.fn();
const resizeMock = vi.fn();
const disposeMock = vi.fn();
const initMock = vi.fn(() => ({
  setOption: setOptionMock,
  resize: resizeMock,
  dispose: disposeMock,
}));

Object.defineProperty(HTMLElement.prototype, "clientWidth", {
  configurable: true,
  get() {
    return 320;
  },
});

Object.defineProperty(HTMLElement.prototype, "clientHeight", {
  configurable: true,
  get() {
    return 240;
  },
});

vi.mock("echarts/core", () => ({
  use: vi.fn(),
  init: initMock,
  graphic: {
    LinearGradient: class {
      constructor(...args: unknown[]) {
        return args;
      }
    },
  },
}));

const { default: FundReturnChart, createFundReturnChartOption } = await import(
  "@/pages/Dashboard/components/FundDetail/FundReturnChart"
);

const points: ACWorthPoint[] = [
  [1712534400000, 3.12],
  [1712620800000, 3.22],
  [1712707200000, 3.41],
];

describe("FundReturnChart", () => {
  beforeEach(() => {
    initMock.mockClear();
    setOptionMock.mockClear();
    resizeMock.mockClear();
    disposeMock.mockClear();
  });

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

  it("falls back to the chart library default animation timing", () => {
    const option = createFundReturnChartOption({
      chartData: points,
      period: "1m",
      isRising: true,
      lineColor: "#ff5a52",
      yAxisMin: 3,
      yAxisMax: 4,
    }) as {
      animationDuration?: number;
      animationDurationUpdate?: number;
      animationEasing?: string;
      animationEasingUpdate?: string;
    };

    expect(option.animationDuration).toBeUndefined();
    expect(option.animationDurationUpdate).toBeUndefined();
    expect(option.animationEasing).toBeUndefined();
    expect(option.animationEasingUpdate).toBeUndefined();
  });

  it("keeps the same chart instance and updates it smoothly when the period changes", async () => {
    const wrapper = mount(FundReturnChart, {
      props: {
        data: points,
        period: "1m",
        isRising: true,
      },
      attachTo: document.body,
    });

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(setOptionMock).toHaveBeenCalledTimes(1);

    await wrapper.setProps({
      period: "3m",
      data: [...points, [1712793600000, 3.5] as ACWorthPoint],
    });

    expect(disposeMock).not.toHaveBeenCalled();
    expect(initMock).toHaveBeenCalledTimes(1);
    expect(setOptionMock).toHaveBeenCalledTimes(2);
  });
});
