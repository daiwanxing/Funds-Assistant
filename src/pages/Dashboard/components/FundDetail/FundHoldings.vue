<script setup lang="ts">
import { computed } from "vue";
import { useFundHoldings } from "@/composables/fund/useFundHoldings";

const props = defineProps<{
  code: string | null;
}>();

const { holdings, quarter, maxRatio, isLoading } = useFundHoldings(() => props.code);

const getMarketTag = (marketCode: string): string => {
  if (marketCode.startsWith("116.")) return "HK";
  if (marketCode.startsWith("1.")) return "SH";
  if (marketCode.startsWith("0.")) return "SZ";
  return "";
};

const totalRatio = computed(() => {
  return holdings.value.reduce((sum, h) => sum + h.ratio, 0);
});
</script>

<template>
  <section
    data-test="fund-holdings-strip"
    class="px-5 py-4"
  >
    <div class="flex items-center justify-between gap-4 mb-4">
      <span class="text-[11px] text-white/40 font-sans tracking-[0.18em]">
        持仓明细
      </span>
      <span
        v-if="quarter"
        class="text-[10px] text-white/25 font-sans tracking-wide"
      >
        {{ quarter }}
      </span>
    </div>

    <div
      v-if="isLoading"
      class="grid grid-cols-3 gap-3"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3"
      >
        <div class="h-3 w-12 rounded bg-white/[0.06] mb-3" />
        <div class="h-3 w-24 rounded bg-white/[0.04] mb-2" />
        <div class="h-2 rounded-full bg-white/[0.04]" />
      </div>
    </div>

    <div
      v-else-if="holdings.length === 0"
      class="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-8 text-[12px] text-white/20 font-sans"
    >
      暂无持仓数据
    </div>

    <div
      v-else
      class="flex flex-col gap-3"
    >
      <div class="grid grid-cols-3 gap-3">
        <article
          v-for="item in holdings"
          :key="item.stockCode"
          data-test="fund-holding-item"
          class="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3"
        >
          <div class="flex items-start justify-between gap-3 mb-2">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10px] text-white/22 font-mono">
                  {{ item.rank }}
                </span>
                <span
                  v-if="getMarketTag(item.marketCode)"
                  class="text-[9px] text-white/24 font-mono px-1.5 py-px rounded-full bg-white/[0.04]"
                >
                  {{ getMarketTag(item.marketCode) }}
                </span>
              </div>
              <div class="text-[12px] text-white/84 font-sans truncate">
                {{ item.stockName }}
              </div>
            </div>

            <span class="text-[13px] text-white/70 font-mono shrink-0">
              {{ item.ratio.toFixed(2) }}%
            </span>
          </div>

          <div class="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{
                width: maxRatio > 0 ? `${(item.ratio / maxRatio) * 100}%` : '0%',
                backgroundColor: 'var(--accent-primary)',
                opacity: 0.72,
              }"
            />
          </div>
        </article>
      </div>

      <div class="flex items-center justify-between border-t border-white/[0.05] pt-3">
        <span class="text-[10px] text-white/25 font-sans tracking-wide">
          前{{ holdings.length }}合计占比
        </span>
        <span class="text-[12px] text-white/58 font-mono">
          {{ totalRatio.toFixed(2) }}%
        </span>
      </div>
    </div>
  </section>
</template>
