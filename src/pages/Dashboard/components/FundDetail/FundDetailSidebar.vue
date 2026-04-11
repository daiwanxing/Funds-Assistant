<script setup lang="ts">
import { computed } from "vue";
import type { FundProfile } from "@/types/fund";

const props = defineProps<{
  profile: FundProfile;
}>();

const navWithDate = computed(() => {
  if (!props.profile.unitNav) return "--";
  if (!props.profile.unitNavDate) return props.profile.unitNav;
  return `${props.profile.unitNav} (${props.profile.unitNavDate})`;
});

const overviewRows = computed(() => {
  return [
    { label: "单位净值", value: navWithDate.value },
    { label: "累计净值", value: props.profile.accumulatedNav ?? "--" },
    { label: "基金类型", value: props.profile.fundType ?? "--" },
    { label: "基金公司", value: props.profile.fundCompany ?? "--" },
    { label: "基金经理", value: props.profile.fundManager ?? "--" },
    { label: "交易状态", value: props.profile.tradeStatus ?? "--" },
    { label: "基金规模", value: props.profile.fundScale ?? "--" },
  ];
});
</script>

<template>
  <aside
    data-test="fund-detail-sidebar"
    class="bg-[var(--bg-1)] px-4 py-4 overflow-y-auto"
  >
    <section class="px-1">
      <h3 class="mb-3 text-[11px] text-white/28 font-sans tracking-[0.18em]">
        基金概况
      </h3>

      <div class="overflow-hidden rounded-[18px] border border-white/[0.05] bg-[rgba(255,255,255,0.015)]">
        <div
          v-for="(item, index) in overviewRows"
          :key="item.label"
          class="flex items-center justify-between gap-4 px-4 py-3 text-[12px] border-b border-white/[0.04] last:border-b-0"
          :class="index % 2 === 0 ? 'bg-white/[0.04]' : 'bg-transparent'"
        >
          <span class="shrink-0 text-white/44 font-sans">
            {{ item.label }}：
          </span>
          <span class="text-right text-white/86 font-medium font-sans break-all">
            {{ item.value }}
          </span>
        </div>
      </div>
    </section>
  </aside>
</template>
