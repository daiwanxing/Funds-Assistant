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
  if (!value || value === "--") return "text-white/80";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return "text-white/80";
  return num >= 0 ? "text-up" : "text-down";
};
</script>

<template>
  <div class="p-4 overflow-y-auto flex flex-col">
    <span class="text-[11px] text-white/40 font-sans tracking-wide mb-3 shrink-0">
      基金概况
    </span>

    <div class="flex flex-col gap-2.5">
      <div
        v-for="(row, ri) in rows"
        :key="ri"
        class="flex gap-4"
      >
        <div
          v-for="(item, ci) in row"
          :key="ci"
          class="flex-1 min-w-0"
        >
          <div class="text-[10px] text-white/30 font-sans mb-0.5">
            {{ item.label }}
          </div>
          <div
            class="text-[13px] font-mono font-medium"
            :class="item.isReturn ? getReturnClass(item.value) : 'text-white/85'"
          >
            {{ item.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
