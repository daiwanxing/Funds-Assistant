<script setup lang="ts">
import { useFundDetail } from "@/composables/fund/useFundDetail";
import FundDetailHero from "./FundDetailHero.vue";
import FundReturnChart from "./FundReturnChart.vue";
import FundDetailOverviewRail from "./FundDetailOverviewRail.vue";
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
  <!-- Empty state: no fund selected -->
  <div
    v-if="!code"
    class="h-full flex flex-col items-center justify-center pb-20 gap-4"
  >
    <div
      class="w-14 h-14 rounded-2xl border border-white/5 flex items-center justify-center"
    >
      <BarChart2
        class="w-6 h-6 text-white/20"
        :stroke-width="2"
      />
    </div>
    <div class="text-center">
      <p class="text-[14px] font-medium text-white/50 mb-1.5 font-sans">
        选择一只基金查看详情
      </p>
      <p class="text-[12px] text-white/30 font-sans">
        左侧点击基金后，这里会展示详细信息
      </p>
    </div>
  </div>

  <!-- Loading state -->
  <div
    v-else-if="isLoading"
    class="h-full flex flex-col"
  >
    <div class="detail-hero-skeleton animate-pulse">
      <div class="flex items-start justify-between px-5 py-4">
        <div class="flex flex-col gap-2">
          <div class="h-5 w-48 rounded bg-white/[0.06]" />
          <div class="h-3.5 w-24 rounded bg-white/[0.04]" />
        </div>
        <div class="flex flex-col items-end gap-2">
          <div class="h-5 w-20 rounded bg-white/[0.06]" />
          <div class="h-3.5 w-16 rounded bg-white/[0.04]" />
        </div>
      </div>
    </div>
    <div class="flex-1 min-h-0 flex flex-col gap-px">
      <div class="flex-1 min-h-0 flex flex-col gap-px">
        <div class="p-5 animate-pulse">
          <div class="h-4 w-28 rounded bg-white/[0.06] mb-3" />
          <div class="h-[520px] rounded bg-white/[0.04]" />
        </div>

        <div class="grid grid-cols-5 gap-px bg-white/[0.04]">
          <div
            v-for="i in 5"
            :key="i"
            class="p-5 animate-pulse"
          >
            <div class="h-3 w-16 rounded bg-white/[0.05] mb-3" />
            <div class="h-6 w-28 rounded bg-white/[0.06] mb-2" />
            <div class="h-3 w-20 rounded bg-white/[0.04]" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Error state -->
  <div
    v-else-if="isError"
    class="h-full flex flex-col items-center justify-center pb-20 gap-3"
  >
    <p class="text-[14px] font-medium text-white/50 font-sans">
      详情加载失败
    </p>
    <p class="text-[12px] text-white/30 font-sans">
      数据源暂时不可用，请稍后重试
    </p>
  </div>

  <!-- Success state -->
  <div
    v-else-if="profile"
    class="h-full flex flex-col overflow-hidden"
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

    <div class="flex-1 min-h-0 flex flex-col gap-px">
      <div
        data-test="fund-detail-main"
        class="flex-1 min-h-0 flex flex-col gap-px"
      >
        <FundReturnChart
          :data="filteredTrend"
          :period="period"
          :is-rising="isRising"
          class="min-h-0"
          @update:period="setPeriod"
        />

        <FundDetailOverviewRail
          :profile="profile"
        />
      </div>
    </div>
  </div>
</template>
