<script setup lang="ts">
import { useFundDetail } from "@/composables/fund/useFundDetail";
import FundDetailHero from "../FundDetailHero";
import FundReturnChart from "../FundReturnChart";
import FundDetailOverviewRail from "../FundDetailOverviewRail";
import { BarChart2 } from "lucide-vue-next";

const props = defineProps<{
  code: string | null;
}>();

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
} = useFundDetail(() => props.code);
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
        category-label="基金"
        value-label="净值"
      />

      <div
        data-test="fund-detail-main"
        class="fund-detail__main"
      >
        <FundReturnChart
          :data="filteredTrend"
          :period="period"
          :is-rising="isRising"
          class="fund-detail__chart"
          @update:period="setPeriod"
        />

        <FundDetailOverviewRail
          :profile="profile"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./FundDetail.scss"></style>
