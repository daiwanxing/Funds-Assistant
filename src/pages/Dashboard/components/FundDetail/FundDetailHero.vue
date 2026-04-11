<script setup lang="ts">
import type { FundProfile } from "@/types/fund";

defineProps<{
  profile: FundProfile;
  latestNav: number | null;
  periodReturn: number | null;
  periodLabel: string;
  isRising: boolean;
  metaTags?: string[];
  categoryLabel?: string;
  valueLabel?: string;
}>();
</script>

<template>
  <div
    class="px-5 py-5 border-b border-white/[0.06] shrink-0 flex items-start justify-between gap-8"
  >
    <div class="flex min-w-0 flex-col gap-3 overflow-hidden pt-0.5">
      <div class="flex items-center gap-3 min-w-0">
        <span class="rounded-[14px] border border-white/[0.08] bg-white/[0.04] px-3 py-[7px] text-[12px] font-medium text-white/62 font-mono tracking-[0.08em] shrink-0 leading-none">
          {{ profile.code }}
        </span>
      </div>

      <div class="flex items-start gap-3 min-w-0">
        <span class="text-[30px] font-semibold text-white/92 font-sans leading-[1.1] break-words whitespace-normal max-w-[720px]">
          {{ profile.name }}
        </span>
        <span class="mt-1 rounded-[10px] border border-[rgba(47,129,247,0.28)] bg-[rgba(47,129,247,0.11)] px-2 py-[5px] text-[10px] text-[#7fb0ff] font-sans shrink-0 leading-none">
          {{ categoryLabel || "基金" }}
        </span>
      </div>

      <div
        v-if="metaTags?.length"
        class="flex flex-wrap gap-1.5"
      >
        <span
          v-for="tag in metaTags"
          :key="tag"
          class="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-[5px] text-[10px] text-white/40 font-sans tracking-wide leading-none"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div class="flex flex-col items-end gap-1 shrink-0 pt-0.5">
      <div class="flex items-baseline gap-2">
        <span
          class="text-[44px] leading-none font-semibold font-mono tracking-[-0.04em]"
          :class="isRising ? 'text-up' : 'text-down'"
        >
          {{ latestNav != null ? latestNav.toFixed(4) : '--' }}
        </span>
        <span
          v-if="periodReturn != null"
          class="text-[16px] font-semibold font-mono"
          :class="isRising ? 'text-up' : 'text-down'"
        >
          {{ periodReturn >= 0 ? '+' : '' }}{{ periodReturn.toFixed(2) }}%
        </span>
        <span
          v-else
          class="text-[16px] text-white/30 font-mono"
        >
          --
        </span>
      </div>

      <div class="flex items-center gap-2.5">
        <span class="text-[11px] text-white/30 font-sans tracking-wide">
          {{ periodLabel }}
        </span>
        <span class="rounded-[10px] bg-white/[0.05] px-2 py-[5px] text-[10px] text-white/24 font-sans tracking-wide leading-none">
          {{ valueLabel || "净值" }}
        </span>
      </div>
    </div>
  </div>
</template>
