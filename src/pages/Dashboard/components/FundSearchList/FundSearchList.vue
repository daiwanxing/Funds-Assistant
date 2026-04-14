<script setup lang="ts">
import { Search } from 'lucide-vue-next';
import type { SearchFundItem } from '@/composables/fund/useFundSearch';
import ListLoadingState from "../ListLoadingState";

type HighlightSegment = {
  text: string;
  matched: boolean;
};

defineProps<{
  query: string;
  options: SearchFundItem[];
  loading: boolean;
  activeCode?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', code: string): void;
}>();

const buildHighlightSegments = (text: string, query: string): HighlightSegment[] => {
  if (!text) {
    return [];
  }

  if (!query) {
    return [{ text, matched: false }];
  }

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, 'gi');

  return text
    .split(regex)
    .filter(Boolean)
    .map((segment) => ({
      text: segment,
      matched: segment.toLowerCase() === query.toLowerCase(),
    }));
};

const handleSelect = (code: string) => {
  emit('select', code);
};
</script>

<template>
  <div class="search-fund-list">
    <div
      v-if="!loading && options && options.length > 0"
      class="search-fund-list__summary"
    >
      <div class="search-fund-list__summary-text">
        找到 <span class="search-fund-list__summary-count">{{ options.length }}</span> 个匹配结果 · 点击基金查看详情
      </div>
    </div>

    <div class="search-fund-list__body">
      <template v-if="loading">
        <div class="search-fund-list__loading-state">
          <ListLoadingState
            title="正在检索基金数据库"
            description="共收录 10,000+ 只基金 · 实时行情数据"
          />
        </div>
      </template>

      <template v-else-if="options.length > 0">
        <ul class="search-fund-list__list">
          <li
            v-for="item in options"
            :key="item.value"
            :class="[
              'search-fund-list__row',
              item.value === activeCode ? 'search-fund-list__row--active' : '',
            ]"
          >
            <button
              type="button"
              class="search-fund-list__row-button"
              @click="handleSelect(item.value)"
            >
              <div class="search-fund-list__identity">
                <div class="search-fund-list__headline">
                  <span class="search-fund-list__name">
                    <template
                      v-for="(segment, index) in buildHighlightSegments(item.label, query)"
                      :key="`${item.value}-label-${index}`"
                    >
                      <span
                        v-if="segment.matched"
                        class="search-fund-list__match"
                      >
                        {{ segment.text }}
                      </span>
                      <template v-else>
                        {{ segment.text }}
                      </template>
                    </template>
                  </span>
                  <span
                    v-if="item.tag"
                    class="search-fund-list__tag"
                  >
                    {{ item.tag }}
                  </span>
                </div>
                <span class="search-fund-list__description">
                  <template
                    v-for="(segment, index) in buildHighlightSegments(item.desc || '', query)"
                    :key="`${item.value}-desc-${index}`"
                  >
                    <span
                      v-if="segment.matched"
                      class="search-fund-list__match"
                    >
                      {{ segment.text }}
                    </span>
                    <template v-else>
                      {{ segment.text }}
                    </template>
                  </template>
                </span>
              </div>

              <div class="search-fund-list__metrics">
                <span class="search-fund-list__quote">
                  {{ item.gsz ?? '--' }}
                </span>
                <template v-if="item.gszzl !== undefined">
                  <span
                    :class="[
                      'search-fund-list__change-badge',
                      item.gszzl >= 0
                        ? 'search-fund-list__change-badge--rise'
                        : 'search-fund-list__change-badge--fall',
                    ]"
                  >
                    {{ item.gszzl >= 0 ? '+' : '' }}{{ item.gszzl.toFixed(2) }}%
                  </span>
                </template>
                <span
                  v-else
                  class="search-fund-list__change-placeholder"
                >--</span>
              </div>
            </button>
          </li>
        </ul>
      </template>

      <div
        v-else-if="!loading"
        class="search-fund-list__empty-state"
      >
        <Search class="search-fund-list__empty-icon" />
        <span class="search-fund-list__empty-text">未找到任何匹配项</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./FundSearchList.scss"></style>
