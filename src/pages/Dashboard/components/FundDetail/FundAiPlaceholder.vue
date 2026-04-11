<script setup lang="ts">
import { Sparkles } from "lucide-vue-next";
</script>

<template>
  <div class="bg-[var(--bg-1)] p-4 overflow-hidden flex flex-col">
    <span class="text-[11px] text-white/40 font-sans tracking-wide mb-3 shrink-0">
      AI 分析
    </span>
    <div class="flex-1 flex flex-col items-center justify-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
        <Sparkles
          class="w-4.5 h-4.5 text-white/20"
          :stroke-width="1.5"
        />
      </div>
      <div class="text-center">
        <p class="text-[12px] text-white/35 font-sans">
          AI 分析功能开发中
        </p>
        <p class="text-[10px] text-white/20 font-sans mt-0.5">
          Coming Soon
        </p>
      </div>
    </div>
  </div>
</template>
