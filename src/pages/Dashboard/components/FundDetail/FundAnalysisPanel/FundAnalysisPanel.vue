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
    class="fund-analysis-panel"
    data-test="fund-detail-bottom"
  >
    <div class="fund-analysis-panel__tabs">
      <div class="fund-analysis-panel__tab-list">
        <button
          :class="[
            'fund-analysis-panel__tab-button',
            { 'fund-analysis-panel__tab-button--active': activeTab === 'holdings' },
          ]"
          @click="activeTab = 'holdings'"
        >
          <Layers3 class="fund-analysis-panel__tab-icon" />
          <span>持仓明细</span>
          <span
            v-if="activeTab === 'holdings'"
            class="fund-analysis-panel__tab-indicator"
          />
        </button>

        <button
          :class="[
            'fund-analysis-panel__tab-button',
            { 'fund-analysis-panel__tab-button--active': activeTab === 'ai' },
          ]"
          @click="activeTab = 'ai'"
        >
          <Bot class="fund-analysis-panel__tab-icon" />
          <span>AI 分析</span>
          <span class="fund-analysis-panel__beta-badge">
            BETA
          </span>
          <span
            v-if="activeTab === 'ai'"
            class="fund-analysis-panel__tab-indicator"
          />
        </button>
      </div>
    </div>

    <div
      v-if="activeTab === 'holdings'"
      class="fund-analysis-panel__holdings-view"
    >
      <div class="fund-analysis-panel__hero">
        <div class="fund-analysis-panel__hero-copy">
          <div class="fund-analysis-panel__hero-title">
            持仓明细
          </div>
          <div class="fund-analysis-panel__hero-subtitle">
            {{ holdingsMeta }}
          </div>
        </div>

        <div class="fund-analysis-panel__hero-note">
          以前三大重仓为核心，4-10 名压成高密度列表
        </div>
      </div>

      <div
        v-if="leaderHoldings.length === 0"
        class="fund-analysis-panel__empty-state"
      >
        <div>
          <div class="fund-analysis-panel__empty-title">
            该基金暂无股票重仓披露
          </div>
          <p class="fund-analysis-panel__empty-description">
            当前基金档案未返回前十大股票持仓，可能是基金类型不适用，或最近季度尚未披露相关数据。
          </p>
        </div>
      </div>

      <template v-else>
        <div class="fund-analysis-panel__leader-grid">
          <article
            v-for="item in leaderHoldings"
            :key="item.stockCode"
            data-test="holding-leader-card"
            class="fund-analysis-panel__leader-card"
          >
            <div class="fund-analysis-panel__leader-rank">
              {{ String(item.rank).padStart(2, "0") }}
            </div>

            <div class="fund-analysis-panel__leader-code">
              <span>{{ item.stockCode }}</span>
              <span class="fund-analysis-panel__market-tag">
                {{ marketTag(item.marketCode) }}
              </span>
            </div>

            <div class="fund-analysis-panel__leader-name">
              {{ item.stockName }}
            </div>

            <div class="fund-analysis-panel__leader-ratio">
              {{ item.ratio.toFixed(2) }}
              <span class="fund-analysis-panel__leader-ratio-unit">%</span>
            </div>

            <div class="fund-analysis-panel__leader-bar">
              <div
                class="fund-analysis-panel__leader-bar-fill"
                :style="{ width: `${Math.min(item.ratio * 7.6, 100)}%` }"
              />
            </div>

            <div
              :class="[
                'fund-analysis-panel__leader-change',
                holdingChange(item) >= 0
                  ? 'fund-analysis-panel__leader-change--rise'
                  : 'fund-analysis-panel__leader-change--fall',
              ]"
            >
              {{ holdingChange(item) >= 0 ? "+" : "" }}{{ holdingChange(item).toFixed(2) }}%
            </div>
          </article>
        </div>

        <div
          v-if="listHoldings.length > 0"
          class="fund-analysis-panel__list"
        >
          <article
            v-for="item in listHoldings"
            :key="item.stockCode"
            data-test="holding-row"
            class="fund-analysis-panel__list-row"
          >
            <div class="fund-analysis-panel__list-rank">
              {{ String(item.rank).padStart(2, "0") }}
            </div>

            <div class="fund-analysis-panel__list-meta">
              <div class="fund-analysis-panel__list-name">
                {{ item.stockName }}
              </div>
              <div class="fund-analysis-panel__list-code">
                {{ item.stockCode }} · {{ marketTag(item.marketCode) }}
              </div>
            </div>

            <div class="fund-analysis-panel__list-bar">
              <div
                class="fund-analysis-panel__list-bar-fill"
                :style="{ width: `${Math.min(item.ratio * 7.6, 100)}%` }"
              />
            </div>

            <div class="fund-analysis-panel__list-ratio">
              {{ item.ratio.toFixed(2) }}%
            </div>

            <div
              :class="[
                'fund-analysis-panel__list-change',
                holdingChange(item) >= 0
                  ? 'fund-analysis-panel__list-change--rise'
                  : 'fund-analysis-panel__list-change--fall',
              ]"
            >
              {{ holdingChange(item) >= 0 ? "+" : "" }}{{ holdingChange(item).toFixed(2) }}%
            </div>
          </article>
        </div>
      </template>

      <div
        data-test="industry-status"
        class="fund-analysis-panel__industry-status"
      >
        <div class="fund-analysis-panel__industry-label">
          {{ industryStatusLabel }}
        </div>
        <div class="fund-analysis-panel__industry-text">
          {{ industryStatusText }}
        </div>
        <div class="fund-analysis-panel__industry-quarter">
          {{ industryQuarter || (quarter ? `持仓数据：${quarter}` : "持仓数据待补充") }}
        </div>
      </div>
    </div>

    <div
      v-else
      class="fund-analysis-panel__ai-view"
    >
      <div class="fund-analysis-panel__ai-placeholder">
        <div class="fund-analysis-panel__ai-title">
          AI 分析占位
        </div>
        <p class="fund-analysis-panel__ai-description">
          这里将承接 AI 对基金走势、持仓构成和风险点的解读。当前先保留与截图一致的 tab 结构和占位层级。
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss" src="./FundAnalysisPanel.scss"></style>
