<script setup lang="ts">
import { ref, computed, onMounted, watch, toValue } from "vue";
import { usePreferences } from "@/composables/preferences";
import { useFundData } from "@/composables/fund";
import { useGlobalIndices } from "@/composables/index";
import { useHoliday } from "@/composables/holiday";
import { useAuthStore } from "@/stores/auth";
import { useWatchlistStore } from "@/stores/watchlist";
import { GlobalTicker } from "./components/GlobalTicker";
import { UserBar } from "./components/StatusBar";
import { FundDetail } from "./components/FundDetail";
import GuestImportDialog from "./components/Auth/GuestImportDialog.vue";
import { AuthDialog } from "@/components/biz/AuthDialog";
import WatchlistHeader from "./components/WatchlistHeader";
import FundSavedList from "./components/FundSavedList";
import FundSearchList from "./components/FundSearchList";
import { useFundSearch } from "@/composables/fund/useFundSearch";

const preferences = usePreferences();
useHoliday();
const auth = useAuthStore();
const watchlist = useWatchlistStore();

const authBootstrapPending = computed(() => toValue(auth.bootstrap.isPending));
const fundData = useFundData(
  computed(() => watchlist.items),
  preferences.userId,
  preferences.sortTypeObj,
  {
    persistWatchlist: (items) => watchlist.replaceAll(items),
    enabled: computed(() => {
      return preferences.isReady.value && !authBootstrapPending.value;
    }),
  },
);
const globalIndices = useGlobalIndices();
const authSourceReady = computed(() => !authBootstrapPending.value);
const watchlistReady = computed(() => preferences.isReady.value && authSourceReady.value);
const fundListPhase = computed(() => {
  if (!watchlistReady.value) return "booting";
  if (watchlist.items.length === 0) return "empty";
  if (fundData.loadingList.value) return "loadingQuotes";
  return "loaded";
});
const savedListLoading = computed(() => {
  return fundListPhase.value === "booting" || fundListPhase.value === "loadingQuotes";
});
const visibleSavedCount = computed(() => {
  return watchlistReady.value ? watchlist.items.length : 0;
});

/** 登录弹窗 */
const authDialogOpen = ref(false);

const savedListActiveFundCode = computed(() => preferences.RealtimeFundcode.value);
const searchSelectedFundCode = ref<string | null>(null);
const detailFundCode = ref<string | null>(null);
const allowEmptySavedListActive = ref(false);

const setSavedListActiveFundCode = (code: string | null) => {
  preferences.RealtimeFundcode.value = code;
  preferences.updatePreference("RealtimeFundcode", code);
};

const selectFund = (code: string) => {
  if (preferences.RealtimeFundcode.value === code) return;
  allowEmptySavedListActive.value = false;
  setSavedListActiveFundCode(code);
  detailFundCode.value = code;
};

const searchQuery = ref("");
const { searchOptions, loading: isSearching } = useFundSearch(searchQuery);
const isDetailFundWatchlisted = computed(() => {
  if (!detailFundCode.value) return false;

  return watchlist.items.some((item) => item.code === detailFundCode.value);
});
const resolvedSavedListActiveFundCode = computed(() => {
  if (searchQuery.value.trim()) {
    return savedListActiveFundCode.value;
  }

  if (detailFundCode.value && isDetailFundWatchlisted.value) {
    return detailFundCode.value;
  }

  if (allowEmptySavedListActive.value) {
    return null;
  }

  return savedListActiveFundCode.value;
});

const normalizeSelectedFundCode = () => {
  const codes = watchlist.items.map((item) => item.code);
  const current = preferences.RealtimeFundcode.value;
  const detailIsWatchlisted = detailFundCode.value ? codes.includes(detailFundCode.value) : false;

  if (codes.length === 0) {
    if (current !== null) {
      setSavedListActiveFundCode(null);
    }
    return;
  }

  if (allowEmptySavedListActive.value && !detailIsWatchlisted) {
    return;
  }

  if (current && codes.includes(current)) {
    allowEmptySavedListActive.value = false;
    return;
  }

  if (allowEmptySavedListActive.value) {
    return;
  }

  allowEmptySavedListActive.value = false;
  setSavedListActiveFundCode(codes[0]);
};

