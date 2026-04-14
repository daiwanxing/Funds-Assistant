<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from "vue";
import { useFundDetail } from "@/composables/fund/useFundDetail";
import FundDetailHero from "../FundDetailHero";
import FundReturnChart from "../FundReturnChart";
import FundDetailOverviewRail from "../FundDetailOverviewRail";
import { BarChart2 } from "lucide-vue-next";

type FundDetailTab = "performance" | "overview" | "holdings" | "industry";

const props = defineProps<{
  code: string | null;
  isWatchlisted?: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-watchlist"): void;
}>();

const activeTab = shallowRef<FundDetailTab>("performance");
const tabsRef = shallowRef<HTMLDivElement | null>(null);
const tabButtonRefs = new Map<FundDetailTab, HTMLButtonElement>();
const tabsIndicatorStyle = shallowRef<Record<string, string>>({
  opacity: "0",
  width: "0px",
  transform: "translateX(0px)",
});
let tabsResizeObserver: ResizeObserver | null = null;

const {
  profile,
  filteredTrend,
  periodReturn,
  periodLabel,
  isRising,
  latestNav,
  period,
  setPeriod,
  isLoading,
  isError,
  retry,
} = useFundDetail(() => props.code);

const tabs: Array<{ key: FundDetailTab; label: string; testId: string }> = [
  { key: "performance", label: "业绩走势", testId: "fund-detail-tab-performance" },
  { key: "overview", label: "基金概况", testId: "fund-detail-tab-overview" },
  { key: "holdings", label: "重仓股票", testId: "fund-detail-tab-holdings" },
  { key: "industry", label: "行业分布", testId: "fund-detail-tab-industry" },
];

const setTabButtonRef = (tab: FundDetailTab, element: unknown) => {
  if (!(element instanceof HTMLButtonElement)) {
    tabButtonRefs.delete(tab);
    return;
  }

  tabButtonRefs.set(tab, element);
};

const syncTabsIndicator = () => {
  const tabsElement = tabsRef.value;
  const activeButton = tabButtonRefs.get(activeTab.value);

  if (!tabsElement || !activeButton) {
    tabsIndicatorStyle.value = {
      opacity: "0",
      width: "0px",
      transform: "translateX(0px)",
    };
    return;
  }

  const tabsRect = tabsElement.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();

  tabsIndicatorStyle.value = {
    opacity: "1",
    width: `${buttonRect.width}px`,
    transform: `translateX(${buttonRect.left - tabsRect.left}px)`,
  };
};

watch(
  activeTab,
  async () => {
    await nextTick();
    syncTabsIndicator();
  },
  { flush: "post" },
);

onMounted(async () => {
  await nextTick();
  syncTabsIndicator();

  if (tabsRef.value && typeof ResizeObserver !== "undefined") {
    tabsResizeObserver = new ResizeObserver(() => {
      syncTabsIndicator();
    });
    tabsResizeObserver.observe(tabsRef.value);
  }
});

onBeforeUnmount(() => {
  tabsResizeObserver?.disconnect();
});
</script>

<template>
  <div
    class="fund-detail"
  >
    <div
      v-if="!code"
      class="fund-detail__empty-state"
    >
      <div class="fund-detail__empty-icon-shell">
        <BarChart2
          class="fund-detail__empty-icon"
          :stroke-width="2"
        />
      </div>
      <div class="fund-detail__empty-copy">
        <p class="fund-detail__empty-title">
          选择一只基金查看详情
        </p>
        <p class="fund-detail__empty-description">
          左侧点击基金后，这里会展示详细信息
        </p>
      </div>
    </div>

    <div
      v-else-if="isLoading"
      class="fund-detail__loading-state"
    >
      <div class="fund-detail__hero-skeleton">
        <div class="fund-detail__hero-skeleton-row">
          <div class="fund-detail__hero-skeleton-copy">
            <div class="fund-detail__skeleton-block fund-detail__skeleton-block--headline" />
            <div class="fund-detail__skeleton-block fund-detail__skeleton-block--subline" />
          </div>
          <div class="fund-detail__hero-skeleton-copy fund-detail__hero-skeleton-copy--align-end">
            <div class="fund-detail__skeleton-block fund-detail__skeleton-block--value" />
            <div class="fund-detail__skeleton-block fund-detail__skeleton-block--delta" />
          </div>
        </div>
      </div>
      <div class="fund-detail__loading-body">
        <div class="fund-detail__chart-skeleton">
          <div class="fund-detail__skeleton-block fund-detail__skeleton-block--toolbar" />
          <div class="fund-detail__skeleton-chart" />
        </div>

        <div class="fund-detail__rail-skeleton">
          <div
            v-for="i in 5"
            :key="i"
            class="fund-detail__rail-skeleton-item"
          >
            <div class="fund-detail__skeleton-block fund-detail__skeleton-block--rail-label" />
            <div class="fund-detail__skeleton-block fund-detail__skeleton-block--rail-value" />
            <div class="fund-detail__skeleton-block fund-detail__skeleton-block--rail-hint" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="isError"
      class="fund-detail__error-state"
    >
      <p class="fund-detail__error-title">
        详情加载失败
      </p>
      <p class="fund-detail__error-description">
        数据源暂时不可用，请稍后重试
      </p>
      <button
        data-test="fund-detail-retry"
        type="button"
        class="fund-detail__error-action"
        @click="retry"
      >
        重试
      </button>
    </div>

    <div
      v-else-if="profile"
      class="fund-detail__content"
    >
      <FundDetailHero
        :profile="profile"
        :latest-nav="latestNav"
        :period-return="periodReturn"
        :period-label="periodLabel"
        :is-rising="isRising"
        :is-watchlisted="isWatchlisted"
        category-label="基金"
        value-label="净值"
        @toggle-watchlist="emit('toggle-watchlist')"
      />

      <div
        data-test="fund-detail-main"
        class="fund-detail__main"
      >
        <div
          ref="tabsRef"
          class="fund-detail__tabs"
        >
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :data-test="tab.testId"
            type="button"
            :ref="(element) => setTabButtonRef(tab.key, element)"
            :class="[
              'fund-detail__tab',
              {
                'fund-detail__tab--active': activeTab === tab.key,
              },
            ]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
          <span
            data-test="fund-detail-tabs-indicator"
            class="fund-detail__tabs-indicator"
            :style="tabsIndicatorStyle"
          />
        </div>

        <div class="fund-detail__tab-panel">
          <FundReturnChart
            v-if="activeTab === 'performance'"
            :data="filteredTrend"
            :period="period"
            :is-rising="isRising"
            class="fund-detail__chart"
            @update:period="setPeriod"
          />

          <FundDetailOverviewRail
            v-else-if="activeTab === 'overview'"
            :profile="profile"
          />

          <div
            v-else-if="activeTab === 'holdings'"
            class="fund-detail__placeholder-panel"
          >
            <p class="fund-detail__placeholder-title">
              重仓股票内容建设中
            </p>
            <p class="fund-detail__placeholder-description">
              后续会在这里展示基金的核心持仓明细与变化趋势
            </p>
          </div>

          <div
            v-else
            class="fund-detail__placeholder-panel"
          >
            <p class="fund-detail__placeholder-title">
              行业分布内容建设中
            </p>
            <p class="fund-detail__placeholder-description">
              后续会在这里展示行业配置结构与仓位变化
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./FundDetail.scss"></style>
