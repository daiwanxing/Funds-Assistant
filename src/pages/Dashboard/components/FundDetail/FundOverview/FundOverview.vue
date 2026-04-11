<script setup lang="ts">
import { computed } from "vue";
import type { FundProfile } from "@/types/fund";

const props = defineProps<{
  profile: FundProfile;
}>();

interface KVItem {
  label: string;
  value: string;
  isReturn?: boolean;
}

const rows = computed<KVItem[][]>(() => {
  const p = props.profile;
  return [
    [
      { label: "申购费率", value: p.currentRate ? `${p.currentRate}%` : "--" },
      { label: "原费率", value: p.sourceRate ? `${p.sourceRate}%` : "--" },
    ],
    [
      { label: "最低申购", value: p.minPurchase ? `${p.minPurchase}元` : "--" },
    ],
    [
      { label: "近1月", value: p.return1m ? `${p.return1m}%` : "--", isReturn: true },
      { label: "近3月", value: p.return3m ? `${p.return3m}%` : "--", isReturn: true },
    ],
    [
      { label: "近6月", value: p.return6m ? `${p.return6m}%` : "--", isReturn: true },
      { label: "近1年", value: p.return1y ? `${p.return1y}%` : "--", isReturn: true },
    ],
  ];
});

const getReturnClass = (value: string): string => {
  if (!value || value === "--") return "fund-overview__value--neutral";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return "fund-overview__value--neutral";
  return num >= 0 ? "fund-overview__value--positive" : "fund-overview__value--negative";
};
</script>

<template>
  <div class="fund-overview">
    <span class="fund-overview__title">
      基金概况
    </span>

    <div class="fund-overview__rows">
      <div
        v-for="(row, ri) in rows"
        :key="ri"
        class="fund-overview__row"
      >
        <div
          v-for="(item, ci) in row"
          :key="ci"
          class="fund-overview__cell"
        >
          <div class="fund-overview__label">
            {{ item.label }}
          </div>
          <div
            :class="[
              'fund-overview__value',
              item.isReturn ? getReturnClass(item.value) : 'fund-overview__value--default',
            ]"
          >
            {{ item.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./FundOverview.scss"></style>
