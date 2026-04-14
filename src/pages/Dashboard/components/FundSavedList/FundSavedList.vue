<script setup lang="ts">
import type { FundItem } from "@/types/fund";
import { formatQuoteTime } from "@/utils/formatters";
import { BarChart2, Info } from 'lucide-vue-next';
import ListLoadingState from "../ListLoadingState";

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
      <ListLoadingState
        title="正在同步自选基金"
        description="正在拉取持仓列表与最新行情"
      />
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
