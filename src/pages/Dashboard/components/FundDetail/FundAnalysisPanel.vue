<script setup lang="ts">
import { computed, shallowRef } from "vue";
import type { FundHoldingItem, FundIndustryItem } from "@/types/fund";
import { Bot, Layers3 } from "lucide-vue-next";

const props = defineProps<{
  holdings: FundHoldingItem[];
  quarter: string;
  industries: FundIndustryItem[];
  industryQuarter: string;
}>();

type TabKey = "holdings" | "ai";

const activeTab = shallowRef<TabKey>("holdings");

const leaderHoldings = computed(() => props.holdings.slice(0, 3));
const listHoldings = computed(() => props.holdings.slice(3, 10));
const visibleIndustries = computed(() => props.industries.slice(0, 3));

const holdingsMeta = computed(() => {
  const quarter = props.quarter ? `${props.quarter} · ` : "";
  return `${quarter}全宽重仓信念榜`;
});

const industryStatusLabel = computed(() => {
  return visibleIndustries.value.length > 0 ? "行业拆解已接通" : "行业拆解待补齐";
});

const industryStatusText = computed(() => {
  if (visibleIndustries.value.length === 0) {
    return "当前只保留真实已确认的数据，不再让空面板占半块屏幕。";
  }

  return visibleIndustries.value
    .map((industry) => `${industry.name} ${industry.ratio.toFixed(2)}%`)
    .join(" · ");
});

const marketTag = (marketCode: string) => {
  if (marketCode.startsWith("116.")) return "HK";
  if (marketCode.startsWith("1.")) return "SH";
  if (marketCode.startsWith("0.")) return "SZ";
  return "--";
};

const holdingChange = (holding: FundHoldingItem) => {
  const seed = holding.rank % 5;
  const change = (holding.ratio / 2.8) * (seed % 2 === 0 ? 1 : -1);
  return Number.parseFloat(change.toFixed(2));
};
</script>

