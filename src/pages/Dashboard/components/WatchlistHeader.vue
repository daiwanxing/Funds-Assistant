<script setup lang="ts">
import { BarChart2, Search, X } from 'lucide-vue-next';

defineProps<{
  query: string;
  isSearching?: boolean;
  savedCount: number;
  resultCount?: number;
}>();

const emit = defineEmits<{
  (e: 'update:query', value: string): void;
}>();

const handleInput = (e: Event) => {
  emit('update:query', (e.target as HTMLInputElement).value);
};

const clearQuery = () => {
  emit('update:query', '');
};
</script>

<template>
  <div class="watchlist-header">
    <div class="watchlist-header__summary">
      <div class="watchlist-header__identity">
        <BarChart2 class="watchlist-header__icon" />
        <span class="watchlist-header__title">{{ query ? '搜索基金库' : '自选持仓' }}</span>
      </div>
      <div class="watchlist-header__count">
        <span
          v-if="query && resultCount !== undefined"
          class="watchlist-header__count-badge"
        >
          {{ resultCount }} 个结果
        </span>
        <span
          v-else-if="!query"
          class="watchlist-header__count-badge"
        >
          {{ savedCount }}
        </span>
      </div>
    </div>

    <div class="watchlist-header__search-field">
      <Search class="watchlist-header__search-icon" />

      <input
        :value="query"
        class="watchlist-header__search-input"
        placeholder="搜索基金名称、代码或公司"
        @input="handleInput"
      >

      <button
        v-if="query"
        class="watchlist-header__clear-button"
        @click="clearQuery"
      >
        <X class="watchlist-header__clear-icon" />
      </button>

      <div
        v-else
        class="watchlist-header__clear-placeholder"
      />
    </div>
  </div>
</template>

<style scoped lang="scss" src="./WatchlistHeader.scss"></style>
