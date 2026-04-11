<script setup lang="ts">
import { computed } from "vue";
import type { FundProfile } from "@/types/fund";

const props = defineProps<{
  profile: FundProfile;
}>();

const tradeStatusSummary = computed(() => {
  const raw = props.profile.tradeStatus?.trim();
  if (!raw) return "--";
  return raw.replace(/\s+/g, " · ");
});

const overviewItems = computed(() => [
  {
    label: "基金经理",
    value: props.profile.fundManager ?? "--",
    hint: "核心决策人",
  },
  {
    label: "基金类型",
    value: props.profile.fundType ?? "--",
    hint: "高弹性风格",
  },
  {
    label: "基金规模",
    value: props.profile.fundScale ?? "--",
    hint: "截至最近披露",
  },
  {
    label: "交易状态",
    value: tradeStatusSummary.value,
    hint: "按最新规则展示",
    wide: true,
  },
  {
    label: "最新净值日",
    value: props.profile.unitNavDate ?? "--",
    hint: props.profile.accumulatedNav ? `累计净值 ${props.profile.accumulatedNav}` : "累计净值 --",
  },
]);
</script>

<template>
  <section
    class="fund-overview-rail"
    data-test="fund-detail-overview-rail"
  >
    <div class="fund-overview-rail__grid">
      <article
        v-for="item in overviewItems"
        :key="item.label"
        class="fund-overview-rail__item"
      >
        <div class="fund-overview-rail__label">
          {{ item.label }}
        </div>
        <div
          :class="[
            'fund-overview-rail__value',
            {
              'fund-overview-rail__value--wide': item.wide,
            },
          ]"
        >
          {{ item.value }}
        </div>
        <div class="fund-overview-rail__hint">
          {{ item.hint }}
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss" src="./FundDetailOverviewRail.scss"></style>