watch(
  [
    () => watchlistReady.value,
    () => searchQuery.value,
    () => watchlist.items.map((item) => item.code),
    () => preferences.RealtimeFundcode.value,
  ],
  () => {
    if (!watchlistReady.value) return;
    if (searchQuery.value.trim()) return;
    normalizeSelectedFundCode();
  },
);

watch(
  [savedListActiveFundCode, () => watchlistReady.value],
  ([code, ready]) => {
    if (!ready) return;
    if (detailFundCode.value !== null) return;
    detailFundCode.value = code;
  },
  { immediate: true },
);

watch(
  searchQuery,
  (query, previousQuery) => {
    if (query.trim()) return;
    if (!previousQuery?.trim()) return;

    const currentDetailCode = detailFundCode.value;
    if (currentDetailCode && watchlist.items.some((item) => item.code === currentDetailCode)) {
      allowEmptySavedListActive.value = false;
      setSavedListActiveFundCode(currentDetailCode);
      return;
    }

    allowEmptySavedListActive.value = true;
    setSavedListActiveFundCode(null);
  },
  { flush: "sync" },
);

watch(
  [searchQuery, searchOptions],
  ([query, options]) => {
    if (!query.trim()) {
      searchSelectedFundCode.value = null;
      return;
    }

    const optionCodes = (options ?? []).map((item) => item.value);
    if (!searchSelectedFundCode.value) return;

    if (!optionCodes.includes(searchSelectedFundCode.value)) {
      searchSelectedFundCode.value = null;
    }
  },
  { immediate: true },
);

const selectSearchFund = (code: string) => {
  searchSelectedFundCode.value = code;
  detailFundCode.value = code;
};

const toggleDetailFundWatchlist = () => {
  if (!detailFundCode.value) return;

  if (isDetailFundWatchlisted.value) {
    watchlist.removeFund(detailFundCode.value);
    return;
  }

  watchlist.addFund([detailFundCode.value]);
};

const handleImportGuestWatchlist = async () => {
  await watchlist.importGuestFunds();
};

const handleDismissImportPrompt = () => {
  watchlist.dismissImportPrompt();
};

onMounted(() => {
  void preferences.load();
});
</script>

<template>
  <div class="dashboard-page">
    <header class="dashboard-page__ticker">
      <GlobalTicker
        :data-list="globalIndices.dataList.value"
        :is-loading="globalIndices.isLoading.value"
      />
    </header>

    <div class="dashboard-page__content">
      <aside class="dashboard-page__sidebar">
        <div class="dashboard-page__sidebar-body">
          <WatchlistHeader
            v-model:query="searchQuery"
            :is-searching="isSearching"
            :saved-count="visibleSavedCount"
            :result-count="searchOptions?.length"
          />

          <div class="dashboard-page__sidebar-scroll">
            <template v-if="searchQuery">
              <FundSearchList
                :query="searchQuery"
                :options="searchOptions || []"
                :loading="isSearching"
                :active-code="searchSelectedFundCode"
                @select="selectSearchFund"
              />
            </template>
            <template v-else>
              <FundSavedList
                :items="fundData.dataList.value"
                :loading="savedListLoading"
                :active-code="resolvedSavedListActiveFundCode"
                @select="selectFund"
              />
            </template>
          </div>
        </div>

        <div class="dashboard-page__sidebar-footer">
          <UserBar @login="authDialogOpen = true" />
        </div>
      </aside>

      <section class="dashboard-page__detail">
        <FundDetail
          :code="detailFundCode"
          :is-watchlisted="isDetailFundWatchlisted"
          @toggle-watchlist="toggleDetailFundWatchlist"
        />
      </section>
    </div>

    <GuestImportDialog
      :open="watchlist.shouldShowImportPrompt"
      :guest-count="watchlist.guestItemsBeforeLogin.length"
      @confirm="handleImportGuestWatchlist"
      @cancel="handleDismissImportPrompt"
    />

    <AuthDialog v-model:open="authDialogOpen" />
  </div>
</template>

<style scoped lang="scss" src="./HomePage.scss"></style>
