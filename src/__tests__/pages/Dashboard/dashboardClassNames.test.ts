import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, ref } from "vue";
import HomePage from "@/pages/Dashboard/HomePage.vue";
import WatchlistHeader from "@/pages/Dashboard/components/WatchlistHeader.vue";
import FundSavedList from "@/pages/Dashboard/components/FundSavedList.vue";
import FundDetail from "@/pages/Dashboard/components/FundDetail/FundDetail.vue";
import type { FundItem, FundListItem } from "@/types/fund";

const preferencesState = {
  isReady: ref(true),
  userId: ref("user-1"),
  sortTypeObj: ref({ name: null, type: null } as { name: string | null; type: string | null }),
  RealtimeFundcode: ref<string | null>(null),
  load: vi.fn(),
  updatePreference: vi.fn(),
};

const watchlistItems = ref<FundListItem[]>([]);

const watchlistState = {
  get items() {
    return watchlistItems.value;
  },
  shouldShowImportPrompt: false,
  guestItemsBeforeLogin: [],
  replaceAll: vi.fn(),
  importGuestFunds: vi.fn(),
  dismissImportPrompt: vi.fn(),
};

const authState = {
  bootstrap: {
    isPending: ref(false),
  },
};

const fundDataState = {
  dataList: computed(() => []),
  loadingList: ref(false),
  addFund: vi.fn(),
};

vi.mock("@/composables/preferences", () => ({
  usePreferences: () => preferencesState,
}));

vi.mock("@/composables/fund", () => ({
  useFundData: () => fundDataState,
}));

vi.mock("@/composables/index", () => ({
  useGlobalIndices: () => ({
    dataList: ref([]),
    isLoading: ref(false),
  }),
}));

vi.mock("@/composables/holiday", () => ({
  useHoliday: vi.fn(),
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => authState,
}));

vi.mock("@/stores/watchlist", () => ({
  useWatchlistStore: () => watchlistState,
}));

vi.mock("@/composables/fund/useFundSearch", () => ({
  useFundSearch: () => ({
    searchOptions: ref([]),
    loading: ref(false),
  }),
}));

vi.mock("@/composables/fund/useFundDetail", () => ({
  useFundDetail: () => ({
    profile: ref(null),
    filteredTrend: ref([]),
    periodReturn: ref(null),
    periodLabel: ref("6个月"),
    isRising: ref(true),
    latestNav: ref(null),
    period: ref("6m"),
    setPeriod: vi.fn(),
    isLoading: ref(false),
    isError: ref(false),
  }),
}));

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

describe("Dashboard semantic class contract", () => {
  beforeEach(() => {
    watchlistItems.value = [];
    preferencesState.RealtimeFundcode.value = null;
    preferencesState.load.mockReset();
    preferencesState.updatePreference.mockReset();
    fundDataState.addFund.mockReset();
  });

  it("renders the dashboard shell with semantic layout classes", () => {
    const wrapper = mount(HomePage, {
      global: {
        stubs: {
          GlobalTicker: { template: "<div />" },
          UserBar: { template: "<div />" },
          FundDetail: { template: "<div />" },
          GuestImportDialog: { template: "<div />" },
          AuthDialog: { template: "<div />" },
          WatchlistHeader: { template: "<div />" },
          FundSavedList: { template: "<div />" },
          FundSearchList: { template: "<div />" },
        },
      },
    });

    expect(wrapper.find(".dashboard-page").exists()).toBe(true);
    expect(wrapper.find(".dashboard-page__ticker").exists()).toBe(true);
    expect(wrapper.find(".dashboard-page__content").exists()).toBe(true);
    expect(wrapper.find(".dashboard-page__sidebar").exists()).toBe(true);
    expect(wrapper.find(".dashboard-page__detail").exists()).toBe(true);
  });

  it("renders watchlist header with semantic search classes", () => {
    const wrapper = mount(WatchlistHeader, {
      props: {
        query: "黄金",
        savedCount: 2,
        resultCount: 8,
      },
    });

    expect(wrapper.find(".watchlist-header").exists()).toBe(true);
    expect(wrapper.find(".watchlist-header__search-input").exists()).toBe(true);
    expect(wrapper.find(".watchlist-header__clear-button").exists()).toBe(true);
  });

  it("renders saved fund rows and empty state with semantic list classes", async () => {
    const rowWrapper = mount(FundSavedList, {
      props: {
        items: [createFundItem("000001")],
        loading: false,
        activeCode: "000001",
      },
    });

    expect(rowWrapper.find(".saved-fund-list").exists()).toBe(true);
    expect(rowWrapper.find(".saved-fund-list__row").exists()).toBe(true);
    expect(rowWrapper.find(".saved-fund-list__row--active").exists()).toBe(true);

    const emptyWrapper = mount(FundSavedList, {
      props: {
        items: [],
        loading: false,
        activeCode: null,
      },
    });

    expect(emptyWrapper.find(".saved-fund-list__empty-state").exists()).toBe(true);
  });

  it("renders the detail empty state with semantic classes", () => {
    const wrapper = mount(FundDetail, {
      props: {
        code: null,
      },
    });

    expect(wrapper.find(".fund-detail").exists()).toBe(true);
    expect(wrapper.find(".fund-detail__empty-state").exists()).toBe(true);
  });
});
