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
    class="fund-holdings"
  >
    <div class="fund-holdings__header">
      <span class="fund-holdings__title">
        持仓明细
      </span>
      <span
        v-if="quarter"
        class="fund-holdings__quarter"
      >
        {{ quarter }}
      </span>
    </div>

    <div
      v-if="isLoading"
      class="fund-holdings__grid"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="fund-holdings__skeleton-card"
      >
        <div class="fund-holdings__skeleton-line fund-holdings__skeleton-line--rank" />
        <div class="fund-holdings__skeleton-line fund-holdings__skeleton-line--name" />
        <div class="fund-holdings__skeleton-line fund-holdings__skeleton-line--bar" />
      </div>
    </div>

    <div
      v-else-if="holdings.length === 0"
      class="fund-holdings__empty-state"
    >
      暂无持仓数据
    </div>

    <div
      v-else
      class="fund-holdings__content"
    >
      <div class="fund-holdings__grid">
        <article
          v-for="item in holdings"
          :key="item.stockCode"
          data-test="fund-holding-item"
          class="fund-holdings__card"
        >
          <div class="fund-holdings__card-header">
            <div class="fund-holdings__card-meta">
              <div class="fund-holdings__card-topline">
                <span class="fund-holdings__rank">
                  {{ item.rank }}
                </span>
                <span
                  v-if="getMarketTag(item.marketCode)"
                  class="fund-holdings__market-tag"
                >
                  {{ getMarketTag(item.marketCode) }}
                </span>
              </div>
              <div class="fund-holdings__stock-name">
                {{ item.stockName }}
              </div>
            </div>

            <span class="fund-holdings__ratio">
              {{ item.ratio.toFixed(2) }}%
            </span>
          </div>

          <div class="fund-holdings__progress-track">
            <div
              class="fund-holdings__progress-fill"
              :style="{
                width: maxRatio > 0 ? `${(item.ratio / maxRatio) * 100}%` : '0%',
              }"
            />
          </div>
        </article>
      </div>

      <div class="fund-holdings__summary">
        <span class="fund-holdings__summary-label">
          前{{ holdings.length }}合计占比
        </span>
        <span class="fund-holdings__summary-value">
          {{ totalRatio.toFixed(2) }}%
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss" src="./FundHoldings.scss"></style>
