import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent, ref, nextTick, reactive } from "vue";
import HomePage from "@/pages/Dashboard/HomePage.vue";
import FundSavedList from "@/pages/Dashboard/components/FundSavedList";
import type { FundItem, FundListItem } from "@/types/fund";

const settingsState = {
  isReady: ref(false),
  isEdit: ref(false),
  userId: ref("user-1"),
  sortTypeObj: ref({ name: null, type: null } as { name: string | null; type: string | null }),
  RealtimeFundcode: ref<string | null>(null),
  load: vi.fn(),
  updatePreference: vi.fn(),
};

const fundDataState = {
  dataList: ref<FundItem[]>([]),
  dataListDft: ref<FundItem[]>([]),
  allGains: ref([0, 0] as const),
  allCostGains: ref([0, 0] as const),
  fetchData: vi.fn(),
  addFund: vi.fn(),
  deleteFund: vi.fn(),
  updateFundNum: vi.fn(),
  updateFundCost: vi.fn(),
  loading: ref(false),
  loadingList: ref(false),
};

const authIsAuthenticated = ref(false);
const authBootstrapIsPending = ref(false);

const authState = {
  bootstrap: {
    refetch: vi.fn(),
    isPending: authBootstrapIsPending,
  },
  get isAuthenticated() {
    return authIsAuthenticated.value;
  },
};

const watchlistItems = ref<FundListItem[]>([]);
const watchlistShouldShowImportPrompt = ref(false);
const watchlistGuestItemsBeforeLogin = ref<FundListItem[]>([]);

const watchlistState = reactive({
  get items() {
    return watchlistItems.value;
  },
  get shouldShowImportPrompt() {
    return watchlistShouldShowImportPrompt.value;
  },
  get guestItemsBeforeLogin() {
    return watchlistGuestItemsBeforeLogin.value;
  },
  replaceAll: vi.fn(),
  addFund: vi.fn(),
  removeFund: vi.fn(),
  updateFund: vi.fn(),
  importGuestFunds: vi.fn(),
  dismissImportPrompt: vi.fn(),
});

const globalIndicesState = {
  dataList: ref([]),
  isLoading: ref(false),
  refetch: vi.fn(),
};

const searchOptionsState = ref<{ label: string; value: string; desc?: string }[]>([]);
const searchLoadingState = ref(false);

const holidayState = {
  loadFromStorage: vi.fn(),
};

vi.mock("@/composables/preferences", () => ({
  usePreferences: () => settingsState,
}));

vi.mock("@/composables/fund", () => ({
  useFundData: vi.fn((watchlistRef) => {
    capturedWatchlistRef = watchlistRef;
    return fundDataState;
  }),
}));

vi.mock("@/composables/index", () => ({
  useGlobalIndices: () => globalIndicesState,
}));

vi.mock("@/composables/holiday", () => ({
  useHoliday: () => holidayState,
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => authState,
}));

vi.mock("@/stores/watchlist", () => ({
  useWatchlistStore: () => watchlistState,
}));

vi.mock("@/composables/fund/useFundSearch", () => ({
  useFundSearch: () => ({
    searchOptions: searchOptionsState,
    loading: searchLoadingState,
    error: ref(null),
  }),
}));

vi.mock("@/utils/marketStatus", async () => {
  const actual = await vi.importActual<typeof import("@/utils/marketStatus")>(
    "@/utils/marketStatus",
  );

  return {
    ...actual,
    loadHoliday: vi.fn().mockResolvedValue(undefined),
  };
});

let capturedWatchlistRef: { value: FundListItem[] } | undefined;

const WatchlistHeaderStub = defineComponent({
  name: "WatchlistHeader",
  props: {
    query: {
      type: String,
      default: "",
    },
    savedCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:query"],
  template: `
    <div>
      <div data-test='saved-count'>{{ savedCount }}</div>
      <input
        data-test="search-query"
        :value="query"
        @input="$emit('update:query', $event.target.value)"
      />
    </div>
  `,
});

const FundSearchListStub = defineComponent({
  name: "FundSearchList",
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    activeCode: {
      type: String,
      default: null,
    },
  },
  emits: ["select"],
  methods: {
    getItemValue(item: { value: string }) {
      return item.value;
    },
    getItemLabel(item: { label: string }) {
      return item.label;
    },
  },
  template: `
    <div data-test="search-list">
      <div data-test="search-active-code">{{ activeCode }}</div>
      <button
        v-for="item in options"
        :key="getItemValue(item)"
        type="button"
        :data-test="'search-select-' + getItemValue(item)"
        @click="$emit('select', getItemValue(item))"
      >
        {{ getItemLabel(item) }}
      </button>
    </div>
  `,
});

