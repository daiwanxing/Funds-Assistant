<script setup lang="ts">
import type { FundItem } from "@/types/fund";
import { formatQuoteTime } from "@/utils/formatters";
import { BarChart2, Info } from 'lucide-vue-next';

defineProps<{
  items: FundItem[];
  loading: boolean;
  activeCode?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', code: string): void;
}>();
</script>

<template>
  <div class="saved-fund-list">
    <div class="saved-fund-list__head">
      <div class="saved-fund-list__head-label">
        基金名称
      </div>
      <div class="saved-fund-list__head-metrics">
        <span class="saved-fund-list__head-metric saved-fund-list__head-metric--quote">估值</span>
        <span class="saved-fund-list__head-metric saved-fund-list__head-metric--change">涨跌幅</span>
        <span class="saved-fund-list__head-metric saved-fund-list__head-metric--gain">估算收益</span>
        <span class="saved-fund-list__head-metric saved-fund-list__head-metric--time">更新时间</span>
      </div>
    </div>

    <ul
      v-if="items.length > 0"
      class="saved-fund-list__list"
    >
      <li
        v-for="item in items"
        :key="item.fundcode"
        :class="[
          'saved-fund-list__row',
          { 'saved-fund-list__row--active': item.fundcode === activeCode },
        ]"
        @click="emit('select', item.fundcode)"
      >
        <div
          v-if="item.fundcode === activeCode"
          class="saved-fund-list__selection-indicator"
        />

        <div class="saved-fund-list__fund-meta">
          <span class="saved-fund-list__fund-name">{{ item.name }}</span>
          <span class="saved-fund-list__fund-subline">
            {{ item.fundcode }} · {{ Number(item.num) > 0 ? item.num + '份' : '0份' }}
          </span>
        </div>

        <div class="saved-fund-list__metrics">
          <span class="saved-fund-list__quote">{{ item.gsz != null ? item.gsz : '--' }}</span>

          <span class="saved-fund-list__change-slot">
            <span
              :class="[
                'saved-fund-list__change-badge',
                Number(item.gszzl) >= 0
                  ? 'saved-fund-list__change-badge--rise'
                  : 'saved-fund-list__change-badge--fall',
              ]"
            >
              {{ Number(item.gszzl) > 0 ? '+' : '' }}{{ item.gszzl || '0.00' }}%
            </span>
          </span>

          <span
            :class="[
              'saved-fund-list__gain',
              {
                'saved-fund-list__gain--rise': item.gains > 0,
                'saved-fund-list__gain--fall': item.gains < 0,
                'saved-fund-list__gain--flat': item.gains === 0,
              },
            ]"
          >
            {{ item.gains > 0 ? '+¥' + item.gains.toFixed(2) : item.gains < 0 ? '-¥' + Math.abs(item.gains).toFixed(2) : '¥0' }}
          </span>

          <span class="saved-fund-list__updated-at">
            {{ formatQuoteTime(item.gztime) }}
          </span>
        </div>
      </li>
    </ul>


    <div
      v-else-if="loading"
      class="saved-fund-list__loading-state"
    >
      <div class="saved-fund-list__loading-copy">
        <div class="saved-fund-list__loading-title">
          <span class="saved-fund-list__loading-dot" />
          <span>正在同步自选持仓</span>
        </div>
        <p class="saved-fund-list__loading-description">
          正在拉取最新估值与收益数据
        </p>
      </div>

      <div
        v-for="index in 4"
        :key="index"
        class="saved-fund-list__skeleton-row"
      >
        <div class="saved-fund-list__skeleton-meta">
          <div class="saved-fund-list__skeleton-line saved-fund-list__skeleton-line--primary" />
          <div class="saved-fund-list__skeleton-line saved-fund-list__skeleton-line--secondary" />
        </div>
        <div class="saved-fund-list__skeleton-metrics">
          <div class="saved-fund-list__skeleton-chip saved-fund-list__skeleton-chip--quote" />
          <div class="saved-fund-list__skeleton-chip saved-fund-list__skeleton-chip--change" />
          <div class="saved-fund-list__skeleton-chip saved-fund-list__skeleton-chip--gain" />
        </div>
      </div>
    </div>

    <div
      v-else
      class="saved-fund-list__empty-state"
    >
      <div class="saved-fund-list__empty-icon-shell">
        <BarChart2
          class="saved-fund-list__empty-icon"
          :stroke-width="2"
        />
      </div>
      <p class="saved-fund-list__empty-title">
        自选列表为空
      </p>
      <p class="saved-fund-list__empty-description">
        通过上方搜索框，添加基金至自选
      </p>

      <div class="saved-fund-list__empty-divider" />

      <div class="saved-fund-list__empty-tip">
        <Info
          class="saved-fund-list__empty-tip-icon"
          :stroke-width="2"
        />
        <span class="saved-fund-list__empty-tip-text">支持基金名称、代码</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./FundSavedList.scss"></style>
