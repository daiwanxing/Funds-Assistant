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
    data-test="fund-detail-overview-rail"
  >
    <div class="grid grid-cols-[repeat(3,minmax(0,1fr))_1.4fr_minmax(0,1fr)]">
      <article
        v-for="item in overviewItems"
        :key="item.label"
        class="min-w-0 border-r border-white/[0.05] px-5 py-4 last:border-r-0"
      >
        <div class="text-[10px] uppercase tracking-[0.18em] text-white/24 font-sans">
          {{ item.label }}
        </div>
        <div
          class="mt-2 text-white/92 font-semibold leading-[1.35] break-words"
          :class="item.wide ? 'text-[16px]' : 'text-[18px]'"
        >
          {{ item.value }}
        </div>
        <div class="mt-2 text-[12px] text-white/34 font-sans">
          {{ item.hint }}
        </div>
      </article>
    </div>
  </section>
</template>
