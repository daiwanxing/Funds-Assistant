<script setup lang="ts">
import type { FundProfile } from "@/types/fund";

defineProps<{
  profile: FundProfile;
  latestNav: number | null;
  periodReturn: number | null;
  periodLabel: string;
  isRising: boolean;
  isWatchlisted?: boolean;
  metaTags?: string[];
  categoryLabel?: string;
  valueLabel?: string;
}>();

defineEmits<{
  (e: "toggle-watchlist"): void;
}>();
</script>

<template>
  <div class="fund-detail-hero">
    <div class="fund-detail-hero__identity">
      <div class="fund-detail-hero__code-row">
        <span class="fund-detail-hero__code">
          {{ profile.code }}
        </span>
        <button
          type="button"
          :class="[
            'fund-detail-hero__watchlist-toggle',
            isWatchlisted ? 'fund-detail-hero__watchlist-toggle--active' : '',
          ]"
          @click="$emit('toggle-watchlist')"
        >
          <span class="fund-detail-hero__watchlist-toggle-marker">
            {{ isWatchlisted ? "✓" : "+" }}
          </span>
          <span class="fund-detail-hero__watchlist-toggle-label">
            {{ isWatchlisted ? "已自选" : "加自选" }}
          </span>
        </button>
      </div>

      <div class="fund-detail-hero__title-row">
        <span class="fund-detail-hero__name">
          {{ profile.name }}
        </span>
        <span class="fund-detail-hero__category">
          {{ categoryLabel || "基金" }}
        </span>
      </div>

      <div
        v-if="metaTags?.length"
        class="fund-detail-hero__tag-list"
      >
        <span
          v-for="tag in metaTags"
          :key="tag"
          class="fund-detail-hero__tag"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div class="fund-detail-hero__metrics">
      <div class="fund-detail-hero__value-row">
        <span
          :class="[
            'fund-detail-hero__value',
            isRising ? 'fund-detail-hero__value--rise' : 'fund-detail-hero__value--fall',
          ]"
        >
          {{ latestNav != null ? latestNav.toFixed(4) : '--' }}
        </span>
        <span
          v-if="periodReturn != null"
          :class="[
            'fund-detail-hero__delta',
            isRising ? 'fund-detail-hero__delta--rise' : 'fund-detail-hero__delta--fall',
          ]"
        >
          {{ periodReturn >= 0 ? '+' : '' }}{{ periodReturn.toFixed(2) }}%
        </span>
        <span
          v-else
          class="fund-detail-hero__delta fund-detail-hero__delta--empty"
        >
          --
        </span>
      </div>

      <div class="fund-detail-hero__meta">
        <span class="fund-detail-hero__period">
          {{ periodLabel }}
        </span>
        <span class="fund-detail-hero__value-label">
          {{ valueLabel || "净值" }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./FundDetailHero.scss"></style>