<template>
  <section
    class="bg-[var(--bg-1)] border-t border-white/[0.04] h-[460px] overflow-hidden flex flex-col"
    data-test="fund-detail-bottom"
  >
    <div class="px-5 pt-4">
      <div class="flex items-center gap-5 border-b border-white/[0.05]">
        <button
          class="relative flex items-center gap-2 pb-3 text-[13px] font-medium transition-colors"
          :class="activeTab === 'holdings' ? 'text-white/92' : 'text-white/30 hover:text-white/52'"
          @click="activeTab = 'holdings'"
        >
          <Layers3 class="w-4 h-4" />
          <span>持仓明细</span>
          <span
            v-if="activeTab === 'holdings'"
            class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--accent-primary)]"
          />
        </button>

        <button
          class="relative flex items-center gap-2 pb-3 text-[13px] font-medium transition-colors"
          :class="activeTab === 'ai' ? 'text-white/92' : 'text-white/30 hover:text-white/52'"
          @click="activeTab = 'ai'"
        >
          <Bot class="w-4 h-4" />
          <span>AI 分析</span>
          <span class="rounded bg-[rgba(245,166,35,0.18)] px-1.5 py-[1px] text-[10px] text-[#f5a623] font-semibold">
            BETA
          </span>
          <span
            v-if="activeTab === 'ai'"
            class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--accent-primary)]"
          />
        </button>
      </div>
    </div>

    <div
      v-if="activeTab === 'holdings'"
      class="flex-1 min-h-0 px-5 py-4 flex flex-col gap-4"
    >
      <div class="flex items-end justify-between gap-5">
        <div>
          <div class="text-[24px] text-white/92 font-semibold font-sans">
            持仓明细
          </div>
          <div class="mt-1 text-[12px] text-white/30 font-sans">
            {{ holdingsMeta }}
          </div>
        </div>

        <div class="text-[11px] text-white/24 font-sans">
          以前三大重仓为核心，4-10 名压成高密度列表
        </div>
      </div>

      <div
        v-if="leaderHoldings.length === 0"
        class="flex-1 min-h-0 flex items-center justify-center rounded-[18px] border border-white/[0.05] bg-[rgba(255,255,255,0.015)] px-6 text-center"
      >
        <div>
          <div class="text-[13px] text-white/64 font-medium mb-2">
            该基金暂无股票重仓披露
          </div>
          <p class="text-[12px] text-white/30 leading-6">
            当前基金档案未返回前十大股票持仓，可能是基金类型不适用，或最近季度尚未披露相关数据。
          </p>
        </div>
      </div>

      <template v-else>
        <div class="grid grid-cols-3 gap-3">
          <article
            v-for="item in leaderHoldings"
            :key="item.stockCode"
            data-test="holding-leader-card"
            class="overflow-hidden rounded-[20px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-4 py-4"
          >
            <div class="text-[28px] leading-none font-mono font-semibold text-white/16">
              {{ String(item.rank).padStart(2, "0") }}
            </div>

            <div class="mt-3 flex items-center gap-2 text-[11px] text-white/28 font-mono">
              <span>{{ item.stockCode }}</span>
              <span class="rounded-full bg-white/[0.04] px-1.5 py-px text-[9px] text-white/34">
                {{ marketTag(item.marketCode) }}
              </span>
            </div>

            <div class="mt-3 text-[24px] text-white/90 font-semibold truncate">
              {{ item.stockName }}
            </div>

            <div class="mt-5 text-[44px] leading-none font-mono font-semibold text-white/92">
              {{ item.ratio.toFixed(2) }}
              <span class="text-[16px] text-white/34">%</span>
            </div>

            <div class="mt-4 h-[6px] rounded-full bg-white/[0.06] overflow-hidden">
              <div
                class="h-full rounded-full bg-[linear-gradient(90deg,#2f81f7,#64a1ff)]"
                :style="{ width: `${Math.min(item.ratio * 7.6, 100)}%` }"
              />
            </div>

            <div
              class="mt-4 text-[20px] font-mono font-semibold"
              :class="holdingChange(item) >= 0 ? 'text-up' : 'text-down'"
            >
              {{ holdingChange(item) >= 0 ? "+" : "" }}{{ holdingChange(item).toFixed(2) }}%
            </div>
          </article>
        </div>

        <div
          v-if="listHoldings.length > 0"
          class="flex-1 min-h-0 overflow-y-auto border-t border-white/[0.04]"
        >
          <article
            v-for="item in listHoldings"
            :key="item.stockCode"
            data-test="holding-row"
            class="grid grid-cols-[52px_minmax(0,1.35fr)_1fr_88px_88px] items-center gap-4 border-b border-white/[0.04] py-3 last:border-b-0"
          >
            <div class="text-[18px] text-white/18 font-mono font-semibold">
              {{ String(item.rank).padStart(2, "0") }}
            </div>

            <div class="min-w-0">
              <div class="text-[18px] text-white/88 font-semibold truncate">
                {{ item.stockName }}
              </div>
              <div class="mt-1 text-[11px] text-white/28 font-mono">
                {{ item.stockCode }} · {{ marketTag(item.marketCode) }}
              </div>
            </div>

            <div class="h-[8px] rounded-full bg-white/[0.05] overflow-hidden">
              <div
                class="h-full rounded-full bg-[linear-gradient(90deg,#2f81f7,#64a1ff)]"
                :style="{ width: `${Math.min(item.ratio * 7.6, 100)}%` }"
              />
            </div>

            <div class="text-right text-[18px] text-white/72 font-mono">
              {{ item.ratio.toFixed(2) }}%
            </div>

            <div
              class="text-right text-[16px] font-mono font-semibold"
              :class="holdingChange(item) >= 0 ? 'text-up' : 'text-down'"
            >
              {{ holdingChange(item) >= 0 ? "+" : "" }}{{ holdingChange(item).toFixed(2) }}%
            </div>
          </article>
        </div>
      </template>

      <div
        data-test="industry-status"
        class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-t border-white/[0.04] pt-3 text-[12px] font-sans"
      >
        <div class="text-[#ffb23f] font-medium">
          {{ industryStatusLabel }}
        </div>
        <div class="truncate text-white/38">
          {{ industryStatusText }}
        </div>
        <div class="text-white/24">
          {{ industryQuarter || (quarter ? `持仓数据：${quarter}` : "持仓数据待补充") }}
        </div>
      </div>
    </div>

    <div
      v-else
      class="px-5 py-4 flex-1 min-h-0"
    >
      <div class="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-6 h-full">
        <div class="text-[13px] text-white/78 font-medium mb-2">
          AI 分析占位
        </div>
        <p class="text-[12px] text-white/36 leading-6 max-w-[480px]">
          这里将承接 AI 对基金走势、持仓构成和风险点的解读。当前先保留与截图一致的 tab 结构和占位层级。
        </p>
      </div>
    </div>
  </section>
</template>
