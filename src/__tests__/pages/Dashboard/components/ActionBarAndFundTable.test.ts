import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ActionBar from "@/pages/Dashboard/components/ActionBar/ActionBar.vue";
import FundTable from "@/pages/Dashboard/components/FundTable/FundTable.vue";
import type { FundItem } from "@/types";

const createFund = (overrides: Partial<FundItem> = {}): FundItem => ({
  fundcode: "110020",
  name: "景顺长城品质长青混合A",
  jzrq: "2026-04-11",
  dwjz: 1.2345,
  gsz: 1.2488,
  gszzl: 1.12,
  gztime: "2026-04-11 14:35",
  num: 1000,
  cost: 1.1,
  amount: 1248.8,
  gains: 13.2,
  costGains: 148.8,
  costGainsRate: 13.53,
  ...overrides,
});

describe("ActionBar", () => {
  it("renders semantic toolbar structure and summary pills", () => {
    const wrapper = mount(ActionBar, {
      props: {
        isEdit: false,
        isDuring: true,
        isLiveUpdate: true,
        showCost: true,
        showGains: true,
        allGains: [123.45, 1.23] as const,
        allCostGains: [-67.89, -0.56] as const,
      },
    });

    expect(wrapper.find(".action-bar").exists()).toBe(true);
    expect(wrapper.find(".action-bar__controls").exists()).toBe(true);
    expect(wrapper.findAll(".action-bar__button")).toHaveLength(6);
    expect(wrapper.find(".action-bar__button--reward").exists()).toBe(true);
    expect(wrapper.find(".action-bar__summary").exists()).toBe(true);
    expect(wrapper.find(".action-bar__metric--positive").exists()).toBe(true);
    expect(wrapper.find(".action-bar__metric--negative").exists()).toBe(true);
    expect(wrapper.find(".action-bar__refresh").exists()).toBe(true);
  });
});

describe("FundTable", () => {
  it("renders semantic table structure for watchlist rows", () => {
    const wrapper = mount(FundTable, {
      props: {
        dataList: [
          createFund(),
          createFund({
            fundcode: "161725",
            name: "招商中证白酒指数A",
            gszzl: -0.87,
            gains: -12.34,
            costGains: -88.2,
            costGainsRate: -6.14,
          }),
        ],
        isEdit: false,
        darkMode: true,
        loadingList: false,
        showGSZ: true,
        showAmount: true,
        showGains: true,
        showCost: true,
        showCostRate: true,
        badgeContent: 0,
        realtimeFundcode: null,
        sortType: {
          gszzl: "",
          amount: "",
          gains: "",
          costGains: "",
          costGainsRate: "",
        },
      },
      global: {
        directives: {
          loading: {},
        },
      },
    });

    expect(wrapper.find(".fund-table").exists()).toBe(true);
    expect(wrapper.find(".fund-table__table").exists()).toBe(true);
    expect(wrapper.findAll(".fund-table__row")).toHaveLength(2);
    expect(wrapper.find(".fund-table__cell--positive").exists()).toBe(true);
    expect(wrapper.find(".fund-table__cell--negative").exists()).toBe(true);
    expect(wrapper.text()).toContain("基金名称（2）");
    expect(wrapper.text()).toContain("招商中证白酒指数A");
  });
});