const FundDetailStub = defineComponent({
  name: "FundDetail",
  props: {
    code: {
      type: String,
      default: null,
    },
    isWatchlisted: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["toggle-watchlist"],
  template: `
    <div data-test="detail-panel">
      <div data-test="detail-code">{{ code }}</div>
      <div data-test="detail-watchlisted">{{ isWatchlisted ? 'yes' : 'no' }}</div>
      <button data-test="detail-toggle" type="button" @click="$emit('toggle-watchlist')">toggle</button>
    </div>
  `,
});

const GuestImportDialogStub = defineComponent({
  name: "GuestImportDialog",
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    guestCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ["confirm", "cancel"],
  template: `
    <div v-if="open">
      <button data-test="confirm-import" @click="$emit('confirm')">confirm {{ guestCount }}</button>
      <button data-test="cancel-import" @click="$emit('cancel')">cancel</button>
    </div>
  `,
});

const createFundItem = (fundcode: string): FundItem => ({
  fundcode,
  name: `基金${fundcode}`,
  jzrq: "2026-03-28",
  dwjz: 1,
  gsz: 1,
  gszzl: 0,
  gztime: "2026-03-28 15:00",
  num: 0,
  cost: 0,
  amount: 0,
  gains: 0,
  costGains: 0,
  costGainsRate: 0,
});

const mountPage = async () => {
  const wrapper = mount(HomePage, {
    global: {
      stubs: {
        GlobalTicker: { template: "<div />" },
        StatusBar: { template: "<div />" },
        UserBar: { template: "<div />" },
        FundDetail: FundDetailStub,
        WatchlistHeader: WatchlistHeaderStub,
        FundSearchList: FundSearchListStub,
        GuestImportDialog: GuestImportDialogStub,
      },
    },
  });

  await flushPromises();
  await nextTick();

  return wrapper;
};

describe("HomePage selection behavior", () => {
  beforeEach(() => {
    settingsState.isReady.value = false;
    settingsState.isEdit.value = false;
    settingsState.RealtimeFundcode.value = null;
    settingsState.load.mockReset();
    settingsState.updatePreference.mockReset();
    settingsState.load.mockImplementation(async () => {
      settingsState.isReady.value = true;
    });
    settingsState.updatePreference.mockImplementation((key, value) => {
      if (key === "RealtimeFundcode") {
        settingsState.RealtimeFundcode.value = value as string | null;
      }
    });

    fundDataState.fetchData.mockReset();
    fundDataState.addFund.mockReset();
    fundDataState.deleteFund.mockReset();
    fundDataState.dataList.value = [];
    fundDataState.dataListDft.value = [];
    fundDataState.allGains.value = [0, 0];
    fundDataState.allCostGains.value = [0, 0];
    fundDataState.loadingList.value = false;
    fundDataState.addFund.mockImplementation((codes: string[]) => {
      codes.forEach((code) => {
        if (!watchlistItems.value.some((item) => item.code === code)) {
          watchlistItems.value = [...watchlistItems.value, { code, num: 0, cost: 0 }];
        }
      });
    });
    fundDataState.deleteFund.mockImplementation((code: string) => {
      watchlistItems.value = watchlistItems.value.filter((item) => item.code !== code);
    });

    globalIndicesState.refetch.mockReset();
    holidayState.loadFromStorage.mockReset();
    authState.bootstrap.refetch.mockReset();
    authBootstrapIsPending.value = false;
    authIsAuthenticated.value = false;

    watchlistItems.value = [];
    watchlistShouldShowImportPrompt.value = false;
    watchlistGuestItemsBeforeLogin.value = [];
    watchlistState.replaceAll.mockReset();
    watchlistState.addFund.mockReset();
    watchlistState.removeFund.mockReset();
    watchlistState.updateFund.mockReset();
    watchlistState.importGuestFunds.mockReset();
    watchlistState.dismissImportPrompt.mockReset();
    watchlistState.addFund.mockImplementation((codes: string[]) => {
      codes.forEach((code) => {
        if (!watchlistItems.value.some((item) => item.code === code)) {
          watchlistItems.value = [...watchlistItems.value, { code, num: 0, cost: 0 }];
        }
      });
    });
    watchlistState.removeFund.mockImplementation((code: string) => {
      watchlistItems.value = watchlistItems.value.filter((item) => item.code !== code);
    });
    searchOptionsState.value = [];
    searchLoadingState.value = false;

    capturedWatchlistRef = undefined;
  });

  it("uses watchlist store items as the active source", async () => {
    watchlistItems.value = [
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ];
    fundDataState.dataList.value = [createFundItem("000001"), createFundItem("000002")];
    fundDataState.dataListDft.value = [createFundItem("000001"), createFundItem("000002")];

    const wrapper = await mountPage();

    expect(capturedWatchlistRef?.value).toEqual([
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ]);
    expect(wrapper.get("[data-test='saved-count']").text()).toBe("2");

    const savedList = wrapper.getComponent(FundSavedList);
    expect(savedList.props("activeCode")).toBe("000001");
  });

  it("does not render the floating AI button", async () => {
    watchlistItems.value = [{ code: "000001", num: 0 }];
    fundDataState.dataList.value = [createFundItem("000001")];
    fundDataState.dataListDft.value = [createFundItem("000001")];

    const wrapper = await mountPage();

    expect(wrapper.find(".ai-fab").exists()).toBe(false);
    expect(wrapper.find('button[title="AI 洞察"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain("AI 决策占位");
  });

  it("uses a two-column semantic shell with the personal info panel fixed at the aside bottom", async () => {
    const wrapper = await mountPage();

    expect(wrapper.find(".dashboard-page__ticker").exists()).toBe(true);
    expect(wrapper.find(".dashboard-page__sidebar").exists()).toBe(true);
    expect(wrapper.find(".dashboard-page__detail").exists()).toBe(true);
    expect(wrapper.find(".dashboard-page__sidebar-body").exists()).toBe(true);
    expect(wrapper.find(".dashboard-page__sidebar-footer").exists()).toBe(true);
    expect(wrapper.find("footer").exists()).toBe(false);
    expect(wrapper.find(".status-bar").exists()).toBe(false);
  });

  it("shows loading state instead of empty state while the first saved-fund request is pending", async () => {
    watchlistItems.value = [{ code: "000001", num: 0 }];
    fundDataState.loadingList.value = true;
    fundDataState.dataList.value = [];
    fundDataState.dataListDft.value = [];

    const wrapper = await mountPage();

    expect(wrapper.text()).not.toContain("添加你的第一只基金");
    expect(wrapper.text()).toContain("正在同步自选基金");
  });

  it("keeps the dashboard shell visible while preferences are still booting", async () => {
    settingsState.load.mockImplementation(() => new Promise(() => {}));
    settingsState.isReady.value = false;
    authBootstrapIsPending.value = true;

    const wrapper = await mountPage();

    expect(wrapper.get("[data-test='saved-count']").text()).toBe("0");
    expect(wrapper.text()).toContain("正在同步自选基金");
    expect(wrapper.text()).not.toContain("自选列表为空");
  });

  it("switches to cloud watchlist when authenticated", async () => {
    authIsAuthenticated.value = true;
    watchlistItems.value = [
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ];
    fundDataState.dataList.value = [createFundItem("000001"), createFundItem("000002")];
    fundDataState.dataListDft.value = [createFundItem("000001"), createFundItem("000002")];

    const wrapper = await mountPage();

    expect(capturedWatchlistRef?.value).toEqual([
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ]);
    expect(wrapper.get("[data-test='saved-count']").text()).toBe("2");
    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBe("000001");
  });

  it("falls back to the first remaining fund when the current selection disappears", async () => {
    watchlistItems.value = [
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ];
    settingsState.RealtimeFundcode.value = "000002";
    fundDataState.dataList.value = [createFundItem("000001"), createFundItem("000002")];
    fundDataState.dataListDft.value = [createFundItem("000001"), createFundItem("000002")];

    const wrapper = await mountPage();

    watchlistItems.value = [{ code: "000001", num: 0 }];
    fundDataState.dataList.value = [createFundItem("000001")];
    fundDataState.dataListDft.value = [createFundItem("000001")];
    await nextTick();

    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBe("000001");
  });

  it("selects the first fund when the list transitions from empty to non-empty and clears when emptied", async () => {
    const wrapper = await mountPage();

    watchlistItems.value = [{ code: "000003", num: 0 }];
    fundDataState.dataList.value = [createFundItem("000003")];
    fundDataState.dataListDft.value = [createFundItem("000003")];
    await nextTick();

    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBe("000003");

    watchlistItems.value = [];
    fundDataState.dataList.value = [];
    fundDataState.dataListDft.value = [];
    await nextTick();

    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBeNull();
  });

  it("opens the guest import dialog for first-login users with local guest funds", async () => {
    watchlistShouldShowImportPrompt.value = true;
    watchlistGuestItemsBeforeLogin.value = [
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ];

    const wrapper = await mountPage();

    expect(wrapper.get("[data-test='confirm-import']").text()).toContain("2");
  });

  it("imports guest watchlist on confirmation and dismisses prompt", async () => {
    watchlistShouldShowImportPrompt.value = true;
    watchlistGuestItemsBeforeLogin.value = [
      { code: "005827", num: 10, cost: 1.7 },
      { code: "000001", num: 5, cost: 0 },
    ];

    const wrapper = await mountPage();

    await wrapper.get("[data-test='confirm-import']").trigger("click");

    expect(watchlistState.importGuestFunds).toHaveBeenCalledTimes(1);
  });

  it("dismisses the guest import dialog without importing when canceled", async () => {
    watchlistShouldShowImportPrompt.value = true;
    watchlistGuestItemsBeforeLogin.value = [{ code: "005827", num: 10, cost: 1.7 }];

    const wrapper = await mountPage();

    await wrapper.get("[data-test='cancel-import']").trigger("click");

    expect(watchlistState.importGuestFunds).not.toHaveBeenCalled();
    expect(watchlistState.dismissImportPrompt).toHaveBeenCalledTimes(1);
  });

  it("does not manually refetch dashboard queries on mount", async () => {
    await mountPage();

    expect(settingsState.load).toHaveBeenCalledTimes(1);
    expect(authState.bootstrap.refetch).not.toHaveBeenCalled();
    expect(globalIndicesState.refetch).not.toHaveBeenCalled();
    expect(fundDataState.fetchData).not.toHaveBeenCalled();
  });

  it("switches detail to the clicked search result without adding it to watchlist", async () => {
    watchlistItems.value = [{ code: "000001", num: 0 }];
    fundDataState.dataList.value = [createFundItem("000001")];
    fundDataState.dataListDft.value = [createFundItem("000001")];
    searchOptionsState.value = [
      { label: "基金A", value: "000003", desc: "000003 · 混合型" },
      { label: "基金B", value: "000004", desc: "000004 · 债券型" },
    ];

    const wrapper = await mountPage();

    await wrapper.get("[data-test='search-query']").setValue("基金");
    await wrapper.get("[data-test='search-select-000003']").trigger("click");

    expect(wrapper.get("[data-test='detail-code']").text()).toBe("000003");
    expect(settingsState.RealtimeFundcode.value).toBe("000001");
    expect(fundDataState.addFund).not.toHaveBeenCalled();
  });

  it("keeps the current detail after clearing the search query and leaves saved-list active empty when the detail fund is not watchlisted", async () => {
    watchlistItems.value = [{ code: "000001", num: 0 }];
    settingsState.RealtimeFundcode.value = "000001";
    fundDataState.dataList.value = [createFundItem("000001")];
    fundDataState.dataListDft.value = [createFundItem("000001")];
    searchOptionsState.value = [{ label: "基金A", value: "000003", desc: "000003 · 混合型" }];

    const wrapper = await mountPage();

    await wrapper.get("[data-test='search-query']").setValue("基金");
    await wrapper.get("[data-test='search-select-000003']").trigger("click");
    await wrapper.get("[data-test='search-query']").setValue("");

    expect(wrapper.get("[data-test='detail-code']").text()).toBe("000003");
    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBeNull();
  });

  it("syncs saved-list active to the current detail when clearing search and the detail fund is watchlisted", async () => {
    watchlistItems.value = [
      { code: "000001", num: 0 },
      { code: "000003", num: 0 },
    ];
    settingsState.RealtimeFundcode.value = "000001";
    fundDataState.dataList.value = [createFundItem("000001"), createFundItem("000003")];
    fundDataState.dataListDft.value = [createFundItem("000001"), createFundItem("000003")];
    searchOptionsState.value = [{ label: "基金A", value: "000003", desc: "000003 · 混合型" }];

    const wrapper = await mountPage();

    await wrapper.get("[data-test='search-query']").setValue("基金");
    await wrapper.get("[data-test='search-select-000003']").trigger("click");
    await wrapper.get("[data-test='search-query']").setValue("");

    expect(wrapper.get("[data-test='detail-code']").text()).toBe("000003");
    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBe("000003");
  });

  it("adds the current searched fund from the detail toggle without leaving the search list", async () => {
    watchlistItems.value = [{ code: "000001", num: 0 }];
    fundDataState.dataList.value = [createFundItem("000001")];
    fundDataState.dataListDft.value = [createFundItem("000001")];
    searchOptionsState.value = [{ label: "基金A", value: "000003", desc: "000003 · 混合型" }];

    const wrapper = await mountPage();

    await wrapper.get("[data-test='search-query']").setValue("基金");
    await wrapper.get("[data-test='search-select-000003']").trigger("click");
    await wrapper.get("[data-test='detail-toggle']").trigger("click");

    expect(watchlistState.addFund).toHaveBeenCalledWith(["000003"]);
    expect(fundDataState.addFund).not.toHaveBeenCalled();
    expect(wrapper.find("[data-test='search-list']").exists()).toBe(true);
    expect(wrapper.get("[data-test='detail-code']").text()).toBe("000003");
    expect(wrapper.get("[data-test='detail-watchlisted']").text()).toBe("yes");
  });

  it("removes the current searched fund from watchlist through the detail toggle", async () => {
    watchlistItems.value = [
      { code: "000001", num: 0 },
      { code: "000003", num: 0 },
    ];
    settingsState.RealtimeFundcode.value = "000001";
    fundDataState.dataList.value = [createFundItem("000001"), createFundItem("000003")];
    fundDataState.dataListDft.value = [createFundItem("000001"), createFundItem("000003")];
    searchOptionsState.value = [{ label: "基金A", value: "000003", desc: "000003 · 混合型" }];

    const wrapper = await mountPage();

    await wrapper.get("[data-test='search-query']").setValue("基金");
    await wrapper.get("[data-test='search-select-000003']").trigger("click");

    expect(wrapper.get("[data-test='detail-watchlisted']").text()).toBe("yes");

    await wrapper.get("[data-test='detail-toggle']").trigger("click");

    expect(watchlistState.removeFund).toHaveBeenCalledWith("000003");
    expect(fundDataState.deleteFund).not.toHaveBeenCalled();
    expect(wrapper.get("[data-test='detail-watchlisted']").text()).toBe("no");
  });

  it("keeps the search list and current detail visible when removing the only saved fund from search mode", async () => {
    watchlistItems.value = [{ code: "000003", num: 0 }];
    settingsState.RealtimeFundcode.value = "000003";
    fundDataState.dataList.value = [createFundItem("000003")];
    fundDataState.dataListDft.value = [createFundItem("000003")];
    searchOptionsState.value = [{ label: "基金A", value: "000003", desc: "000003 · 混合型" }];

    const wrapper = await mountPage();

    await wrapper.get("[data-test='search-query']").setValue("基金");
    await wrapper.get("[data-test='search-select-000003']").trigger("click");
    await wrapper.get("[data-test='detail-toggle']").trigger("click");

    expect(wrapper.find("[data-test='search-list']").exists()).toBe(true);
    expect(wrapper.get("[data-test='detail-code']").text()).toBe("000003");
    expect(wrapper.get("[data-test='detail-watchlisted']").text()).toBe("no");
  });
});
