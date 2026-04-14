<script setup lang="ts">
import { computed } from "vue";
import { Plus, Star } from "lucide-vue-next";
import type { FundProfile } from "@/types/fund";

const props = defineProps<{
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

const periodChange = computed(() => {
  if (props.latestNav === null || props.periodReturn === null) {
    return null;
  }

  const divisor = 1 + props.periodReturn / 100;
  if (divisor === 0) {
    return null;
  }

  const startValue = props.latestNav / divisor;
  return props.latestNav - startValue;
});
</script>

<template>
  <div class="fund-detail-hero">
    <div class="fund-detail-hero__identity">
      <div class="fund-detail-hero__title-row">
        <span class="fund-detail-hero__name">
          {{ profile.name }}
        </span>

        <div class="fund-detail-hero__meta-row">
          <span class="fund-detail-hero__meta-badge fund-detail-hero__code">
            {{ profile.code }}
          </span>
          <span class="fund-detail-hero__meta-badge fund-detail-hero__category">
            {{ categoryLabel || "基金" }}
          </span>
          <span
            v-for="tag in metaTags"
            :key="tag"
            class="fund-detail-hero__meta-badge fund-detail-hero__tag"
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
            v-if="periodChange != null"
            :class="[
              'fund-detail-hero__change',
              isRising ? 'fund-detail-hero__change--rise' : 'fund-detail-hero__change--fall',
            ]"
          >
            {{ periodChange >= 0 ? '+' : '' }}{{ periodChange.toFixed(4) }}
          </span>
          <span
            v-else
            class="fund-detail-hero__change fund-detail-hero__change--empty"
          >
            --
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
      </div>
    </div>

    <button
      type="button"
      :class="[
        'fund-detail-hero__watchlist-toggle',
        isWatchlisted ? 'fund-detail-hero__watchlist-toggle--active' : '',
      ]"
      @click="$emit('toggle-watchlist')"
    >
      <span class="fund-detail-hero__watchlist-toggle-marker">
        <Star
          v-if="isWatchlisted"
          class="fund-detail-hero__watchlist-toggle-icon"
          :size="13"
          :stroke-width="1.8"
        />
        <Plus
          v-else
          class="fund-detail-hero__watchlist-toggle-icon"
          :size="13"
          :stroke-width="1.8"
        />
      </span>
      <span class="fund-detail-hero__watchlist-toggle-label">
        {{ isWatchlisted ? "已自选" : "加自选" }}
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss" src="./FundDetailHero.scss"></style>
