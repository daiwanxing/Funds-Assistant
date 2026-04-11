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
import WatchlistHeader from "./components/WatchlistHeader.vue";
import FundSavedList from "./components/FundSavedList.vue";
import FundSearchList from "./components/FundSearchList.vue";
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

const addedFundCodes = computed(() => watchlist.items.map((item) => item.code));

/** 登录弹窗 */
const authDialogOpen = ref(false);

/** 当前选中基金（Zone B → Zone C 联动） */
const selectedFundCode = computed(() => preferences.RealtimeFundcode.value);

const setSelectedFundCode = (code: string | null) => {
  preferences.RealtimeFundcode.value = code;
  preferences.updatePreference("RealtimeFundcode", code);
};

const selectFund = (code: string) => {
  if (preferences.RealtimeFundcode.value === code) return;
  setSelectedFundCode(code);
};

const searchQuery = ref("");
const { searchOptions, loading: isSearching } = useFundSearch(searchQuery);

const normalizeSelectedFundCode = () => {
  const codes = watchlist.items.map((item) => item.code);
  const current = preferences.RealtimeFundcode.value;

  if (codes.length === 0) {
    if (current !== null) {
      setSelectedFundCode(null);
    }
    return;
  }

  if (current && codes.includes(current)) {
    return;
  }

  setSelectedFundCode(codes[0]);
};

watch(
  [
    () => watchlistReady.value,
    () => watchlist.items.map((item) => item.code),
    () => preferences.RealtimeFundcode.value,
  ],
  () => {
    if (!watchlistReady.value) return;
    normalizeSelectedFundCode();
  },
);

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
                :added-codes="addedFundCodes"
                @add="(code) => { fundData.addFund([code]); searchQuery = ''; }"
              />
            </template>
            <template v-else>
              <FundSavedList
                :items="fundData.dataList.value"
                :loading="savedListLoading"
                :active-code="selectedFundCode"
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
        <FundDetail :code="selectedFundCode" />
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
