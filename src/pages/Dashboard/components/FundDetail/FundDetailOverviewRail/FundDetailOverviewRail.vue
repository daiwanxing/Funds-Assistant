<script setup lang="ts">
import { computed } from "vue";
import type { FundProfile } from "@/types/fund";
import { useFundHoldings } from "@/composables/fund/useFundHoldings";
import EmptyHoldingsIllustration from "./EmptyHoldingsIllustration.vue";
import EmptyIndustryIllustration from "./EmptyIndustryIllustration.vue";

const props = defineProps<{
  profile: FundProfile;
  code: string | null;
}>();

const {
  holdings,
  quarter,
  industries,
  industryQuarter,
  isLoading,
  isError,
  retry,
} = useFundHoldings(() => props.code);

const tradeStatusSummary = computed(() => {
  const raw = props.profile.tradeStatus?.trim();
  if (!raw) return "--";
  return raw.replace(/\s+/g, " · ");
});

const profileItems = computed(() => [
  {
    label: "基金类型",
    value: props.profile.fundType ?? "--",
  },
  {
    label: "基金公司",
    value: props.profile.fundCompany ?? "--",
  },
  {
    label: "基金经理",
    value: props.profile.fundManager ?? "--",
  },
  {
    label: "基金规模",
    value: props.profile.fundScale ?? "--",
  },
]);

const holdingsHeadline = computed(() => {
  if (!quarter.value) return "前十大重仓股";
  return `${quarter.value} 重仓股`;
});

const industryHeadline = computed(() => {
  if (!industryQuarter.value) return "行业分布";
  return `${industryQuarter.value} 行业分布`;
});

const totalIndustryRatio = computed(() =>
  industries.value.reduce((total, item) => total + item.ratio, 0),
);
</script>

<template>
  <section
    class="fund-overview-rail"
    data-test="fund-detail-overview-rail"
  >
    <div class="fund-overview-rail__layout">
      <article
        class="fund-overview-rail__column fund-overview-rail__column--summary"
        data-test="fund-overview-summary"
      >
        <div class="fund-overview-rail__section-label">
          持仓摘要
        </div>

        <div class="fund-overview-rail__summary-stack">
          <div class="fund-overview-rail__metric">
            <div class="fund-overview-rail__label">
              单位净值
            </div>
            <div class="fund-overview-rail__hero-value">
              {{ profile.unitNav ?? "--" }}
            </div>
            <div class="fund-overview-rail__hint">
              {{ profile.unitNavDate ?? "--" }}
            </div>
          </div>

          <div class="fund-overview-rail__metric">
            <div class="fund-overview-rail__label">
              累计净值
            </div>
            <div class="fund-overview-rail__value">
              {{ profile.accumulatedNav ?? "--" }}
            </div>
          </div>
        </div>

        <div class="fund-overview-rail__status-block">
          <div class="fund-overview-rail__label">
            交易状态
          </div>
          <div class="fund-overview-rail__status-value">
            {{ tradeStatusSummary }}
          </div>
        </div>

        <dl class="fund-overview-rail__profile-list">
          <template
            v-for="item in profileItems"
            :key="item.label"
          >
            <dt class="fund-overview-rail__profile-label">
              {{ item.label }}
            </dt>
            <dd class="fund-overview-rail__profile-value">
              {{ item.value }}
            </dd>
          </template>
        </dl>
      </article>

      <article class="fund-overview-rail__column fund-overview-rail__column--holdings">
        <div class="fund-overview-rail__section-heading">
          <div class="fund-overview-rail__section-label">
            {{ holdingsHeadline }}
          </div>
          <div
            v-if="holdings.length > 0"
            class="fund-overview-rail__section-meta"
          >
            {{ holdings.length }} 只
          </div>
        </div>

        <div
          v-if="isLoading && holdings.length === 0"
          class="fund-overview-rail__feedback"
        >
          正在载入重仓信息
        </div>

        <div
          v-else-if="isError && holdings.length === 0"
          class="fund-overview-rail__feedback fund-overview-rail__feedback--error"
        >
          <span>重仓股票暂时不可用</span>
          <button
            type="button"
            class="fund-overview-rail__feedback-action"
            @click="retry"
          >
            重试
          </button>
        </div>

        <div
          v-else-if="holdings.length === 0"
          class="fund-overview-rail__feedback"
        >
          <EmptyHoldingsIllustration class="fund-overview-rail__feedback-illustration" />
          暂无重仓股票披露
        </div>

        <ol
          v-else
          class="fund-overview-rail__holding-list"
        >
          <li
            v-for="item in holdings"
            :key="`${item.stockCode}-${item.rank}`"
            class="fund-overview-rail__holding-item"
          >
            <div
              :class="[
                'fund-overview-rail__holding-rank',
                {
                  'fund-overview-rail__holding-rank--featured': item.rank <= 3,
                },
              ]"
            >
              {{ item.rank }}
            </div>
            <div class="fund-overview-rail__holding-copy">
              <div class="fund-overview-rail__holding-name">
                {{ item.stockName }}
              </div>
              <div class="fund-overview-rail__holding-code">
                {{ item.stockCode }}
              </div>
            </div>
            <div class="fund-overview-rail__holding-bar">
              <span
                class="fund-overview-rail__holding-fill"
                :style="{ width: `${Math.min(item.ratio, 100)}%` }"
              />
            </div>
            <div class="fund-overview-rail__holding-ratio">
              {{ item.ratio.toFixed(2) }}%
            </div>
          </li>
        </ol>
      </article>

      <article class="fund-overview-rail__column fund-overview-rail__column--industry">
        <div class="fund-overview-rail__section-heading">
          <div class="fund-overview-rail__section-label">
            {{ industryHeadline }}
          </div>
          <div
            v-if="industries.length > 0"
            class="fund-overview-rail__section-meta"
          >
            {{ totalIndustryRatio.toFixed(1) }}% 覆盖
          </div>
        </div>

        <div
          v-if="isLoading && industries.length === 0"
          class="fund-overview-rail__feedback"
        >
          正在载入行业分布
        </div>

        <div
          v-else-if="industries.length === 0"
          class="fund-overview-rail__feedback"
          data-test="fund-overview-industry-empty"
        >
          <EmptyIndustryIllustration class="fund-overview-rail__feedback-illustration" />
          <p class="fund-overview-rail__feedback-description">
            当前基金暂未披露可用的行业配置数据
          </p>
        </div>

        <div
          v-else
          class="fund-overview-rail__industry-panel"
        >
          <div class="fund-overview-rail__industry-bar">
            <span
              v-for="item in industries"
              :key="item.name"
              class="fund-overview-rail__industry-bar-segment"
              :style="{ width: `${Math.min(item.ratio, 100)}%` }"
            />
          </div>

          <ul class="fund-overview-rail__industry-list">
            <li
              v-for="item in industries"
              :key="item.name"
              class="fund-overview-rail__industry-item"
            >
              <div class="fund-overview-rail__industry-copy">
                <span class="fund-overview-rail__industry-dot" />
                <span class="fund-overview-rail__industry-name">{{ item.name }}</span>
              </div>
              <span class="fund-overview-rail__industry-ratio">
                {{ item.ratio.toFixed(1) }}%
              </span>
            </li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss" src="./FundDetailOverviewRail.scss"></style>
